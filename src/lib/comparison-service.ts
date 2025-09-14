import type { ComparisonResponse, ComparisonRequest } from '../types/comparison';
import type { Property } from '../types/property';

/**
 * Comparison Service Integration
 * Connects to the Python comparison service with CrewAI agents
 */

const COMPARISON_SERVICE_URL = 'http://localhost:8000';

export interface ComparisonServiceConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

export class ComparisonService {
  private config: ComparisonServiceConfig;

  constructor(config?: Partial<ComparisonServiceConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || COMPARISON_SERVICE_URL,
      timeout: config?.timeout || 60000, // 60 seconds (comparison takes longer)
      retries: config?.retries || 2
    };
  }

  /**
   * Generate property comparison using CrewAI agents
   */
  async generateComparison(properties: Property[]): Promise<ComparisonResponse> {
    console.log('🚀 Starting property comparison for', properties.length, 'properties');

    if (properties.length < 2) {
      throw new Error('At least 2 properties are required for comparison');
    }

    try {
      // Transform properties data to match Python service format
      const comparisonRequest: ComparisonRequest = {
        properties_data: properties.map(property => ({
          price: property.unformattedPrice || property.price || 0,
          unformattedPrice: property.unformattedPrice || property.price || 0,
          address: this.formatAddress(property),
          addressStreet: property.addressStreet,
          addressCity: property.addressCity,
          addressState: property.addressState,
          addressZipcode: property.addressZipcode,
          beds: property.beds || 0,
          baths: property.baths || 0,
          area: property.area || 0,
          latitude: property.latitude,
          longitude: property.longitude,
          isZillowOwned: property.isZillowOwned,
          variableData: property.variableData,
          badgeInfo: property.badgeInfo,
          pgapt: property.pgapt,
          sgapt: property.sgapt,
          zestimate: property.zestimate,
          info3String: property.info3String,
          brokerName: property.brokerName,
        })),
        context: 'Property comparison analysis for Austin market',
        focus_areas: [
          'Value analysis',
          'Location comparison',
          'Space efficiency',
          'Family suitability',
          'Investment potential'
        ]
      };

      // Call the comparison service
      const response = await this.callComparisonService(comparisonRequest);

      console.log('✅ Property comparison completed successfully');
      return response;

    } catch (error) {
      console.error('❌ Property comparison failed:', error);
      throw new Error(`Failed to generate comparison: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Call the Python comparison service with retry logic
   */
  private async callComparisonService(request: ComparisonRequest): Promise<ComparisonResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        console.log(`🔄 Comparison service attempt ${attempt}/${this.config.retries}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(`${this.config.baseUrl}/compare`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(request),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const comparisonResponse: ComparisonResponse = await response.json();

        // Validate response structure
        if (!this.validateComparisonResponse(comparisonResponse)) {
          throw new Error('Invalid comparison response format from service');
        }

        console.log('✅ Comparison service call successful');
        return comparisonResponse;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`⚠️ Comparison service attempt ${attempt} failed:`, lastError.message);

        if (attempt < this.config.retries) {
          // Wait before retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('All comparison service attempts failed');
  }

  /**
   * Validate comparison response structure
   */
  private validateComparisonResponse(response: any): response is ComparisonResponse {
    return !!(response &&
      Array.isArray(response.insights) &&
      response.summary &&
      typeof response.confidence_score === 'number' &&
      response.metadata
    );
  }

  /**
   * Format property address for the comparison service
   */
  private formatAddress(property: Property): string {
    const addressParts = [
      property.addressStreet,
      property.addressCity,
      property.addressState,
      property.addressZipcode?.toString()
    ].filter(Boolean);

    return addressParts.length > 0
      ? addressParts.join(', ')
      : property.address || 'Austin, TX';
  }

  /**
   * Check if comparison service is available
   */
  async checkServiceHealth(): Promise<boolean> {
    try {
      console.log('🔍 Checking comparison service health...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const isHealthy = response.ok;
      console.log(`${isHealthy ? '✅' : '❌'} Comparison service health check:`, isHealthy ? 'OK' : 'Failed');

      return isHealthy;

    } catch (error) {
      console.warn('⚠️ Comparison service health check failed:', error);
      return false;
    }
  }

  /**
   * Get service status and configuration
   */
  getServiceInfo() {
    return {
      baseUrl: this.config.baseUrl,
      timeout: this.config.timeout,
      retries: this.config.retries,
      type: 'CrewAI Comparison Service'
    };
  }
}

// Export singleton instance
export const comparisonService = new ComparisonService();

// Log service initialization
console.log('🚀 Comparison Service initialized:', comparisonService.getServiceInfo());
