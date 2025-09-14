import { useState, useCallback, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { comparisonService } from '../lib/comparison-service';
import type { Id } from '../../convex/_generated/dataModel';
import type { ComparisonResponse } from '../types/comparison';

interface ComparisonState {
  isLoading: boolean;
  error: string | null;
  comparison: ComparisonResponse | null;
  isGenerating: boolean;
}
import type { Property } from '../types/property';

export const useComparison = () => {
  const [comparisonState, setComparisonState] = useState<ComparisonState>({
    isLoading: false,
    error: null,
    comparison: null,
    isGenerating: false,
  });

  // Get all properties for property lookup
  const allProperties = useQuery(api.properties.getAllProperties);

  // Caching and request deduplication
  const cache = useRef(new Map<string, ComparisonResponse>());
  const inflight = useRef(new Map<string, Promise<ComparisonResponse>>());

  // Guard against out-of-order responses
  const reqId = useRef(0);

  const startComparison = useCallback(async (propertyIds: Id<'properties'>[]) => {
    if (propertyIds.length < 2) {
      throw new Error('At least 2 properties are required for comparison');
    }

    // Create cache key from sorted property IDs
    const cacheKey = propertyIds.sort().join(',');

    // Check cache first
    const cached = cache.current.get(cacheKey);
    if (cached) return cached;

    // Check if request is already in flight
    const pending = inflight.current.get(cacheKey);
    if (pending) return pending;

    // Find the property data
    const properties: Property[] = [];
    for (const propertyId of propertyIds) {
      const property = allProperties?.find((p: any) => p._id === propertyId);
      if (!property) {
        throw new Error(`Property ${propertyId} not found`);
      }
      properties.push(property);
    }

    // Create new request with order tracking
    const current = ++reqId.current;
    const p = (async () => {
      setComparisonState(s => ({ ...s, isLoading: true, isGenerating: true, error: null }));
      try {
        console.log('🚀 Starting property comparison with comparison service...');

        // Use the actual comparison service
        const res = await comparisonService.generateComparison(properties);

        cache.current.set(cacheKey, res);

        // Only update state if this is still the current request
        if (reqId.current === current) {
          setComparisonState(s => ({ ...s, isLoading: false, isGenerating: false, comparison: res }));
        }

        console.log('✅ Property comparison completed successfully');
        return res;
      } catch (error) {
        console.error('❌ Property comparison failed:', error);

        // Only update error state if this is still the current request
        if (reqId.current === current) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to generate comparison';
          setComparisonState(s => ({ ...s, isLoading: false, isGenerating: false, error: errorMessage }));
        }
        throw error;
      } finally {
        inflight.current.delete(cacheKey);
      }
    })();

    inflight.current.set(cacheKey, p);
    return p;
  }, [allProperties]);

  const clearComparison = useCallback(() => {
    setComparisonState({
      isLoading: false,
      error: null,
      comparison: null,
      isGenerating: false,
    });
  }, []);

  const clearError = useCallback(() => {
    setComparisonState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const retryComparison = useCallback(async (propertyIds: Id<'properties'>[]) => {
    clearError();
    return await startComparison(propertyIds);
  }, [startComparison, clearError]);

  return {
    ...comparisonState,
    startComparison,
    clearComparison,
    clearError,
    retryComparison,
  };
};

export default useComparison;
