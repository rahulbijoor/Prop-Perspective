# DualLens - AI Apartment Hunting Assistant

DualLens is an innovative apartment hunting assistant that provides AI-powered dual perspective debates to help you make informed property decisions. Built with Convex and React, it features a comprehensive property database with 801 Austin listings from Zillow.

## Tech Stack

- **Backend**: Convex (TypeScript)
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Data**: Zillow Austin property listings (801 properties)

## Features

- 🏠 Comprehensive property listings with detailed information
- 📊 Rich property data including price, location, beds/baths, area, and Zestimate
- 🔍 Real-time property search and filtering
- 🤖 AI-powered dual perspective debates (coming soon)
- 📱 Responsive design for all devices

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd duallens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This will:
   - Initialize your Convex project
   - Generate TypeScript types
   - Provide you with a deployment URL

4. **Configure environment variables**
   - Copy the deployment URL from the Convex dev command
   - Update `.env.local` with your `VITE_CONVEX_URL`
   ```bash
   VITE_CONVEX_URL=https://your-deployment-name.convex.cloud
   ```

5. **Import property data**
   ```bash
   npm run convex:import
   ```
   This imports the `data/Zillow_Austin_11-16-22.csv` file into your Convex database.

6. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Data Import

The project includes a comprehensive Zillow dataset (`Zillow_Austin_11-16-22.csv`) with 801 Austin property listings. The data includes:

- **Basic Info**: Price, address, beds, baths, area
- **Location**: Latitude, longitude, full address components
- **Market Data**: Zestimate, price changes, market timing
- **Additional**: Broker information, property badges, variable market data

### Manual Data Import

If you need to re-import the data:

```bash
npx convex import --table properties data/Zillow_Austin_11-16-22.csv
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run convex:dev` - Start Convex development
- `npm run convex:deploy` - Deploy Convex to production
- `npm run convex:import` - Import CSV data to Convex

### Project Structure

```
duallens/
├── convex/                 # Convex backend
│   ├── schema.ts          # Database schema
│   ├── properties.ts      # Property queries

├── src/                   # React frontend
│   ├── components/        # React components
│   │   └── PropertyCard.tsx
│   ├── lib/              # Utilities
│   │   └── convex.ts     # Convex client
│   ├── App.tsx           # Main app component
│   └── main.tsx          # App entry point
├── data/
│   └── Zillow_Austin_11-16-22.csv  # Property data
└── index.html            # HTML template
```

**Note**: The CSV dataset is included in the repository for convenience. The `data/*.csv` pattern is in `.gitignore` to prevent accidental commits of additional CSV files.

## Database Schema

The properties table includes the following fields:

- `price` (string) - Formatted price display
- `unformattedPrice` (number) - Numeric price value
- `address` (string) - Full address
- `addressStreet`, `addressCity`, `addressState`, `addressZipcode` - Address components
- `beds`, `baths` (number) - Property features
- `area` (number) - Square footage
- `latitude`, `longitude` (number) - Geographic coordinates
- `isZillowOwned` (boolean) - Zillow ownership status
- `variableData` (string) - Dynamic market information
- `zestimate` (number) - Zillow's estimated value
- `brokerName` (string) - Listing broker
- Additional fields: `badgeInfo`, `pgapt`, `sgapt`, `info3String`

## Roadmap

### Phase 1: Foundation ✅
- [x] Convex + React setup
- [x] Property data import
- [x] Basic property listing interface
- [x] Property card components

### Phase 2: AI Integration (Coming Soon)
- [ ] AI debate system implementation
- [ ] Dual perspective generation
- [ ] Property comparison features
- [ ] User preference learning

### Phase 3: Advanced Features (Future)
- [ ] Advanced filtering and search
- [ ] Map integration
- [ ] Saved properties and favorites
- [ ] Property alerts and notifications

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
