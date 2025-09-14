import { useState, useCallback, useMemo } from 'react';
import { Property } from '../types/property';
import { 
  ComparisonState, 
  ComparisonResult, 
  ComparisonMode 
} from '../types/comparison';
import { ComparisonEngine } from '../lib/comparison-engine';

const MAX_COMPARISON_PROPERTIES = 4;
const MIN_COMPARISON_PROPERTIES = 2;

export function useComparison(allProperties: Property[] = []) {
  const [comparisonState, setComparisonState] = useState<ComparisonState>({
    selectedProperties: [],
    comparisonData: [],
    insights: null,
    isLoading: false,
    error: null,
    viewMode: ComparisonMode.TABLE
  });

  const selectedPropertiesData = useMemo(() => {
    return allProperties.filter(property => 
      comparisonState.selectedProperties.includes(property._id)
    );
  }, [allProperties, comparisonState.selectedProperties]);

  const comparisonResult = useMemo<ComparisonResult | null>(() => {
    if (selectedPropertiesData.length < MIN_COMPARISON_PROPERTIES) {
      return null;
    }

    try {
      return ComparisonEngine.generateComparison(selectedPropertiesData);
    } catch (error) {
      console.error('Error generating comparison:', error);
      return null;
    }
  }, [selectedPropertiesData]);

  const addProperty = useCallback((propertyId: string) => {
    setComparisonState(prev => {
      if (prev.selectedProperties.includes(propertyId)) {
        return prev; // Already selected
      }

      if (prev.selectedProperties.length >= MAX_COMPARISON_PROPERTIES) {
        return {
          ...prev,
          error: `Maximum ${MAX_COMPARISON_PROPERTIES} properties can be compared`
        };
      }

      return {
        ...prev,
        selectedProperties: [...prev.selectedProperties, propertyId],
        error: null
      };
    });
  }, []);

  const removeProperty = useCallback((propertyId: string) => {
    setComparisonState(prev => ({
      ...prev,
      selectedProperties: prev.selectedProperties.filter(id => id !== propertyId),
      error: null
    }));
  }, []);

  const toggleProperty = useCallback((propertyId: string) => {
    setComparisonState(prev => {
      const isSelected = prev.selectedProperties.includes(propertyId);
      
      if (isSelected) {
        return {
          ...prev,
          selectedProperties: prev.selectedProperties.filter(id => id !== propertyId),
          error: null
        };
      } else {
        if (prev.selectedProperties.length >= MAX_COMPARISON_PROPERTIES) {
          return {
            ...prev,
            error: `Maximum ${MAX_COMPARISON_PROPERTIES} properties can be compared`
          };
        }

        return {
          ...prev,
          selectedProperties: [...prev.selectedProperties, propertyId],
          error: null
        };
      }
    });
  }, []);

  const clearAll = useCallback(() => {
    setComparisonState(prev => ({
      ...prev,
      selectedProperties: [],
      comparisonData: [],
      insights: null,
      error: null
    }));
  }, []);

  const setViewMode = useCallback((mode: ComparisonMode) => {
    setComparisonState(prev => ({
      ...prev,
      viewMode: mode
    }));
  }, []);

  const clearError = useCallback(() => {
    setComparisonState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  const canAddMore = comparisonState.selectedProperties.length < MAX_COMPARISON_PROPERTIES;
  const canCompare = comparisonState.selectedProperties.length >= MIN_COMPARISON_PROPERTIES;
  const isMaxSelected = comparisonState.selectedProperties.length >= MAX_COMPARISON_PROPERTIES;

  const isPropertySelected = useCallback((propertyId: string) => {
    return comparisonState.selectedProperties.includes(propertyId);
  }, [comparisonState.selectedProperties]);

  const getSelectionCount = () => comparisonState.selectedProperties.length;

  const getComparisonSummary = () => {
    const count = comparisonState.selectedProperties.length;
    if (count === 0) return 'No properties selected';
    if (count === 1) return '1 property selected - add 1 more to compare';
    if (count < MAX_COMPARISON_PROPERTIES) return `${count} properties selected - add up to ${MAX_COMPARISON_PROPERTIES - count} more`;
    return `${count} properties selected (maximum reached)`;
  };

  const exportComparison = useCallback(() => {
    if (!comparisonResult) return null;

    const exportData = {
      timestamp: new Date().toISOString(),
      properties: comparisonResult.properties.map(p => ({
        address: p.address,
        price: p.price,
        area: p.area,
        beds: p.beds,
        baths: p.baths,
        walkScore: p.walkScore,
        pricePerSqft: p.pricePerSqft,
        valueScore: p.valueScore
      })),
      insights: comparisonResult.insights,
      winners: comparisonResult.winners,
      summary: comparisonResult.summary
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `property-comparison-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return exportData;
  }, [comparisonResult]);

  return {
    // State
    selectedProperties: comparisonState.selectedProperties,
    selectedPropertiesData,
    comparisonResult,
    isLoading: comparisonState.isLoading,
    error: comparisonState.error,
    viewMode: comparisonState.viewMode,

    // Actions
    addProperty,
    removeProperty,
    toggleProperty,
    clearAll,
    setViewMode,
    clearError,
    exportComparison,

    // Computed values
    canAddMore,
    canCompare,
    isMaxSelected,
    isPropertySelected,
    getSelectionCount,
    getComparisonSummary,

    // Constants
    MAX_COMPARISON_PROPERTIES,
    MIN_COMPARISON_PROPERTIES
  };
}

export default useComparison;
