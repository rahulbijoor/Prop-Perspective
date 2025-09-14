import { query, action } from "./_generated/server";
import type { QueryCtx, ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import { fetchWithTimeout, logHttpOperation, validators } from "./lib/http";

export const getAllProperties = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("properties").collect();
  },
});

export const count = action({
  args: {},
  handler: async (ctx: ActionCtx) => (await ctx.db.query('properties').collect()).length,
});

export const getPropertyById = query({
  args: { id: v.id("properties") },
  handler: async (ctx: QueryCtx, args: { id: any }) => {
    return await ctx.db.get(args.id);
  },
});

export const getByIdAction = action({
  args: { id: v.id("properties") },
  handler: async (ctx: ActionCtx, args: { id: any }) => {
    return await ctx.db.get(args.id);
  },
});

export const getRankedProperties = query({
  args: { 
    maxBudget: v.number(), 
    minBeds: v.number(), 
    minBaths: v.optional(v.number()) 
  },
  handler: async (ctx: QueryCtx, args: { maxBudget: number; minBeds: number; minBaths?: number }) => {
    // Input validation
    if (args.maxBudget < 0 || isNaN(args.maxBudget)) {
      throw new Error("Invalid maxBudget: must be a positive number");
    }
    if (args.minBeds < 0 || isNaN(args.minBeds)) {
      throw new Error("Invalid minBeds: must be a non-negative number");
    }
    if (args.minBaths !== undefined && (args.minBaths < 0 || isNaN(args.minBaths))) {
      throw new Error("Invalid minBaths: must be a non-negative number");
    }

    // Clamp maxBudget to reasonable bounds
    const clampedMaxBudget = Math.min(args.maxBudget, 2000000);

    // Fetch all properties
    const all = await ctx.db.query("properties").collect();

    // Filter properties
    const filtered = all.filter((p: any) => {
      // Coerce price with fallback
      const price = p.unformattedPrice ?? Number.MAX_SAFE_INTEGER;
      // Coerce beds and baths with fallbacks
      const beds = p.beds ?? 0;
      const baths = p.baths ?? 0;

      // Apply filters
      const withinBudget = price <= clampedMaxBudget;
      const hasEnoughBeds = beds >= args.minBeds;
      const hasEnoughBaths = args.minBaths != null ? baths >= args.minBaths : true;

      return withinBudget && hasEnoughBeds && hasEnoughBaths;
    });

    // Score and rank properties
    const scored = filtered.map((p: any) => {
      const price = p.unformattedPrice ?? Number.MAX_SAFE_INTEGER;
      const beds = p.beds ?? 0;

      // Calculate scoring components
      const priceEfficiency = Math.max(0, (clampedMaxBudget - price) / clampedMaxBudget);
      const bedroomRaw = beds >= args.minBeds ? 1 + 0.1 * (beds - args.minBeds) : 0;
      const bedroomMatch = Math.min(1, bedroomRaw);
      
      // Calculate final score
      const score = 0.7 * priceEfficiency + 0.3 * bedroomMatch;

      return {
        ...p,
        score,
        scoreBreakdown: {
          priceEfficiency,
          bedroomMatch
        }
      };
    });

    // Sort by score descending and add rank
    const sorted = scored.sort((a: any, b: any) => b.score - a.score);
    const ranked = sorted.map((p: any, idx: number) => ({
      ...p,
      rank: idx + 1
    }));

    return ranked;
  },
});

export const generateDebate = action({
  args: { propertyId: v.id("properties") },
  handler: async (ctx: ActionCtx, args: { propertyId: any }) => {
    try {
      // Fetch the property data
      const property = await ctx.db.get(args.propertyId);
      if (!property) {
        throw new Error("Property not found");
      }

      // Get the debate service URL from environment with fallback to localhost
      // In Convex, environment variables are accessed through the action context
      const debateServiceUrl = (ctx as any).env?.DEBATE_SERVICE_URL || 'http://localhost:8000';
      const base = debateServiceUrl.replace(/\/$/, '');
      
      // Log for debugging
      console.log(`Calling debate service at: ${base}/debate`);

      // Transform property data to match the Python service expected format
      const address = property.address ?? [
        property.addressStreet, 
        property.addressCity, 
        property.addressState, 
        property.addressZipcode?.toString()
      ]
        .filter(Boolean)
        .join(', ');

      const debateRequest = {
        property_data: {
          price: property.unformattedPrice ?? property.price ?? 0,
          unformattedPrice: property.unformattedPrice ?? property.price ?? 0,
          address,
          addressStreet: property.addressStreet,
          addressCity: property.addressCity,
          addressState: property.addressState,
          addressZipcode: property.addressZipcode,
          beds: property.beds ?? 0,
          baths: property.baths ?? 0,
          area: property.area ?? 0,
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
        context: 'Property listing data',
        focus_areas: [],
      };

      // Call the Python debate service using enhanced fetch helper
      const result = await fetchWithTimeout(`${base}/debate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(debateRequest),
        timeout: 45000, // 45 seconds for snappier demo feedback
        retries: 1,
        retryDelay: 5000,
      });

      // Log the operation
      logHttpOperation('generateDebate', `${base}/debate`, result, {
        propertyId: args.propertyId,
      });

      if (!result.success) {
        throw new Error(`Debate service error: ${result.error}`);
      }

      // Validate the response structure using the helper
      const debateResponse = result.data;
      if (!validators.debateResponse(debateResponse)) {
        throw new Error('Invalid debate response format');
      }

      // Add property ID to the response for consistency
      debateResponse.property_id = args.propertyId;

      return debateResponse;
    } catch (error) {
      console.error("Error generating debate:", error);
      throw new Error(`Failed to generate debate: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});
