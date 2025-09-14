import type { DebateResponse } from '../types/debate';
import type { RankedProperty } from '../types/property';

/**
 * Debate Service Integration
 * Connects to the Python debate service with CrewAI agents
 */

const DEBATE_SERVICE_URL = 'http://localhost:8000';

export interface DebateServiceConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

export class DebateService {
  private config: DebateServiceConfig;

  constructor(config?: Partial<DebateServiceConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || DEBATE_SERVICE_URL,
      timeout: config?.timeout || 45000, // 45 seconds
      retries: config?.retries || 2
    };
  }

  /**
   * Generate debate using CrewAI agents
   */
  async generateDebate(property: RankedProperty): Promise<DebateResponse> {
    console.log('🚀 Starting debate generation for property:', property._id);

    try {
      // Transform property data to match Python service format
      const debateRequest = {
        property_data: {
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
        },
        context: 'Property investment analysis for Austin market',
        focus_areas: [
          'Investment potential',
          'Market conditions',
          'Risk assessment',
          'Financial analysis',
          'Location advantages'
        ]
      };

      // Call the debate service
      const response = await this.callDebateService(debateRequest);
      
      console.log('✅ Debate generation completed successfully');
      return response;

    } catch (error) {
      console.error('❌ Debate generation failed:', error);
      throw new Error(`Failed to generate debate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Call the Python debate service with retry logic
   */
  private async callDebateService(request: any): Promise<DebateResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        console.log(`🔄 Debate service attempt ${attempt}/${this.config.retries}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(`${this.config.baseUrl}/debate`, {
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

        const debateResponse: DebateResponse = await response.json();
        
        // Validate response structure
        if (!this.validateDebateResponse(debateResponse)) {
          throw new Error('Invalid debate response format from service');
        }

        console.log('✅ Debate service call successful');
        return debateResponse;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`⚠️ Debate service attempt ${attempt} failed:`, lastError.message);

        if (attempt < this.config.retries) {
          // Wait before retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('All debate service attempts failed');
  }

  /**
   * Validate debate response structure
   */
  private validateDebateResponse(response: any): response is DebateResponse {
    return !!(
      response &&
      Array.isArray(response.pro_arguments) &&
      Array.isArray(response.con_arguments) &&
      response.summary &&
      response.recommendation &&
      typeof response.confidence_score === 'number' &&
      response.market_insights &&
      response.metadata
    );
  }

  /**
   * Format property address for the debate service
   */
  private formatAddress(property: RankedProperty): string {
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
   * Check if debate service is available
   */
  async checkServiceHealth(): Promise<boolean> {
    try {
      console.log('🔍 Checking debate service health...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      const isHealthy = response.ok;
      console.log(`${isHealthy ? '✅' : '❌'} Debate service health check:`, isHealthy ? 'OK' : 'Failed');
      
      return isHealthy;

    } catch (error) {
      console.warn('⚠️ Debate service health check failed:', error);
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
      type: 'CrewAI Debate Service'
    };
  }
}

// Export singleton instance
export const debateService = new DebateService();

// Log service initialization
console.log('🚀 Debate Service initialized:', debateService.getServiceInfo());
