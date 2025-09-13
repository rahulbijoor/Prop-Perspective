import { useState, useCallback, useRef } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import type { DebateResponse, DebateState } from '../types/debate';

export const useDebate = () => {
  const [debateState, setDebateState] = useState<DebateState>({
    isLoading: false,
    error: null,
    debate: null,
    isGenerating: false,
  });

  const generateDebateAction = useAction(api.properties.generateDebate);
  
  // Caching and request deduplication
  const cache = useRef(new Map<Id<'properties'>, DebateResponse>());
  const inflight = useRef(new Map<Id<'properties'>, Promise<DebateResponse>>());
  
  // Guard against out-of-order responses
  const reqId = useRef(0);

  const startDebate = useCallback(async (propertyId: Id<'properties'>) => {
    // Check cache first
    const cached = cache.current.get(propertyId);
    if (cached) return cached;
    
    // Check if request is already in flight
    const pending = inflight.current.get(propertyId);
    if (pending) return pending;

    // Create new request with order tracking
    const current = ++reqId.current;
    const p = (async () => {
      setDebateState(s => ({ ...s, isLoading: true, isGenerating: true, error: null }));
      try {
        const res = await generateDebateAction({ propertyId });
        cache.current.set(propertyId, res as DebateResponse);
        
        // Only update state if this is still the current request
        if (reqId.current === current) {
          setDebateState(s => ({ ...s, isLoading: false, isGenerating: false, debate: res as DebateResponse }));
        }
        
        return res as DebateResponse;
      } catch (error) {
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
  }, [generateDebateAction]);

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
