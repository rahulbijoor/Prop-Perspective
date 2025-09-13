import type { Id } from '../../convex/_generated/dataModel';

export interface Property {
  _id: Id<'properties'>;
  price?: string;
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
}

export interface ScoreBreakdown {
  priceEfficiency: number;
  bedroomMatch: number;
}

export interface FilterPreferences {
  maxBudget: number;
  minBeds: number;
  minBaths?: number;
}

export interface RankedProperty extends Property {
  score: number;
  rank: number;
  scoreBreakdown?: ScoreBreakdown;
}
