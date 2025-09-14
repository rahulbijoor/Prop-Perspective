import React, { useState, useEffect } from 'react';
import type { DebateTriggerProps } from '../types/debate';
import { useDebate } from '../hooks/useDebate';

const DebateTrigger: React.FC<DebateTriggerProps> = ({ 
  propertyId, 
  onDebateStart, 
  disabled = false 
}) => {
  const { startDebate, isLoading, isGenerating, error, clearError } = useDebate();
  const [showError, setShowError] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Timer effect for elapsed time
  useEffect(() => {
    let interval: number;
    
    if ((isLoading || isGenerating) && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else if (!isLoading && !isGenerating) {
      setElapsedTime(0);
      setStartTime(null);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, isGenerating, startTime]);

  const handleStartDebate = async () => {
    try {
      clearError();
      setShowError(false);
      setStartTime(Date.now());
      setElapsedTime(0);
      
      // Create abort controller for cancellation
      const controller = new AbortController();
      setAbortController(controller);
      
      const debate = await startDebate(propertyId);
      onDebateStart(debate);
    } catch (err) {
      console.error('Failed to start debate:', err);
      setShowError(true);
    } finally {
      setAbortController(null);
      setStartTime(null);
      setElapsedTime(0);
    }
  };

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setStartTime(null);
    setElapsedTime(0);
    clearError();
  };

  const handleRetry = () => {
    setShowError(false);
    handleStartDebate();
  };

  if (showError && error) {
    return (
      <div className="space-y-2">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">Failed to generate debate</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleRetry}
            disabled={isLoading}
            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Retrying...' : 'Retry'}
          </button>
          <button
            onClick={() => setShowError(false)}
            className="px-3 py-1.5 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || isGenerating) {
    const timeoutWarning = elapsedTime >= 45;
    
    return (
      <div className="space-y-3">
        <div className={`border rounded-lg p-4 ${
          timeoutWarning 
            ? 'bg-yellow-50 border-yellow-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${
                  timeoutWarning ? 'text-yellow-800' : 'text-blue-800'
                }`}>
                  {isGenerating ? 'Generating AI debate...' : 'Starting debate...'}
                </h4>
                <p className={`text-sm mt-1 ${
                  timeoutWarning ? 'text-yellow-700' : 'text-blue-600'
                }`}>
                  {timeoutWarning 
                    ? 'Taking longer than expected, may timeout soon...'
                    : 'This may take 30-60 seconds as our AI agents analyze the property'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`text-sm font-mono ${
                timeoutWarning ? 'text-yellow-700' : 'text-blue-600'
              }`}>
                {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
              </div>
              <button
                onClick={handleCancel}
                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="w-full bg-blue-100 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              timeoutWarning ? 'bg-yellow-500' : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min((elapsedTime / 60) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleStartDebate}
        disabled={disabled || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        data-testid="generate-debate"
      >
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Start AI Debate
        </div>
      </button>
    </div>
  );
};

export default DebateTrigger;
