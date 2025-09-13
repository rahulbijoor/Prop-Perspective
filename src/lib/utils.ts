export const formatCurrency = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export const formatScore = (s: number) => `${Math.round((s ?? 0) * 100)}%`;

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function debounce<T extends (...a: any[]) => void>(fn: T, wait = 300) {
  let t: any; 
  return (...args: Parameters<T>) => { 
    clearTimeout(t); 
    t = setTimeout(() => fn(...args), wait); 
  };
}

export const DEFAULT_BUDGET = 3000;
export const DEFAULT_MIN_BEDS = 2;
export const DEFAULT_MIN_BATHS = 1;
