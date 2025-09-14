import { Property } from '../types/property';
import { 
  ComparisonProperty, 
  ComparisonInsights, 
  ComparisonResult, 
  CategoryWinner,
  ComparisonRecommendation,
  ComparisonChart
} from '../types/comparison';

// Simple property scoring function
function calculatePropertyScore(property: Property): number {
  const price = property.price || 0;
  const area = property.area || 0;
  const beds = property.beds || 0;
  const baths = property.baths || 0;
  
  if (price === 0 || area === 0) return 0;
  
  const pricePerSqft = price / area;
  const spaceScore = (beds * 200 + baths * 100) / area;
  const priceScore = Math.max(0, 100 - (pricePerSqft / 10));
  
  return Math.min(100, Math.max(0, (spaceScore * 0.4 + priceScore * 0.6)));
}

export class ComparisonEngine {
  static generateComparison(properties: Property[]): ComparisonResult {
    if (properties.length < 2) {
      throw new Error('At least 2 properties required for comparison');
    }

    const comparisonProperties = this.enhancePropertiesForComparison(properties);
    const insights = this.generateInsights(comparisonProperties);
    const winners = this.detectCategoryWinners(comparisonProperties);
    const charts = this.generateChartData(comparisonProperties);
    const summary = this.generateSummary(comparisonProperties);

    return {
      properties: comparisonProperties,
      insights,
      winners,
      charts,
      summary
    };
  }

  private static enhancePropertiesForComparison(properties: Property[]): ComparisonProperty[] {
    return properties.map(property => {
      const price = property.price || 0;
      const area = property.area || 0;
      const beds = property.beds || 0;
      const baths = property.baths || 0;
      
      const pricePerSqft = area > 0 ? price / area : 0;
      const valueScore = this.calculateValueScore(property, properties);
      const efficiencyScore = this.calculateEfficiencyScore(property);
      const comparisonScore = calculatePropertyScore(property);
      const walkScore = this.generateWalkScore(property); // Generate a mock walk score

      return {
        ...property,
        comparisonScore,
        pricePerSqft,
        valueScore,
        efficiencyScore,
        walkScore,
        normalizedMetrics: this.normalizeMetrics(property, properties)
      };
    });
  }

  private static generateWalkScore(property: Property): number {
    // Generate a mock walk score based on property characteristics
    // In a real app, this would come from an API like Walk Score
    const baseScore = 50;
    const price = property.price || 0;
    const area = property.area || 0;
    
    // Higher priced properties in smaller areas tend to be in more walkable areas
    if (price > 0 && area > 0) {
      const pricePerSqft = price / area;
      if (pricePerSqft > 500) return Math.min(100, baseScore + 30);
      if (pricePerSqft > 300) return Math.min(100, baseScore + 20);
      if (pricePerSqft > 200) return Math.min(100, baseScore + 10);
    }
    
    return baseScore + Math.floor(Math.random() * 30); // Random component for demo
  }

  private static calculateValueScore(property: Property, allProperties: Property[]): number {
    const price = property.price || 0;
    const area = property.area || 0;
    
    if (price === 0 || area === 0) return 0;
    
    const validProperties = allProperties.filter(p => (p.price || 0) > 0 && (p.area || 0) > 0);
    if (validProperties.length === 0) return 50;
    
    const avgPrice = validProperties.reduce((sum, p) => sum + (p.price || 0), 0) / validProperties.length;
    const avgArea = validProperties.reduce((sum, p) => sum + (p.area || 0), 0) / validProperties.length;
    
    const priceRatio = avgPrice / price;
    const sizeRatio = area / avgArea;
    
    return Math.round(Math.min(100, Math.max(0, (priceRatio * sizeRatio) * 50)));
  }

  private static calculateEfficiencyScore(property: Property): number {
    const area = property.area || 0;
    const beds = property.beds || 1;
    const baths = property.baths || 1;
    
    if (area === 0) return 0;
    
    const bedroomEfficiency = area / beds;
    const bathroomRatio = baths / beds;
    
    return Math.round(Math.min(100, Math.max(0, (bedroomEfficiency / 10) * bathroomRatio)));
  }

  private static normalizeMetrics(property: Property, allProperties: Property[]) {
    const validProperties = allProperties.filter(p => 
      (p.price || 0) > 0 && (p.area || 0) > 0 && (p.beds || 0) > 0 && (p.baths || 0) > 0
    );
    
    if (validProperties.length === 0) {
      return { price: 50, size: 50, bedrooms: 50, bathrooms: 50, walkScore: 50 };
    }

    const maxPrice = Math.max(...validProperties.map(p => p.price || 0));
    const maxSize = Math.max(...validProperties.map(p => p.area || 0));
    const maxBedrooms = Math.max(...validProperties.map(p => p.beds || 0));
    const maxBathrooms = Math.max(...validProperties.map(p => p.baths || 0));

    return {
      price: maxPrice > 0 ? ((property.price || 0) / maxPrice) * 100 : 50,
      size: maxSize > 0 ? ((property.area || 0) / maxSize) * 100 : 50,
      bedrooms: maxBedrooms > 0 ? ((property.beds || 0) / maxBedrooms) * 100 : 50,
      bathrooms: maxBathrooms > 0 ? ((property.baths || 0) / maxBathrooms) * 100 : 50,
      walkScore: 50 // Will be updated with actual walk score
    };
  }

  private static generateInsights(properties: ComparisonProperty[]): ComparisonInsights {
    const bestValue = this.findBestValue(properties);
    const bestForFamilies = this.findBestForFamilies(properties);
    const bestInvestment = this.findBestInvestment(properties);
    const tradeOffs = this.analyzeTradeOffs(properties);
    const recommendations = this.generateRecommendations(properties);
    const summary = this.generateInsightSummary(properties);

    return {
      bestValue,
      bestForFamilies,
      bestInvestment,
      tradeOffs,
      recommendations,
      summary
    };
  }

  private static findBestValue(properties: ComparisonProperty[]) {
    const bestValueProperty = properties.reduce((best, current) => 
      current.valueScore > best.valueScore ? current : best
    );

    const validPrices = properties.filter(p => (p.price || 0) > 0).map(p => p.price || 0);
    const avgPrice = validPrices.length > 0 ? validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length : 0;
    const savings = avgPrice - (bestValueProperty.price || 0);

    return {
      propertyId: bestValueProperty._id,
      reason: `Offers ${bestValueProperty.area || 0} sq ft at $${bestValueProperty.pricePerSqft.toFixed(0)}/sq ft with good walkability`,
      savings: Math.round(Math.max(0, savings))
    };
  }

  private static findBestForFamilies(properties: ComparisonProperty[]) {
    const familyProperty = properties.reduce((best, current) => {
      const currentFamilyScore = ((current.beds || 0) * 2) + (current.baths || 0) + ((current.area || 0) / 100);
      const bestFamilyScore = ((best.beds || 0) * 2) + (best.baths || 0) + ((best.area || 0) / 100);
      return currentFamilyScore > bestFamilyScore ? current : best;
    });

    return {
      propertyId: familyProperty._id,
      reason: `${familyProperty.beds || 0} bedrooms, ${familyProperty.baths || 0} bathrooms, and ${familyProperty.area || 0} sq ft of living space`
    };
  }

  private static findBestInvestment(properties: ComparisonProperty[]) {
    const investmentProperty = properties.reduce((best, current) => {
      const currentROI = (current.walkScore * 0.4) + (current.valueScore * 0.6);
      const bestROI = (best.walkScore * 0.4) + (best.valueScore * 0.6);
      return currentROI > bestROI ? current : best;
    });

    const roi = Math.round(((investmentProperty.walkScore * 0.4) + (investmentProperty.valueScore * 0.6)) / 10);

    return {
      propertyId: investmentProperty._id,
      reason: `High walkability (${investmentProperty.walkScore}) and strong value score indicate good appreciation potential`,
      roi
    };
  }

  private static analyzeTradeOffs(properties: ComparisonProperty[]) {
    return properties.map(property => {
      const pros: string[] = [];
      const cons: string[] = [];

      const validPrices = properties.filter(p => (p.price || 0) > 0).map(p => p.price || 0);
      const avgPrice = validPrices.length > 0 ? validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length : 0;
      const propertyPrice = property.price || 0;

      // Analyze price
      if (avgPrice > 0) {
        if (propertyPrice < avgPrice * 0.9) {
          pros.push(`Below average price ($${propertyPrice.toLocaleString()})`);
        } else if (propertyPrice > avgPrice * 1.1) {
          cons.push(`Above average price ($${propertyPrice.toLocaleString()})`);
        }
      }

      // Analyze space
      const validAreas = properties.filter(p => (p.area || 0) > 0).map(p => p.area || 0);
      const avgArea = validAreas.length > 0 ? validAreas.reduce((sum, p) => sum + p, 0) / validAreas.length : 0;
      const propertyArea = property.area || 0;

      if (avgArea > 0) {
        if (propertyArea > avgArea * 1.1) {
          pros.push(`Spacious ${propertyArea} sq ft`);
        } else if (propertyArea < avgArea * 0.9) {
          cons.push(`Smaller space (${propertyArea} sq ft)`);
        }
      }

      // Analyze walkability
      if (property.walkScore > 80) {
        pros.push(`Excellent walkability (${property.walkScore})`);
      } else if (property.walkScore < 50) {
        cons.push(`Limited walkability (${property.walkScore})`);
      }

      // Analyze bedrooms
      const maxBedrooms = Math.max(...properties.map(p => p.beds || 0));
      if ((property.beds || 0) === maxBedrooms && maxBedrooms > 0) {
        pros.push(`Most bedrooms (${property.beds})`);
      }

      return {
        propertyId: property._id,
        pros,
        cons
      };
    });
  }

  private static generateRecommendations(properties: ComparisonProperty[]): ComparisonRecommendation[] {
    const recommendations: ComparisonRecommendation[] = [];

    // Best value recommendation
    const bestValue = properties.reduce((best, current) => 
      current.valueScore > best.valueScore ? current : best
    );
    recommendations.push({
      type: 'best_value',
      propertyId: bestValue._id,
      title: 'Best Value',
      description: `Offers the best price-to-value ratio with a score of ${bestValue.valueScore}`,
      confidence: 0.9
    });

    // Best location recommendation
    const bestLocation = properties.reduce((best, current) => 
      current.walkScore > best.walkScore ? current : best
    );
    recommendations.push({
      type: 'best_location',
      propertyId: bestLocation._id,
      title: 'Best Location',
      description: `Highest walkability score of ${bestLocation.walkScore} for convenient living`,
      confidence: 0.85
    });

    // Best space recommendation
    const bestSpace = properties.reduce((best, current) => 
      (current.area || 0) > (best.area || 0) ? current : best
    );
    recommendations.push({
      type: 'best_space',
      propertyId: bestSpace._id,
      title: 'Most Spacious',
      description: `Largest living space with ${bestSpace.area || 0} sq ft`,
      confidence: 0.95
    });

    return recommendations;
  }

  private static generateInsightSummary(properties: ComparisonProperty[]): string {
    const validPrices = properties.filter(p => (p.price || 0) > 0).map(p => p.price || 0);
    const avgPrice = validPrices.length > 0 ? validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length : 0;
    const priceRange = {
      min: validPrices.length > 0 ? Math.min(...validPrices) : 0,
      max: validPrices.length > 0 ? Math.max(...validPrices) : 0
    };

    return `Comparing ${properties.length} properties with prices ranging from $${priceRange.min.toLocaleString()} to $${priceRange.max.toLocaleString()}. Average price is $${Math.round(avgPrice).toLocaleString()}. Each property offers unique advantages - consider your priorities for space, location, and budget.`;
  }

  private static detectCategoryWinners(properties: ComparisonProperty[]): CategoryWinner[] {
    const winners: CategoryWinner[] = [];

    // Price winner (lowest price)
    const validPriceProperties = properties.filter(p => (p.price || 0) > 0);
    if (validPriceProperties.length > 0) {
      const cheapest = validPriceProperties.reduce((best, current) => 
        (current.price || 0) < (best.price || 0) ? current : best
      );
      const avgPrice = validPriceProperties.reduce((sum, p) => sum + (p.price || 0), 0) / validPriceProperties.length;
      winners.push({
        category: 'Price',
        propertyId: cheapest._id,
        value: cheapest.price || 0,
        advantage: `$${Math.round(avgPrice - (cheapest.price || 0)).toLocaleString()} below average`
      });
    }

    // Space winner (largest area)
    const validAreaProperties = properties.filter(p => (p.area || 0) > 0);
    if (validAreaProperties.length > 0) {
      const largest = validAreaProperties.reduce((best, current) => 
        (current.area || 0) > (best.area || 0) ? current : best
      );
      const avgArea = validAreaProperties.reduce((sum, p) => sum + (p.area || 0), 0) / validAreaProperties.length;
      winners.push({
        category: 'Space',
        propertyId: largest._id,
        value: largest.area || 0,
        advantage: `${Math.round((largest.area || 0) - avgArea)} sq ft above average`
      });
    }

    // Location winner (highest walk score)
    const bestWalk = properties.reduce((best, current) => 
      current.walkScore > best.walkScore ? current : best
    );
    winners.push({
      category: 'Location',
      propertyId: bestWalk._id,
      value: bestWalk.walkScore,
      advantage: `Walk Score of ${bestWalk.walkScore}`
    });

    // Value winner (best price per sqft)
    const validValueProperties = properties.filter(p => p.pricePerSqft > 0);
    if (validValueProperties.length > 0) {
      const bestPricePerSqft = validValueProperties.reduce((best, current) => 
        current.pricePerSqft < best.pricePerSqft ? current : best
      );
      winners.push({
        category: 'Value',
        propertyId: bestPricePerSqft._id,
        value: bestPricePerSqft.pricePerSqft,
        advantage: `$${bestPricePerSqft.pricePerSqft.toFixed(0)}/sq ft`
      });
    }

    return winners;
  }

  private static generateChartData(properties: ComparisonProperty[]): ComparisonChart[] {
    const charts: ComparisonChart[] = [];

    // Price comparison chart
    charts.push({
      labels: properties.map(p => (p.address || 'Unknown').split(',')[0]),
      datasets: [{
        label: 'Price',
        data: properties.map(p => p.price || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)'
      }]
    });

    // Size comparison chart
    charts.push({
      labels: properties.map(p => (p.address || 'Unknown').split(',')[0]),
      datasets: [{
        label: 'Square Feet',
        data: properties.map(p => p.area || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgba(16, 185, 129, 1)'
      }]
    });

    // Walk Score comparison chart
    charts.push({
      labels: properties.map(p => (p.address || 'Unknown').split(',')[0]),
      datasets: [{
        label: 'Walk Score',
        data: properties.map(p => p.walkScore),
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        borderColor: 'rgba(245, 158, 11, 1)'
      }]
    });

    return charts;
  }

  private static generateSummary(properties: ComparisonProperty[]) {
    const validPrices = properties.filter(p => (p.price || 0) > 0).map(p => p.price || 0);
    const priceRange = {
      min: validPrices.length > 0 ? Math.min(...validPrices) : 0,
      max: validPrices.length > 0 ? Math.max(...validPrices) : 0
    };
    const avgPricePerSqft = properties.filter(p => p.pricePerSqft > 0).reduce((sum, p) => sum + p.pricePerSqft, 0) / Math.max(1, properties.filter(p => p.pricePerSqft > 0).length);
    const bestValue = properties.reduce((best, current) => 
      current.valueScore > best.valueScore ? current : best
    );

    return {
      totalProperties: properties.length,
      priceRange,
      avgPricePerSqft: Math.round(avgPricePerSqft),
      bestValue: bestValue._id
    };
  }
}
