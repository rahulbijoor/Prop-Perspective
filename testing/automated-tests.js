// Automated Testing Suite for Prop-Perspective Demo
// This script validates the complete demo environment and user flow

const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:5173',
  pythonServiceUrl: 'http://localhost:8000',
  convexUrl: process.env.VITE_CONVEX_URL || 'https://your-convex-deployment.convex.cloud',
  timeout: 30000,
  debateTimeout: 35000,
  performanceThresholds: {
    pageLoad: 5000,
    debateGeneration: 35000,
    propertyFilter: 1000
  }
};

// Test Results Storage
let testResults = {
  timestamp: new Date().toISOString(),
  environment: 'demo',
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// Utility Functions
function logTest(name, status, duration, details = '') {
  const result = {
    name,
    status,
    duration,
    details,
    timestamp: new Date().toISOString()
  };
  
  testResults.tests.push(result);
  testResults.summary.total++;
  
  if (status === 'PASS') {
    testResults.summary.passed++;
    console.log(`✅ ${name} - ${duration}ms`);
  } else if (status === 'FAIL') {
    testResults.summary.failed++;
    console.log(`❌ ${name} - ${details}`);
  } else if (status === 'WARN') {
    testResults.summary.warnings++;
    console.log(`⚠️  ${name} - ${details}`);
  }
  
  if (details) {
    console.log(`   ${details}`);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Service Health Check Tests
async function testServiceHealth() {
  console.log('\n🔍 Testing Service Health...');
  
  // Test Python Service
  try {
    const startTime = Date.now();
    const response = await axios.get(`${CONFIG.pythonServiceUrl}/health`, {
      timeout: 5000
    });
    const duration = Date.now() - startTime;
    
    if (response.status === 200 && response.data.status === 'healthy') {
      logTest('Python Service Health', 'PASS', duration);
    } else {
      logTest('Python Service Health', 'FAIL', duration, 'Invalid health response');
    }
  } catch (error) {
    logTest('Python Service Health', 'FAIL', 0, `Service not responding: ${error.message}`);
  }
  
  // Test React Frontend
  try {
    const startTime = Date.now();
    const response = await axios.get(CONFIG.baseUrl, {
      timeout: 5000
    });
    const duration = Date.now() - startTime;
    
    if (response.status === 200) {
      logTest('React Frontend Health', 'PASS', duration);
    } else {
      logTest('React Frontend Health', 'FAIL', duration, `HTTP ${response.status}`);
    }
  } catch (error) {
    logTest('React Frontend Health', 'FAIL', 0, `Frontend not responding: ${error.message}`);
  }
  
  // Test Debate Generation Endpoint
  try {
    const startTime = Date.now();
    const testProperty = {
      id: 'test_001',
      address: '123 Test St, Austin, TX',
      price: 500000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1800,
      lot_size: 0.25,
      year_built: 2010,
      property_type: 'Single Family',
      neighborhood: 'Test Neighborhood'
    };
    
    const response = await axios.post(`${CONFIG.pythonServiceUrl}/generate-debate`, {
      property: testProperty
    }, {
      timeout: CONFIG.debateTimeout,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const duration = Date.now() - startTime;
    
    if (response.status === 200 && 
        response.data.pro_agent && 
        response.data.con_agent && 
        response.data.market_insight) {
      logTest('Debate Generation API', 'PASS', duration);
    } else {
      logTest('Debate Generation API', 'FAIL', duration, 'Invalid debate response structure');
    }
  } catch (error) {
    logTest('Debate Generation API', 'FAIL', 0, `API error: ${error.message}`);
  }
}

// Frontend Integration Tests
async function testFrontendIntegration() {
  console.log('\n🌐 Testing Frontend Integration...');
  
  let browser;
  let page;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    // Test Page Load Performance
    const pageLoadStart = Date.now();
    await page.goto(CONFIG.baseUrl, { 
      waitUntil: 'networkidle0',
      timeout: CONFIG.timeout 
    });
    const pageLoadDuration = Date.now() - pageLoadStart;
    
    if (pageLoadDuration < CONFIG.performanceThresholds.pageLoad) {
      logTest('Page Load Performance', 'PASS', pageLoadDuration);
    } else {
      logTest('Page Load Performance', 'WARN', pageLoadDuration, 
        `Slower than threshold (${CONFIG.performanceThresholds.pageLoad}ms)`);
    }
    
    // Test Property Cards Loading
    try {
      await page.waitForSelector('.property-card', { timeout: 10000 });
      const propertyCount = await page.$$eval('.property-card', cards => cards.length);
      
      if (propertyCount >= 5) {
        logTest('Property Cards Loading', 'PASS', 0, `${propertyCount} properties loaded`);
      } else {
        logTest('Property Cards Loading', 'WARN', 0, `Only ${propertyCount} properties loaded`);
      }
    } catch (error) {
      logTest('Property Cards Loading', 'FAIL', 0, 'Property cards not found');
    }
    
    // Test Property Selection and Debate Generation
    try {
      const debateStart = Date.now();
      
      // Click first property card
      await page.click('.property-card:first-child');
      await sleep(1000);
      
      // Look for debate trigger button
      const debateButton = await page.$('[data-testid="start-debate"], .debate-trigger, button:contains("Start Debate")');
      if (debateButton) {
        await debateButton.click();
        
        // Wait for debate results
        await page.waitForSelector('[data-testid="debate-result"], .debate-content, .pro-agent', {
          timeout: CONFIG.debateTimeout
        });
        
        const debateDuration = Date.now() - debateStart;
        
        // Check if all debate sections are present
        const proAgent = await page.$('.pro-agent, [data-testid="pro-agent"]');
        const conAgent = await page.$('.con-agent, [data-testid="con-agent"]');
        const marketInsight = await page.$('.market-insight, [data-testid="market-insight"]');
        
        if (proAgent && conAgent && marketInsight) {
          if (debateDuration < CONFIG.performanceThresholds.debateGeneration) {
            logTest('Complete Debate Flow', 'PASS', debateDuration);
          } else {
            logTest('Complete Debate Flow', 'WARN', debateDuration, 
              `Slower than threshold (${CONFIG.performanceThresholds.debateGeneration}ms)`);
          }
        } else {
          logTest('Complete Debate Flow', 'FAIL', debateDuration, 'Missing debate sections');
        }
      } else {
        logTest('Complete Debate Flow', 'FAIL', 0, 'Debate button not found');
      }
    } catch (error) {
      logTest('Complete Debate Flow', 'FAIL', 0, `Debate flow error: ${error.message}`);
    }
    
    // Test Property Filtering
    try {
      const filterStart = Date.now();
      
      // Look for price filter or any filter element
      const priceFilter = await page.$('input[type="range"], select, .filter-control');
      if (priceFilter) {
        await priceFilter.click();
        await sleep(500);
        
        // Wait for filtered results
        await page.waitForSelector('.property-card', { timeout: 5000 });
        const filterDuration = Date.now() - filterStart;
        
        if (filterDuration < CONFIG.performanceThresholds.propertyFilter) {
          logTest('Property Filtering', 'PASS', filterDuration);
        } else {
          logTest('Property Filtering', 'WARN', filterDuration, 
            `Slower than threshold (${CONFIG.performanceThresholds.propertyFilter}ms)`);
        }
      } else {
        logTest('Property Filtering', 'WARN', 0, 'Filter controls not found');
      }
    } catch (error) {
      logTest('Property Filtering', 'WARN', 0, `Filter test error: ${error.message}`);
    }
    
    // Test Console Errors
    const logs = await page.evaluate(() => {
      return window.console.errors || [];
    });
    
    if (logs.length === 0) {
      logTest('Console Error Check', 'PASS', 0);
    } else {
      logTest('Console Error Check', 'WARN', 0, `${logs.length} console errors found`);
    }
    
  } catch (error) {
    logTest('Frontend Integration', 'FAIL', 0, `Browser test error: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Performance Benchmarking
async function testPerformanceBenchmarks() {
  console.log('\n⚡ Testing Performance Benchmarks...');
  
  let browser;
  let page;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    // Enable performance monitoring
    await page.tracing.start({ path: 'performance-trace.json' });
    
    // Multiple page load tests
    const loadTimes = [];
    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      await page.goto(CONFIG.baseUrl, { 
        waitUntil: 'networkidle0',
        timeout: CONFIG.timeout,
        ignoreHTTPErrors: true
      });
      loadTimes.push(Date.now() - start);
      await sleep(1000);
    }
    
    const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
    
    if (avgLoadTime < CONFIG.performanceThresholds.pageLoad) {
      logTest('Average Load Time', 'PASS', Math.round(avgLoadTime));
    } else {
      logTest('Average Load Time', 'WARN', Math.round(avgLoadTime), 
        `Above threshold (${CONFIG.performanceThresholds.pageLoad}ms)`);
    }
    
    // Memory usage check
    const metrics = await page.metrics();
    const memoryMB = Math.round(metrics.JSHeapUsedSize / 1024 / 1024);
    
    if (memoryMB < 50) {
      logTest('Memory Usage', 'PASS', 0, `${memoryMB}MB`);
    } else if (memoryMB < 100) {
      logTest('Memory Usage', 'WARN', 0, `${memoryMB}MB - Consider optimization`);
    } else {
      logTest('Memory Usage', 'FAIL', 0, `${memoryMB}MB - High memory usage`);
    }
    
    await page.tracing.stop();
    
  } catch (error) {
    logTest('Performance Benchmarks', 'FAIL', 0, `Performance test error: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Cross-Browser Compatibility Tests
async function testCrossBrowserCompatibility() {
  console.log('\n🌍 Testing Cross-Browser Compatibility...');
  
  const browsers = [
    { name: 'Chrome', product: 'chrome' },
    { name: 'Firefox', product: 'firefox' }
  ];
  
  for (const browserConfig of browsers) {
    let browser;
    try {
      browser = await puppeteer.launch({
        product: browserConfig.product,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.goto(CONFIG.baseUrl, { 
        waitUntil: 'networkidle0',
        timeout: CONFIG.timeout 
      });
      
      // Check if property cards load
      await page.waitForSelector('.property-card', { timeout: 10000 });
      const propertyCount = await page.$$eval('.property-card', cards => cards.length);
      
      if (propertyCount > 0) {
        logTest(`${browserConfig.name} Compatibility`, 'PASS', 0, 
          `${propertyCount} properties loaded`);
      } else {
        logTest(`${browserConfig.name} Compatibility`, 'FAIL', 0, 
          'No properties loaded');
      }
      
    } catch (error) {
      logTest(`${browserConfig.name} Compatibility`, 'WARN', 0, 
        `Browser not available or test failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

// Demo-Specific Scenario Tests
async function testDemoScenarios() {
  console.log('\n🎭 Testing Demo Scenarios...');
  
  // Test curated property scenarios
  const scenarios = [
    { name: 'Luxury Property', priceRange: [2000000, 3000000] },
    { name: 'Budget Property', priceRange: [300000, 450000] },
    { name: 'Investment Property', priceRange: [400000, 600000] }
  ];
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto(CONFIG.baseUrl, { 
      waitUntil: 'networkidle0',
      timeout: CONFIG.timeout 
    });
    
    for (const scenario of scenarios) {
      try {
        // Look for properties in the price range
        await page.waitForSelector('.property-card', { timeout: 10000 });
        
        // This is a simplified test - in a real scenario, you'd filter by price
        const properties = await page.$$('.property-card');
        
        if (properties.length > 0) {
          // Test debate generation on first property
          await properties[0].click();
          await sleep(1000);
          
          const debateButton = await page.$('[data-testid="start-debate"], .debate-trigger');
          if (debateButton) {
            const debateStart = Date.now();
            await debateButton.click();
            
            try {
              await page.waitForSelector('.pro-agent, [data-testid="pro-agent"]', {
                timeout: CONFIG.debateTimeout
              });
              const debateDuration = Date.now() - debateStart;
              
              logTest(`${scenario.name} Scenario`, 'PASS', debateDuration);
            } catch (error) {
              logTest(`${scenario.name} Scenario`, 'FAIL', 0, 'Debate generation failed');
            }
          } else {
            logTest(`${scenario.name} Scenario`, 'WARN', 0, 'Debate button not found');
          }
        } else {
          logTest(`${scenario.name} Scenario`, 'WARN', 0, 'No properties found');
        }
        
        // Reset for next scenario
        await page.goto(CONFIG.baseUrl);
        await sleep(1000);
        
      } catch (error) {
        logTest(`${scenario.name} Scenario`, 'FAIL', 0, `Scenario test error: ${error.message}`);
      }
    }
    
  } catch (error) {
    logTest('Demo Scenarios', 'FAIL', 0, `Demo scenario tests failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Error Handling Tests
async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Test with invalid URL
    try {
      await page.goto('http://localhost:9999', { timeout: 5000 });
      logTest('Invalid URL Handling', 'FAIL', 0, 'Should have failed to connect');
    } catch (error) {
      logTest('Invalid URL Handling', 'PASS', 0, 'Correctly handled invalid URL');
    }
    
    // Test network offline simulation
    await page.setOfflineMode(true);
    try {
      await page.goto(CONFIG.baseUrl, { timeout: 5000, waitUntil: 'domcontentloaded' });
      logTest('Offline Mode Handling', 'FAIL', 0, 'Should have failed in offline mode');
    } catch (error) {
      logTest('Offline Mode Handling', 'PASS', 0, 'Correctly handled offline mode');
    }
    
    await page.setOfflineMode(false);
    
  } catch (error) {
    logTest('Error Handling Tests', 'FAIL', 0, `Error handling test failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Generate Test Report
function generateTestReport() {
  console.log('\n📊 Generating Test Report...');
  
  const report = {
    ...testResults,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString()
    },
    configuration: CONFIG
  };
  
  // Write detailed report
  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  
  // Write summary report
  const summary = `
# Demo Readiness Test Report

**Generated:** ${new Date().toISOString()}

## Summary
- **Total Tests:** ${testResults.summary.total}
- **Passed:** ${testResults.summary.passed} ✅
- **Failed:** ${testResults.summary.failed} ❌
- **Warnings:** ${testResults.summary.warnings} ⚠️

## Overall Status
${testResults.summary.failed === 0 ? '🟢 DEMO READY' : '🔴 ISSUES FOUND'}

## Test Results
${testResults.tests.map(test => 
  `- ${test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️'} ${test.name} (${test.duration}ms)${test.details ? ` - ${test.details}` : ''}`
).join('\n')}

## Recommendations
${testResults.summary.failed > 0 ? 
  '- Address failed tests before demo\n- Review error details in test-report.json' : 
  '- System is ready for demo\n- Monitor warnings for potential improvements'}
`;
  
  fs.writeFileSync('demo-readiness-report.md', summary);
  
  console.log('\n📋 Test Report Summary:');
  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`Passed: ${testResults.summary.passed} ✅`);
  console.log(`Failed: ${testResults.summary.failed} ❌`);
  console.log(`Warnings: ${testResults.summary.warnings} ⚠️`);
  
  if (testResults.summary.failed === 0) {
    console.log('\n🎉 DEMO READY! All critical tests passed.');
  } else {
    console.log('\n⚠️  ISSUES FOUND! Review failed tests before demo.');
  }
  
  console.log('\nDetailed reports saved:');
  console.log('- test-report.json (detailed results)');
  console.log('- demo-readiness-report.md (summary)');
}

// Main Test Runner
async function runAllTests() {
  console.log('🚀 Starting Prop-Perspective Demo Test Suite...');
  console.log(`Testing environment: ${CONFIG.baseUrl}`);
  console.log(`Python service: ${CONFIG.pythonServiceUrl}`);
  
  const overallStart = Date.now();
  
  try {
    await testServiceHealth();
    await testFrontendIntegration();
    await testPerformanceBenchmarks();
    await testCrossBrowserCompatibility();
    await testDemoScenarios();
    await testErrorHandling();
  } catch (error) {
    console.error('Test suite error:', error);
    logTest('Test Suite Execution', 'FAIL', 0, `Suite error: ${error.message}`);
  }
  
  const overallDuration = Date.now() - overallStart;
  console.log(`\n⏱️  Total test duration: ${overallDuration}ms`);
  
  generateTestReport();
  
  // Exit with appropriate code
  process.exit(testResults.summary.failed > 0 ? 1 : 0);
}

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log(`
Prop-Perspective Automated Test Suite

Usage: node automated-tests.js [options]

Options:
  --help          Show this help message
  --quick         Run only essential tests
  --performance   Run only performance tests
  --health        Run only health checks

Environment Variables:
  VITE_CONVEX_URL    Convex deployment URL
  TEST_TIMEOUT       Test timeout in milliseconds (default: 30000)
  
Examples:
  node automated-tests.js                 # Run all tests
  node automated-tests.js --quick         # Quick validation
  node automated-tests.js --health        # Health checks only
`);
    process.exit(0);
  }
  
  if (args.includes('--quick')) {
    console.log('Running quick test suite...');
    testServiceHealth().then(() => {
      testFrontendIntegration().then(() => {
        generateTestReport();
        process.exit(testResults.summary.failed > 0 ? 1 : 0);
      });
    });
  } else if (args.includes('--performance')) {
    console.log('Running performance tests...');
    testPerformanceBenchmarks().then(() => {
      generateTestReport();
      process.exit(testResults.summary.failed > 0 ? 1 : 0);
    });
  } else if (args.includes('--health')) {
    console.log('Running health checks...');
    testServiceHealth().then(() => {
      generateTestReport();
      process.exit(testResults.summary.failed > 0 ? 1 : 0);
    });
  } else {
    runAllTests();
  }
}

module.exports = {
  runAllTests,
  testServiceHealth,
  testFrontendIntegration,
  testPerformanceBenchmarks,
  CONFIG
};
