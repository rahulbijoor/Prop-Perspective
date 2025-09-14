import React, { useState, useEffect } from 'react';
import type { Id } from '../../convex/_generated/dataModel';
import { useComparison } from '../hooks/useComparison';

interface ComparisonTriggerProps {
  propertyIds: Id<'properties'>[];
  onComparisonStart: (comparison: any) => void;
  disabled?: boolean;
}

const ComparisonTrigger: React.FC<ComparisonTriggerProps> = ({
  propertyIds,
  onComparisonStart,
  disabled = false
}) => {
  const { startComparison, isLoading, isGenerating, error, clearError } = useComparison();
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

  const handleStartComparison = async () => {
    try {
      clearError();
      setShowError(false);
      setStartTime(Date.now());
      setElapsedTime(0);

      // Create abort controller for cancellation
      const controller = new AbortController();
      setAbortController(controller);

      const comparison = await startComparison(propertyIds);
      onComparisonStart(comparison);
    } catch (err) {
      console.error('Failed to start comparison:', err);
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
    handleStartComparison();
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
              <h4 className="text-sm font-medium text-red-800">Failed to generate comparison</h4>
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
    const timeoutWarning = elapsedTime >= 60;

    return (
      <div className="space-y-3">
        <div className={`border rounded-lg p-4 ${
          timeoutWarning
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-3"></div>
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${
                  timeoutWarning ? 'text-yellow-800' : 'text-purple-800'
                }`}>
                  {isGenerating ? 'Generating AI comparison...' : 'Starting comparison...'}
                </h4>
                <p className={`text-sm mt-1 ${
                  timeoutWarning ? 'text-yellow-700' : 'text-purple-600'
                }`}>
                  {timeoutWarning
                    ? 'Taking longer than expected, may timeout soon...'
                    : 'This may take 45-90 seconds as our AI agents analyze multiple properties'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`text-sm font-mono ${
                timeoutWarning ? 'text-yellow-700' : 'text-purple-600'
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
        <div className="w-full bg-purple-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              timeoutWarning ? 'bg-yellow-500' : 'bg-purple-600'
            }`}
            style={{ width: `${Math.min((elapsedTime / 90) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleStartComparison}
        disabled={disabled || isLoading || propertyIds.length < 2}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        data-testid="generate-comparison"
      >
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Compare {propertyIds.length} Properties
        </div>
      </button>

      {propertyIds.length < 2 && (
        <p className="text-sm text-gray-500 text-center">
          Select at least 2 properties to compare
        </p>
      )}
    </div>
  );
};

export default ComparisonTrigger;
