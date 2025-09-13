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
