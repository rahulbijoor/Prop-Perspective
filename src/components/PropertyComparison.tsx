import React from 'react';
import { ComparisonResult, ComparisonMode, CategoryWinner } from '../types/comparison';

interface PropertyComparisonProps {
  comparisonResult: ComparisonResult;
  viewMode: ComparisonMode;
  onViewModeChange: (mode: ComparisonMode) => void;
  onStartDebate: (propertyId: string) => void;
  onExport: () => void;
  onClose: () => void;
}

export function PropertyComparison({
  comparisonResult,
  viewMode,
  onViewModeChange,
  onStartDebate,
  onExport,
  onClose
}: PropertyComparisonProps) {
  const { properties, insights, winners, summary } = comparisonResult;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getWinnerForCategory = (category: string): CategoryWinner | undefined => {
    return winners.find(w => w.category === category);
  };

  const isWinner = (propertyId: string, category: string): boolean => {
    const winner = getWinnerForCategory(category);
    return winner?.propertyId === propertyId;
  };

  const renderWinnerBadge = () => (
    <span className="winner-badge">👑</span>
  );

  const renderPropertyOverview = () => (
    <div className="comparison-overview">
      <div className="overview-cards">
        {properties.map((property) => (
          <div key={property._id} className="overview-card">
            <div className="card-header">
              <h3>{(property.address || 'Unknown Address').split(',')[0]}</h3>
              <button
                className="debate-btn"
                onClick={() => onStartDebate(property._id)}
                title="Start debate for this property"
              >
                💬 Debate
              </button>
            </div>
            <div className="card-stats">
              <div className="stat">
                <span className="stat-value">{formatCurrency(property.price || 0)}</span>
                <span className="stat-label">Price</span>
              </div>
              <div className="stat">
                <span className="stat-value">{property.area || 0}</span>
                <span className="stat-label">Sq Ft</span>
              </div>
              <div className="stat">
                <span className="stat-value">{property.beds || 0}bd/{property.baths || 0}ba</span>
                <span className="stat-label">Bed/Bath</span>
              </div>
              <div className="stat">
                <span className="stat-value">{property.walkScore}</span>
                <span className="stat-label">Walk Score</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderComparisonTable = () => (
    <div className="comparison-table-container">
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Property</th>
            {properties.map((property) => (
              <th key={property._id} className="property-header">
                <div className="property-name">
                  {(property.address || 'Unknown').split(',')[0]}
                </div>
                <div className="property-location">
                  {(property.address || '').split(',').slice(1).join(',').trim()}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="metric-label">Price</td>
            {properties.map((property) => (
              <td key={property._id} className={isWinner(property._id, 'Price') ? 'winner-cell' : ''}>
                {formatCurrency(property.price || 0)}
                {isWinner(property._id, 'Price') && renderWinnerBadge()}
              </td>
            ))}
          </tr>
          <tr>
            <td className="metric-label">Square Feet</td>
            {properties.map((property) => (
              <td key={property._id} className={isWinner(property._id, 'Space') ? 'winner-cell' : ''}>
                {(property.area || 0).toLocaleString()}
                {isWinner(property._id, 'Space') && renderWinnerBadge()}
              </td>
            ))}
          </tr>
          <tr>
            <td className="metric-label">Price per Sq Ft</td>
            {properties.map((property) => (
              <td key={property._id} className={isWinner(property._id, 'Value') ? 'winner-cell' : ''}>
                ${property.pricePerSqft.toFixed(0)}
                {isWinner(property._id, 'Value') && renderWinnerBadge()}
              </td>
            ))}
          </tr>
          <tr>
            <td className="metric-label">Bedrooms</td>
            {properties.map((property) => (
              <td key={property._id}>
                {property.beds || 0}
              </td>
            ))}
          </tr>
          <tr>
            <td className="metric-label">Bathrooms</td>
            {properties.map((property) => (
              <td key={property._id}>
                {property.baths || 0}
              </td>
            ))}
          </tr>
          <tr>
            <td className="metric-label">Walk Score</td>
            {properties.map((property) => (
              <td key={property._id} className={isWinner(property._id, 'Location') ? 'winner-cell' : ''}>
                {property.walkScore}
                {isWinner(property._id, 'Location') && renderWinnerBadge()}
              </td>
            ))}
          </tr>
          <tr>
            <td className="metric-label">Value Score</td>
            {properties.map((property) => (
              <td key={property._id}>
                {property.valueScore}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderInsightsPanel = () => (
    <div className="insights-panel">
      <h3>🤖 AI Insights</h3>
      
      <div className="insight-section">
        <h4>💰 Best Value</h4>
        <p>{insights.bestValue.reason}</p>
        {insights.bestValue.savings > 0 && (
          <p className="savings">Saves ${insights.bestValue.savings.toLocaleString()} compared to average</p>
        )}
      </div>

      <div className="insight-section">
        <h4>👨‍👩‍👧‍👦 Best for Families</h4>
        <p>{insights.bestForFamilies.reason}</p>
      </div>

      <div className="insight-section">
        <h4>📈 Best Investment</h4>
        <p>{insights.bestInvestment.reason}</p>
        <p className="roi">Estimated ROI: {insights.bestInvestment.roi}%</p>
      </div>

      <div className="insight-section">
        <h4>⚖️ Trade-offs Analysis</h4>
        {insights.tradeOffs.map((tradeOff, index) => {
          const property = properties.find(p => p._id === tradeOff.propertyId);
          return (
            <div key={tradeOff.propertyId} className="tradeoff-item">
              <h5>{(property?.address || 'Unknown').split(',')[0]}</h5>
              {tradeOff.pros.length > 0 && (
                <div className="pros">
                  <strong>Pros:</strong>
                  <ul>
                    {tradeOff.pros.map((pro, i) => (
                      <li key={i} className="pro-item">✅ {pro}</li>
                    ))}
                  </ul>
                </div>
              )}
              {tradeOff.cons.length > 0 && (
                <div className="cons">
                  <strong>Cons:</strong>
                  <ul>
                    {tradeOff.cons.map((con, i) => (
                      <li key={i} className="con-item">❌ {con}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="insight-section">
        <h4>🎯 Recommendations</h4>
        {insights.recommendations.map((rec, index) => (
          <div key={index} className="recommendation-item">
            <div className="rec-header">
              <span className="rec-title">{rec.title}</span>
              <span className="rec-confidence">{Math.round(rec.confidence * 100)}% confidence</span>
            </div>
            <p>{rec.description}</p>
          </div>
        ))}
      </div>

      <div className="insight-section">
        <h4>📊 Summary</h4>
        <p>{insights.summary}</p>
      </div>
    </div>
  );

  const renderViewModeToggle = () => (
    <div className="view-mode-toggle">
      <button
        className={viewMode === ComparisonMode.TABLE ? 'active' : ''}
        onClick={() => onViewModeChange(ComparisonMode.TABLE)}
      >
        📊 Table
      </button>
      <button
        className={viewMode === ComparisonMode.CARDS ? 'active' : ''}
        onClick={() => onViewModeChange(ComparisonMode.CARDS)}
      >
        🏠 Cards
      </button>
    </div>
  );

  return (
    <div className="property-comparison">
      <div className="comparison-header">
        <div className="header-left">
          <h2>Property Comparison</h2>
          <p className="comparison-count">Comparing {properties.length} properties</p>
        </div>
        <div className="header-right">
          {renderViewModeToggle()}
          <button className="export-btn" onClick={onExport}>
            📤 Export
          </button>
          <button className="close-btn" onClick={onClose}>
            ✕ Close
          </button>
        </div>
      </div>

      {renderPropertyOverview()}

      <div className="comparison-content">
        <div className="comparison-main">
          {viewMode === ComparisonMode.TABLE && renderComparisonTable()}
          {viewMode === ComparisonMode.CARDS && (
            <div className="comparison-cards">
              {properties.map((property) => (
                <div key={property._id} className="comparison-card">
                  <h3>{(property.address || 'Unknown').split(',')[0]}</h3>
                  <div className="card-metrics">
                    <div className="metric">
                      <span className="metric-label">Price:</span>
                      <span className="metric-value">{formatCurrency(property.price || 0)}</span>
                      {isWinner(property._id, 'Price') && renderWinnerBadge()}
                    </div>
                    <div className="metric">
                      <span className="metric-label">Size:</span>
                      <span className="metric-value">{(property.area || 0).toLocaleString()} sq ft</span>
                      {isWinner(property._id, 'Space') && renderWinnerBadge()}
                    </div>
                    <div className="metric">
                      <span className="metric-label">Price/sq ft:</span>
                      <span className="metric-value">${property.pricePerSqft.toFixed(0)}</span>
                      {isWinner(property._id, 'Value') && renderWinnerBadge()}
                    </div>
                    <div className="metric">
                      <span className="metric-label">Beds/Baths:</span>
                      <span className="metric-value">{property.beds || 0}/{property.baths || 0}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Walk Score:</span>
                      <span className="metric-value">{property.walkScore}</span>
                      {isWinner(property._id, 'Location') && renderWinnerBadge()}
                    </div>
                    <div className="metric">
                      <span className="metric-label">Value Score:</span>
                      <span className="metric-value">{property.valueScore}</span>
                    </div>
                  </div>
                  <button
                    className="card-debate-btn"
                    onClick={() => onStartDebate(property._id)}
                  >
                    💬 Start Debate
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="comparison-sidebar">
          {renderInsightsPanel()}
        </div>
      </div>
    </div>
  );
}

export default PropertyComparison;
