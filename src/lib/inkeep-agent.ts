import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // Only for development
});

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

export class InkeepDistanceAgent {
  private openaiClient: OpenAI;

  constructor() {
    this.openaiClient = openai;
  }

  /**
   * Calculate distance between user's desired location and property
   */
  async calculateDistance(
    userLocation: LocationData,
    propertyLocation: LocationData
  ): Promise<DistanceResult> {
    try {
      const prompt = `
You are a location and distance analysis agent. Calculate the distance and provide travel information between these two locations:

User's Desired Location:
- Address: ${userLocation.address}
- ZIP Code: ${userLocation.zipCode}

Property Location:
- Address: ${propertyLocation.address}
- ZIP Code: ${propertyLocation.zipCode}

Please provide:
1. Approximate distance in miles
2. Estimated driving time
3. Best route description
4. Confidence level (0-100) in your calculation

Format your response as JSON:
{
  "distance": number,
  "travelTime": "string",
  "route": "string",
  "confidence": number
}
`;

      const response = await this.openaiClient.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a precise location and distance calculation agent. Always respond with valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const result = response.choices[0]?.message?.content;
      if (!result) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      const distanceData = JSON.parse(result) as DistanceResult;
      
      return {
        distance: distanceData.distance,
        travelTime: distanceData.travelTime,
        route: distanceData.route,
        confidence: distanceData.confidence
      };

    } catch (error) {
      console.error('Error calculating distance:', error);
      
      // Fallback calculation using approximate ZIP code distance
      const fallbackDistance = this.calculateFallbackDistance(
        userLocation.zipCode,
        propertyLocation.zipCode
      );
      
      return {
        distance: fallbackDistance,
        travelTime: `${Math.round(fallbackDistance * 1.5)} minutes`,
        route: `Approximate route from ${userLocation.zipCode} to ${propertyLocation.zipCode}`,
        confidence: 60
      };
    }
  }

  /**
   * Get location suggestions based on user input
   */
  async getLocationSuggestions(userInput: string): Promise<string[]> {
    try {
      const prompt = `
Given this location input: "${userInput}"

Provide 5 specific location suggestions in Austin, Texas area that match this input. 
Include full addresses with ZIP codes where possible.

Format as a JSON array of strings:
["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"]
`;

      const response = await this.openaiClient.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a location suggestion agent for Austin, Texas. Always respond with valid JSON array format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      });

      const result = response.choices[0]?.message?.content;
      if (!result) {
        return [];
      }

      return JSON.parse(result) as string[];

    } catch (error) {
      console.error('Error getting location suggestions:', error);
      return [
        "Downtown Austin, TX 78701",
        "University of Texas, Austin, TX 78712",
        "South Austin, TX 78704",
        "North Austin, TX 78758",
        "West Austin, TX 78746"
      ];
    }
  }

  /**
   * Analyze commute quality and provide insights
   */
  async analyzeCommute(
    userLocation: LocationData,
    propertyLocation: LocationData,
    userPreferences: {
      maxCommuteTime?: number;
      transportMode?: 'driving' | 'public' | 'walking' | 'cycling';
      workSchedule?: 'standard' | 'flexible' | 'remote';
    }
  ): Promise<{
    score: number;
    insights: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `
Analyze the commute between these locations:

From: ${userLocation.address} (${userLocation.zipCode})
To: ${propertyLocation.address} (${propertyLocation.zipCode})

User Preferences:
- Max commute time: ${userPreferences.maxCommuteTime || 'Not specified'} minutes
- Transport mode: ${userPreferences.transportMode || 'driving'}
- Work schedule: ${userPreferences.workSchedule || 'standard'}

Provide a commute analysis with:
1. Overall commute score (0-100)
2. Key insights about this commute
3. Recommendations for the user

Format as JSON:
{
  "score": number,
  "insights": ["insight1", "insight2", "insight3"],
  "recommendations": ["rec1", "rec2", "rec3"]
}
`;

      const response = await this.openaiClient.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a commute analysis expert for Austin, Texas. Consider traffic patterns, public transport, and local conditions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 600
      });

      const result = response.choices[0]?.message?.content;
      if (!result) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(result);

    } catch (error) {
      console.error('Error analyzing commute:', error);
      return {
        score: 75,
        insights: [
          "Commute analysis temporarily unavailable",
          "Consider traffic patterns during peak hours",
          "Austin has growing public transportation options"
        ],
        recommendations: [
          "Test the commute during your typical work hours",
          "Consider alternative routes",
          "Explore public transportation options"
        ]
      };
    }
  }

  /**
   * Fallback distance calculation using ZIP code approximation
   */
  private calculateFallbackDistance(zip1: string, zip2: string): number {
    // Simple approximation - in a real app, you'd use a ZIP code database
    const zip1Num = parseInt(zip1.replace(/\D/g, ''));
    const zip2Num = parseInt(zip2.replace(/\D/g, ''));
    
    const diff = Math.abs(zip1Num - zip2Num);
    
    // Rough approximation: each ZIP code difference ≈ 2-5 miles in Austin area
    return Math.min(diff * 3, 50); // Cap at 50 miles for safety
  }

  /**
   * Validate OpenAI API key
   */
  isConfigured(): boolean {
    return !!process.env.VITE_OPENAI_API_KEY;
  }
}

// Export singleton instance
export const inkeepAgent = new InkeepDistanceAgent();
