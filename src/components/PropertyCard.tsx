import type { Id } from '../../convex/_generated/dataModel';
interface Property {
  _id: Id<'properties'>;
  price?: string;
  unformattedPrice?: number;
  address?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZipcode?: string;
  beds?: number;
  baths?: number;
  area?: number;
  latitude?: number;
  longitude?: number;
  isZillowOwned?: boolean;
  variableData?: string;
  badgeInfo?: string;
  pgapt?: string;
  sgapt?: string;
  zestimate?: number;
  info3String?: string;
  brokerName?: string;
}

interface PropertyCardProps {
  property: Property;
}

function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price?: string, unformattedPrice?: number) => {
    if (price) return price;
    if (unformattedPrice) return `$${unformattedPrice.toLocaleString()}`;
    return 'Price not available';
  };

  const formatAddress = () => {
    if (property.address) return property.address;
    const parts = [
      property.addressStreet,
      property.addressCity,
      property.addressState,
      property.addressZipcode
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {formatPrice(property.price, property.unformattedPrice)}
          </h3>
          {property.isZillowOwned && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Zillow Owned
            </span>
          )}
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

        {property.brokerName && (
          <div className="text-xs text-gray-500 mt-4">
            Listed by: {property.brokerName}
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyCard;
