import React, { useState } from 'react';
import type { DebateTriggerProps } from '../types/debate';
import { useDebate } from '../hooks/useDebate';

const DebateTrigger: React.FC<DebateTriggerProps> = ({ 
  propertyId, 
  onDebateStart, 
  disabled = false 
}) => {
  const { startDebate, isLoading, isGenerating, error, clearError } = useDebate();
  const [showError, setShowError] = useState(false);

  const handleStartDebate = async () => {
    try {
      clearError();
      setShowError(false);
      
      const debate = await startDebate(propertyId);
      onDebateStart(debate);
    } catch (err) {
      console.error('Failed to start debate:', err);
      setShowError(true);
    }
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
    return (
      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-800">
                {isGenerating ? 'Generating AI debate...' : 'Starting debate...'}
              </h4>
              <p className="text-sm text-blue-600 mt-1">
                This may take 30-60 seconds as our AI agents analyze the property
              </p>
            </div>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="w-full bg-blue-100 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleStartDebate}
      disabled={disabled || isLoading}
      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
    >
      <div className="flex items-center justify-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Start AI Debate
      </div>
    </button>
  );
};

export default DebateTrigger;
