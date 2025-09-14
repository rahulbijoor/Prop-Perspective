import React, { useState, useEffect } from 'react';
import { distanceCalculator } from '../lib/inkeep-agent';
import { ZipCodeData } from '../lib/distance-calculator';

interface LocationInputProps {
  onLocationSelect: (zipCode: string) => void;
  placeholder?: string;
  label?: string;
}

const LocationInput: React.FC<LocationInputProps> = ({
  onLocationSelect,
  placeholder = "Enter ZIP code (e.g., 78701)...",
  label = "Your Desired Location"
}) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<ZipCodeData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedZip, setSelectedZip] = useState<string>('');

  // Get suggestions based on input using distance calculator
  useEffect(() => {
    if (input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const getSuggestions = async () => {
      try {
        // Use distance calculator for location suggestions
        const zipSuggestions = await distanceCalculator.getLocationSuggestions(input);
        setSuggestions(zipSuggestions);
        setShowSuggestions(zipSuggestions.length > 0);
      } catch (error) {
        console.error('Distance calculator suggestion error:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    getSuggestions();
  }, [input]);

  const handleSuggestionClick = (zipData: ZipCodeData) => {
    setInput(`${zipData.zip} - ${zipData.neighborhood || zipData.city}`);
    setShowSuggestions(false);
    setSelectedZip(zipData.zip);
    onLocationSelect(zipData.zip);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (selectedZip) {
      setSelectedZip('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleDirectZipEntry = async () => {
    const cleanZip = input.replace(/\D/g, '').substring(0, 5);
    if (cleanZip.length === 5 && distanceCalculator.isValidZip(cleanZip)) {
      try {
        // Use distance calculator to get ZIP code suggestions for the entered ZIP
        const zipSuggestions = await distanceCalculator.getLocationSuggestions(cleanZip);
        if (zipSuggestions.length > 0) {
          handleSuggestionClick(zipSuggestions[0]);
        }
      } catch (error) {
        console.error('Distance calculator direct ZIP entry error:', error);
      }
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center mb-3">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <label className="text-lg font-semibold text-gray-800">
            {label}
          </label>
        </div>
        <div className="ml-auto">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
            📍 Distance Calculator
          </span>
        </div>
      </div>
      
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-lg text-lg placeholder-gray-400 hover:border-gray-300"
        />
        
        {/* Enhanced Location Icon */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        {/* Enhanced Direct ZIP entry button */}
        {input.replace(/\D/g, '').length === 5 && !selectedZip && (
          <button
            onClick={handleDirectZipEntry}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md"
          >
            ✓ Use
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((zipData, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(zipData)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-150 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">{zipData.zip}</div>
                    <div className="text-sm text-gray-600">{zipData.neighborhood || zipData.city}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Austin, TX</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected Location Display */}
      {selectedZip && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-green-800 font-medium">
              Selected: {input}
            </span>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-2 text-xs text-gray-500">
        Enter an Austin area ZIP code or neighborhood name. Distance calculations use precise coordinates.
      </div>
    </div>
  );
};

export default LocationInput;
