import logging
from crewai import Agent
from crewai.tools import BaseTool
from typing import Dict, Any, Optional
from config import get_gemini_config, settings
from utils import (
    price_per_sqft, compute_market_position, summarize_location,
    assess_investment_potential, identify_risk_factors, format_currency
)
from models import PropertyData

logger = logging.getLogger(__name__)


class PropertyAnalysisTool(BaseTool):
    """Custom tool for property analysis"""
    name: str = "property_analysis"
    description: str = "Analyze property data and provide market insights"
    
    def _run(self, property_data: Dict[str, Any]) -> str:
        """Run property analysis"""
        try:
            # Convert dict to PropertyData model
            prop_data = PropertyData(**property_data)
            
            # Calculate metrics
            price_sqft = price_per_sqft(prop_data)
            market_pos = compute_market_position(prop_data)
            location = summarize_location(prop_data)
            investment_potential = assess_investment_potential(prop_data)
            risks = identify_risk_factors(prop_data)
            
            # Format analysis
            analysis = f"""
Property Analysis:
- Location: {location}
- Price per sq ft: {format_currency(price_sqft) if price_sqft else 'N/A'}
- Market Position: {market_pos}
- Investment Potential: {investment_potential}
- Key Risks: {', '.join(risks[:3]) if risks else 'None identified'}
- Property Size: {prop_data.area or 'N/A'} sq ft
- Bedrooms/Bathrooms: {prop_data.beds or 'N/A'}/{prop_data.baths or 'N/A'}
- Asking Price: {format_currency(prop_data.price)}
- Zestimate: {format_currency(prop_data.zestimate)}
"""
            return analysis.strip()
            
        except Exception as e:
            logger.error(f"Error in property analysis tool: {e}")
            return f"Analysis error: {str(e)}"


def create_pro_agent() -> Agent:
    """Create the Pro (Buy) Agent"""
    
    gemini_config = get_gemini_config(settings)
    
    return Agent(
        role="Property Investment Advocate",
        goal="Identify and articulate compelling reasons why this property represents a good investment opportunity",
        backstory="""You are an experienced real estate investment advisor with 15+ years in the market. 
        You specialize in finding hidden gems and undervalued properties. Your expertise lies in:
        - Identifying properties with strong appreciation potential
        - Recognizing favorable market conditions and timing
        - Spotting properties that offer good cash flow potential
        - Understanding neighborhood growth patterns and development trends
        - Evaluating properties from a long-term wealth building perspective
        
        You have a track record of helping clients build substantial real estate portfolios by 
        focusing on fundamentals like location, price efficiency, and market positioning. You're 
        optimistic but grounded in data, always looking for the silver lining while maintaining 
        professional credibility.""",
        verbose=True,
        allow_delegation=False,
        tools=[PropertyAnalysisTool()],
        llm_config={
            "model": gemini_config["model"],
            "api_key": gemini_config["api_key"],
            "temperature": gemini_config["temperature"],
            "max_tokens": gemini_config["max_tokens"],
        },
        max_iter=3,
        memory=True,
        step_callback=None,
        system_template="""You are a Property Investment Advocate. Your task is to build a compelling case for why someone should consider purchasing this property.

ANALYSIS FRAMEWORK:
1. **Value Proposition**: Focus on price efficiency, market positioning, and potential for appreciation
2. **Location Benefits**: Highlight neighborhood advantages, accessibility, and growth potential  
3. **Property Strengths**: Emphasize positive features, layout, size, and condition indicators
4. **Market Timing**: Consider current market conditions and opportunity windows
5. **Investment Potential**: Evaluate rental income potential, appreciation prospects, and portfolio fit

EVIDENCE REQUIREMENTS:
- Use specific data points from the property analysis
- Reference comparable market data when available
- Cite location-specific advantages and trends
- Quantify potential returns where possible
- Address value relative to alternatives

ARGUMENT STRUCTURE:
- Lead with the strongest value proposition
- Support with concrete evidence and data
- Address potential concerns proactively
- Conclude with clear investment thesis

Remember: Be persuasive but honest. Focus on genuine strengths and opportunities while maintaining professional credibility."""
    )


def create_con_agent() -> Agent:
    """Create the Con (Pass) Agent"""
    
    gemini_config = get_gemini_config(settings)
    
    return Agent(
        role="Property Risk Assessment Specialist",
        goal="Identify and articulate potential risks, drawbacks, and reasons to be cautious about this property investment",
        backstory="""You are a seasoned real estate risk analyst and due diligence expert with 20+ years 
        of experience. You've seen multiple market cycles and have helped investors avoid costly mistakes. 
        Your expertise includes:
        - Identifying overpriced properties and market bubbles
        - Spotting hidden costs and maintenance issues
        - Evaluating neighborhood decline indicators and risk factors
        - Assessing liquidity risks and market timing concerns
        - Understanding financing challenges and cash flow problems
        
        You've built your reputation on thorough analysis and conservative recommendations. While you're 
        not pessimistic by nature, you believe that proper risk assessment is crucial for successful 
        real estate investing. You help clients ask the hard questions before making major financial 
        commitments.""",
        verbose=True,
        allow_delegation=False,
        tools=[PropertyAnalysisTool()],
        llm_config={
            "model": gemini_config["model"],
            "api_key": gemini_config["api_key"],
            "temperature": gemini_config["temperature"],
            "max_tokens": gemini_config["max_tokens"],
        },
        max_iter=3,
        memory=True,
        step_callback=None,
        system_template="""You are a Property Risk Assessment Specialist. Your task is to identify potential risks, drawbacks, and reasons to be cautious about this property investment.

RISK ANALYSIS FRAMEWORK:
1. **Pricing Concerns**: Evaluate if property is overpriced relative to market, comps, or intrinsic value
2. **Market Risks**: Assess local market conditions, trends, and potential for decline
3. **Property Issues**: Identify potential maintenance, structural, or functional problems
4. **Location Drawbacks**: Highlight neighborhood concerns, accessibility issues, or declining areas
5. **Financial Risks**: Consider cash flow challenges, financing issues, and liquidity concerns

EVIDENCE REQUIREMENTS:
- Use specific data points that indicate risk or concern
- Reference market data that suggests caution
- Identify missing information that creates uncertainty
- Quantify potential costs or losses where possible
- Compare unfavorably to alternatives when relevant

ARGUMENT STRUCTURE:
- Lead with the most significant risk factors
- Support with concrete evidence and data
- Explain potential consequences and costs
- Suggest what additional information would be needed
- Conclude with overall risk assessment

Remember: Be thorough but fair. Focus on legitimate concerns and risks while maintaining objectivity. Your goal is to ensure informed decision-making, not to be unnecessarily negative."""
    )


def get_shared_instructions() -> str:
    """Get shared instructions for both agents"""
    return """
SHARED INSTRUCTIONS FOR ALL AGENTS:

OUTPUT FORMAT:
- Provide 2-4 distinct arguments
- Each argument should be 100-300 words
- Include a strength score (0.0-1.0) for each argument
- Support arguments with specific evidence from the property data
- Use clear, professional language suitable for investors

EVIDENCE STANDARDS:
- Always reference specific property data points
- Use market context when available
- Quantify impacts where possible (dollar amounts, percentages, etc.)
- Cite comparable properties or market standards when relevant
- Acknowledge data limitations honestly

ARGUMENT QUALITY:
- Focus on the most impactful points
- Avoid generic statements that could apply to any property
- Provide actionable insights
- Balance emotional appeal with logical reasoning
- Consider the investor's perspective and priorities

PROFESSIONAL TONE:
- Maintain objectivity while advocating your position
- Use industry-appropriate terminology
- Provide educational value beyond just advocacy
- Respect the complexity of real estate decisions
- Acknowledge when information is limited or uncertain
"""


def create_debate_agents() -> Dict[str, Agent]:
    """Create and return both debate agents"""
    try:
        pro_agent = create_pro_agent()
        con_agent = create_con_agent()
        
        logger.info("Successfully created debate agents")
        
        return {
            "pro_agent": pro_agent,
            "con_agent": con_agent
        }
        
    except Exception as e:
        logger.error(f"Error creating debate agents: {e}")
        raise


def format_agent_prompt(agent_type: str, property_data: PropertyData, context: Optional[str] = None, focus_areas: Optional[list] = None) -> str:
    """Format the prompt for an agent"""
    
    # Convert property data to dict for the tool
    property_dict = property_data.dict()
    
    # Base prompt
    prompt = f"""Analyze this property and provide your {agent_type} perspective.

PROPERTY DATA:
{property_dict}

ADDITIONAL CONTEXT:
{context or 'No additional context provided'}

FOCUS AREAS:
{', '.join(focus_areas) if focus_areas else 'General analysis'}

Please use the property_analysis tool to get detailed insights, then provide your arguments based on your role and expertise.

{get_shared_instructions()}
"""
    
    return prompt.strip()
