import React from 'react';
import type { DebateViewProps, DebateArgument, ArgumentType, MarketInsights } from '../types/debate';
import { ArgumentType as ArgType } from '../types/debate';
import { 
  formatConfidenceScore, 
  getConfidenceColor, 
  formatArgumentStrength 
} from '../lib/utils';

const ArgumentCard: React.FC<{ argument: DebateArgument; type: ArgumentType; index: number }> = ({ 
  argument, 
  type
}) => {
  const isProArgument = type === ArgType.PRO;
  
  return (
    <div className={`p-4 rounded-lg border-l-4 ${
      isProArgument 
        ? 'bg-green-50 border-green-500' 
        : 'bg-red-50 border-red-500'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{argument.title}</h4>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          isProArgument 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          Strength: {formatArgumentStrength(argument.strength)}
        </div>
      </div>
      
      <p className="text-gray-700 mb-3 leading-relaxed">{argument.content}</p>
      
      {argument.evidence && argument.evidence.length > 0 && (
        <div className="mt-3">
          <h5 className="text-sm font-medium text-gray-600 mb-2">Supporting Evidence:</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            {argument.evidence.map((evidence, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>{evidence}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const MarketInsightsPanel: React.FC<{ insights: MarketInsights }> = ({ insights }) => {
  return (
    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Market Insights
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-blue-800 mb-2">Price Analysis</h4>
          <p className="text-sm text-blue-700">
            <span className="font-medium">${insights.price_per_sqft}/sqft</span>
          </p>
          <p className="text-sm text-blue-600 mt-1">{insights.market_position}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-blue-800 mb-2">Investment Potential</h4>
          <p className="text-sm text-blue-700">{insights.investment_potential}</p>
        </div>
      </div>
      
      {insights.risk_factors && insights.risk_factors.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-blue-800 mb-2">Risk Factors</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {insights.risk_factors.map((risk: string, idx: number) => (
              <li key={idx} className="flex items-start">
                <span className="text-blue-400 mr-2">⚠</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {insights.comparable_properties && insights.comparable_properties.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-blue-800 mb-2">Comparable Properties</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {insights.comparable_properties.map((comp: string, idx: number) => (
              <li key={idx} className="flex items-start">
                <span className="text-blue-400 mr-2">🏠</span>
                <span>{comp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const DebateView: React.FC<DebateViewProps> = ({ debate, onClose, property }) => {
  const confidenceColor = getConfidenceColor(debate.confidence_score);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Investment Debate</h1>
          <p className="text-gray-600 mt-1">
            {property?.address || 'Property Analysis'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ← Back to Properties
        </button>
      </div>

      {/* Debate Summary */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Debate Summary</h2>
          <div className={`text-lg font-bold ${confidenceColor}`}>
            Confidence: {formatConfidenceScore(debate.confidence_score)}
          </div>
        </div>
        
        <p className="text-gray-700 mb-4 leading-relaxed">{debate.summary}</p>
        
        <div className="bg-white p-4 rounded border-l-4 border-blue-500">
          <h3 className="font-semibold text-gray-900 mb-2">Recommendation</h3>
          <p className="text-gray-700">{debate.recommendation}</p>
        </div>
      </div>

      {/* Pro and Con Arguments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pro Arguments */}
        <div>
          <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Pro Arguments ({debate.pro_arguments.length})
          </h2>
          <div className="space-y-4">
            {debate.pro_arguments.map((argument, index) => (
              <ArgumentCard
                key={index}
                argument={argument}
                type={ArgType.PRO}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Con Arguments */}
        <div>
          <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Con Arguments ({debate.con_arguments.length})
          </h2>
          <div className="space-y-4">
            {debate.con_arguments.map((argument, index) => (
              <ArgumentCard
                key={index}
                argument={argument}
                type={ArgType.CON}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <MarketInsightsPanel insights={debate.market_insights} />

      {/* Metadata */}
      {debate.metadata && (
        <div className="mt-6 text-sm text-gray-500 bg-gray-50 p-4 rounded">
          <div className="flex flex-wrap gap-4">
            <span>Model: {debate.metadata.model_used}</span>
            <span>Tokens: {debate.metadata.total_tokens?.toLocaleString()}</span>
            <span>Generated in: {debate.metadata.latency_seconds}s</span>
            <span>ID: {debate.metadata.debate_id}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebateView;
