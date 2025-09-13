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
  return `${Math.round(score * 100)}%`;
};

export const getConfidenceColor = (score: number): string => {
  if (score >= 0.8) return 'text-green-600';
  if (score >= 0.6) return 'text-yellow-600';
  return 'text-red-600';
};

export const formatArgumentStrength = (strength: number): string => {
  return `${Math.round(strength * 100)}%`;
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
