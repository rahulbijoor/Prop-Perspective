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

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow relative">
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

        {property.variableData && (
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-1">Market Info</div>
            <div className="text-sm text-gray-800">{property.variableData}</div>
          </div>
        )}

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
