import { Property } from './property';
import { DebateResponse } from './debate';

export interface ComparisonProperty extends Property {
  comparisonScore: number;
  pricePerSqft: number;
  valueScore: number;
  efficiencyScore: number;
  walkScore: number; // Add walkScore to the interface
  normalizedMetrics: {
    price: number;
    size: number;
    bedrooms: number;
    bathrooms: number;
    walkScore: number;
  };
}

export interface ComparisonMetrics {
  pricePerSqft: number;
  valueRatio: number;
  spaceEfficiency: number;
  locationScore: number;
  amenityScore: number;
  overallScore: number;
}

export interface ComparisonInsights {
  bestValue: {
    propertyId: string;
    reason: string;
    savings: number;
  };
  bestForFamilies: {
    propertyId: string;
    reason: string;
  };
  bestInvestment: {
    propertyId: string;
    reason: string;
    roi: number;
  };
  tradeOffs: Array<{
    propertyId: string;
    pros: string[];
    cons: string[];
  }>;
  recommendations: ComparisonRecommendation[];
  summary: string;
}

export interface ComparisonRecommendation {
  type: 'best_value' | 'best_location' | 'best_space' | 'best_amenities';
  propertyId: string;
  title: string;
  description: string;
  confidence: number;
}

export interface ComparisonState {
  selectedProperties: string[];
  comparisonData: ComparisonProperty[];
  insights: ComparisonInsights | null;
  isLoading: boolean;
  error: string | null;
  viewMode: ComparisonMode;
}

export interface ComparisonChart {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }>;
}

export enum ComparisonMode {
  TABLE = 'table',
  CARDS = 'cards',
  CHARTS = 'charts'
}

export interface ComparisonCriteria {
  price: number;
  location: number;
  size: number;
  amenities: number;
  walkability: number;
}

export interface CategoryWinner {
  category: string;
  propertyId: string;
  value: number;
  advantage: string;
}

export interface ComparisonResult {
  properties: ComparisonProperty[];
  insights: ComparisonInsights;
  winners: CategoryWinner[];
  charts: ComparisonChart[];
  summary: {
    totalProperties: number;
    priceRange: { min: number; max: number };
    avgPricePerSqft: number;
    bestValue: string;
  };
}

// Backend API types that mirror Python models
export interface ComparisonRequest {
  properties_data: Array<{
    price?: number;
    unformattedPrice?: number;
    address?: string;
    addressStreet?: string;
    addressCity?: string;
    addressState?: string;
    addressZipcode?: string | number;
    beds?: number;
    baths?: number;
    area?: number;
    latitude?: number;
    longitude?: number;
    isZillowOwned?: boolean;
    variableData?: string;
    badgeInfo?: string;
    pgapt?: string;
    sgapt?: string;
    zestimate?: number;
    info3String?: string;
    brokerName?: string;
  }>;
  context?: string;
  focus_areas?: string[];
}

export interface ComparisonInsight {
  title: string;
  content: string;
  strength: number;
  category: string;
  recommendations?: string[];
  property_rankings?: Record<string, number>;
}

export interface ComparisonSummary {
  total_properties: number;
  price_range: Record<string, number | null>;
  avg_price_per_sqft?: number;
  key_findings: string[];
  overall_recommendation: string;
}

export interface ComparisonResponse {
  insights: ComparisonInsight[];
  summary: ComparisonSummary;
  confidence_score: number;
  metadata: {
    model_name: string;
    total_tokens?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
    latency_ms: number;
    timestamp: string;
    agents_used: string[];
    cache_hit: boolean;
    request_id?: string;
  };
  agent_response?: any;
}

export interface ComparisonState {
  isLoading: boolean;
  error: string | null;
  comparison: ComparisonResponse | null;
  isGenerating: boolean;
}
