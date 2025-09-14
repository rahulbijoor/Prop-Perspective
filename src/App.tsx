import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { useState, useEffect } from 'react'
import PropertyCard from './components/PropertyCard'
import PropertyFilters from './components/PropertyFilters'
import LocationInput from './components/LocationInput'
import DebateView from './components/DebateView'
import PropertyComparison from './components/PropertyComparison'
import ComparisonSelector from './components/ComparisonSelector'
import ErrorBoundary from './components/ErrorBoundary'
import { DEFAULT_BUDGET, DEFAULT_MIN_BEDS, DEFAULT_MIN_BATHS } from './lib/utils'
import useComparison from './hooks/useComparison'
import { ComparisonMode } from './types/comparison'
import type { RankedProperty } from './types/property'
import type { DebateResponse } from './types/debate'

function App() {
  // Filter state for immediate UI updates
  const [budget, setBudget] = useState(DEFAULT_BUDGET);
  const [minBeds, setMinBeds] = useState(DEFAULT_MIN_BEDS);
  const [minBaths, setMinBaths] = useState(DEFAULT_MIN_BATHS);

  // Debounced mirrors for query
  const [debBudget, setDebBudget] = useState(budget);
  const [debBeds, setDebBeds] = useState(minBeds);
  const [debBaths, setDebBaths] = useState(minBaths);

  // Location state for distance calculation
  const [userZipCode, setUserZipCode] = useState<string>('');

  // Debate state
  const [activeDebate, setActiveDebate] = useState<DebateResponse | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<RankedProperty | null>(null);

  // View state
  const [currentView, setCurrentView] = useState<'properties' | 'comparison'>('properties');

  // Use ranked properties query with debounced values
  const properties = useQuery(api.properties.getRankedProperties, {
    maxBudget: debBudget,
    minBeds: debBeds,
    minBaths: debBaths
  });

  // Comparison functionality
  const comparison = useComparison(properties || []);

  // Debounce the query arguments
  useEffect(() => {
    const id = setTimeout(() => setDebBudget(budget), 300);
    return () => clearTimeout(id);
  }, [budget]);

  useEffect(() => {
    const id = setTimeout(() => setDebBeds(minBeds), 300);
    return () => clearTimeout(id);
  }, [minBeds]);

  useEffect(() => {
    const id = setTimeout(() => setDebBaths(minBaths), 300);
    return () => clearTimeout(id);
  }, [minBaths]);

  const handleReset = () => {
    setBudget(DEFAULT_BUDGET);
    setMinBeds(DEFAULT_MIN_BEDS);
    setMinBaths(DEFAULT_MIN_BATHS);
  };

  const handleDebateStart = (debate: DebateResponse, property: RankedProperty) => {
    setActiveDebate(debate);
    setSelectedProperty(property);
  };

  const handleCloseDebate = () => {
    setActiveDebate(null);
    setSelectedProperty(null);
  };

  // Comparison handlers
  const handleCompareProperties = () => {
    setCurrentView('comparison');
  };

  const handleCloseComparison = () => {
    setCurrentView('properties');
  };

  const handleStartDebateFromComparison = (propertyId: string) => {
    const property = properties?.find((p: RankedProperty) => p._id === propertyId);
    if (property) {
      // For now, we'll need to generate a mock debate or integrate with the existing debate system
      // This would typically trigger the debate generation process
      console.log('Starting debate for property:', propertyId);
    }
  };

  // If there's an active debate, show the debate view
  if (activeDebate && selectedProperty) {
    return (
      <div className="demo-mode min-h-screen bg-gray-50">
        <ErrorBoundary fallback={<div className="p-4">Failed to render debate.</div>}>
          <DebateView
            debate={activeDebate}
            property={selectedProperty}
            onClose={handleCloseDebate}
          />
        </ErrorBoundary>
      </div>
    );
  }

  // If in comparison view and we have a comparison result, show the comparison
  if (currentView === 'comparison' && comparison.comparisonResult) {
    return (
      <div className="demo-mode min-h-screen bg-gray-50">
        <ErrorBoundary fallback={<div className="p-4">Failed to render comparison.</div>}>
          <PropertyComparison
            comparisonResult={comparison.comparisonResult}
            viewMode={comparison.viewMode}
            onViewModeChange={comparison.setViewMode}
            onStartDebate={handleStartDebateFromComparison}
            onExport={comparison.exportComparison}
            onClose={handleCloseComparison}
          />
        </ErrorBoundary>
      </div>
    );
  }

  return (
    <div className="demo-mode min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg border-b-2 border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DualLens
                </h1>
                <p className="text-sm text-gray-600 font-medium">AI Apartment Hunting Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                🤖 Inkeep Agent Active
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
                ✨ AI-Powered
              </div>
            </div>
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

        {/* Location Input for Distance Calculation */}
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
          <div className="max-w-md">
            <LocationInput
              onLocationSelect={setUserZipCode}
              label="Calculate Distance From"
              placeholder="Enter your ZIP code or neighborhood..."
            />
          </div>
          {userZipCode && (
            <div className="mt-3 text-sm text-gray-600">
              📍 Showing distances from ZIP code {userZipCode}
            </div>
          )}
        </div>

        {/* Results Summary */}
        {properties !== undefined && (
          <div className="mb-6 text-sm text-gray-600">
            Found {properties.length} properties matching your criteria
            {userZipCode && ' with distance calculations'}
          </div>
        )}

        {/* Comparison Selector */}
        {comparison.selectedPropertiesData.length > 0 && (
          <div className="mb-6">
            <ComparisonSelector
              selectedProperties={comparison.comparisonResult?.properties || []}
              onRemoveProperty={comparison.removeProperty}
              onClearAll={comparison.clearAll}
              onCompare={handleCompareProperties}
              canCompare={comparison.canCompare}
              maxProperties={comparison.MAX_COMPARISON_PROPERTIES}
              selectionSummary={comparison.getComparisonSummary()}
            />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="property-grid">
            {properties.map((property: RankedProperty) => (
              <PropertyCard 
                key={property._id} 
                property={property} 
                onDebateStart={handleDebateStart}
                userZipCode={userZipCode}
                // Comparison props
                showComparison={true}
                isSelected={comparison.isPropertySelected(property._id)}
                onToggleComparison={comparison.toggleProperty}
                comparisonDisabled={comparison.isMaxSelected}
              />
            ))}
          </div>
        )}

        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🎯 AI Features Available!
          </h3>
          <p className="text-gray-600 mb-4">
            Click "Start AI Debate" on any property card to get dual perspectives 
            with AI-powered debates between different viewpoints to help you make 
            informed investment decisions.
          </p>
          <p className="text-gray-600">
            <strong>🆕 New:</strong> Select multiple properties using the checkboxes to compare them side-by-side 
            with AI-powered insights and recommendations!
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
