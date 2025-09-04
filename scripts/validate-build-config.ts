#!/usr/bin/env tsx

/**
 * Build Configuration Validation Script
 * This script validates build configuration and identifies potential issues
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  category: string;
  check: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  message: string;
  recommendation?: string;
}

interface ValidationSummary {
  total: number;
  passed: number;
  warnings: number;
  failed: number;
  results: ValidationResult[];
}

class BuildConfigValidator {
  private results: ValidationResult[] = [];

  // Validate Next.js configuration
  validateNextConfig(): void {
    const nextConfigPath = join(process.cwd(), 'next.config.ts');

    if (!existsSync(nextConfigPath)) {
      this.addResult(
        'Next.js Config',
        'next.config.ts exists',
        'FAIL',
        'Next.js configuration file not found'
      );
      return;
    }

    try {
      const configContent = readFileSync(nextConfigPath, 'utf8');

      // Check for common optimizations
      if (configContent.includes('experimental.optimizePackageImports')) {
        this.addResult(
          'Next.js Config',
          'Package optimization enabled',
          'PASS',
          'Package imports are optimized'
        );
      } else {
        this.addResult(
          'Next.js Config',
          'Package optimization enabled',
          'WARN',
          'Consider enabling package optimization'
        );
      }

      if (configContent.includes('swcMinify: true')) {
        this.addResult(
          'Next.js Config',
          'SWC minification enabled',
          'PASS',
          'SWC minification is enabled'
        );
      } else {
        this.addResult(
          'Next.js Config',
          'SWC minification enabled',
          'WARN',
          'Consider enabling SWC minification'
        );
      }

      if (configContent.includes('compiler.removeConsole')) {
        this.addResult(
          'Next.js Config',
          'Console removal enabled',
          'PASS',
          'Console statements are removed in production'
        );
      } else {
        this.addResult(
          'Next.js Config',
          'Console removal enabled',
          'WARN',
          'Consider removing console statements in production'
        );
      }
    } catch (error) {
      this.addResult(
        'Next.js Config',
        'Configuration readable',
        'FAIL',
        'Failed to read Next.js configuration'
      );
    }
  }

  // Validate TypeScript configuration
  validateTypeScriptConfig(): void {
    const tsConfigPath = join(process.cwd(), 'tsconfig.json');

    if (!existsSync(tsConfigPath)) {
      this.addResult(
        'TypeScript Config',
        'tsconfig.json exists',
        'FAIL',
        'TypeScript configuration file not found'
      );
      return;
    }

    try {
      const config = JSON.parse(readFileSync(tsConfigPath, 'utf8'));

      // Check target version
      if (
        config.compilerOptions?.target === 'ES2020' ||
        config.compilerOptions?.target === 'ES2022'
      ) {
        this.addResult(
          'TypeScript Config',
          'Modern target version',
          'PASS',
          'Using modern JavaScript target'
        );
      } else {
        this.addResult(
          'TypeScript Config',
          'Modern target version',
          'WARN',
          'Consider using ES2020 or later'
        );
      }

      // Check strict mode
      if (config.compilerOptions?.strict === true) {
        this.addResult(
          'TypeScript Config',
          'Strict mode enabled',
          'PASS',
          'TypeScript strict mode is enabled'
        );
      } else {
        this.addResult(
          'TypeScript Config',
          'Strict mode enabled',
          'WARN',
          'Consider enabling strict mode'
        );
      }

      // Check incremental compilation
      if (config.compilerOptions?.incremental === true) {
        this.addResult(
          'TypeScript Config',
          'Incremental compilation',
          'PASS',
          'Incremental compilation is enabled'
        );
      } else {
        this.addResult(
          'TypeScript Config',
          'Incremental compilation',
          'WARN',
          'Consider enabling incremental compilation'
        );
      }
    } catch (error) {
      this.addResult(
        'TypeScript Config',
        'Configuration readable',
        'FAIL',
        'Failed to read TypeScript configuration'
      );
    }
  }

  // Validate package.json
  validatePackageJson(): void {
    const packageJsonPath = join(process.cwd(), 'package.json');

    if (!existsSync(packageJsonPath)) {
      this.addResult(
        'Package.json',
        'package.json exists',
        'FAIL',
        'Package.json file not found'
      );
      return;
    }

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      // Check build scripts
      if (packageJson.scripts?.build) {
        this.addResult(
          'Package.json',
          'Build script exists',
          'PASS',
          'Build script is defined'
        );
      } else {
        this.addResult(
          'Package.json',
          'Build script exists',
          'FAIL',
          'Build script is missing'
        );
      }

      // Check for essential dependencies
      const requiredDeps = ['next', 'react', 'react-dom'];
      const missingDeps = requiredDeps.filter(
        dep =>
          !packageJson.dependencies?.[dep] &&
          !packageJson.devDependencies?.[dep]
      );

      if (missingDeps.length === 0) {
        this.addResult(
          'Package.json',
          'Essential dependencies',
          'PASS',
          'All essential dependencies are present'
        );
      } else {
        this.addResult(
          'Package.json',
          'Essential dependencies',
          'FAIL',
          `Missing dependencies: ${missingDeps.join(', ')}`
        );
      }

      // Check for build optimization scripts
      const optimizationScripts = [
        'build:analyze',
        'build:optimize',
        'build:clean',
      ];
      const presentScripts = optimizationScripts.filter(
        script => packageJson.scripts?.[script]
      );

      if (presentScripts.length > 0) {
        this.addResult(
          'Package.json',
          'Build optimization scripts',
          'PASS',
          `Build optimization scripts present: ${presentScripts.join(', ')}`
        );
      } else {
        this.addResult(
          'Package.json',
          'Build optimization scripts',
          'WARN',
          'Consider adding build optimization scripts'
        );
      }
    } catch (error) {
      this.addResult(
        'Package.json',
        'Configuration readable',
        'FAIL',
        'Failed to read package.json'
      );
    }
  }

  // Validate environment configuration
  validateEnvironmentConfig(): void {
    const envFiles = ['.env.local', '.env.production', '.env.development'];

    envFiles.forEach(envFile => {
      const envPath = join(process.cwd(), envFile);
      if (existsSync(envPath)) {
        this.addResult(
          'Environment',
          `${envFile} exists`,
          'PASS',
          `Environment file ${envFile} is present`
        );
      } else {
        this.addResult(
          'Environment',
          `${envFile} exists`,
          'WARN',
          `Environment file ${envFile} not found`
        );
      }
    });

    // Check for required environment variables
    const requiredEnvVars = ['PRISMA_DATABASE_URL', 'NEXTAUTH_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(
      envVar => !process.env[envVar]
    );

    if (missingEnvVars.length === 0) {
      this.addResult(
        'Environment',
        'Required variables',
        'PASS',
        'All required environment variables are set'
      );
    } else {
      this.addResult(
        'Environment',
        'Required variables',
        'WARN',
        `Missing environment variables: ${missingEnvVars.join(', ')}`
      );
    }
  }

  // Validate build output directory
  validateBuildOutput(): void {
    const nextDir = join(process.cwd(), '.next');
    const outDir = join(process.cwd(), 'out');

    if (existsSync(nextDir)) {
      this.addResult(
        'Build Output',
        '.next directory exists',
        'PASS',
        'Next.js build output directory exists'
      );
    } else {
      this.addResult(
        'Build Output',
        '.next directory exists',
        'WARN',
        'No build output found - run build first'
      );
    }

    if (existsSync(outDir)) {
      this.addResult(
        'Build Output',
        'out directory exists',
        'PASS',
        'Static export directory exists'
      );
    }
  }

  // Validate ESLint configuration
  validateESLintConfig(): void {
    const eslintConfigs = [
      'eslint.config.mjs',
      'eslint.config.js',
      '.eslintrc.js',
      '.eslintrc.json',
    ];
    const foundConfig = eslintConfigs.find(config =>
      existsSync(join(process.cwd(), config))
    );

    if (foundConfig) {
      this.addResult(
        'ESLint',
        'Configuration exists',
        'PASS',
        `ESLint configuration found: ${foundConfig}`
      );
    } else {
      this.addResult(
        'ESLint',
        'Configuration exists',
        'WARN',
        'No ESLint configuration found'
      );
    }
  }

  // Validate Tailwind configuration
  validateTailwindConfig(): void {
    const tailwindConfigs = ['tailwind.config.ts', 'tailwind.config.js'];
    const foundConfig = tailwindConfigs.find(config =>
      existsSync(join(process.cwd(), config))
    );

    if (foundConfig) {
      this.addResult(
        'Tailwind',
        'Configuration exists',
        'PASS',
        `Tailwind configuration found: ${foundConfig}`
      );
    } else {
      this.addResult(
        'Tailwind',
        'Configuration exists',
        'WARN',
        'No Tailwind configuration found'
      );
    }
  }

  // Add validation result
  private addResult(
    category: string,
    check: string,
    status: 'PASS' | 'WARN' | 'FAIL',
    message: string,
    recommendation?: string
  ): void {
    this.results.push({
      category,
      check,
      status,
      message,
      recommendation,
    });
  }

  // Get validation summary
  getSummary(): ValidationSummary {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const warnings = this.results.filter(r => r.status === 'WARN').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;

    return {
      total,
      passed,
      warnings,
      failed,
      results: this.results,
    };
  }

  // Run all validations
  runAllValidations(): void {
    console.log('🔍 Running build configuration validation...\n');

    this.validateNextConfig();
    this.validateTypeScriptConfig();
    this.validatePackageJson();
    this.validateEnvironmentConfig();
    this.validateBuildOutput();
    this.validateESLintConfig();
    this.validateTailwindConfig();
  }

  // Print validation results
  printResults(): void {
    const summary = this.getSummary();

    console.log('📊 Validation Results Summary:');
    console.log(`   Total Checks: ${summary.total}`);
    console.log(`   ✅ Passed: ${summary.passed}`);
    console.log(`   ⚠️  Warnings: ${summary.warnings}`);
    console.log(`   ❌ Failed: ${summary.failed}`);
    console.log('');

    // Group results by category
    const groupedResults = this.results.reduce(
      (acc, result) => {
        if (!acc[result.category]) {
          acc[result.category] = [];
        }
        acc[result.category]!.push(result);
        return acc;
      },
      {} as Record<string, ValidationResult[]>
    );

    // Print results by category
    Object.entries(groupedResults).forEach(([category, results]) => {
      console.log(`📁 ${category}:`);
      results.forEach(result => {
        const statusIcon =
          result.status === 'PASS'
            ? '✅'
            : result.status === 'WARN'
              ? '⚠️'
              : '❌';
        console.log(`   ${statusIcon} ${result.check}: ${result.message}`);
        if (result.recommendation) {
          console.log(`      💡 ${result.recommendation}`);
        }
      });
      console.log('');
    });

    // Print overall assessment
    if (summary.failed === 0 && summary.warnings === 0) {
      console.log(
        '🎉 All validations passed! Your build configuration is excellent.'
      );
    } else if (summary.failed === 0) {
      console.log(
        '✅ All critical validations passed. Some warnings to consider.'
      );
    } else {
      console.log(
        '⚠️  Some validations failed. Please address the issues above.'
      );
    }
  }
}

async function main() {
  try {
    const validator = new BuildConfigValidator();
    validator.runAllValidations();
    validator.printResults();
  } catch (error) {
    console.error('❌ Validation failed:', error);
  }
}

if (require.main === module) {
  main();
}
