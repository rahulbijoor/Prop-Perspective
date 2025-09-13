# Data Import Guide

This guide provides detailed instructions for importing the Zillow CSV data into your Convex database.

## Overview

The `Zillow_Austin_11-16-22.csv` file contains 801 Austin property listings with comprehensive data including pricing, location details, property features, and market information. This data needs to be imported into the Convex `properties` table defined in `convex/schema.ts`.

## Prerequisites

- Convex project initialized (`npx convex dev` completed)
- Environment variables configured in `.env.local`
- Convex deployment URL available

## Import Methods

### Method 1: Using npm Script (Recommended)

The easiest way to import data is using the predefined npm script:

```bash
npm run convex:import
```

This command runs: `convex import --table properties data/Zillow_Austin_11-16-22.csv`

### Method 2: Manual Convex CLI

If you need more control over the import process:

```bash
npx convex import --table properties data/Zillow_Austin_11-16-22.csv
```

### Method 3: Custom Import Options

For advanced import scenarios:

```bash
# Import with specific options
npx convex import --table properties --replace data/Zillow_Austin_11-16-22.csv

# Import to a different table name
npx convex import --table properties_backup data/Zillow_Austin_11-16-22.csv
```

## Field Mapping

The CSV columns are automatically mapped to the database schema fields defined in `convex/schema.ts`:

| CSV Column | Database Field | Type | Description |
|------------|----------------|------|-------------|
| price | price | string | Formatted price display |
| unformattedPrice | unformattedPrice | number | Numeric price value |
| address | address | string | Full property address |
| addressStreet | addressStreet | string | Street address |
| addressCity | addressCity | string | City name |
| addressState | addressState | string | State abbreviation |
| addressZipcode | addressZipcode | string | ZIP code |
| beds | beds | number | Number of bedrooms |
| baths | baths | number | Number of bathrooms |
| area | area | number | Square footage |
| latitude | latitude | number | Geographic latitude |
| longitude | longitude | number | Geographic longitude |
| isZillowOwned | isZillowOwned | boolean | Zillow ownership status |
| variableData | variableData | string | Dynamic market information |
| badgeInfo | badgeInfo | string | Property badges/labels |
| pgapt | pgapt | string | Property group apartment info |
| sgapt | sgapt | string | Sub-group apartment info |
| zestimate | zestimate | number | Zillow estimated value |
| info3String | info3String | string | Additional property info |
| brokerName | brokerName | string | Listing broker name |

## Step-by-Step Import Process

### 1. Verify Schema

Ensure your `convex/schema.ts` matches the expected structure:

```typescript
export default defineSchema({
  properties: defineTable({
    price: v.optional(v.string()),
    unformattedPrice: v.optional(v.number()),
    address: v.optional(v.string()),
    // ... other fields
  }),
});
```

### 2. Check CSV File

Verify the CSV file is in the data directory:
```bash
ls -la data/Zillow_Austin_11-16-22.csv
```

### 3. Run Import Command

Execute the import:
```bash
npm run convex:import
```

### 4. Monitor Import Progress

The Convex CLI will show import progress:
```
Importing data from Zillow_Austin_11-16-22.csv...
✓ Imported 801 rows to table 'properties'
Import completed successfully!
```

### 5. Verify Import

Check the data was imported correctly:

Start the app (`npm run dev`) and verify properties render, and/or use the Convex dashboard Data tab to inspect the `properties` table.

For CLI verification, you may add the following action to `convex/properties.ts`:

```ts
export const count = action({
   args: {},
   handler: async (ctx) => (await ctx.db.query('properties').collect()).length
});
```
Then run:
```bash
npx convex run properties:count
```

## Troubleshooting

### Common Issues

**Issue**: `Error: Table 'properties' does not exist`
**Solution**: Ensure you've run `npx convex dev` and the schema is deployed.

**Issue**: `Error: CSV file not found`
**Solution**: Verify the CSV file is in the `data/` directory and the filename is correct.

**Issue**: `Error: Field type mismatch`
**Solution**: Check that CSV column types match the schema field types. If you encounter errors due to blanks or 'N/A' in numeric columns, you can either:
   - Temporarily change the relevant field in `convex/schema.ts` from `v.optional(v.number())` to `v.optional(v.string())` for import, then normalize later.
   - Or, pre-process the CSV to clean/convert blanks and 'N/A' to valid numbers or empty strings before import.

**Issue**: `Error: Deployment not found`
**Solution**: Verify `VITE_CONVEX_URL` is set correctly in `.env.local`.

### Data Validation

After import, verify data integrity:

1. **Check via Convex Dashboard**:
   Visit your Convex dashboard and navigate to the Data tab to inspect the `properties` table.

2. **Check via Running App**:
   Start the app (`npm run dev`) and verify properties render correctly in the UI.

3. **CLI Verification**:
   For CLI verification, use the count action:
   ```bash
   npx convex run properties:count
   ```
   Should return 801 properties.

   For CLI lookup by ID, use:
   ```bash
   npx convex run properties:getByIdAction --id <documentId>
   ```

4. **Verify field population**:
   Check that key fields like price, address, beds, baths are populated for most records via the dashboard or app UI.

### Re-importing Data

If you need to re-import data:



2. **Re-import**:
   ```bash
   npm run convex:import
   ```

## Data Quality Notes

The Zillow dataset includes:

- **Complete records**: Most properties have all basic fields (price, address, beds, baths)
- **Optional fields**: Some properties may have missing zestimate, broker, or variable data
- **Geographic data**: All properties include latitude/longitude coordinates
- **Market data**: Variable data field contains dynamic market information when available

## Performance Considerations

- Import typically takes 1-2 minutes for 801 records
- Large imports may require increased timeout settings
- Consider batching for datasets larger than 10,000 records

## Next Steps

After successful import:

1. Start the development server: `npm run dev`
2. Verify properties display in the React application
3. Test property card rendering and data display
4. Begin implementing additional features like filtering and search

## Support

If you encounter issues during import:

1. Check the Convex dashboard for error logs
2. Verify CSV file format and encoding (UTF-8 recommended)
3. Ensure all required dependencies are installed
4. Review the Convex documentation for advanced import options
