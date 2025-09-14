// TypeScript interfaces for the debate system that mirror the Python models
import type { Id } from '../../convex/_generated/dataModel';
import type { RankedProperty } from './property';

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
  model_name: string;
  total_tokens?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  latency_ms: number;
  timestamp: string;
  agents_used: string[];
  cache_hit: boolean;
  request_id?: string;
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
  property: RankedProperty;
}

export interface DebateTriggerProps {
  propertyId: Id<'properties'>;
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

// Mock debate system types
export interface MockResponse {
  title: string;
  confidence: number;
  content: string;
}

export interface MockDebateState {
  phase: TimingPhase;
  proResponse: MockResponse | null;
  conResponse: MockResponse | null;
  isLoading: boolean;
  error: string | null;
}

export enum TimingPhase {
  ANALYZING = 'analyzing',
  PRO = 'pro',
  CON = 'con',
  COMPLETE = 'complete'
}

export interface MockDebateProps {
  onComplete: (debate: DebateResponse) => void;
  onCancel: () => void;
  propertyId: string;
}

export interface ResponseData {
  responses: MockResponse[];
}

export type DebatePhase = 'analyzing' | 'pro' | 'con' | 'complete';

export interface MockDebateConfig {
  proDelay: number;
  conDelay: number;
  enableCancellation: boolean;
}
