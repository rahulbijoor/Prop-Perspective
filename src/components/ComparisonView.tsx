import React from 'react';
import type { ComparisonResponse, ComparisonInsight } from '../types/comparison';
import { formatConfidenceScore, getConfidenceColor } from '../lib/utils';

interface ComparisonViewProps {
  comparison: ComparisonResponse;
  onClose: () => void;
  propertyIds: string[];
}

const InsightCard: React.FC<{ insight: ComparisonInsight; index: number }> = ({
  insight,
  index
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'value': return 'from-green-500 to-emerald-600';
      case 'location': return 'from-blue-500 to-indigo-600';
      case 'space': return 'from-purple-500 to-violet-600';
      case 'family_suitability': return 'from-pink-500 to-rose-600';
      case 'investment': return 'from-amber-500 to-orange-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'value': return '💰';
      case 'location': return '📍';
      case 'space': return '🏠';
      case 'family_suitability': return '👨‍👩‍👧‍👦';
      case 'investment': return '📈';
      default: return '📊';
    }
  };

  return (
    <div className="comparison-insight bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-r ${getCategoryColor(insight.category)}`}>
            <span className="text-lg">{getCategoryIcon(insight.category)}</span>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-lg leading-tight">{insight.title}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{insight.category.replace('_', ' ')}</span>
              <div className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getCategoryColor(insight.category)} text-white`}>
                {Math.round(insight.strength * 100)}% strength
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-gray-700 mb-4 leading-relaxed text-base">
        {insight.content.split('\n').map((paragraph, idx) => (
          <p key={idx} className="mb-3">{paragraph}</p>
        ))}
      </div>

      {insight.recommendations && insight.recommendations.length > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <h5 className="text-sm font-bold text-blue-900 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recommendations
          </h5>
          <ul className="text-sm text-blue-800 space-y-2">
            {insight.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="font-medium">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const ComparisonSummary: React.FC<{ summary: ComparisonResponse['summary'] }> = ({ summary }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-xl border border-blue-100">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        Comparison Summary
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white/60 p-6 rounded-xl shadow-md border border-white/40">
          <h4 className="font-bold text-blue-900 mb-3 flex items-center text-lg">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Properties Compared
          </h4>
          <p className="text-3xl font-bold text-blue-800">{summary.total_properties}</p>
        </div>

        <div className="bg-white/60 p-6 rounded-xl shadow-md border border-white/40">
          <h4 className="font-bold text-blue-900 mb-3 flex items-center text-lg">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Price Range
          </h4>
          <p className="text-xl font-bold text-blue-800">
            ${summary.price_range.min?.toLocaleString() || 'N/A'} - ${summary.price_range.max?.toLocaleString() || 'N/A'}
          </p>
        </div>

        <div className="bg-white/60 p-6 rounded-xl shadow-md border border-white/40">
          <h4 className="font-bold text-blue-900 mb-3 flex items-center text-lg">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Avg Price/sqft
          </h4>
          <p className="text-2xl font-bold text-blue-800">
            ${summary.avg_price_per_sqft?.toLocaleString() || 'N/A'}
          </p>
        </div>
      </div>

      <div className="bg-white/60 p-6 rounded-xl shadow-md border border-white/40 mb-6">
        <h4 className="font-bold text-blue-900 mb-4 flex items-center text-lg">
          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Key Findings
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {summary.key_findings.map((finding, idx) => (
            <div key={idx} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-green-800 font-medium">{finding}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-l-4 border-green-500 shadow-sm">
        <h4 className="font-bold text-green-900 mb-3 text-lg flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Overall Recommendation
        </h4>
        <p className="text-green-800 font-medium text-lg">{summary.overall_recommendation}</p>
      </div>
    </div>
  );
};

const ComparisonView: React.FC<ComparisonViewProps> = ({ comparison, onClose, propertyIds }) => {
  const confidenceColor = getConfidenceColor(comparison.confidence_score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="comparison-container max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                AI Property Comparison
              </h1>
              <p className="text-gray-600 mt-1 font-medium">
                Comparing {comparison.summary.total_properties} properties
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 font-medium"
          >
            ← Back to Properties
          </button>
        </div>

        {/* Comparison Summary */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl mb-8 shadow-xl border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg mr-3 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Comparison Results
            </h2>
            <div className={`px-4 py-2 rounded-xl font-bold text-lg shadow-md ${confidenceColor} bg-gradient-to-r from-purple-400 to-pink-500 text-white`}>
              Confidence: {formatConfidenceScore(comparison.confidence_score)}
            </div>
          </div>
        </div>

        {/* Comparison Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {comparison.insights.map((insight, index) => (
            <InsightCard
              key={index}
              insight={insight}
              index={index}
            />
          ))}
        </div>

        {/* Detailed Summary */}
        <ComparisonSummary summary={comparison.summary} />

        {/* Metadata */}
        {comparison.metadata && (
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl shadow-lg border border-gray-100">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Analysis Details
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-1">AI Model</div>
                <div className="text-sm font-bold text-gray-800">{comparison.metadata.model_name}</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-1">Tokens Used</div>
                <div className="text-sm font-bold text-gray-800">{comparison.metadata.total_tokens?.toLocaleString()}</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-1">Processing Time</div>
                <div className="text-sm font-bold text-gray-800">{Math.round(comparison.metadata.latency_ms / 1000)}s</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-1">AI Agents</div>
                <div className="text-sm font-bold text-gray-800">{comparison.metadata.agents_used.join(', ')}</div>
              </div>
              {comparison.metadata.request_id && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="text-xs font-medium text-gray-500 mb-1">Request ID</div>
                  <div className="text-xs font-mono text-gray-700 truncate">{comparison.metadata.request_id}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonView;
