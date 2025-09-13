import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import PropertyCard from './components/PropertyCard'

function App() {
  const properties = useQuery(api.properties.getAllProperties)

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
            Austin Properties
          </h2>
          <p className="text-gray-600">
            Browse available properties and get AI-powered insights
          </p>
        </div>

        {properties === undefined ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-gray-500">Loading properties...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: any) => (
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
