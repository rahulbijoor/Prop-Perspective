import React from 'react';
import { ComparisonProperty } from '../types/comparison';

interface ComparisonSelectorProps {
  selectedProperties: ComparisonProperty[];
  onRemoveProperty: (propertyId: string) => void;
  onClearAll: () => void;
  onCompare: () => void;
  canCompare: boolean;
  maxProperties: number;
  selectionSummary: string;
}

export function ComparisonSelector({
  selectedProperties,
  onRemoveProperty,
  onClearAll,
  onCompare,
  canCompare,
  maxProperties,
  selectionSummary
}: ComparisonSelectorProps) {
  if (selectedProperties.length === 0) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="comparison-selector">
      <div className="selector-header">
        <div className="selector-title">
          <h3>🔍 Property Comparison</h3>
          <p className="selection-summary">{selectionSummary}</p>
        </div>
        <div className="selector-actions">
          <button
            className="compare-btn"
            onClick={onCompare}
            disabled={!canCompare}
            title={canCompare ? 'Compare selected properties' : 'Select at least 2 properties to compare'}
          >
            📊 Compare Now
          </button>
          <button
            className="clear-btn"
            onClick={onClearAll}
            title="Clear all selections"
          >
            🗑️ Clear All
          </button>
        </div>
      </div>

      <div className="selected-properties">
        {selectedProperties.map((property) => (
          <div key={property._id} className="selected-property">
            <div className="property-thumbnail">
              <div className="property-info">
                <h4 className="property-address">
                  {(property.address || 'Unknown Address').split(',')[0]}
                </h4>
                <div className="property-details">
                  <span className="price">{formatCurrency(property.price || 0)}</span>
                  <span className="size">{property.area || 0} sq ft</span>
                  <span className="beds-baths">{property.beds || 0}bd/{property.baths || 0}ba</span>
                </div>
                <div className="property-scores">
                  <span className="walk-score" title="Walk Score">
                    🚶 {property.walkScore}
                  </span>
                  <span className="value-score" title="Value Score">
                    💎 {property.valueScore}
                  </span>
                </div>
              </div>
              <button
                className="remove-btn"
                onClick={() => onRemoveProperty(property._id)}
                title="Remove from comparison"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="selector-footer">
        <div className="selection-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(selectedProperties.length / maxProperties) * 100}%` }}
            />
          </div>
          <span className="progress-text">
            {selectedProperties.length} of {maxProperties} selected
          </span>
        </div>
        
        <div className="quick-stats">
          {selectedProperties.length >= 2 && (
            <>
              <div className="stat">
                <span className="stat-label">Price Range:</span>
                <span className="stat-value">
                  {formatCurrency(Math.min(...selectedProperties.map(p => p.price || 0)))} - {formatCurrency(Math.max(...selectedProperties.map(p => p.price || 0)))}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Size Range:</span>
                <span className="stat-value">
                  {Math.min(...selectedProperties.map(p => p.area || 0)).toLocaleString()} - {Math.max(...selectedProperties.map(p => p.area || 0)).toLocaleString()} sq ft
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {!canCompare && selectedProperties.length === 1 && (
        <div className="selection-hint">
          <p>💡 Select one more property to start comparing</p>
        </div>
      )}

      {selectedProperties.length >= maxProperties && (
        <div className="selection-limit">
          <p>⚠️ Maximum {maxProperties} properties can be compared at once</p>
        </div>
      )}
    </div>
  );
}

export default ComparisonSelector;
