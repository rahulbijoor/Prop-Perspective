import { formatCurrency } from '../lib/utils';

interface PropertyFiltersProps {
  budget: number;
  setBudget: (n: number) => void;
  minBeds: number;
  setMinBeds: (n: number) => void;
  minBaths?: number;
  setMinBaths?: (n: number) => void;
  minSqft?: number;
  setMinSqft?: (n: number | undefined) => void;
  onReset?: () => void;
}

function PropertyFilters({
  budget,
  setBudget,
  minBeds,
  setMinBeds,
  minBaths,
  setMinBaths,
  minSqft,
  setMinSqft,
  onReset
}: PropertyFiltersProps) {
  const bedOptions = [0, 1, 2, 3, 4, 5];
  const bathOptions = [0, 1, 2, 3, 4, 5];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter Properties</h3>
        {onReset && (
          <button
            onClick={onReset}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Budget Filter */}
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
            Max Budget: {formatCurrency(budget)}
          </label>
          <input
            id="budget"
            type="range"
            min={100000}
            max={1000000}
            step={10000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$100K</span>
            <span>$1M</span>
          </div>
        </div>

        {/* Bedrooms Filter */}
        <div>
          <label htmlFor="minBeds" className="block text-sm font-medium text-gray-700 mb-2">
            Min Bedrooms
          </label>
          <select
            id="minBeds"
            value={minBeds}
            onChange={(e) => setMinBeds(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {bedOptions.map(beds => (
              <option key={beds} value={beds}>
                {beds === 0 ? 'Any' : beds === 5 ? '5+' : beds}
              </option>
            ))}
          </select>
        </div>

        {/* Bathrooms Filter */}
        {setMinBaths && (
          <div>
            <label htmlFor="minBaths" className="block text-sm font-medium text-gray-700 mb-2">
              Min Bathrooms
            </label>
            <select
              id="minBaths"
              value={minBaths ?? 0}
              onChange={(e) => setMinBaths(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {bathOptions.map(baths => (
                <option key={baths} value={baths}>
                  {baths === 0 ? 'Any' : baths === 5 ? '5+' : baths}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Square Footage Filter */}
        {setMinSqft && (
          <div>
            <label htmlFor="minSqft" className="block text-sm font-medium text-gray-700 mb-2">
              Min Square Feet
            </label>
            <input
              id="minSqft"
              type="number"
              min={0}
              step={100}
              value={minSqft ?? ''}
              onChange={(e) => setMinSqft?.(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Any"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyFilters;
