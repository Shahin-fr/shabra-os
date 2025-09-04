#!/usr/bin/env node

/**
 * E2E Test Runner for Shabra OS
 * This script provides utilities for running and managing E2E tests
 */

import { execSync } from 'child_process';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

import { logger } from '@/lib/logger';

interface TestResult {
  testFile: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  errors: string[];
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  totalDuration: number;
  results: TestResult[];
}

class E2ETestRunner {
  private testDir: string;
  private results: TestResult[] = [];

  constructor(testDir: string = './src/e2e') {
    this.testDir = testDir;
  }

  /**
   * Discover all E2E test files
   */
  discoverTestFiles(): string[] {
    if (!existsSync(this.testDir)) {
      logger.error('Test directory not found: ${this.testDir}');
      return [];
    }

    const testFiles: string[] = [];
    const files = readdirSync(this.testDir);

    for (const file of files) {
      const filePath = join(this.testDir, file);
      const stats = statSync(filePath);

      if (stats.isFile() && file.endsWith('.e2e.spec.ts')) {
        testFiles.push(filePath);
      }
    }

    return testFiles;
  }

  /**
   * Run a single E2E test file
   */
  async runTestFile(testFile: string): Promise<TestResult> {
    const startTime = Date.now();
    const result: TestResult = {
      testFile,
      status: 'passed',
      duration: 0,
      errors: [],
    };

    try {
      logger.info('\n🧪 Running: ${testFile}');

      // Run the test using Playwright
      const command = `npx playwright test ${testFile} --reporter=list`;
      execSync(command, { stdio: 'pipe' });

      result.duration = Date.now() - startTime;
      logger.info('✅ Passed: ${testFile} (${result.duration}ms)');
    } catch (error: any) {
      result.status = 'failed';
      result.duration = Date.now() - startTime;
      result.errors.push(error.message || 'Unknown error');

      logger.error('❌ Failed: ${testFile} (${result.duration}ms)');
      logger.error('   Error: ${error.message}');
    }

    return result;
  }

  /**
   * Run all E2E tests
   */
  async runAllTests(): Promise<TestSummary> {
    const testFiles = this.discoverTestFiles();

    if (testFiles.length === 0) {
      logger.info('No E2E test files found.');
      return {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        totalDuration: 0,
        results: [],
      };
    }

    logger.info('🚀 Starting E2E Test Suite');
    logger.info('📁 Test Directory: ${this.testDir}');
    logger.info('🔍 Found ${testFiles.length} test files');
    logger.info('='.repeat(60));
    logger.info('🧪 Starting E2E Test Suite');
    logger.info('='.repeat(60));

    // Run tests sequentially to avoid conflicts
    for (const testFile of testFiles) {
      const result = await this.runTestFile(testFile);
      this.results.push(result);
    }

    return this.generateSummary();
  }

  /**
   * Generate test summary
   */
  generateSummary(): TestSummary {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    return {
      total,
      passed,
      failed,
      skipped,
      totalDuration,
      results: this.results,
    };
  }

  /**
   * Print test summary
   */
  printSummary(summary: TestSummary): void {
    logger.info(`\n${'='.repeat(60)}`);
    logger.info('📊 E2E Test Results Summary');
    logger.info('='.repeat(60));

    logger.info('Total Tests: ${summary.total}');
    logger.info('✅ Passed: ${summary.passed}');
    logger.info('❌ Failed: ${summary.failed}');
    logger.info('⏭️  Skipped: ${summary.skipped}');
    logger.info('⏱️  Total Duration: ${summary.totalDuration}ms');

    if (summary.failed > 0) {
      logger.info('\n❌ Failed Tests:');
      summary.results
        .filter(r => r.status === 'failed')
        .forEach(result => {
          logger.info('   - ${result.testFile}');
          result.errors.forEach(_error => logger.info('     Error: ${_error}'));
        });
    }

    logger.info(`\n${'='.repeat(60)}`);
    logger.info(`\n${'='.repeat(60)}`);
    logger.info('🎉 E2E Test Suite Completed Successfully!');
    logger.info('='.repeat(60));

    if (summary.failed === 0) {
      logger.info('🎉 All E2E tests passed successfully!');
    } else {
      logger.info(
        '💥 ${summary.failed} test(s) failed. Please review the errors above.'
      );
      process.exit(1);
    }
  }

  /**
   * Run tests with specific browser
   */
  async runTestsWithBrowser(
    browser: 'chromium' | 'firefox' | 'webkit'
  ): Promise<TestSummary> {
    logger.info('🌐 Running tests with ${browser} browser');

    // Set environment variable for browser
    process.env.PLAYWRIGHT_BROWSER = browser;

    return this.runAllTests();
  }

  /**
   * Run tests in headed mode (with browser UI)
   */
  async runTestsHeaded(): Promise<TestSummary> {
    logger.info('👁️  Running tests in headed mode');

    // Set environment variable for headed mode
    process.env.PLAYWRIGHT_HEADED = 'true';

    return this.runAllTests();
  }

  /**
   * Run tests with debugging
   */
  async runTestsWithDebug(): Promise<TestSummary> {
    logger.info('🐛 Running tests with debugging enabled');

    // Set environment variable for debug mode
    process.env.PLAYWRIGHT_DEBUG = 'true';

    return this.runAllTests();
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const runner = new E2ETestRunner();

  let summary: TestSummary;

  if (args.includes('--browser')) {
    const browserIndex = args.indexOf('--browser');
    const browser = args[browserIndex + 1] as 'chromium' | 'firefox' | 'webkit';
    summary = await runner.runTestsWithBrowser(browser);
  } else if (args.includes('--headed')) {
    summary = await runner.runTestsHeaded();
  } else if (args.includes('--debug')) {
    summary = await runner.runTestsWithDebug();
  } else if (args.includes('--help')) {
    logger.info(`
E2E Test Runner for Shabra OS

Usage:
  npm run test:e2e                    # Run all E2E tests
  npm run test:e2e -- --browser webkit  # Run with specific browser
  npm run test:e2e -- --headed         # Run in headed mode
  npm run test:e2e -- --debug          # Run with debugging
  npm run test:e2e -- --help           # Show this help

Options:
  --browser <browser>  Specify browser (chromium|firefox|webkit)
  --headed             Run tests with browser UI visible
  --debug              Enable debugging mode
  --help               Show this help message

Examples:
  npm run test:e2e -- --browser firefox
  npm run test:e2e -- --headed
  npm run test:e2e -- --debug
    `);
    return;
  } else {
    // Default: run all tests
    summary = await runner.runAllTests();
  }

  runner.printSummary(summary);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    logger.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

export default E2ETestRunner;
