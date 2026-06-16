import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

import { useState, useEffect } from 'react'
import PropertyCard from './components/PropertyCard'
import PropertyFilters from './components/PropertyFilters'
import LocationInput from './components/LocationInput'
import ChatDebateView from './components/ChatDebateView'
import PropertyComparison from './components/PropertyComparison'
import ComparisonSelector from './components/ComparisonSelector'
import ComparisonView from './components/ComparisonView'
import ComparisonTrigger from './components/ComparisonTrigger'
import ErrorBoundary from './components/ErrorBoundary'
import { DEFAULT_BUDGET, DEFAULT_MIN_BEDS, DEFAULT_MIN_BATHS, DEFAULT_MIN_SQFT } from './lib/utils'
import useComparison from './hooks/useComparison'
import { useComparison as useAIComparison } from './hooks/useComparison'

import type { RankedProperty } from './types/property'
import type { DebateResponse } from './types/debate'
import type { ComparisonResponse } from './types/comparison'

function App() {
  // Filter state for immediate UI updates
  const [budget, setBudget] = useState(DEFAULT_BUDGET);
  const [minBeds, setMinBeds] = useState(DEFAULT_MIN_BEDS);
  const [minBaths, setMinBaths] = useState(DEFAULT_MIN_BATHS);
  const [minSqft, setMinSqft] = useState(DEFAULT_MIN_SQFT);

  // Debounced mirrors for query
  const [debBudget, setDebBudget] = useState(budget);
  const [debBeds, setDebBeds] = useState(minBeds);
  const [debBaths, setDebBaths] = useState(minBaths);
  const [debSqft, setDebSqft] = useState(minSqft);

  // Location state for distance calculation
  const [userZipCode, setUserZipCode] = useState<string>('');

  // Debate state
  const [activeDebate, setActiveDebate] = useState<DebateResponse | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<RankedProperty | null>(null);

  // Comparison state
  const [activeComparison, setActiveComparison] = useState<ComparisonResponse | null>(null);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);

  // View state
  const [currentView, setCurrentView] = useState<'properties' | 'debate' | 'comparison'>('properties');

  // Use ranked properties query with debounced values
  const rawProperties = useQuery(api.properties.getRankedProperties, {
    maxBudget: debBudget,
    minBeds: debBeds,
    minBaths: debBaths
  });

  // Filter and AI-rank properties based on current filter criteria
  const properties = rawProperties?.filter((property) => {
    // Filter by minimum square footage
    if (debSqft > 0 && (!property.area || property.area < debSqft)) {
      return false;
    }
    
    // Filter by minimum bedrooms (already handled by query, but double-check)
    if (debBeds > 0 && (!property.beds || property.beds < debBeds)) {
      return false;
    }
    
    return true;
  }).map((property: any) => {
    // AI-Powered Intelligent Scoring System
    let aiScore = 0;
    
    // Declare variables for AI factor calculations
    let budgetRatio = 0;
    let pricePerSqft = 0;
    const austinAvgPricePsf = 300;
    
    // 🤖 AI Factor 1: Smart Budget Analysis (25% weight)
    if (property.price && property.price <= debBudget) {
      budgetRatio = property.price / debBudget;
      // AI considers sweet spot around 80-90% of budget as optimal
      if (budgetRatio >= 0.8 && budgetRatio <= 0.9) {
        aiScore += 25; // Perfect budget utilization
      } else if (budgetRatio < 0.8) {
        aiScore += 20 + (0.8 - budgetRatio) * 10; // Bonus for being under budget
      } else {
        aiScore += 15; // Still good if within budget
      }
    }
    
    // 🤖 AI Factor 2: Space Intelligence (20% weight)
    if (property.area && property.area >= debSqft) {
      const spaceRatio = property.area / debSqft;
      // AI considers 20-40% more space than minimum as ideal
      if (spaceRatio >= 1.2 && spaceRatio <= 1.4) {
        aiScore += 20; // Optimal space bonus
      } else if (spaceRatio > 1.4) {
        aiScore += 18; // Good but maybe too much space
      } else {
        aiScore += 15; // Meets minimum requirements
      }
    }
    
    // 🤖 AI Factor 3: Layout Optimization (15% weight)
    if (property.beds && property.baths) {
      const bedroomBathRatio = property.beds / property.baths;
      // AI considers 1.5-2.5 bed/bath ratio as optimal
      if (bedroomBathRatio >= 1.5 && bedroomBathRatio <= 2.5) {
        aiScore += 15; // Optimal layout
      } else {
        aiScore += 10; // Acceptable layout
      }
    }
    
    // 🤖 AI Factor 4: Market Value Intelligence (20% weight)
    if (property.price && property.area && property.area > 0) {
      pricePerSqft = property.price / property.area;
      // AI analyzes Austin market data (average ~$280-320/sqft)
      const marketEfficiency = (austinAvgPricePsf - pricePerSqft) / austinAvgPricePsf;
      
      if (marketEfficiency > 0.1) {
        aiScore += 20; // Excellent value - significantly below market
      } else if (marketEfficiency > 0) {
        aiScore += 15; // Good value - below market average
      } else if (marketEfficiency > -0.1) {
        aiScore += 10; // Fair value - near market average
      } else {
        aiScore += 5; // Above market - premium property
      }
    }
    
    // 🤖 AI Factor 5: Investment Potential (10% weight)
    // AI considers location, size, and price for investment scoring
    let investmentScore = 0;
    if (property.addressCity?.toLowerCase().includes('austin')) {
      investmentScore += 5; // Austin market bonus
    }
    if (property.area && property.area > 1000) {
      investmentScore += 3; // Larger properties tend to appreciate better
    }
    if (property.beds && property.beds >= 2) {
      investmentScore += 2; // Multi-bedroom properties have better rental potential
    }
    aiScore += investmentScore;
    
    // 🤖 AI Factor 6: Lifestyle Compatibility (10% weight)
    // AI analyzes how well property matches user preferences
    let lifestyleScore = 0;
    
    // Reward properties that exceed user requirements intelligently
    if (property.beds && property.beds > debBeds) {
      lifestyleScore += Math.min((property.beds - debBeds) * 2, 5);
    }
    if (property.baths && property.baths > debBaths) {
      lifestyleScore += Math.min((property.baths - debBaths) * 2, 5);
    }
    
    aiScore += lifestyleScore;
    
    // 🤖 AI Enhancement: Incorporate original Convex scoring
    if (property.score) {
      aiScore += property.score * 20; // Blend with existing algorithm
    }
    
    // 🤖 AI Normalization: Ensure score is between 0-100
    const normalizedAiScore = Math.min(100, Math.max(0, aiScore));
    
    return {
      ...property,
      aiScore: Math.round(normalizedAiScore * 100) / 100,
      aiRankingFactors: {
        budgetAnalysis: budgetRatio ? Math.round((budgetRatio >= 0.8 && budgetRatio <= 0.9 ? 25 : 20) * 100) / 100 : 0,
        spaceIntelligence: property.area ? Math.round((property.area / debSqft >= 1.2 ? 20 : 15) * 100) / 100 : 0,
        layoutOptimization: property.beds && property.baths ? 15 : 0,
        marketValue: pricePerSqft ? Math.round(((austinAvgPricePsf - pricePerSqft) / austinAvgPricePsf > 0.1 ? 20 : 15) * 100) / 100 : 0,
        investmentPotential: investmentScore,
        lifestyleMatch: lifestyleScore
      }
    };
  }).sort((a: any, b: any) => (b.aiScore || 0) - (a.aiScore || 0)) // Sort by AI score
  .map((property: any, index: number) => ({
    ...property,
    rank: index + 1 // Assign new rank based on AI scoring
  }));

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

  useEffect(() => {
    const id = setTimeout(() => setDebSqft(minSqft), 300);
    return () => clearTimeout(id);
  }, [minSqft]);

  const handleReset = () => {
    setBudget(DEFAULT_BUDGET);
    setMinBeds(DEFAULT_MIN_BEDS);
    setMinBaths(DEFAULT_MIN_BATHS);
    setMinSqft(DEFAULT_MIN_SQFT);
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
  const handleCompareProperties = async () => {
    setIsLoadingComparison(true);
    // Add a 12-second delay to simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 12000));
    setCurrentView('comparison');
    setIsLoadingComparison(false);
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
          <ChatDebateView
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
                  Prop - Perspective
                </h1>
                <p className="text-sm text-gray-600 font-medium">AI Apartment Hunting Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                📍 Distance Calculator Active
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
            Rank Properties
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
          minSqft={minSqft}
          setMinSqft={setMinSqft}
          onReset={handleReset}
        />

        {/* Location Input for Distance Calculation */}
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
          <div className="max-w-md">
            <LocationInput
              onLocationSelect={handleZipChange}
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
              isLoading={isLoadingComparison}
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
          <p className="text-gray-600 mb-6">
            <strong>🆕 New:</strong> Select multiple properties using the checkboxes to compare them side-by-side 
            with AI-powered insights and recommendations!
          </p>
          
          <div className="border-t pt-6">
            <div className="text-center">
              <h4 className="text-md font-semibold text-gray-900 mb-3">
                Want personalized property recommendations?
              </h4>
              <a 
                href="https://calendly.com/rahulbijoor/30min" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-center"
              >
                📅 Schedule a Meeting
              </a>
              <p className="text-sm text-gray-500 mt-3">
                Get expert guidance on your property search with our AI-powered insights
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
