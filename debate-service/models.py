from pydantic import BaseModel, Field, validator
from typing import Optional, List, Union
from datetime import datetime
from enum import Enum


class PropertyData(BaseModel):
    """Property data model aligned with TypeScript Property interface"""
    price: Optional[float] = None
    unformattedPrice: Optional[float] = None
    address: Optional[str] = None
    addressStreet: Optional[str] = None
    addressCity: Optional[str] = None
    addressState: Optional[str] = None
    addressZipcode: Optional[Union[str, int]] = None
    beds: Optional[int] = None
    baths: Optional[float] = None
    area: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    isZillowOwned: Optional[bool] = None
    variableData: Optional[str] = None
    badgeInfo: Optional[str] = None
    pgapt: Optional[str] = None
    sgapt: Optional[str] = None
    zestimate: Optional[float] = None
    info3String: Optional[str] = None
    brokerName: Optional[str] = None

    @validator('price', 'unformattedPrice', 'zestimate', pre=True)
    def validate_positive_numbers(cls, v):
        if v is not None and v < 0:
            raise ValueError('Price values must be positive')
        return v

    @validator('beds', pre=True)
    def validate_beds(cls, v):
        if v is not None and v < 0:
            raise ValueError('Beds must be non-negative')
        return v

    @validator('baths', pre=True)
    def validate_baths(cls, v):
        if v is not None and v < 0:
            raise ValueError('Baths must be non-negative')
        return v

    @validator('area', pre=True)
    def validate_area(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Area must be positive')
        return v


class DebateRequest(BaseModel):
    """Request model for debate endpoint"""
    property_data: PropertyData
    context: Optional[str] = Field(None, description="Additional context for the debate")
    focus_areas: Optional[List[str]] = Field(
        default_factory=list,
        description="Specific areas to focus on (e.g., 'location', 'price', 'investment')"
    )

    class Config:
        max_anystr_length = 10000  # Limit string field lengths


class ArgumentType(str, Enum):
    PRO = "pro"
    CON = "con"


class DebateArgument(BaseModel):
    """Individual argument in the debate"""
    type: ArgumentType
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=10, max_length=2000)
    strength: float = Field(..., ge=0.0, le=1.0, description="Argument strength score (0-1)")
    evidence: Optional[List[str]] = Field(
        default_factory=list,
        description="Supporting evidence or data points"
    )
    market_context: Optional[str] = Field(None, max_length=500)


class AgentResponse(BaseModel):
    """Response from individual agent"""
    agent_name: str
    role: str
    arguments: List[DebateArgument]
    confidence: float = Field(..., ge=0.0, le=1.0)
    reasoning: Optional[str] = Field(None, max_length=1000)


class DebateMetadata(BaseModel):
    """Metadata about the debate generation"""
    model_name: str
    total_tokens: Optional[int] = None
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    latency_ms: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    agents_used: List[str]
    cache_hit: bool = False
    request_id: Optional[str] = None


class MarketInsights(BaseModel):
    """Market analysis insights"""
    price_per_sqft: Optional[float] = None
    market_position: Optional[str] = Field(None, description="below_market, at_market, above_market")
    location_summary: Optional[str] = Field(None, max_length=300)
    investment_potential: Optional[str] = Field(None, description="low, moderate, high")
    risk_factors: Optional[List[str]] = Field(default_factory=list)


class DebateResponse(BaseModel):
    """Complete debate response"""
    property_id: Optional[str] = None
    pro_arguments: List[DebateArgument]
    con_arguments: List[DebateArgument]
    summary: str = Field(..., min_length=50, max_length=1000)
    recommendation: str = Field(..., description="buy, pass, investigate_further")
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    market_insights: MarketInsights
    agent_responses: List[AgentResponse]
    metadata: DebateMetadata

    @validator('pro_arguments', 'con_arguments')
    def validate_arguments_not_empty(cls, v):
        if not v:
            raise ValueError('Arguments list cannot be empty')
        return v

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = "healthy"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: str = "1.0.0"
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class ComparisonRequest(BaseModel):
    """Request model for property comparison"""
    properties_data: List[PropertyData]
    context: Optional[str] = Field(None, description="Additional context for the comparison")
    focus_areas: Optional[List[str]] = Field(
        default_factory=list,
        description="Specific areas to focus on (e.g., 'value', 'location', 'family_suitability')"
    )

    class Config:
        max_anystr_length = 10000  # Limit string field lengths


class ComparisonInsight(BaseModel):
    """Individual comparison insight"""
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=50, max_length=2000)
    strength: float = Field(..., ge=0.0, le=1.0, description="Insight strength score (0-1)")
    category: str = Field(..., description="Category of insight (e.g., 'value', 'location', 'space')")
    recommendations: Optional[List[str]] = Field(default_factory=list)
    property_rankings: Optional[Dict[str, int]] = Field(None, description="Property rankings for this insight")


class ComparisonSummary(BaseModel):
    """Summary of the comparison analysis"""
    total_properties: int
    price_range: Dict[str, Optional[float]]
    avg_price_per_sqft: Optional[float] = None
    key_findings: List[str]
    overall_recommendation: str = Field(..., description="Overall recommendation based on analysis")


class ComparisonResponse(BaseModel):
    """Complete comparison response"""
    insights: List[ComparisonInsight]
    summary: ComparisonSummary
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    metadata: DebateMetadata
    agent_response: Optional[Dict[str, Any]] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    detail: Optional[str] = None
    request_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
