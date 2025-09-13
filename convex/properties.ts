import { query, action } from "./_generated/server";
import type { QueryCtx, ActionCtx } from "./_generated/server";
import { v } from "convex/values";

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

    // Define budget cap and clamp maxBudget
    const MAX_BUDGET_CAP = 50000;
    const clampedMaxBudget = Math.min(args.maxBudget, MAX_BUDGET_CAP);

    // Query using the price index for performance
    const propertiesWithinBudget = await ctx.db
      .query('properties')
      .withIndex('by_unformattedPrice', (q: any) => q.lte('unformattedPrice', clampedMaxBudget))
      .collect();

    // Filter in memory for beds/baths using safe fallbacks
    const filtered = propertiesWithinBudget.filter((p: any) => {
      const beds = p.beds ?? 0;
      const baths = p.baths ?? 0;
      const enoughBeds = beds >= args.minBeds;
      const enoughBaths = args.minBaths != null ? baths >= args.minBaths : true;
      return enoughBeds && enoughBaths;
    });

    // Score exactly once per item
    const scored = filtered.map((p: any): typeof p & { score: number; scoreBreakdown: { priceEfficiency: number; bedroomMatch: number } } => {
      const price = p.unformattedPrice!; // indexed query ensures number
      const beds = p.beds ?? 0;
      const priceEfficiency = Math.max(0, (clampedMaxBudget - price) / clampedMaxBudget);
      const bedroomRaw = beds >= args.minBeds ? 1 + 0.1 * (beds - args.minBeds) : 0;
      const bedroomMatch = Math.min(1, bedroomRaw);
      const score = 0.7 * priceEfficiency + 0.3 * bedroomMatch;
      return { ...p, score, scoreBreakdown: { priceEfficiency, bedroomMatch } };
    });

    // Sort and rank
    const ranked = scored.sort((a: any, b: any) => b.score - a.score)
      .map((p: any, i: number): typeof p & { rank: number } => ({ ...p, rank: i + 1 }));
    
    return ranked;
  },
});
