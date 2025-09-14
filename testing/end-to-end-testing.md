# End-to-End Testing Guide

## Overview
This document provides comprehensive testing procedures to validate the complete demo environment and user flow. All tests should be executed before any demo presentation to ensure system reliability.

## Pre-Demo Testing Checklist

### Environment Setup Validation
- [ ] **Python Service Running**: Verify debate-service is active on port 8000
- [ ] **Convex Backend Active**: Confirm Convex development server is running
- [ ] **React Frontend Loaded**: Ensure Vite dev server is serving on port 5173
- [ ] **Database Connection**: Verify Convex database contains property data
- [ ] **Environment Variables**: Confirm all required .env variables are set
- [ ] **Network Connectivity**: Test internet connection for external API calls
- [ ] **Browser Compatibility**: Test in Chrome, Firefox, and Safari
- [ ] **Screen Resolution**: Verify display works on presentation screen resolution

### Service Health Validation Scripts

#### Python Service Health Check
```bash
# Test Python service endpoint
curl -X GET http://localhost:8000/health
# Expected response: {"status": "healthy", "timestamp": "..."}

# Test debate endpoint with sample data
curl -X POST http://localhost:8000/generate-debate \
  -H "Content-Type: application/json" \
  -d '{
    "property": {
      "id": "test_001",
      "address": "123 Test St, Austin, TX",
      "price": 500000,
      "bedrooms": 3,
      "bathrooms": 2,
      "sqft": 1800,
      "lot_size": 0.25,
      "year_built": 2010,
      "property_type": "Single Family",
      "neighborhood": "Test Neighborhood"
    }
  }'
# Expected: JSON response with pro_agent, con_agent, market_insight, recommendation
```

#### Convex Service Health Check
```bash
# Check Convex deployment status
npx convex dev --once

# Test property query
curl -X POST https://your-convex-deployment.convex.cloud/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "path": "properties:getProperties",
    "args": {"limit": 1}
  }'
# Expected: Array with at least one property object
```

#### Frontend Health Check
```bash
# Verify Vite server is running
curl -X GET http://localhost:5173
# Expected: HTML response with React app

# Check for JavaScript errors in console
# Open browser dev tools and look for any console errors
```

## Integration Testing Procedures

### Complete User Flow Test

#### Test Case 1: Basic Property Debate Flow
1. **Navigate to Application**
   - Open http://localhost:5173 in browser
   - Verify property cards load within 5 seconds
   - Check that at least 10 properties are displayed

2. **Property Selection**
   - Click on first property card
   - Verify property details display correctly
   - Confirm "Start Debate" button is visible and enabled

3. **Debate Generation**
   - Click "Start Debate" button
   - Verify loading state appears immediately
   - Wait for debate completion (should be < 30 seconds)
   - Confirm all debate sections populate:
     - Pro Agent response with confidence score
     - Con Agent response with confidence score
     - Market Insight section
     - Final recommendation

4. **Result Validation**
   - Verify debate content is relevant to selected property
   - Check that confidence scores are between 0-100
   - Confirm recommendation matches one of expected values
   - Ensure no error messages or broken layouts

#### Test Case 2: Multiple Property Types
1. **Luxury Property Test**
   - Filter properties by price > $1M
   - Select luxury property
   - Generate debate and verify appropriate luxury market analysis

2. **Budget Property Test**
   - Filter properties by price < $400K
   - Select budget property
   - Generate debate and verify first-time buyer considerations

3. **Investment Property Test**
   - Filter for multi-family or duplex properties
   - Select investment property
   - Generate debate and verify cash flow analysis

#### Test Case 3: Error Handling
1. **Network Interruption Test**
   - Start debate generation
   - Disconnect internet during process
   - Verify graceful error handling and user feedback

2. **Service Timeout Test**
   - Simulate slow Python service response
   - Verify timeout handling and fallback options

3. **Invalid Property Data Test**
   - Test with property missing required fields
   - Verify error handling and user messaging

## Performance Testing

### Response Time Benchmarks
- **Property Loading**: < 3 seconds for initial page load
- **Debate Generation**: < 30 seconds for complete debate
- **Property Filtering**: < 1 second for filter application
- **Page Navigation**: < 2 seconds between views

### Load Testing Procedures
```bash
# Install Apache Bench for load testing
# Test property endpoint
ab -n 100 -c 10 http://localhost:5173/

# Test debate generation endpoint
ab -n 10 -c 2 -p debate_payload.json -T application/json http://localhost:8000/generate-debate

# Monitor system resources during testing
# CPU usage should stay < 80%
# Memory usage should stay < 4GB
# Network latency should stay < 100ms
```

### Performance Validation Script
```javascript
// performance-test.js
const puppeteer = require('puppeteer');

async function performanceTest() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Measure page load time
  const startTime = Date.now();
  await page.goto('http://localhost:5173');
  await page.waitForSelector('.property-card');
  const loadTime = Date.now() - startTime;
  
  console.log(`Page load time: ${loadTime}ms`);
  
  // Measure debate generation time
  const debateStartTime = Date.now();
  await page.click('.property-card:first-child');
  await page.click('[data-testid="start-debate"]');
  await page.waitForSelector('[data-testid="debate-result"]', { timeout: 35000 });
  const debateTime = Date.now() - debateStartTime;
  
  console.log(`Debate generation time: ${debateTime}ms`);
  
  await browser.close();
  
  // Validate performance benchmarks
  if (loadTime > 5000) console.error('Page load too slow!');
  if (debateTime > 35000) console.error('Debate generation too slow!');
}

performanceTest();
```

## Error Scenario Testing

### Network Failure Scenarios
1. **Complete Network Loss**
   - Disconnect internet
   - Attempt to generate debate
   - Verify offline message displays
   - Reconnect and verify recovery

2. **Intermittent Connectivity**
   - Use network throttling tools
   - Test with slow 3G speeds
   - Verify loading states and timeouts

3. **Service Unavailability**
   - Stop Python service
   - Attempt debate generation
   - Verify fallback content activation

### Data Validation Scenarios
1. **Missing Property Data**
   - Test with properties missing required fields
   - Verify graceful degradation

2. **Invalid API Responses**
   - Mock invalid JSON responses
   - Test error parsing and user feedback

3. **Database Connection Issues**
   - Simulate Convex connection problems
   - Verify error handling and retry logic

## Browser Compatibility Testing

### Desktop Browser Testing
- **Chrome (Latest)**: Full functionality test
- **Firefox (Latest)**: Full functionality test
- **Safari (Latest)**: Full functionality test
- **Edge (Latest)**: Full functionality test

### Mobile Browser Testing
- **iOS Safari**: Responsive design and touch interactions
- **Android Chrome**: Performance and compatibility
- **Mobile Firefox**: Basic functionality verification

### Compatibility Checklist
- [ ] Property cards display correctly
- [ ] Debate generation works on all browsers
- [ ] Responsive design adapts to different screen sizes
- [ ] Touch interactions work on mobile devices
- [ ] No JavaScript errors in any browser console

## Demo Environment Validation

### Presentation Setup Testing
1. **Projector/Screen Testing**
   - Connect to presentation display
   - Verify resolution and scaling
   - Test color accuracy and readability

2. **Audio/Visual Setup**
   - Test microphone if using audio
   - Verify screen sharing works properly
   - Check lighting and visibility

3. **Backup Systems**
   - Test secondary internet connection
   - Verify mobile hotspot functionality
   - Confirm backup laptop/device works

### Demo-Specific Scenarios
1. **Curated Property Testing**
   - Test all properties from demo-scenarios.md
   - Verify expected debate outcomes
   - Confirm timing matches expectations

2. **Fallback Content Testing**
   - Practice switching to fallback content
   - Verify seamless transition
   - Test multiple fallback scenarios

3. **Audience Interaction Testing**
   - Practice property selection with audience input
   - Test different property types based on audience interest
   - Verify smooth transitions between properties

## Automated Test Scripts

### Quick Health Check Script
```bash
#!/bin/bash
# quick-health-check.sh

echo "Starting health check..."

# Check Python service
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Python service healthy"
else
    echo "❌ Python service not responding"
    exit 1
fi

# Check React frontend
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ React frontend healthy"
else
    echo "❌ React frontend not responding"
    exit 1
fi

# Check Convex connection
if npx convex dev --once 2>/dev/null; then
    echo "✅ Convex connection healthy"
else
    echo "❌ Convex connection failed"
    exit 1
fi

echo "All services healthy! ✅"
```

### Comprehensive Test Suite
```bash
#!/bin/bash
# comprehensive-test.sh

echo "Running comprehensive test suite..."

# Run health checks
./quick-health-check.sh

# Run performance tests
node performance-test.js

# Run integration tests
npm run test:integration

# Generate test report
echo "Test completed at $(date)" > test-report.txt
echo "All systems validated for demo" >> test-report.txt
```

## Manual Test Procedures

### Demo Rehearsal Checklist
- [ ] **Complete User Flow**: Execute full demo script with timing
- [ ] **Error Recovery**: Practice handling common issues
- [ ] **Audience Interaction**: Test different audience engagement scenarios
- [ ] **Technical Transitions**: Practice smooth transitions between demo phases
- [ ] **Backup Procedures**: Rehearse fallback content activation

### Pre-Demo Validation (30 minutes before)
- [ ] Run quick health check script
- [ ] Test 3 different property debates
- [ ] Verify presentation display setup
- [ ] Confirm internet connectivity
- [ ] Test backup systems
- [ ] Review fallback content accessibility

### During Demo Monitoring
- [ ] Monitor browser console for errors
- [ ] Watch network requests for failures
- [ ] Observe response times
- [ ] Note any unexpected behavior
- [ ] Be ready to switch to fallback content

## Troubleshooting Guide

### Common Issues and Solutions

#### Python Service Not Starting
```bash
# Check port availability
netstat -an | grep 8000

# Kill existing processes
pkill -f "python.*main.py"

# Restart service
cd debate-service && python main.py
```

#### Convex Connection Issues
```bash
# Check authentication
npx convex auth

# Redeploy functions
npx convex deploy

# Check environment variables
cat .env.local | grep CONVEX
```

#### React Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

#### Database Query Failures
```bash
# Check Convex dashboard
npx convex dashboard

# Verify data import
npx convex run properties:count

# Re-import data if needed
npm run import-data
```

## Success Criteria

### Technical Success Metrics
- All services respond within acceptable timeframes
- No JavaScript errors in browser console
- Complete user flow works end-to-end
- Error handling gracefully manages failures
- Performance meets established benchmarks

### Demo Readiness Indicators
- All curated scenarios work as expected
- Fallback content is easily accessible
- Presentation setup is tested and working
- Team is comfortable with all procedures
- Backup systems are validated and ready

## Post-Demo Analysis

### Performance Review
- Document actual response times during demo
- Note any issues or unexpected behavior
- Collect feedback on system performance
- Identify areas for improvement

### System Monitoring
- Review server logs for errors
- Analyze database query performance
- Check network usage patterns
- Document any system stress points

This comprehensive testing guide ensures the demo environment is thoroughly validated and ready for presentation, with multiple backup plans and recovery procedures in place.
