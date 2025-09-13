// TypeScript interfaces for the debate system that mirror the Python models

export enum ArgumentType {
  PRO = 'pro',
  CON = 'con'
}

export interface DebateArgument {
  title: string;
  content: string;
  strength: number;
  evidence: string[];
}

export interface AgentResponse {
  agent_name: string;
  arguments: DebateArgument[];
  confidence: number;
}

export interface MarketInsights {
  price_per_sqft: number;
  market_position: string;
  risk_factors: string[];
  investment_potential: string;
  comparable_properties: string[];
}

export interface DebateMetadata {
  model_used: string;
  total_tokens: number;
  latency_seconds: number;
  timestamp: string;
  debate_id: string;
}

export interface DebateResponse {
  property_id: string;
  pro_arguments: DebateArgument[];
  con_arguments: DebateArgument[];
  market_insights: MarketInsights;
  summary: string;
  recommendation: string;
  confidence_score: number;
  metadata: DebateMetadata;
}

export interface DebateState {
  isLoading: boolean;
  error: string | null;
  debate: DebateResponse | null;
  isGenerating: boolean;
}

export interface DebateRequest {
  property_id: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lot_size?: number;
  year_built?: number;
  property_type: string;
  neighborhood?: string;
  additional_context?: string;
}

// UI-specific types
export interface DebateViewProps {
  debate: DebateResponse;
  onClose: () => void;
  property: any; // Will be typed based on existing property type
}

export interface DebateTriggerProps {
  propertyId: string;
  onDebateStart: (debate: DebateResponse) => void;
  disabled?: boolean;
}

export interface ArgumentCardProps {
  argument: DebateArgument;
  type: ArgumentType;
  index: number;
}

export interface MarketInsightsProps {
  insights: MarketInsights;
}
