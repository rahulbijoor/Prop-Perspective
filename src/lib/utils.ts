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
