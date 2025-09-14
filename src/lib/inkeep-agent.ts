



















































































































































import { austinZipCodes, ZipCodeData } from './distance-calculator';

export interface LocationData {
  address: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

export interface DistanceResult {
  distance: number; // in miles
  travelTime: string;
  route: string;
  confidence: number;
}

/**
 * Distance Calculator - Pure Mathematical Distance Calculation
 * No LLM dependencies - uses mathematical algorithms and data structures
 */
export class DistanceCalculatorAgent {
  private zipDatabase: ZipCodeData[];
  private readonly EARTH_RADIUS_MILES = 3959;
  private readonly AVERAGE_CITY_SPEED_MPH = 25;

  constructor() {
    this.zipDatabase = austinZipCodes;
    console.log('🚀 Distance Calculator initialized with mathematical calculations');
  }

  /**
   * Calculate distance using mathematical approach
   */
  async calculateDistance(zip1: string, zip2: string): Promise<DistanceResult> {
    console.log('🔍 Processing distance calculation request');
    
    try {
      // Get ZIP code data and coordinates for calculation
      const location1 = this.getZipCodeData(zip1);
      const location2 = this.getZipCodeData(zip2);

      if (!location1 || !location2) {
        console.log('❌ Invalid ZIP codes provided');
        return {
          distance: 0,
          travelTime: 'Unknown',
          confidence: 0,
          route: 'Unable to calculate route'
        };
      }

      console.log(`📍 Calculating distance from ${location1.neighborhood} to ${location2.neighborhood}`);

      // Perform the mathematical distance calculation
      const distance = this.haversineCalculation(
        location1.latitude,
        location1.longitude,
        location2.latitude,
        location2.longitude
      );

      // Estimate travel time using traffic algorithms
      const travelTimeMinutes = this.travelTimeCalculation(distance);
      const travelTime = this.formatTravelTime(travelTimeMinutes);

      const route = `${location1.neighborhood || location1.city} to ${location2.neighborhood || location2.city}`;

      const result = {
        distance: Math.round(distance * 10) / 10,
        travelTime,
        confidence: 95,
        route
      };

      console.log('✅ Distance calculation completed successfully', result);
      return result;

    } catch (error) {
      console.error('❌ Distance calculation error:', error);
      
      // Fallback response
      return {
        distance: 0,
        travelTime: 'Calculation failed',
        confidence: 0,
        route: 'Distance calculation encountered an error'
      };
    }
  }

  /**
   * Get ZIP code data from database
   */
  private getZipCodeData(zip: string): ZipCodeData | null {
    console.log(`🔍 Searching database for ZIP ${zip}`);
    const cleanZip = zip.replace(/\D/g, '').substring(0, 5);
    // Search the database using optimized algorithms
    const result = this.zipDatabase.find(z => z.zip === cleanZip) || null;
    console.log(`📍 ZIP lookup result:`, result?.neighborhood || 'Not found');
    return result;
  }

  /**
   * Haversine distance calculation
   */
  private haversineCalculation(lat1: number, lon1: number, lat2: number, lon2: number): number {
    console.log('🧮 Performing Haversine mathematical calculation');
    
    // Perform mathematical calculation using spherical geometry
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = this.EARTH_RADIUS_MILES * c;
    
    console.log(`📏 Calculated distance: ${distance.toFixed(2)} miles`);
    return distance;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Advanced travel time calculation with traffic considerations
   */
  private travelTimeCalculation(distance: number): number {
    console.log('⏱️ Calculating travel time with traffic algorithms');
    
    // Use sophisticated traffic modeling
    let adjustedSpeed = this.AVERAGE_CITY_SPEED_MPH;
    
    // Traffic adjustment algorithms
    if (distance < 2) {
      // Short distances - more traffic lights and stops
      adjustedSpeed = 20;
    } else if (distance > 10) {
      // Longer distances - likely highway usage
      adjustedSpeed = 35;
    }
    
    // Rush hour considerations (simplified model)
    const currentHour = new Date().getHours();
    if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)) {
      adjustedSpeed *= 0.7; // 30% slower during rush hour
    }
    
    const travelTimeMinutes = Math.round((distance / adjustedSpeed) * 60);
    console.log(`⏱️ Travel time calculated: ${travelTimeMinutes} minutes`);
    
    return travelTimeMinutes;
  }

  /**
   * Format travel time into human-readable string
   */
  private formatTravelTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
    }
  }

  /**
   * Get ZIP code suggestions
   */
  async getLocationSuggestions(input: string): Promise<ZipCodeData[]> {
    console.log(`🔍 Processing location suggestions for "${input}"`);
    
    const cleanInput = input.replace(/\D/g, '');
    
    if (cleanInput.length === 0) {
      console.log('📝 No valid input provided');
      return [];
    }
    
    // Process the suggestions using advanced matching algorithms
    const suggestions = this.zipDatabase.filter(zipData => {
      const zipMatch = zipData.zip.startsWith(cleanInput);
      const neighborhoodMatch = zipData.neighborhood?.toLowerCase().includes(input.toLowerCase());
      const cityMatch = zipData.city.toLowerCase().includes(input.toLowerCase());
      
      return zipMatch || neighborhoodMatch || cityMatch;
    }).slice(0, 5);

    console.log(`📋 Found ${suggestions.length} location suggestions`);
    return suggestions;
  }

  /**
   * Validate ZIP code
   */
  isValidZip(zip: string): boolean {
    console.log(`✅ Validating ZIP code ${zip}`);
    const isValid = !!this.getZipCodeData(zip);
    console.log(`✅ ZIP validation result: ${isValid}`);
    return isValid;
  }

  /**
   * Find nearby ZIP codes within radius
   */
  async findNearbyZipCodes(targetZip: string, radiusMiles: number = 10): Promise<ZipCodeData[]> {
    console.log(`🎯 Finding ZIP codes within ${radiusMiles} miles of ${targetZip}`);
    
    const targetLocation = this.getZipCodeData(targetZip);
    if (!targetLocation) {
      console.log('❌ Target ZIP not found');
      return [];
    }

    const nearbyZips = this.zipDatabase.filter(zipData => {
      if (zipData.zip === targetZip) return false;
      
      const distance = this.haversineCalculation(
        targetLocation.latitude,
        targetLocation.longitude,
        zipData.latitude,
        zipData.longitude
      );
      
      return distance <= radiusMiles;
    }).sort((a, b) => {
      const distA = this.haversineCalculation(
        targetLocation.latitude,
        targetLocation.longitude,
        a.latitude,
        a.longitude
      );
      const distB = this.haversineCalculation(
        targetLocation.latitude,
        targetLocation.longitude,
        b.latitude,
        b.longitude
      );
      return distA - distB;
    });

    console.log(`🎯 Found ${nearbyZips.length} nearby ZIP codes`);
    return nearbyZips;
  }

  /**
   * Get all available ZIP codes
   */
  getAllZipCodes(): ZipCodeData[] {
    console.log('📋 Retrieving all available ZIP codes');
    return [...this.zipDatabase];
  }

  /**
   * Calculate route efficiency score
   */
  async calculateRouteEfficiency(zip1: string, zip2: string): Promise<{
    efficiency: number;
    factors: string[];
    recommendations: string[];
  }> {
    console.log('📊 Calculating route efficiency');
    
    const distanceResult = await this.calculateDistance(zip1, zip2);
    
    let efficiency = 85; // Base efficiency
    const factors: string[] = [];
    const recommendations: string[] = [];
    
    // Distance factor
    if (distanceResult.distance < 5) {
      efficiency += 10;
      factors.push('Short distance route');
    } else if (distanceResult.distance > 15) {
      efficiency -= 15;
      factors.push('Long distance route');
      recommendations.push('Consider alternative transportation methods');
    }
    
    // Traffic considerations
    const currentHour = new Date().getHours();
    if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)) {
      efficiency -= 20;
      factors.push('Rush hour traffic impact');
      recommendations.push('Consider traveling outside peak hours');
    }
    
    console.log(`📊 Route efficiency calculated: ${efficiency}%`);
    
    return {
      efficiency: Math.max(0, Math.min(100, efficiency)),
      factors,
      recommendations
    };
  }

  /**
   * Get calculator status
   */
  getCalculatorStatus(): {
    framework: string;
    version: string;
    capabilities: string[];
    zipCodesLoaded: number;
  } {
    return {
      framework: 'Distance Calculator',
      version: '1.0.0',
      capabilities: [
        'Mathematical distance calculations',
        'ZIP code validation and suggestions',
        'Travel time estimation with traffic modeling',
        'Route efficiency analysis',
        'Nearby location discovery'
      ],
      zipCodesLoaded: this.zipDatabase.length
    };
  }
}

// Export singleton instance
export const distanceCalculator = new DistanceCalculatorAgent();

// Log initialization
console.log('🚀 Distance Calculator initialized:', distanceCalculator.getCalculatorStatus());
