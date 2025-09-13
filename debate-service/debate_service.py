import asyncio
import logging
import time
import hashlib
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError

from crewai import Task, Crew
from models import (
    PropertyData, DebateRequest, DebateResponse, DebateArgument, 
    AgentResponse, DebateMetadata, MarketInsights, ArgumentType
)
from agents import create_debate_agents, format_agent_prompt
from utils import (
    price_per_sqft, compute_market_position, summarize_location,
    assess_investment_potential, identify_risk_factors, generate_property_hash,
    format_currency
)
from config import settings

logger = logging.getLogger(__name__)

# Simple in-memory cache
_cache: Dict[str, Tuple[DebateResponse, datetime]] = {}


class DebateOrchestrator:
    """Orchestrates the property debate between Pro and Con agents"""
    
    def __init__(self):
        self.agents = create_debate_agents()
        self.executor = ThreadPoolExecutor(max_workers=settings.MAX_CONCURRENT_REQUESTS)
        logger.info("DebateOrchestrator initialized")
    
    async def generate_debate(self, request: DebateRequest) -> DebateResponse:
        """Generate a complete debate response"""
        start_time = time.time()
        request_id = self._generate_request_id(request)
        
        logger.info(f"Starting debate generation for request {request_id}")
        
        try:
            # Check cache first
            if settings.ENABLE_CACHE:
                cached_response = self._get_cached_response(request.property_data)
                if cached_response:
                    logger.info(f"Returning cached response for request {request_id}")
                    cached_response.metadata.cache_hit = True
                    cached_response.metadata.request_id = request_id
                    return cached_response
            
            # Generate arguments from both agents
            pro_response, con_response = await self._run_agents_parallel(
                request.property_data, request.context, request.focus_areas
            )
            
            # Create market insights
            market_insights = self._create_market_insights(request.property_data)
            
            # Generate summary and recommendation
            summary, recommendation, confidence = self._generate_summary_and_recommendation(
                pro_response, con_response, market_insights
            )
            
            # Calculate metadata
            end_time = time.time()
            latency_ms = (end_time - start_time) * 1000
            
            metadata = DebateMetadata(
                model_name=settings.GEMINI_MODEL,
                latency_ms=latency_ms,
                agents_used=["pro_agent", "con_agent"],
                request_id=request_id,
                total_tokens=self._estimate_tokens(pro_response, con_response, summary)
            )
            
            # Create response
            response = DebateResponse(
                pro_arguments=pro_response.arguments,
                con_arguments=con_response.arguments,
                summary=summary,
                recommendation=recommendation,
                confidence_score=confidence,
                market_insights=market_insights,
                agent_responses=[pro_response, con_response],
                metadata=metadata
            )
            
            # Cache the response
            if settings.ENABLE_CACHE:
                self._cache_response(request.property_data, response)
            
            logger.info(f"Debate generation completed for request {request_id} in {latency_ms:.2f}ms")
            return response
            
        except Exception as e:
            logger.error(f"Error generating debate for request {request_id}: {e}")
            raise
    
    async def _run_agents_parallel(
        self, 
        property_data: PropertyData, 
        context: Optional[str], 
        focus_areas: Optional[List[str]]
    ) -> Tuple[AgentResponse, AgentResponse]:
        """Run both agents in parallel"""
        
        try:
            # Create tasks for both agents
            pro_task = asyncio.create_task(
                self._run_agent("pro", property_data, context, focus_areas)
            )
            con_task = asyncio.create_task(
                self._run_agent("con", property_data, context, focus_areas)
            )
            
            # Wait for both with timeout
            pro_response, con_response = await asyncio.wait_for(
                asyncio.gather(pro_task, con_task),
                timeout=settings.TIMEOUT_SECONDS
            )
            
            return pro_response, con_response
            
        except asyncio.TimeoutError:
            logger.error("Agent execution timed out")
            raise TimeoutError("Debate generation timed out")
        except Exception as e:
            logger.error(f"Error running agents in parallel: {e}")
            raise
    
    async def _run_agent(
        self, 
        agent_type: str, 
        property_data: PropertyData, 
        context: Optional[str], 
        focus_areas: Optional[List[str]]
    ) -> AgentResponse:
        """Run a single agent with retry logic"""
        
        agent_key = f"{agent_type}_agent"
        agent = self.agents[agent_key]
        
        for attempt in range(settings.MAX_RETRIES):
            try:
                # Format the prompt
                prompt = format_agent_prompt(agent_type, property_data, context, focus_areas)
                
                # Create and execute task
                task = Task(
                    description=prompt,
                    agent=agent,
                    expected_output="A structured analysis with 2-4 arguments, each with title, content, strength score, and evidence."
                )
                
                # Run in thread pool to avoid blocking
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    self.executor,
                    self._execute_crew_task,
                    task,
                    agent
                )
                
                # Parse the result into structured arguments
                arguments = self._parse_agent_output(result, agent_type)
                
                return AgentResponse(
                    agent_name=agent_key,
                    role=agent.role,
                    arguments=arguments,
                    confidence=self._calculate_agent_confidence(arguments),
                    reasoning=f"Analysis completed using {settings.GEMINI_MODEL}"
                )
                
            except Exception as e:
                logger.warning(f"Agent {agent_type} attempt {attempt + 1} failed: {e}")
                if attempt == settings.MAX_RETRIES - 1:
                    # Last attempt failed, create fallback response
                    return self._create_fallback_response(agent_type, property_data, str(e))
                await asyncio.sleep(1)  # Brief delay before retry
    
    def _execute_crew_task(self, task: Task, agent) -> str:
        """Execute a CrewAI task synchronously"""
        try:
            crew = Crew(agents=[agent], tasks=[task], verbose=False)
            result = crew.kickoff()
            return str(result)
        except Exception as e:
            logger.error(f"Error executing crew task: {e}")
            raise
    
    def _parse_agent_output(self, output: str, agent_type: str) -> List[DebateArgument]:
        """Parse agent output into structured arguments"""
        try:
            # This is a simplified parser - in production, you might use more sophisticated NLP
            arguments = []
            
            # Split output into potential arguments (simple heuristic)
            sections = output.split('\n\n')
            
            for i, section in enumerate(sections):
                if len(section.strip()) < 50:  # Skip short sections
                    continue
                
                # Extract title (first line or generate one)
                lines = section.strip().split('\n')
                title = lines[0][:100] if lines[0] else f"Argument {i+1}"
                
                # Clean title
                title = title.replace('*', '').replace('#', '').strip()
                if not title:
                    title = f"Key {agent_type.title()} Point {i+1}"
                
                # Content is the full section
                content = section.strip()
                
                # Estimate strength based on content length and keywords
                strength = self._estimate_argument_strength(content, agent_type)
                
                # Extract evidence (simplified)
                evidence = self._extract_evidence(content)
                
                argument = DebateArgument(
                    type=ArgumentType.PRO if agent_type == "pro" else ArgumentType.CON,
                    title=title,
                    content=content,
                    strength=strength,
                    evidence=evidence
                )
                
                arguments.append(argument)
                
                # Limit to 4 arguments
                if len(arguments) >= 4:
                    break
            
            # Ensure we have at least 2 arguments
            if len(arguments) < 2:
                arguments.extend(self._create_fallback_arguments(agent_type, 2 - len(arguments)))
            
            return arguments[:4]  # Max 4 arguments
            
        except Exception as e:
            logger.error(f"Error parsing agent output: {e}")
            return self._create_fallback_arguments(agent_type, 2)
    
    def _estimate_argument_strength(self, content: str, agent_type: str) -> float:
        """Estimate argument strength based on content analysis"""
        try:
            base_strength = 0.5
            
            # Adjust based on content length
            if len(content) > 200:
                base_strength += 0.1
            if len(content) > 400:
                base_strength += 0.1
            
            # Look for strong indicators
            strong_words = ['significant', 'substantial', 'excellent', 'outstanding', 'major', 'critical']
            weak_words = ['might', 'could', 'possibly', 'uncertain', 'unclear']
            
            strong_count = sum(1 for word in strong_words if word.lower() in content.lower())
            weak_count = sum(1 for word in weak_words if word.lower() in content.lower())
            
            base_strength += (strong_count * 0.05) - (weak_count * 0.05)
            
            # Look for data/numbers
            if any(char.isdigit() for char in content):
                base_strength += 0.1
            
            return max(0.1, min(1.0, base_strength))
            
        except Exception:
            return 0.6  # Default strength
    
    def _extract_evidence(self, content: str) -> List[str]:
        """Extract evidence points from content"""
        evidence = []
        
        try:
            # Look for bullet points or numbered lists
            lines = content.split('\n')
            for line in lines:
                line = line.strip()
                if line.startswith('-') or line.startswith('•') or line.startswith('*'):
                    evidence.append(line[1:].strip())
                elif any(line.startswith(f"{i}.") for i in range(1, 10)):
                    evidence.append(line[2:].strip())
            
            # Look for sentences with numbers or percentages
            import re
            number_sentences = re.findall(r'[^.!?]*[\d$%][^.!?]*[.!?]', content)
            evidence.extend(number_sentences[:3])  # Limit to 3
            
            return evidence[:5]  # Max 5 evidence points
            
        except Exception:
            return []
    
    def _create_fallback_arguments(self, agent_type: str, count: int) -> List[DebateArgument]:
        """Create fallback arguments when parsing fails"""
        arguments = []
        
        for i in range(count):
            if agent_type == "pro":
                title = f"Investment Consideration {i+1}"
                content = "This property presents potential investment opportunities that warrant further analysis based on available market data and property characteristics."
            else:
                title = f"Risk Factor {i+1}"
                content = "This property presents certain risks and considerations that should be carefully evaluated before making an investment decision."
            
            arguments.append(DebateArgument(
                type=ArgumentType.PRO if agent_type == "pro" else ArgumentType.CON,
                title=title,
                content=content,
                strength=0.5,
                evidence=["Analysis based on available property data"]
            ))
        
        return arguments
    
    def _create_fallback_response(self, agent_type: str, property_data: PropertyData, error: str) -> AgentResponse:
        """Create a fallback response when agent fails"""
        arguments = self._create_fallback_arguments(agent_type, 2)
        
        return AgentResponse(
            agent_name=f"{agent_type}_agent",
            role=f"Property {agent_type.title()} Agent",
            arguments=arguments,
            confidence=0.3,
            reasoning=f"Fallback response due to error: {error}"
        )
    
    def _calculate_agent_confidence(self, arguments: List[DebateArgument]) -> float:
        """Calculate overall confidence based on argument strengths"""
        if not arguments:
            return 0.0
        
        avg_strength = sum(arg.strength for arg in arguments) / len(arguments)
        return min(1.0, avg_strength + 0.1)  # Slight boost for having multiple arguments
    
    def _create_market_insights(self, property_data: PropertyData) -> MarketInsights:
        """Create market insights from property data"""
        try:
            return MarketInsights(
                price_per_sqft=price_per_sqft(property_data),
                market_position=compute_market_position(property_data),
                location_summary=summarize_location(property_data),
                investment_potential=assess_investment_potential(property_data),
                risk_factors=identify_risk_factors(property_data)
            )
        except Exception as e:
            logger.error(f"Error creating market insights: {e}")
            return MarketInsights()
    
    def _generate_summary_and_recommendation(
        self, 
        pro_response: AgentResponse, 
        con_response: AgentResponse, 
        market_insights: MarketInsights
    ) -> Tuple[str, str, float]:
        """Generate summary, recommendation, and confidence score"""
        
        try:
            # Calculate weighted scores
            pro_score = pro_response.confidence * len(pro_response.arguments)
            con_score = con_response.confidence * len(con_response.arguments)
            
            # Factor in market insights
            market_factor = 1.0
            if market_insights.market_position == "below_market":
                market_factor = 1.2
            elif market_insights.market_position == "above_market":
                market_factor = 0.8
            
            if market_insights.investment_potential == "high":
                market_factor *= 1.1
            elif market_insights.investment_potential == "low":
                market_factor *= 0.9
            
            adjusted_pro_score = pro_score * market_factor
            
            # Determine recommendation
            if adjusted_pro_score > con_score * 1.2:
                recommendation = "buy"
                confidence = min(0.9, adjusted_pro_score / (adjusted_pro_score + con_score))
            elif con_score > adjusted_pro_score * 1.2:
                recommendation = "pass"
                confidence = min(0.9, con_score / (adjusted_pro_score + con_score))
            else:
                recommendation = "investigate_further"
                confidence = 0.5
            
            # Generate summary
            summary = self._generate_summary_text(pro_response, con_response, market_insights, recommendation)
            
            return summary, recommendation, confidence
            
        except Exception as e:
            logger.error(f"Error generating summary and recommendation: {e}")
            return (
                "Analysis completed with mixed results. Further investigation recommended.",
                "investigate_further",
                0.5
            )
    
    def _generate_summary_text(
        self, 
        pro_response: AgentResponse, 
        con_response: AgentResponse, 
        market_insights: MarketInsights, 
        recommendation: str
    ) -> str:
        """Generate summary text"""
        
        try:
            # Extract key points
            pro_titles = [arg.title for arg in pro_response.arguments[:2]]
            con_titles = [arg.title for arg in con_response.arguments[:2]]
            
            summary_parts = []
            
            # Market context
            if market_insights.location_summary:
                summary_parts.append(f"This property is located in {market_insights.location_summary}.")
            
            if market_insights.price_per_sqft:
                summary_parts.append(f"At {format_currency(market_insights.price_per_sqft)} per square foot, the property is {market_insights.market_position or 'positioned'} relative to market averages.")
            
            # Key arguments
            if pro_titles:
                summary_parts.append(f"Positive factors include: {', '.join(pro_titles[:2]).lower()}.")
            
            if con_titles:
                summary_parts.append(f"Concerns center around: {', '.join(con_titles[:2]).lower()}.")
            
            # Investment potential
            if market_insights.investment_potential:
                summary_parts.append(f"The investment potential is assessed as {market_insights.investment_potential}.")
            
            # Recommendation context
            rec_context = {
                "buy": "The analysis suggests this property presents a favorable investment opportunity.",
                "pass": "The analysis indicates significant concerns that outweigh the potential benefits.",
                "investigate_further": "The analysis reveals both opportunities and risks that require additional research."
            }
            
            summary_parts.append(rec_context.get(recommendation, "Further analysis is recommended."))
            
            return " ".join(summary_parts)
            
        except Exception as e:
            logger.error(f"Error generating summary text: {e}")
            return "Property analysis completed with mixed results requiring further investigation."
    
    def _estimate_tokens(self, pro_response: AgentResponse, con_response: AgentResponse, summary: str) -> int:
        """Estimate total tokens used"""
        try:
            # Rough estimation: 1 token ≈ 4 characters
            total_chars = 0
            
            for arg in pro_response.arguments + con_response.arguments:
                total_chars += len(arg.title) + len(arg.content)
            
            total_chars += len(summary)
            total_chars += len(pro_response.reasoning or "") + len(con_response.reasoning or "")
            
            return total_chars // 4
            
        except Exception:
            return 1000  # Default estimate
    
    def _generate_request_id(self, request: DebateRequest) -> str:
        """Generate a unique request ID"""
        timestamp = str(int(time.time()))
        property_hash = generate_property_hash(request.property_data)
        return f"{timestamp}_{property_hash[:8]}"
    
    def _get_cached_response(self, property_data: PropertyData) -> Optional[DebateResponse]:
        """Get cached response if available and not expired"""
        try:
            cache_key = generate_property_hash(property_data)
            
            if cache_key in _cache:
                response, cached_time = _cache[cache_key]
                
                # Check if cache is still valid
                if datetime.utcnow() - cached_time < timedelta(seconds=settings.CACHE_TTL_SECONDS):
                    return response
                else:
                    # Remove expired cache entry
                    del _cache[cache_key]
            
            return None
            
        except Exception as e:
            logger.warning(f"Error checking cache: {e}")
            return None
    
    def _cache_response(self, property_data: PropertyData, response: DebateResponse) -> None:
        """Cache the response"""
        try:
            cache_key = generate_property_hash(property_data)
            _cache[cache_key] = (response, datetime.utcnow())
            
            # Simple cache cleanup - remove oldest entries if cache is too large
            if len(_cache) > 100:
                oldest_key = min(_cache.keys(), key=lambda k: _cache[k][1])
                del _cache[oldest_key]
                
        except Exception as e:
            logger.warning(f"Error caching response: {e}")


# Global orchestrator instance
orchestrator = DebateOrchestrator()
