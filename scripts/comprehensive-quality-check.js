#!/usr/bin/env node

/**
 * Comprehensive Code Quality Automation Script
 * 
 * This script runs all quality checks in the correct order and provides
 * comprehensive reporting for the CI/CD pipeline.
 * 
 * Usage: node scripts/comprehensive-quality-check.js [--fix] [--report]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  rootDir: path.join(__dirname, '..'),
  reportDir: path.join(__dirname, '..', 'quality-reports'),
  timestamp: new Date().toISOString().replace(/[:.]/g, '-'),
  fixMode: process.argv.includes('--fix'),
  generateReport: process.argv.includes('--report'),
  verbose: process.argv.includes('--verbose')
};

// Quality check definitions
const QUALITY_CHECKS = [
  {
    id: 'prerequisites',
    name: 'Prerequisites Check',
    command: 'node -e "console.log(\'Checking prerequisites...\')"',
    critical: true,
    timeout: 5000
  },
  {
    id: 'type-check',
    name: 'TypeScript Type Checking',
    command: 'npm run type-check',
    critical: true,
    timeout: 30000
  },
  {
    id: 'lint',
    name: 'ESLint Code Analysis',
    command: CONFIG.fixMode ? 'npm run lint:fix' : 'npm run lint',
    critical: true,
    timeout: 60000
  },
  {
    id: 'format-check',
    name: 'Code Formatting Check',
    command: 'npm run format:check',
    critical: false,
    timeout: 30000
  },
  {
    id: 'unit-tests',
    name: 'Unit Tests',
    command: 'npm run test:unit',
    critical: true,
    timeout: 120000
  },
  {
    id: 'accessibility-tests',
    name: 'Accessibility Tests',
    command: 'npm run test:accessibility',
    critical: false,
    timeout: 60000
  },
  {
    id: 'security-audit',
    name: 'Security Audit',
    command: 'npm run security:audit',
    critical: false,
    timeout: 60000
  },
  {
    id: 'console-verification',
    name: 'Console Statement Verification',
    command: 'npm run verify:no-console',
    critical: false,
    timeout: 30000
  },
  {
    id: 'bundle-analysis',
    name: 'Bundle Analysis',
    command: 'npm run build:analyze-bundle',
    critical: false,
    timeout: 180000
  },
  {
    id: 'performance-monitor',
    name: 'Performance Monitoring',
    command: 'npm run performance:monitor',
    critical: false,
    timeout: 300000
  }
];

// Results tracking
const results = {
  startTime: Date.now(),
  checks: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    critical: 0,
    warnings: 0
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
    info: '🔍',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  
  console.log(`${colors[type]}${icons[type]} [${timestamp}] ${message}${colors.reset}`);
}

function runCheck(check) {
  const startTime = Date.now();
  log(`Starting: ${check.name}`);
  
  try {
    const output = execSync(check.command, {
      cwd: CONFIG.rootDir,
      encoding: 'utf8',
      timeout: check.timeout,
      stdio: CONFIG.verbose ? 'inherit' : 'pipe'
    });
    
    const duration = Date.now() - startTime;
    const result = {
      id: check.id,
      name: check.name,
      success: true,
      duration,
      output: output || '',
      critical: check.critical
    };
    
    results.checks.push(result);
    results.summary.total++;
    results.summary.passed++;
    
    if (check.critical) {
      results.summary.critical++;
    }
    
    log(`Completed: ${check.name} (${duration}ms)`, 'success');
    return result;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const result = {
      id: check.id,
      name: check.name,
      success: false,
      duration,
      error: error.message,
      critical: check.critical
    };
    
    results.checks.push(result);
    results.summary.total++;
    results.summary.failed++;
    
    if (check.critical) {
      results.summary.critical++;
    }
    
    log(`Failed: ${check.name} - ${error.message}`, 'error');
    return result;
  }
}

function generateReport() {
  if (!CONFIG.generateReport) return;
  
  // Ensure report directory exists
  if (!fs.existsSync(CONFIG.reportDir)) {
    fs.mkdirSync(CONFIG.reportDir, { recursive: true });
  }
  
  const reportPath = path.join(CONFIG.reportDir, `quality-report-${CONFIG.timestamp}.json`);
  const htmlReportPath = path.join(CONFIG.reportDir, `quality-report-${CONFIG.timestamp}.html`);
  
  // Generate JSON report
  const reportData = {
    timestamp: CONFIG.timestamp,
    duration: Date.now() - results.startTime,
    summary: results.summary,
    checks: results.checks,
    config: {
      fixMode: CONFIG.fixMode,
      verbose: CONFIG.verbose
    }
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  log(`JSON report saved: ${reportPath}`);
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(reportData);
  fs.writeFileSync(htmlReportPath, htmlReport);
  log(`HTML report saved: ${htmlReportPath}`);
}

function generateHtmlReport(data) {
  const { summary, checks } = data;
  const passedChecks = checks.filter(c => c.success);
  const failedChecks = checks.filter(c => !c.success);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quality Report - ${data.timestamp}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card.success { background: #d4edda; color: #155724; }
        .summary-card.error { background: #f8d7da; color: #721c24; }
        .summary-card.warning { background: #fff3cd; color: #856404; }
        .summary-card.info { background: #d1ecf1; color: #0c5460; }
        .check-list { margin-top: 20px; }
        .check-item { padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid; }
        .check-item.success { background: #d4edda; border-color: #28a745; }
        .check-item.error { background: #f8d7da; border-color: #dc3545; }
        .check-item.warning { background: #fff3cd; border-color: #ffc107; }
        .status { font-weight: bold; }
        .duration { color: #666; font-size: 0.9em; }
        .error-details { margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Code Quality Report</h1>
            <p>Generated: ${new Date(data.timestamp).toLocaleString()}</p>
            <p>Duration: ${(data.duration / 1000).toFixed(2)}s</p>
        </div>
        
        <div class="summary">
            <div class="summary-card ${summary.failed === 0 ? 'success' : 'error'}">
                <h3>${summary.passed}/${summary.total}</h3>
                <p>Checks Passed</p>
            </div>
            <div class="summary-card ${summary.failed === 0 ? 'success' : 'error'}">
                <h3>${summary.failed}</h3>
                <p>Checks Failed</p>
            </div>
            <div class="summary-card ${summary.critical === 0 ? 'success' : 'error'}">
                <h3>${summary.critical}</h3>
                <p>Critical Issues</p>
            </div>
            <div class="summary-card info">
                <h3>${summary.warnings}</h3>
                <p>Warnings</p>
            </div>
        </div>
        
        <div class="check-list">
            <h2>Check Results</h2>
            ${checks.map(check => `
                <div class="check-item ${check.success ? 'success' : 'error'}">
                    <div class="status">
                        ${check.success ? '✅' : '❌'} ${check.name}
                        <span class="duration">(${check.duration}ms)</span>
                    </div>
                    ${!check.success && check.error ? `
                        <div class="error-details">
                            <strong>Error:</strong> ${check.error}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
}

function printSummary() {
  const totalDuration = Date.now() - results.startTime;
  const { summary } = results;
  
  log('\n' + '='.repeat(80));
  log('📊 QUALITY CHECK SUMMARY', 'info');
  log('='.repeat(80));
  
  log(`Total Checks: ${summary.total}`);
  log(`Passed: ${summary.passed}`, summary.passed === summary.total ? 'success' : 'info');
  log(`Failed: ${summary.failed}`, summary.failed > 0 ? 'error' : 'success');
  log(`Critical Issues: ${summary.critical}`, summary.critical > 0 ? 'error' : 'success');
  log(`Warnings: ${summary.warnings}`, summary.warnings > 0 ? 'warning' : 'info');
  log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  
  if (summary.failed === 0) {
    log('\n🎉 ALL QUALITY CHECKS PASSED!', 'success');
    log('✅ Code is ready for deployment', 'success');
  } else {
    log('\n❌ QUALITY CHECKS FAILED!', 'error');
    log('🚨 Please fix the issues above before proceeding', 'error');
  }
  
  log('='.repeat(80));
}

async function main() {
  log('🚀 Starting Comprehensive Code Quality Check...');
  log(`Mode: ${CONFIG.fixMode ? 'Fix + Check' : 'Check Only'}`);
  log(`Report Generation: ${CONFIG.generateReport ? 'Enabled' : 'Disabled'}`);
  log(`Verbose Output: ${CONFIG.verbose ? 'Enabled' : 'Disabled'}`);
  
  // Run all quality checks
  for (const check of QUALITY_CHECKS) {
    runCheck(check);
  }
  
  // Generate reports if requested
  if (CONFIG.generateReport) {
    generateReport();
  }
  
  // Print summary
  printSummary();
  
  // Exit with appropriate code
  const hasFailures = results.summary.failed > 0;
  process.exit(hasFailures ? 1 : 0);
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    log(`Script failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runCheck, generateReport, QUALITY_CHECKS };
