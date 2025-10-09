#!/usr/bin/env node

/**
 * Performance Monitoring Script
 * 
 * This script monitors various performance metrics including:
 * - Bundle size analysis
 * - Build performance
 * - Test execution time
 * - Memory usage
 * 
 * Usage: node scripts/performance-monitor.js [--report]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  rootDir: path.join(__dirname, '..'),
  reportDir: path.join(__dirname, '..', 'performance-reports'),
  timestamp: new Date().toISOString().replace(/[:.]/g, '-'),
  generateReport: process.argv.includes('--report'),
  verbose: process.argv.includes('--verbose')
};

// Performance metrics
const metrics = {
  startTime: Date.now(),
  bundleSize: {},
  buildTime: 0,
  testTime: 0,
  memoryUsage: process.memoryUsage(),
  thresholds: {
    maxBundleSize: 1024 * 1024 * 2, // 2MB
    maxBuildTime: 120000, // 2 minutes
    maxTestTime: 300000, // 5 minutes
    maxMemoryUsage: 1024 * 1024 * 1024 // 1GB
  }
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'
  };
  
  const icons = {
    info: '📊',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  
  console.log(`${colors[type]}${icons[type]} [${timestamp}] ${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`;
}

function measureBundleSize() {
  log('Measuring bundle size...');
  
  try {
    // Run build with analysis
    const buildStart = Date.now();
    execSync('npm run build:analyze-bundle', {
      cwd: CONFIG.rootDir,
      stdio: CONFIG.verbose ? 'inherit' : 'pipe'
    });
    const buildTime = Date.now() - buildStart;
    
    metrics.buildTime = buildTime;
    
    // Check if analyze directory exists
    const analyzeDir = path.join(CONFIG.rootDir, 'analyze');
    if (fs.existsSync(analyzeDir)) {
      const files = fs.readdirSync(analyzeDir);
      const htmlFile = files.find(f => f.endsWith('.html'));
      
      if (htmlFile) {
        const htmlPath = path.join(analyzeDir, htmlFile);
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Extract bundle size information from HTML
        const bundleMatch = htmlContent.match(/Total bundle size: ([\d.]+) ([KMGT]?B)/i);
        if (bundleMatch) {
          const size = parseFloat(bundleMatch[1]);
          const unit = bundleMatch[2];
          const multiplier = {
            'B': 1,
            'KB': 1024,
            'MB': 1024 * 1024,
            'GB': 1024 * 1024 * 1024
          }[unit] || 1;
          
          metrics.bundleSize.total = size * multiplier;
          metrics.bundleSize.unit = unit;
        }
      }
    }
    
    // Check .next directory for actual bundle files
    const nextDir = path.join(CONFIG.rootDir, '.next');
    if (fs.existsSync(nextDir)) {
      const staticDir = path.join(nextDir, 'static');
      if (fs.existsSync(staticDir)) {
        let totalSize = 0;
        
        function calculateDirSize(dir) {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
              calculateDirSize(filePath);
            } else {
              totalSize += stat.size;
            }
          }
        }
        
        calculateDirSize(staticDir);
        metrics.bundleSize.actual = totalSize;
      }
    }
    
    log(`Bundle analysis completed in ${formatTime(buildTime)}`, 'success');
    
  } catch (error) {
    log(`Bundle analysis failed: ${error.message}`, 'error');
  }
}

function measureTestPerformance() {
  log('Measuring test performance...');
  
  try {
    const testStart = Date.now();
    execSync('npm run test:unit', {
      cwd: CONFIG.rootDir,
      stdio: CONFIG.verbose ? 'inherit' : 'pipe'
    });
    const testTime = Date.now() - testStart;
    
    metrics.testTime = testTime;
    log(`Tests completed in ${formatTime(testTime)}`, 'success');
    
  } catch (error) {
    log(`Test execution failed: ${error.message}`, 'error');
  }
}

function measureMemoryUsage() {
  log('Measuring memory usage...');
  
  const memoryUsage = process.memoryUsage();
  metrics.memoryUsage = {
    rss: memoryUsage.rss,
    heapTotal: memoryUsage.heapTotal,
    heapUsed: memoryUsage.heapUsed,
    external: memoryUsage.external,
    arrayBuffers: memoryUsage.arrayBuffers
  };
  
  log(`Memory usage: ${formatBytes(memoryUsage.heapUsed)}`, 'info');
}

function checkThresholds() {
  const issues = [];
  
  // Check bundle size
  if (metrics.bundleSize.actual && metrics.bundleSize.actual > metrics.thresholds.maxBundleSize) {
    issues.push({
      type: 'Bundle Size',
      current: formatBytes(metrics.bundleSize.actual),
      threshold: formatBytes(metrics.thresholds.maxBundleSize),
      severity: 'warning'
    });
  }
  
  // Check build time
  if (metrics.buildTime > metrics.thresholds.maxBuildTime) {
    issues.push({
      type: 'Build Time',
      current: formatTime(metrics.buildTime),
      threshold: formatTime(metrics.thresholds.maxBuildTime),
      severity: 'warning'
    });
  }
  
  // Check test time
  if (metrics.testTime > metrics.thresholds.maxTestTime) {
    issues.push({
      type: 'Test Time',
      current: formatTime(metrics.testTime),
      threshold: formatTime(metrics.thresholds.maxTestTime),
      severity: 'warning'
    });
  }
  
  // Check memory usage
  if (metrics.memoryUsage.heapUsed > metrics.thresholds.maxMemoryUsage) {
    issues.push({
      type: 'Memory Usage',
      current: formatBytes(metrics.memoryUsage.heapUsed),
      threshold: formatBytes(metrics.thresholds.maxMemoryUsage),
      severity: 'warning'
    });
  }
  
  return issues;
}

function generateReport() {
  if (!CONFIG.generateReport) return;
  
  // Ensure report directory exists
  if (!fs.existsSync(CONFIG.reportDir)) {
    fs.mkdirSync(CONFIG.reportDir, { recursive: true });
  }
  
  const reportPath = path.join(CONFIG.reportDir, `performance-report-${CONFIG.timestamp}.json`);
  const htmlReportPath = path.join(CONFIG.reportDir, `performance-report-${CONFIG.timestamp}.html`);
  
  const issues = checkThresholds();
  
  // Generate JSON report
  const reportData = {
    timestamp: CONFIG.timestamp,
    duration: Date.now() - metrics.startTime,
    metrics,
    issues,
    thresholds: metrics.thresholds
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  log(`JSON report saved: ${reportPath}`);
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(reportData);
  fs.writeFileSync(htmlReportPath, htmlReport);
  log(`HTML report saved: ${htmlReportPath}`);
}

function generateHtmlReport(data) {
  const { metrics, issues, thresholds } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Report - ${data.timestamp}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { padding: 20px; border-radius: 8px; text-align: center; }
        .metric-card.success { background: #d4edda; color: #155724; }
        .metric-card.warning { background: #fff3cd; color: #856404; }
        .metric-card.error { background: #f8d7da; color: #721c24; }
        .metric-card.info { background: #d1ecf1; color: #0c5460; }
        .issues { margin-top: 20px; }
        .issue { padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid; }
        .issue.warning { background: #fff3cd; border-color: #ffc107; }
        .issue.error { background: #f8d7da; border-color: #dc3545; }
        .thresholds { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Performance Report</h1>
            <p>Generated: ${new Date(data.timestamp).toLocaleString()}</p>
            <p>Duration: ${(data.duration / 1000).toFixed(2)}s</p>
        </div>
        
        <div class="metrics">
            <div class="metric-card ${metrics.bundleSize.actual && metrics.bundleSize.actual > thresholds.maxBundleSize ? 'warning' : 'success'}">
                <h3>${metrics.bundleSize.actual ? formatBytes(metrics.bundleSize.actual) : 'N/A'}</h3>
                <p>Bundle Size</p>
            </div>
            <div class="metric-card ${metrics.buildTime > thresholds.maxBuildTime ? 'warning' : 'success'}">
                <h3>${formatTime(metrics.buildTime)}</h3>
                <p>Build Time</p>
            </div>
            <div class="metric-card ${metrics.testTime > thresholds.maxTestTime ? 'warning' : 'success'}">
                <h3>${formatTime(metrics.testTime)}</h3>
                <p>Test Time</p>
            </div>
            <div class="metric-card ${metrics.memoryUsage.heapUsed > thresholds.maxMemoryUsage ? 'warning' : 'success'}">
                <h3>${formatBytes(metrics.memoryUsage.heapUsed)}</h3>
                <p>Memory Usage</p>
            </div>
        </div>
        
        ${issues.length > 0 ? `
        <div class="issues">
            <h2>⚠️ Performance Issues</h2>
            ${issues.map(issue => `
                <div class="issue ${issue.severity}">
                    <strong>${issue.type}</strong><br>
                    Current: ${issue.current} | Threshold: ${issue.threshold}
                </div>
            `).join('')}
        </div>
        ` : '<div class="issues"><h2>✅ No performance issues detected</h2></div>'}
        
        <div class="thresholds">
            <h3>Performance Thresholds</h3>
            <ul>
                <li>Max Bundle Size: ${formatBytes(thresholds.maxBundleSize)}</li>
                <li>Max Build Time: ${formatTime(thresholds.maxBuildTime)}</li>
                <li>Max Test Time: ${formatTime(thresholds.maxTestTime)}</li>
                <li>Max Memory Usage: ${formatBytes(thresholds.maxMemoryUsage)}</li>
            </ul>
        </div>
    </div>
</body>
</html>`;
}

function printSummary() {
  const totalDuration = Date.now() - metrics.startTime;
  const issues = checkThresholds();
  
  log('\n' + '='.repeat(80));
  log('📊 PERFORMANCE MONITORING SUMMARY', 'info');
  log('='.repeat(80));
  
  log(`Bundle Size: ${metrics.bundleSize.actual ? formatBytes(metrics.bundleSize.actual) : 'N/A'}`);
  log(`Build Time: ${formatTime(metrics.buildTime)}`);
  log(`Test Time: ${formatTime(metrics.testTime)}`);
  log(`Memory Usage: ${formatBytes(metrics.memoryUsage.heapUsed)}`);
  log(`Total Duration: ${formatTime(totalDuration)}`);
  
  if (issues.length > 0) {
    log(`\n⚠️ Performance Issues Found: ${issues.length}`, 'warning');
    issues.forEach(issue => {
      log(`  - ${issue.type}: ${issue.current} (threshold: ${issue.threshold})`, 'warning');
    });
  } else {
    log('\n✅ No performance issues detected', 'success');
  }
  
  log('='.repeat(80));
}

async function main() {
  log('🚀 Starting Performance Monitoring...');
  log(`Report Generation: ${CONFIG.generateReport ? 'Enabled' : 'Disabled'}`);
  log(`Verbose Output: ${CONFIG.verbose ? 'Enabled' : 'Disabled'}`);
  
  // Measure various performance metrics
  measureBundleSize();
  measureTestPerformance();
  measureMemoryUsage();
  
  // Generate reports if requested
  if (CONFIG.generateReport) {
    generateReport();
  }
  
  // Print summary
  printSummary();
  
  // Exit with appropriate code
  const issues = checkThresholds();
  const hasIssues = issues.length > 0;
  process.exit(hasIssues ? 1 : 0);
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    log(`Script failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { measureBundleSize, measureTestPerformance, measureMemoryUsage, checkThresholds };
