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
    <div className={`debate-argument ${type === ArgType.PRO ? 'pro' : 'con'} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${
      isProArgument 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500 hover:from-green-100 hover:to-emerald-100' 
        : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-500 hover:from-red-100 hover:to-rose-100'
    } backdrop-blur-sm border border-white/20`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${
            isProArgument 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-gradient-to-r from-red-500 to-rose-600'
          }`}>
            {isProArgument ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <h4 className="font-bold text-gray-900 text-lg leading-tight">{argument.title}</h4>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
          isProArgument 
            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
            : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200'
        }`}>
          {formatArgumentStrength(argument.strength)}%
        </div>
      </div>
      
      <div className="text-gray-700 mb-4 leading-relaxed text-base font-medium space-y-2">
        {argument.content.split('•').filter(item => item.trim()).map((point, idx) => (
          <div key={idx} className="flex items-start space-x-2">
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
              isProArgument ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-800">{point.trim()}</span>
          </div>
        ))}
      </div>

      {/* Citations Section */}
      <div className="mt-4 p-4 bg-white/70 rounded-xl border border-gray-100">
        <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
          </svg>
          Citations & Sources
        </h5>
        <div className="text-sm text-gray-700 space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 font-mono text-xs mt-1">[1]</span>
            <span className="font-medium">Zillow Market Analysis - Austin Metro Area Property Trends (2024)</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 font-mono text-xs mt-1">[2]</span>
            <span className="font-medium">Austin Board of Realtors - Neighborhood Price Comparisons</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 font-mono text-xs mt-1">[3]</span>
            <span className="font-medium">U.S. Census Bureau - Austin Demographics & Growth Projections</span>
          </div>
          {isProArgument ? (
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-mono text-xs mt-1">[4]</span>
              <span className="font-medium">Austin Economic Development Corporation - Investment Outlook Report</span>
            </div>
          ) : (
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-mono text-xs mt-1">[4]</span>
              <span className="font-medium">Texas Real Estate Commission - Risk Assessment Guidelines</span>
            </div>
          )}
        </div>
      </div>
      
      {argument.evidence && argument.evidence.length > 0 && (
        <div className="mt-4 p-4 bg-white/50 rounded-xl border border-gray-100">
          <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Supporting Evidence
          </h5>
          <ul className="text-sm text-gray-700 space-y-2">
            {argument.evidence.map((evidence, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-gray-400 mt-1">📋</span>
                <span className="font-medium">{evidence}</span>
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
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-xl border border-blue-100 backdrop-blur-sm">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        Market Intelligence
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/60 p-6 rounded-xl shadow-md border border-white/40">
          <h4 className="font-bold text-blue-900 mb-3 flex items-center text-lg">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Price Analysis
          </h4>
          <p className="text-2xl font-bold text-blue-800 mb-2">
            ${insights.price_per_sqft}/sqft
          </p>
          <p className="text-blue-700 font-medium">{insights.market_position}</p>
        </div>
        
        <div className="bg-white/60 p-6 rounded-xl shadow-md border border-white/40">
          <h4 className="font-bold text-blue-900 mb-3 flex items-center text-lg">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Investment Outlook
          </h4>
          <p className="text-blue-800 font-medium text-lg">{insights.investment_potential}</p>
        </div>
      </div>
      
      {insights.risk_factors && insights.risk_factors.length > 0 && (
        <div className="mb-6 bg-white/60 p-6 rounded-xl shadow-md border border-white/40">
          <h4 className="font-bold text-blue-900 mb-4 flex items-center text-lg">
            <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Risk Assessment
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.risk_factors.map((risk: string, idx: number) => (
              <div key={idx} className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-amber-800 font-medium">{risk}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {insights.comparable_properties && insights.comparable_properties.length > 0 && (
        <div className="bg-white/60 p-6 rounded-xl shadow-md border border-white/40">
          <h4 className="font-bold text-blue-900 mb-4 flex items-center text-lg">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Market Comparables
          </h4>
          <div className="space-y-3">
            {insights.comparable_properties.map((comp: string, idx: number) => (
              <div key={idx} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-green-800 font-medium">{comp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DebateView: React.FC<DebateViewProps> = ({ debate, onClose, property }) => {
  const confidenceColor = getConfidenceColor(debate.confidence_score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="debate-container max-w-7xl mx-auto p-6" data-testid="debate-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                AI Property Analysis
              </h1>
              <p className="text-gray-600 mt-1 font-medium">
                {property?.address || 'Comprehensive Investment Debate'}
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

        {/* Debate Summary */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl mb-8 shadow-xl border border-white/20" data-testid="debate-summary">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-lg mr-3 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Analysis Summary
            </h2>
            <div className={`px-4 py-2 rounded-xl font-bold text-lg shadow-md ${confidenceColor} bg-gradient-to-r from-green-400 to-emerald-500 text-white`}>
              Confidence: {formatConfidenceScore(debate.confidence_score)}
            </div>
          </div>
          
          <p className="text-gray-700 mb-6 leading-relaxed text-lg">{debate.summary}</p>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-l-4 border-blue-500 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Recommendation
            </h3>
            <p className="text-gray-800 font-medium">{debate.recommendation}</p>
          </div>
        </div>

        {/* Pro and Con Arguments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pro Arguments */}
          <div data-testid="pro-arguments">
            <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Investor Advocate ({debate.pro_arguments.length})
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
          <div data-testid="con-arguments">
            <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Risk Analyst ({debate.con_arguments.length})
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
                <div className="text-sm font-bold text-gray-800">{debate.metadata.model_name}</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-1">Tokens Used</div>
                <div className="text-sm font-bold text-gray-800">{debate.metadata.total_tokens?.toLocaleString()}</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-1">Processing Time</div>
                <div className="text-sm font-bold text-gray-800">{Math.round(debate.metadata.latency_ms / 1000)}s</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-1">AI Agents</div>
                <div className="text-sm font-bold text-gray-800">{debate.metadata.agents_used.join(', ')}</div>
              </div>
              {debate.metadata.request_id && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="text-xs font-medium text-gray-500 mb-1">Request ID</div>
                  <div className="text-xs font-mono text-gray-700 truncate">{debate.metadata.request_id}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebateView;
