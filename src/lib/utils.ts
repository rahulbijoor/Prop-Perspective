export const formatCurrency = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export const formatScore = (s: number) => `${Math.round((s ?? 0) * 100)}%`;

export function formatZip(zip?: string | number): string | undefined {
  if (zip === undefined || zip === null) return undefined;
  const s = String(zip);
  return s.replace(/\.0+$/, '');
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function debounce<T extends (...a: any[]) => void>(fn: T, wait = 300) {
  let t: any; 
  return (...args: Parameters<T>) => { 
    clearTimeout(t); 
    t = setTimeout(() => fn(...args), wait); 
  };
}

export const DEFAULT_BUDGET = 500000;
export const DEFAULT_MIN_BEDS = 2;
export const DEFAULT_MIN_BATHS = 1;

// Debate utility functions
export const formatConfidenceScore = (score: number): string => {
  // Handle both decimal (0.94) and percentage (94) formats
  const percentage = score > 1 ? score : score * 100;
  return `${Math.round(percentage)}%`;
};

export const getConfidenceColor = (score: number): string => {
  // Handle both decimal (0.8) and percentage (80) formats
  const normalizedScore = score > 1 ? score / 100 : score;
  if (normalizedScore >= 0.8) return 'text-green-600';
  if (normalizedScore >= 0.6) return 'text-yellow-600';
  return 'text-red-600';
};

export const formatArgumentStrength = (strength: number): string => {
  // Handle both decimal (0.94) and percentage (94) formats
  const percentage = strength > 1 ? strength : strength * 100;
  return `${Math.round(percentage)}%`;
};

export const getStrengthColor = (strength: number, isProArgument: boolean): string => {
  const baseColor = isProArgument ? 'green' : 'red';
  if (strength >= 0.8) return `text-${baseColor}-700`;
  if (strength >= 0.6) return `text-${baseColor}-600`;
  return `text-${baseColor}-500`;
};

export const formatDebateMetadata = (metadata: any): string => {
  const parts = [];
  if (metadata.model_used) parts.push(`Model: ${metadata.model_used}`);
  if (metadata.total_tokens) parts.push(`Tokens: ${metadata.total_tokens.toLocaleString()}`);
  if (metadata.latency_seconds) parts.push(`Generated in: ${metadata.latency_seconds}s`);
  return parts.join(' • ');
};

export const validateDebateResponse = (response: any): boolean => {
  return !!(
    response &&
    response.pro_arguments &&
    response.con_arguments &&
    response.summary &&
    response.recommendation &&
    typeof response.confidence_score === 'number'
  );
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const formatMarketInsight = (insight: string): string => {
  // Capitalize first letter and ensure proper punctuation
  const formatted = insight.charAt(0).toUpperCase() + insight.slice(1);
  return formatted.endsWith('.') ? formatted : formatted + '.';
};

export const getDebateRecommendationIcon = (recommendation: string): string => {
  const lower = recommendation.toLowerCase();
  if (lower.includes('buy') || lower.includes('invest') || lower.includes('purchase')) {
    return '👍';
  }
  if (lower.includes('avoid') || lower.includes('pass') || lower.includes('skip')) {
    return '👎';
  }
  return '🤔';
};

export const sortArgumentsByStrength = (args: any[]): any[] => {
  return [...args].sort((a, b) => (b.strength || 0) - (a.strength || 0));
};

// Comparison utility functions
export const formatComparisonCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatComparisonPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

export const getComparisonWinnerColor = (isWinner: boolean): string => {
  return isWinner ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-600';
};

export const formatComparisonMetric = (value: number, type: 'currency' | 'number' | 'percentage'): string => {
  switch (type) {
    case 'currency':
      return formatComparisonCurrency(value);
    case 'percentage':
      return formatComparisonPercentage(value);
    case 'number':
    default:
      return value.toLocaleString();
  }
};

export const calculateComparisonAdvantage = (value: number, average: number, type: 'higher' | 'lower'): string => {
  const difference = type === 'higher' ? value - average : average - value;
  const percentage = Math.abs((difference / average) * 100);
  
  if (percentage < 5) return 'Similar to average';
  if (percentage < 15) return `${Math.round(percentage)}% ${type === 'higher' ? 'above' : 'below'} average`;
  if (percentage < 30) return `${Math.round(percentage)}% ${type === 'higher' ? 'above' : 'below'} average (significant)`;
  return `${Math.round(percentage)}% ${type === 'higher' ? 'above' : 'below'} average (major difference)`;
};

export const getComparisonInsightIcon = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'best_value':
      return '💰';
    case 'best_location':
      return '📍';
    case 'best_space':
      return '🏠';
    case 'best_amenities':
      return '✨';
    case 'best_investment':
      return '📈';
    case 'best_for_families':
      return '👨‍👩‍👧‍👦';
    default:
      return '🎯';
  }
};

export const truncateComparisonText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};
