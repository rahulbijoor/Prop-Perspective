import { useState, useCallback, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { debateService } from '../lib/debate-service';
import type { Id } from '../../convex/_generated/dataModel';
import type { DebateResponse, DebateState } from '../types/debate';
import type { RankedProperty } from '../types/property';

export const useDebate = () => {
  const [debateState, setDebateState] = useState<DebateState>({
    isLoading: false,
    error: null,
    debate: null,
    isGenerating: false,
  });

  // Get all properties for property lookup
  const allProperties = useQuery(api.properties.getAllProperties);
  
  // Caching and request deduplication
  const cache = useRef(new Map<string, DebateResponse>());
  const inflight = useRef(new Map<string, Promise<DebateResponse>>());
  
  // Guard against out-of-order responses
  const reqId = useRef(0);

  const startDebate = useCallback(async (propertyId: Id<'properties'>) => {
    // Check cache first
    const cached = cache.current.get(propertyId);
    if (cached) return cached;
    
    // Check if request is already in flight
    const pending = inflight.current.get(propertyId);
    if (pending) return pending;

    // Find the property data
    const property = allProperties?.find((p: any) => p._id === propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Create new request with order tracking
    const current = ++reqId.current;
    const p = (async () => {
      setDebateState(s => ({ ...s, isLoading: true, isGenerating: true, error: null }));
      try {
        console.log('🚀 Starting debate generation with debate service...');
        
        // Use the actual debate service instead of Convex API
        const res = await debateService.generateDebate(property as RankedProperty);
        
        // Add property_id to response for consistency
        res.property_id = propertyId;
        
        cache.current.set(propertyId, res);
        
        // Only update state if this is still the current request
        if (reqId.current === current) {
          setDebateState(s => ({ ...s, isLoading: false, isGenerating: false, debate: res }));
        }
        
        console.log('✅ Debate generation completed successfully');
        return res;
      } catch (error) {
        console.error('❌ Debate generation failed:', error);
        
        // Only update error state if this is still the current request
        if (reqId.current === current) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to generate debate';
          setDebateState(s => ({ ...s, isLoading: false, isGenerating: false, error: errorMessage }));
        }
        throw error;
      } finally {
        inflight.current.delete(propertyId);
      }
    })();

    inflight.current.set(propertyId, p);
    return p;
  }, [allProperties]);

  const clearDebate = useCallback(() => {
    setDebateState({
      isLoading: false,
      error: null,
      debate: null,
      isGenerating: false,
    });
  }, []);

  const clearError = useCallback(() => {
    setDebateState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const retryDebate = useCallback(async (propertyId: Id<'properties'>) => {
    clearError();
    return await startDebate(propertyId);
  }, [startDebate, clearError]);

  return {
    ...debateState,
    startDebate,
    clearDebate,
    clearError,
    retryDebate,
  };
};

export default useDebate;
