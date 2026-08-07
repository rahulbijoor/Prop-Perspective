/**
 * HTTP utilities for Convex actions
 * Provides timeout, retry logic, and structured error handling
 */

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface FetchResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  duration: number;
}

/**
 * Enhanced fetch with timeout and retry logic
 */
export async function fetchWithTimeout<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  const {
    timeout = 45000, // 45 seconds default
    retries = 1,
    retryDelay = 5000,
    ...fetchOptions
  } = options;

  const startTime = Date.now();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          return {
            success: false,
            error: `HTTP ${response.status}: ${errorText}`,
            status: response.status,
            duration,
          };
        }

        const data = await response.json();
        return {
          success: true,
          data,
          status: response.status,
          duration,
        };

      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if ((fetchError as any).name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`);
        }
        throw fetchError;
      }

    } catch (error) {
      lastError = error as Error;
      
      // If this is the last attempt, don't retry
      if (attempt === retries) {
        break;
      }

      // Log retry attempt
      console.info(`Fetch attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  const duration = Date.now() - startTime;
  return {
    success: false,
    error: lastError?.message || 'Unknown fetch error',
    duration,
  };
}

/**
 * Structured logging for HTTP operations
 */
export function logHttpOperation(
  operation: string,
  url: string,
  result: FetchResult,
  context?: Record<string, any>
) {
  const logData = {
    operation,
    url,
    success: result.success,
    status: result.status,
    duration: `${result.duration}ms`,
    ...context,
  };

  if (result.success) {
    console.info(`HTTP ${operation} succeeded: `, logData);
  } else {
    console.error(`HTTP ${operation} failed: `, {
      ...logData,
      error: result.error,
    });
  }
}

/**
 * Validate response structure
 */
export function validateResponse<T>(
  data: any,
  validator: (data: any) => data is T,
  errorMessage: string = 'Invalid response format'
): T {
  if (!validator(data)) {
    throw new Error(errorMessage);
  }
  return data;
}

/**
 * Common response validators
 */
export const validators = {
  debateResponse: (data: any): data is any => {
    return (
      data &&
      Array.isArray(data.pro_arguments) &&
      Array.isArray(data.con_arguments) &&
      typeof data.summary === 'string' &&
      typeof data.recommendation === 'string' &&
      typeof data.confidence_score === 'number' &&
      data.market_insights
    );
  },
};
