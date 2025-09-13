import { useState, useCallback } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { DebateResponse, DebateState } from '../types/debate';

export const useDebate = () => {
  const [debateState, setDebateState] = useState<DebateState>({
    isLoading: false,
    error: null,
    debate: null,
    isGenerating: false,
  });

  const generateDebateAction = useAction(api.properties.generateDebate);

  const startDebate = useCallback(async (propertyId: string) => {
    setDebateState(prev => ({
      ...prev,
      isLoading: true,
      isGenerating: true,
      error: null,
    }));

    try {
      const debateResponse = await generateDebateAction({ propertyId });
      
      setDebateState(prev => ({
        ...prev,
        isLoading: false,
        isGenerating: false,
        debate: debateResponse as DebateResponse,
        error: null,
      }));

      return debateResponse as DebateResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate debate';
      
      setDebateState(prev => ({
        ...prev,
        isLoading: false,
        isGenerating: false,
        error: errorMessage,
      }));

      throw error;
    }
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

  const retryDebate = useCallback(async (propertyId: string) => {
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
