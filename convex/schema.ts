
// If you encounter import errors due to blanks or 'N/A' in numeric columns, temporarily change
// v.optional(v.number()) to v.optional(v.string()) for import, then normalize later.
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  properties: defineTable({
    price: v.optional(v.number()),
    unformattedPrice: v.optional(v.number()),
    address: v.optional(v.string()),
    addressStreet: v.optional(v.string()),
    addressCity: v.optional(v.string()),
    addressState: v.optional(v.string()),
    addressZipcode: v.optional(v.number()),
    beds: v.optional(v.number()),
    baths: v.optional(v.number()),
    area: v.optional(v.number()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    isZillowOwned: v.optional(v.string()),
    variableData: v.optional(v.string()),
    badgeInfo: v.optional(v.string()),
    pgapt: v.optional(v.string()),
    sgapt: v.optional(v.string()),
    zestimate: v.optional(v.number()),
    info3String: v.optional(v.string()),
    brokerName: v.optional(v.string()),
  })
    .index('by_unformattedPrice', ['unformattedPrice'])
    .index('by_beds', ['beds']),
});
