import type { RankedProperty } from '../types/property';
import type { DebateResponse } from '../types/debate';
import { formatScore, formatZip } from '../lib/utils';
import DebateTrigger from './DebateTrigger';

interface PropertyCardProps {
  property: RankedProperty;
  onDebateStart?: (debate: DebateResponse, property: RankedProperty) => void;
}

function PropertyCard({ property, onDebateStart }: PropertyCardProps) {
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
    <div className="property-card bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow relative" data-testid="property-card">
      {/* Rank Badge */}
      {property.rank && (
        <div className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
          #{property.rank}
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
            {/* Score Badge */}
            {property.score !== undefined && (
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Score: {formatScore(property.score)}
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

        {/* Debate Integration */}
        {onDebateStart && property._id && (
          <div className="mt-4 pt-4 border-t border-gray-200">
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
