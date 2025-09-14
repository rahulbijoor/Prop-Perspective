# Local Development Setup Guide

## Quick Start (10 Minutes)

This guide will get your AI Property Debate application running locally for the hackathon demo.

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.9 or higher) - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Google Gemini API Key** - [Get one here](https://makersuite.google.com/app/apikey)

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/rahulbijoor/Prop-Perspective.git
cd Prop-Perspective

# Install Node.js dependencies
npm install

# Install Python dependencies
cd debate-service
pip install -r requirements.txt
cd ..
```

### Step 2: Environment Configuration

1. **Create environment files:**
   
   Create `debate-service/.env`:
   ```env
   GOOGLE_API_KEY=your_gemini_api_key_here
   ENVIRONMENT=development
   DEBUG=true
   HOST=localhost
   PORT=8000
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

   Create `.env.local`:
   ```env
   VITE_CONVEX_URL=your_convex_deployment_url
   VITE_DEBATE_SERVICE_URL=http://localhost:8000
   VITE_ENVIRONMENT=development
   ```

2. **Configure your API keys:**
   
   Edit `debate-service/.env`:
   ```env
   GOOGLE_API_KEY=your_gemini_api_key_here
   ENVIRONMENT=development
   DEBUG=true
   HOST=localhost
   PORT=8000
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

   Edit `.env.local`:
   ```env
   VITE_CONVEX_URL=your_convex_deployment_url
   VITE_DEBATE_SERVICE_URL=http://localhost:8000
   VITE_ENVIRONMENT=development
   ```

### Step 3: Start All Services

**Option A: One-Command Start (Recommended)**
```bash
# Cross-platform - starts all services concurrently
npm run demo
```

**Option B: Manual Start**
```bash
# Terminal 1: Start Python debate service
cd debate-service
python run.py

# Terminal 2: Start Convex development server
npx convex dev

# Terminal 3: Start React frontend
npm run dev
```

### Step 4: Verify Setup

1. **Check Python Service**: Visit http://localhost:8000/docs
2. **Check Frontend**: Visit http://localhost:5173
3. **Test Integration**: Select a property and trigger a debate

---

## Detailed Setup Instructions

### Python Service Setup

The debate service uses CrewAI with Google Gemini for AI-powered property debates.

#### 1. Virtual Environment (Recommended)

```bash
cd debate-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 2. Environment Variables

Create `debate-service/.env` with these required variables:

```env
# Google Gemini API Configuration
GOOGLE_API_KEY=your_api_key_here

# Service Configuration
ENVIRONMENT=development
DEBUG=true
HOST=localhost
PORT=8000

# CORS Configuration for local development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# CrewAI Configuration
CREW_VERBOSE=true
CREW_MEMORY=true

# Logging Configuration
LOG_LEVEL=INFO
LOG_FORMAT=detailed
```

#### 3. Test Python Service

```bash
cd debate-service
python run.py
```

Visit http://localhost:8000/docs to see the API documentation.

### Convex Configuration

#### 1. Convex Setup

```bash
# Install Convex CLI globally
npm install -g convex

# Login to Convex (if not already logged in)
npx convex login

# Deploy to development environment
npx convex dev
```

#### 2. Configure Local Service URL

The Convex action needs to call your local Python service. Update `convex/properties.ts`:

```typescript
const DEBATE_SERVICE_URL = process.env.DEBATE_SERVICE_URL || 'http://localhost:8000';
```

#### 3. Environment Variables

Create `.env.local`:

```env
# Convex Configuration
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Local Development
VITE_DEBATE_SERVICE_URL=http://localhost:8000
VITE_ENVIRONMENT=development
VITE_DEBUG=true

# Demo Configuration
VITE_DEMO_MODE=true
VITE_AUTO_REFRESH=false
```

### Frontend Configuration

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Development Server

```bash
npm run dev
```

The frontend will be available at http://localhost:5173.

---

## API Key Setup

### Google Gemini API Key

1. **Get API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Click "Create API Key"
   - Copy the generated key

2. **Configure API Key:**
   ```bash
   # Add to debate-service/.env
   GOOGLE_API_KEY=your_api_key_here
   ```

3. **Test API Key:**
   ```bash
   cd debate-service
   python -c "
   import os
   from google.generativeai import configure, GenerativeModel
   configure(api_key=os.getenv('GOOGLE_API_KEY'))
   model = GenerativeModel('gemini-pro')
   print('API key is valid!')
   "
   ```

---

## Port Configuration

Default ports for local development:

- **React Frontend**: http://localhost:5173
- **Python Debate Service**: http://localhost:8000
- **Convex Dev Server**: Managed by Convex CLI

### Changing Ports

If you need to use different ports:

1. **Python Service** - Edit `debate-service/.env`:
   ```env
   PORT=8001
   ```

2. **React Frontend** - Edit `vite.config.ts`:
   ```typescript
   export default defineConfig({
     server: {
       port: 3000
     }
   })
   ```

3. **Update CORS** - Edit `debate-service/.env`:
   ```env
   CORS_ORIGINS=http://localhost:3000,http://localhost:5174
   ```

---

## Troubleshooting

### Common Issues

#### 1. Python Service Won't Start

**Error**: `ModuleNotFoundError: No module named 'crewai'`

**Solution**:
```bash
cd debate-service
pip install -r requirements.txt
```

#### 2. API Key Issues

**Error**: `Invalid API key`

**Solution**:
- Verify your Google Gemini API key is correct
- Check that the key is properly set in `debate-service/.env`
- Ensure no extra spaces or quotes around the key

#### 3. CORS Errors

**Error**: `Access to fetch at 'http://localhost:8000' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution**:
- Check `CORS_ORIGINS` in `debate-service/.env`
- Ensure it includes your frontend URL
- Restart the Python service after changes

#### 4. Convex Connection Issues

**Error**: `Failed to connect to Convex`

**Solution**:
```bash
# Re-authenticate with Convex
npx convex login

# Restart development server
npx convex dev
```

#### 5. Port Already in Use

**Error**: `Port 8000 is already in use`

**Solution**:
```bash
# Find and kill process using the port
# Windows:
netstat -ano | findstr :8000
taskkill /PID <process_id> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

### Debug Mode

Enable debug mode for detailed logging:

1. **Python Service** - Edit `debate-service/.env`:
   ```env
   DEBUG=true
   LOG_LEVEL=DEBUG
   ```

2. **Frontend** - Edit `.env.local`:
   ```env
   VITE_DEBUG=true
   ```

### Health Checks

Verify all services are running:

```bash
# Check Python service
curl http://localhost:8000/health

# Check frontend
curl http://localhost:5173

# Check Convex (in browser console)
console.log(convex.connectionState())
```

---

## Demo Preparation

### Pre-Demo Checklist

- [ ] All services start without errors
- [ ] API keys are configured and working
- [ ] Property data loads correctly
- [ ] Debate generation works end-to-end
- [ ] UI is responsive and styled
- [ ] No console errors in browser
- [ ] Network requests complete successfully

### Demo Data

The application includes Austin property data. For the demo:

1. **Select interesting properties** with diverse characteristics
2. **Test debate generation** for your selected properties
3. **Prepare fallback content** in case of API issues

### Performance Tips

1. **Warm up the services** before demo
2. **Pre-generate debates** for key properties
3. **Clear browser cache** before demo
4. **Close unnecessary applications** to free up resources

---

## Next Steps

Once your local environment is running:

1. **Test the complete user flow** from property selection to debate viewing
2. **Customize styling** in `src/styles/global.css` if needed
3. **Review demo scenarios** in `DEMO_GUIDE.md`
4. **Run integration tests** using `testing/local-integration.md`

For demo preparation and presentation tips, see `DEMO_GUIDE.md`.
