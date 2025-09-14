// Austin ZIP Code Database with coordinates
export interface ZipCodeData {
  zip: string;
  latitude: number;
  longitude: number;
  city: string;
  neighborhood?: string;
}

// Austin area ZIP codes with their coordinates
export const austinZipCodes: ZipCodeData[] = [
  { zip: '78701', latitude: 30.2672, longitude: -97.7431, city: 'Austin', neighborhood: 'Downtown' },
  { zip: '78702', latitude: 30.2515, longitude: -97.7209, city: 'Austin', neighborhood: 'East Austin' },
  { zip: '78703', latitude: 30.2849, longitude: -97.7881, city: 'Austin', neighborhood: 'Tarrytown' },
  { zip: '78704', latitude: 30.2322, longitude: -97.7697, city: 'Austin', neighborhood: 'South Austin' },
  { zip: '78705', latitude: 30.2849, longitude: -97.7431, city: 'Austin', neighborhood: 'University Area' },
  { zip: '78712', latitude: 30.2849, longitude: -97.7431, city: 'Austin', neighborhood: 'UT Campus' },
  { zip: '78717', latitude: 30.4516, longitude: -97.8147, city: 'Austin', neighborhood: 'Northwest Hills' },
  { zip: '78719', latitude: 30.1133, longitude: -97.8147, city: 'Austin', neighborhood: 'South Austin' },
  { zip: '78721', latitude: 30.2515, longitude: -97.6931, city: 'Austin', neighborhood: 'East Austin' },
  { zip: '78722', latitude: 30.2849, longitude: -97.7209, city: 'Austin', neighborhood: 'East Austin' },
  { zip: '78723', latitude: 30.3183, longitude: -97.6931, city: 'Austin', neighborhood: 'Northeast Austin' },
  { zip: '78724', latitude: 30.2182, longitude: -97.6653, city: 'Austin', neighborhood: 'East Austin' },
  { zip: '78725', latitude: 30.2182, longitude: -97.6375, city: 'Austin', neighborhood: 'East Austin' },
  { zip: '78726', latitude: 30.4516, longitude: -97.8425, city: 'Austin', neighborhood: 'Northwest Austin' },
  { zip: '78727', latitude: 30.4183, longitude: -97.7709, city: 'Austin', neighborhood: 'North Austin' },
  { zip: '78728', latitude: 30.3850, longitude: -97.8147, city: 'Austin', neighborhood: 'Northwest Austin' },
  { zip: '78729', latitude: 30.4516, longitude: -97.8703, city: 'Austin', neighborhood: 'Cedar Park' },
  { zip: '78730', latitude: 30.3516, longitude: -97.8981, city: 'Austin', neighborhood: 'West Lake Hills' },
  { zip: '78731', latitude: 30.3183, longitude: -97.7987, city: 'Austin', neighborhood: 'North Austin' },
  { zip: '78732', latitude: 30.3850, longitude: -97.9259, city: 'Austin', neighborhood: 'Lakeway' },
  { zip: '78733', latitude: 30.2849, longitude: -97.8703, city: 'Austin', neighborhood: 'West Austin' },
  { zip: '78734', latitude: 30.2182, longitude: -97.9537, city: 'Austin', neighborhood: 'Lakeway' },
  { zip: '78735', latitude: 30.2182, longitude: -97.8981, city: 'Austin', neighborhood: 'Sunset Valley' },
  { zip: '78736', latitude: 30.1849, longitude: -97.8703, city: 'Austin', neighborhood: 'Southwest Austin' },
  { zip: '78737', latitude: 30.1516, longitude: -97.9259, city: 'Austin', neighborhood: 'Southwest Austin' },
  { zip: '78738', latitude: 30.2849, longitude: -97.9537, city: 'Austin', neighborhood: 'Bee Cave' },
  { zip: '78739', latitude: 30.1183, longitude: -97.8981, city: 'Austin', neighborhood: 'Southwest Austin' },
  { zip: '78741', latitude: 30.2182, longitude: -97.7431, city: 'Austin', neighborhood: 'South Austin' },
  { zip: '78742', latitude: 30.1849, longitude: -97.7153, city: 'Austin', neighborhood: 'Southeast Austin' },
  { zip: '78744', latitude: 30.1516, longitude: -97.7431, city: 'Austin', neighborhood: 'South Austin' },
  { zip: '78745', latitude: 30.1849, longitude: -97.7987, city: 'Austin', neighborhood: 'South Austin' },
  { zip: '78746', latitude: 30.2849, longitude: -97.8425, city: 'Austin', neighborhood: 'West Austin' },
  { zip: '78747', latitude: 30.1183, longitude: -97.8425, city: 'Austin', neighborhood: 'Southwest Austin' },
  { zip: '78748', latitude: 30.1516, longitude: -97.7987, city: 'Austin', neighborhood: 'South Austin' },
  { zip: '78749', latitude: 30.1849, longitude: -97.8425, city: 'Austin', neighborhood: 'Southwest Austin' },
  { zip: '78750', latitude: 30.3850, longitude: -97.8425, city: 'Austin', neighborhood: 'Northwest Austin' },
  { zip: '78751', latitude: 30.3183, longitude: -97.7431, city: 'Austin', neighborhood: 'North Austin' },
  { zip: '78752', latitude: 30.3516, longitude: -97.7153, city: 'Austin', neighborhood: 'North Austin' },
  { zip: '78753', latitude: 30.3850, longitude: -97.6931, city: 'Austin', neighborhood: 'North Austin' },
  { zip: '78754', latitude: 30.3516, longitude: -97.6653, city: 'Austin', neighborhood: 'Northeast Austin' },
  { zip: '78756', latitude: 30.3183, longitude: -97.7709, city: 'Austin', neighborhood: 'North Austin' },
  { zip: '78757', latitude: 30.3516, longitude: -97.7431, city: 'Austin', neighborhood: 'North Austin' },
  { zip: '78758', latitude: 30.4183, longitude: -97.7153, city: 'Austin', neighborhood: 'North Austin' },
  { zip: '78759', latitude: 30.4183, longitude: -97.7431, city: 'Austin', neighborhood: 'North Austin' }
];

export interface DistanceResult {
  distance: number; // in miles
  travelTime: string;
  confidence: number;
  route: string;
}

export class DistanceCalculator {
  /**
   * Calculate distance between two ZIP codes using Haversine formula
   */
  static calculateDistance(zip1: string, zip2: string): DistanceResult {
    const location1 = this.getZipCodeData(zip1);
    const location2 = this.getZipCodeData(zip2);

    if (!location1 || !location2) {
      return {
        distance: 0,
        travelTime: 'Unknown',
        confidence: 0,
        route: 'Unable to calculate route'
      };
    }

    const distance = this.haversineDistance(
      location1.latitude,
      location1.longitude,
      location2.latitude,
      location2.longitude
    );

    // Estimate travel time (assuming average 25 mph in city)
    const travelTimeMinutes = Math.round(distance * 2.4); // ~25 mph average
    const travelTime = travelTimeMinutes < 60 
      ? `${travelTimeMinutes} min`
      : `${Math.round(travelTimeMinutes / 60)} hr ${travelTimeMinutes % 60} min`;

    const route = `${location1.neighborhood || location1.city} to ${location2.neighborhood || location2.city}`;

    return {
      distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
      travelTime,
      confidence: 85, // High confidence for ZIP code based calculation
      route
    };
  }

  /**
   * Get ZIP code data from our database
   */
  static getZipCodeData(zip: string): ZipCodeData | null {
    const cleanZip = zip.replace(/\D/g, '').substring(0, 5);
    return austinZipCodes.find(z => z.zip === cleanZip) || null;
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  static haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find nearby ZIP codes within a certain radius
   */
  static findNearbyZipCodes(targetZip: string, radiusMiles: number = 10): ZipCodeData[] {
    const targetLocation = this.getZipCodeData(targetZip);
    if (!targetLocation) return [];

    return austinZipCodes.filter(zipData => {
      if (zipData.zip === targetZip) return false;
      
      const distance = this.haversineDistance(
        targetLocation.latitude,
        targetLocation.longitude,
        zipData.latitude,
        zipData.longitude
      );
      
      return distance <= radiusMiles;
    }).sort((a, b) => {
      const distA = this.haversineDistance(
        targetLocation.latitude,
        targetLocation.longitude,
        a.latitude,
        a.longitude
      );
      const distB = this.haversineDistance(
        targetLocation.latitude,
        targetLocation.longitude,
        b.latitude,
        b.longitude
      );
      return distA - distB;
    });
  }

  /**
   * Get ZIP code suggestions based on partial input
   */
  static getZipCodeSuggestions(input: string): ZipCodeData[] {
    const cleanInput = input.replace(/\D/g, '');
    
    if (cleanInput.length === 0) return [];
    
    return austinZipCodes.filter(zipData => 
      zipData.zip.startsWith(cleanInput) ||
      zipData.neighborhood?.toLowerCase().includes(input.toLowerCase()) ||
      zipData.city.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5);
  }

  /**
   * Validate if a ZIP code is in our Austin database
   */
  static isValidAustinZip(zip: string): boolean {
    return !!this.getZipCodeData(zip);
  }

  /**
   * Get all available ZIP codes
   */
  static getAllZipCodes(): ZipCodeData[] {
    return [...austinZipCodes];
  }
}

// Export singleton instance for convenience
export const distanceCalculator = DistanceCalculator;
