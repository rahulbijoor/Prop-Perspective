import React, { useState, useEffect } from 'react';
import type { DebateViewProps, DebateResponse } from '../types/debate';
import { formatConfidenceScore, getConfidenceColor } from '../lib/utils';

interface ChatMessage {
  id: string;
  agent: 'investor' | 'risk';
  message: string;
  timestamp: Date;
  confidence?: number;
}

const ChatDebateView: React.FC<DebateViewProps> = ({ debate, onClose, property }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<'investor' | 'risk' | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Convert debate arguments into chat messages
  const chatScript: Omit<ChatMessage, 'id' | 'timestamp'>[] = [
    {
      agent: 'investor',
      message: "Hey there! I've been analyzing this property and I'm really excited about what I'm seeing. This looks like a fantastic investment opportunity!",
      confidence: 95
    },
    {
      agent: 'risk',
      message: "Hold on a second... I need to pump the brakes here. While I appreciate your enthusiasm, there are some serious concerns we need to discuss about this property.",
      confidence: 88
    },
    {
      agent: 'investor',
      message: `Let me break down why this is such a great deal: ${debate.pro_arguments[0]?.content.split('•').slice(1, 4).join(' ').trim()}`,
      confidence: debate.pro_arguments[0]?.strength || 90
    },
    {
      agent: 'risk',
      message: `I hear you, but here's what worries me: ${debate.con_arguments[0]?.content.split('•').slice(1, 4).join(' ').trim()}`,
      confidence: debate.con_arguments[0]?.strength || 85
    },
    {
      agent: 'investor',
      message: "Those are valid concerns, but look at the bigger picture! Austin's market fundamentals are incredibly strong. We're seeing consistent growth, major tech companies moving in, and the infrastructure investments are massive.",
      confidence: 92
    },
    {
      agent: 'risk',
      message: "But that's exactly my point - when everyone's saying the same thing about 'strong fundamentals,' that's often when you should be most cautious. Markets can turn quickly, especially in tech-heavy areas.",
      confidence: 87
    },
    {
      agent: 'investor',
      message: `The numbers don't lie though. At $${debate.market_insights.price_per_sqft}/sqft, this property is positioned perfectly in the market. The rental potential alone makes this a cash-flowing asset from day one.`,
      confidence: 89
    },
    {
      agent: 'risk',
      message: "Cash flow projections are great on paper, but what about the hidden costs? Property taxes are rising fast in Austin, insurance costs are climbing, and maintenance on older properties can eat into those returns quickly.",
      confidence: 84
    },
    {
      agent: 'investor',
      message: "You're right to consider those factors, but that's why this property stands out - it's been well-maintained and upgraded. Plus, the location gives us multiple exit strategies if needed.",
      confidence: 88
    },
    {
      agent: 'risk',
      message: "I'll give you that the location is solid, but I still think we need to be realistic about the risks. Market timing, interest rates, potential oversupply... there are a lot of variables here.",
      confidence: 82
    },
    {
      agent: 'investor',
      message: "Fair points all around. But here's my final thought - in real estate, you make money when you buy, not when you sell. This property gives us that opportunity.",
      confidence: 91
    },
    {
      agent: 'risk',
      message: "And my final thought is this - it's better to miss a good deal than to get stuck in a bad one. We need to make sure we're not letting FOMO drive our decision-making here.",
      confidence: 86
    }
  ];

  useEffect(() => {
    if (currentMessageIndex < chatScript.length) {
      const timer = setTimeout(() => {
        const scriptMessage = chatScript[currentMessageIndex];
        setIsTyping(scriptMessage.agent);
        
        // Simulate typing delay
        setTimeout(() => {
          const newMessage: ChatMessage = {
            id: `msg-${currentMessageIndex}`,
            ...scriptMessage,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, newMessage]);
          setIsTyping(null);
          setCurrentMessageIndex(prev => prev + 1);
        }, 1500 + Math.random() * 1000); // 1.5-2.5 second typing simulation
        
      }, 1000); // 1 second between messages
      
      return () => clearTimeout(timer);
    }
  }, [currentMessageIndex, chatScript.length]);

  const getAgentInfo = (agent: 'investor' | 'risk') => {
    if (agent === 'investor') {
      return {
        name: 'Investor Advocate',
        avatar: '🏡',
        color: 'bg-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else {
      return {
        name: 'Risk Analyst',
        avatar: '⚠️',
        color: 'bg-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                AI Agent Debate Chat
              </h1>
              <p className="text-gray-600 text-sm">
                {property?.address || 'Property Analysis Discussion'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 font-medium text-sm"
          >
            ← Back to Properties
          </button>
        </div>

        {/* Chat Container */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm">🏡</div>
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-sm">⚠️</div>
                </div>
                <div>
                  <h3 className="font-semibold">Property Analysis Chat</h3>
                  <p className="text-sm opacity-90">Investor Advocate & Risk Analyst</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">Confidence Score</div>
                <div className="font-bold">{formatConfidenceScore(debate.confidence_score)}</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const agentInfo = getAgentInfo(message.agent);
              return (
                <div key={message.id} className="flex items-start space-x-3 animate-fadeIn">
                  <div className={`w-10 h-10 ${agentInfo.color} rounded-full flex items-center justify-center text-white shadow-md flex-shrink-0`}>
                    {agentInfo.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{agentInfo.name}</span>
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.confidence && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {message.confidence}% confident
                        </span>
                      )}
                    </div>
                    <div className={`${agentInfo.bgColor} ${agentInfo.borderColor} border rounded-2xl rounded-tl-sm p-3 shadow-sm`}>
                      <p className="text-gray-800 text-sm leading-relaxed">{message.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 ${getAgentInfo(isTyping).color} rounded-full flex items-center justify-center text-white shadow-md flex-shrink-0`}>
                  {getAgentInfo(isTyping).avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{getAgentInfo(isTyping).name}</span>
                    <span className="text-xs text-gray-500">typing...</span>
                  </div>
                  <div className="bg-gray-100 border border-gray-200 rounded-2xl rounded-tl-sm p-3 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary Footer */}
          {currentMessageIndex >= chatScript.length && (
            <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">🤖 AI Analysis Complete</h4>
                <p className="text-sm text-gray-700 mb-3">{debate.summary}</p>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <h5 className="font-medium text-blue-900 mb-1">Final Recommendation</h5>
                  <p className="text-sm text-blue-800">{debate.recommendation}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Market Insights */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Market Intelligence Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Price Analysis</h4>
              <p className="text-2xl font-bold text-blue-800">${debate.market_insights.price_per_sqft}/sqft</p>
              <p className="text-sm text-blue-700">{debate.market_insights.market_position}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">Investment Outlook</h4>
              <p className="text-sm text-green-800">{debate.market_insights.investment_potential}</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatDebateView;
