import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { useState } from 'react'
import PropertyCard from './components/PropertyCard'
import PropertyFilters from './components/PropertyFilters'
import { DEFAULT_BUDGET, DEFAULT_MIN_BEDS, DEFAULT_MIN_BATHS, debounce } from './lib/utils'
import type { RankedProperty } from './types/property'

function App() {
  // Filter state
  const [budget, setBudget] = useState(DEFAULT_BUDGET);
  const [minBeds, setMinBeds] = useState(DEFAULT_MIN_BEDS);
  const [minBaths, setMinBaths] = useState(DEFAULT_MIN_BATHS);

  // Use ranked properties query
  const properties = useQuery(api.properties.getRankedProperties, {
    maxBudget: budget,
    minBeds,
    minBaths
  });

  const handleReset = () => {
    setBudget(DEFAULT_BUDGET);
    setMinBeds(DEFAULT_MIN_BEDS);
    setMinBaths(DEFAULT_MIN_BATHS);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              DualLens - AI Apartment Hunting Assistant
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Ranked Austin Properties
          </h2>
          <p className="text-gray-600">
            Browse properties ranked by your preferences with AI-powered insights
          </p>
        </div>

        {/* Property Filters */}
        <PropertyFilters
          budget={budget}
          setBudget={setBudget}
          minBeds={minBeds}
          setMinBeds={setMinBeds}
          minBaths={minBaths}
          setMinBaths={setMinBaths}
          onReset={handleReset}
        />

        {/* Results Summary */}
        {properties !== undefined && (
          <div className="mb-6 text-sm text-gray-600">
            Found {properties.length} properties matching your criteria
          </div>
        )}

        {/* Properties Grid */}
        {properties === undefined ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-gray-500">Loading properties...</div>
          </div>
        ) : properties.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="text-lg text-gray-500 mb-2">No properties found</div>
              <div className="text-sm text-gray-400">Try adjusting your filters</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: RankedProperty) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}

        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Coming Soon: AI Debate Feature
          </h3>
          <p className="text-gray-600">
            Get dual perspectives on properties with AI-powered debates between 
            different viewpoints to help you make informed decisions.
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
