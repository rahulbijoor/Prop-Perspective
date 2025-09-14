import type { RankedProperty } from '../types/property';
import type { DebateResponse } from '../types/debate';
import { formatScore, formatZip } from '../lib/utils';
import { distanceCalculator, DistanceResult } from '../lib/inkeep-agent';
import DebateTrigger from './DebateTrigger';
import { useState, useEffect } from 'react';

interface PropertyCardProps {
  property: RankedProperty;
  onDebateStart?: (debate: DebateResponse, property: RankedProperty) => void;
  userZipCode?: string;
  // Comparison props
  isSelected?: boolean;
  onToggleComparison?: (propertyId: string) => void;
  comparisonDisabled?: boolean;
  showComparison?: boolean;
}

function PropertyCard({ 
  property, 
  onDebateStart, 
  userZipCode,
  isSelected = false,
  onToggleComparison,
  comparisonDisabled = false,
  showComparison = false
}: PropertyCardProps) {
  const [distanceInfo, setDistanceInfo] = useState<DistanceResult | null>(null);

  // Calculate distance when userZipCode changes using Inkeep agent
  useEffect(() => {
    if (userZipCode && property.addressZipcode) {
      const propertyZip = formatZip(property.addressZipcode) || '';
      if (propertyZip) {
        const calculateDistance = async () => {
          try {
            // Use distance calculator for distance calculation
            const result = await distanceCalculator.calculateDistance(userZipCode, propertyZip);
            setDistanceInfo(result);
          } catch (error) {
            console.error('Distance calculation error:', error);
            setDistanceInfo(null);
          }
        };
        
        calculateDistance();
      }
    } else {
      setDistanceInfo(null);
    }
  }, [userZipCode, property.addressZipcode]);

  const formatPrice = (price?: number, unformattedPrice?: number) => {
    if (price) return `$${price.toLocaleString()}`;
    if (unformattedPrice) return `$${unformattedPrice.toLocaleString()}`;
    return 'Price not available';
  };

  const formatAddress = () => {
    if (property.address) return property.address;
    const parts = [
      property.addressStreet,
      property.addressCity,
      property.addressState,
      formatZip(property.addressZipcode),
    ].filter(Boolean).map(String);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  };

  const parseMarketInfo = (variableData: string) => {
    try {
      // Handle both direct JSON objects and stringified JSON
      let parsed;
      if (typeof variableData === 'string') {
        // Try to parse as JSON first
        try {
          parsed = JSON.parse(variableData);
        } catch {
          // If it fails, check if it looks like a Python dict representation
          if (variableData.includes("'type':") || variableData.includes('"type":')) {
            // Convert Python dict format to JSON
            const jsonString = variableData
              .replace(/'/g, '"')
              .replace(/True/g, 'true')
              .replace(/False/g, 'false')
              .replace(/None/g, 'null');
            parsed = JSON.parse(jsonString);
          } else {
            throw new Error('Not JSON format');
          }
        }
      } else {
        parsed = variableData;
      }

      if (parsed && parsed.type && parsed.text) {
        return {
          type: parsed.type,
          text: parsed.text
        };
      }
    } catch (e) {
      console.log('Failed to parse market info:', e, variableData);
    }
    return { type: 'INFO', text: variableData };
  };

  const getTagColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'OPEN_HOUSE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PRICE_DROP':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'NEW_LISTING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'VIRTUAL_TOUR':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'RECENTLY_SOLD':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const formatTagType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className={`property-card bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow relative ${isSelected ? 'ring-2 ring-blue-500 border-blue-300' : ''}`} data-testid="property-card">
      {/* Comparison Selection */}
      {showComparison && onToggleComparison && (
        <div className="absolute top-3 left-3 z-10">
          <label className="comparison-checkbox-container">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleComparison(property._id)}
              disabled={comparisonDisabled && !isSelected}
              className="comparison-checkbox"
              title={comparisonDisabled && !isSelected ? 'Maximum properties selected' : 'Add to comparison'}
            />
            <span className="comparison-checkmark">
              {isSelected ? '✓' : '+'}
            </span>
          </label>
        </div>
      )}

      {/* Rank Badge */}
      {property.rank && (
        <div className={`absolute top-3 ${showComparison ? 'right-3' : 'right-3'} bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full`}>
          #{property.rank}
        </div>
      )}

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-12 bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
          Selected
        </div>
      )}
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {formatPrice(property.price, property.unformattedPrice)}
          </h3>
          <div className="flex flex-col items-end gap-2">
            {property.isZillowOwned && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Zillow Owned
              </span>
            )}
          </div>
        </div>

        <p className="text-gray-600 mb-4">{formatAddress()}</p>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {property.beds || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Beds</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {property.baths || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Baths</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {property.area ? `${property.area.toLocaleString()}` : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Sq Ft</div>
          </div>
        </div>

        {/* Enhanced Distance Information */}
        {distanceInfo && distanceInfo.distance > 0 && (
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-800 flex items-center">
                    📍 {distanceInfo.distance} miles away
                  </div>
                  <div className="text-sm text-gray-600 flex items-center mt-1">
                    🚗 ~{distanceInfo.travelTime} drive
                  </div>
                </div>
              </div>
              
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-blue-100">
              <div className="text-xs text-gray-600 font-medium">
                🤖 {distanceInfo.route}
              </div>
              <div className="flex items-center text-xs text-blue-600">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                Live calculation
              </div>
            </div>
          </div>
        )}

        {property.zestimate && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Zestimate</div>
            <div className="text-lg font-semibold text-gray-900">
              ${property.zestimate.toLocaleString()}
            </div>
          </div>
        )}

        {property.variableData && (() => {
          const marketInfo = parseMarketInfo(property.variableData);
          return (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Market Info</div>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getTagColor(marketInfo.type)}`}>
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {formatTagType(marketInfo.type)}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-2 leading-relaxed">
                {marketInfo.text}
              </div>
            </div>
          );
        })()}

        {/* Score Breakdown */}
        {property.scoreBreakdown && (
          <div className="mb-4 p-3 bg-purple-50 rounded border border-purple-200">
            <div className="text-sm font-medium text-purple-900 mb-2">Score Breakdown</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Price Efficiency:</span>
                <span className="ml-1 font-medium">{formatScore(property.scoreBreakdown.priceEfficiency)}</span>
              </div>
              <div>
                <span className="text-gray-600">Bedroom Match:</span>
                <span className="ml-1 font-medium">{formatScore(property.scoreBreakdown.bedroomMatch)}</span>
              </div>
            </div>
          </div>
        )}

        {property.brokerName && (
          <div className="text-xs text-gray-500 mb-4">
            Listed by: {property.brokerName}
          </div>
        )}

        {/* Schedule Meeting & Debate Integration */}
        {onDebateStart && property._id && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <a 
              href="https://calendly.com/rahulbijoor/30min" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-sm text-sm text-center inline-block"
            >
              📅 Schedule Meeting
            </a>
            <DebateTrigger
              propertyId={property._id}
              onDebateStart={(debate) => onDebateStart(debate, property)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyCard;
