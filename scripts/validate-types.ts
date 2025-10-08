#!/usr/bin/env tsx

/**
 * Comprehensive Type Validation Script
 * 
 * This script performs thorough type checking and validation
 * for the CI/CD pipeline to catch type-related errors early.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  step: string;
  success: boolean;
  error?: string;
  duration: number;
}

class TypeValidator {
  private results: ValidationResult[] = [];
  private startTime: number = Date.now();

  private log(message: string, type: 'info' | 'success' | 'error' = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔍',
      success: '✅',
      error: '❌'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  private async runCommand(command: string, description: string): Promise<ValidationResult> {
    const stepStart = Date.now();
    this.log(`Starting: ${description}`);
    
    try {
      execSync(command, { 
        stdio: 'pipe',
        cwd: process.cwd(),
        encoding: 'utf8'
      });
      
      const duration = Date.now() - stepStart;
      this.log(`Completed: ${description} (${duration}ms)`, 'success');
      
      return {
        step: description,
        success: true,
        duration
      };
    } catch (error) {
      const duration = Date.now() - stepStart;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this.log(`Failed: ${description} - ${errorMessage}`, 'error');
      
      return {
        step: description,
        success: false,
        error: errorMessage,
        duration
      };
    }
  }

  private checkPrerequisites(): boolean {
    this.log('Checking prerequisites...');
    
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'next.config.ts'
    ];
    
    for (const file of requiredFiles) {
      if (!existsSync(file)) {
        this.log(`Missing required file: ${file}`, 'error');
        return false;
      }
    }
    
    this.log('All prerequisites found', 'success');
    return true;
  }

  async validate(): Promise<boolean> {
    this.log('🚀 Starting comprehensive type validation...');
    
    if (!this.checkPrerequisites()) {
      return false;
    }

    // Step 1: TypeScript compilation check
    this.results.push(
      await this.runCommand('npm run type-check', 'TypeScript type checking')
    );

    // Step 2: ESLint validation
    this.results.push(
      await this.runCommand('npm run lint', 'ESLint validation')
    );

    // Step 3: Unit tests
    this.results.push(
      await this.runCommand('npm run test:unit', 'Unit tests')
    );

    // Step 4: Format check
    this.results.push(
      await this.runCommand('npm run format:check', 'Code formatting check')
    );

    // Step 5: Build validation (without actually building)
    this.results.push(
      await this.runCommand('npx next build --dry-run', 'Build validation (dry run)')
    );

    return this.generateReport();
  }

  private generateReport(): boolean {
    const totalDuration = Date.now() - this.startTime;
    const successfulSteps = this.results.filter(r => r.success).length;
    const totalSteps = this.results.length;
    
    this.log('\n📊 Validation Report:');
    this.log('=' .repeat(50));
    
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const duration = `${result.duration}ms`;
      console.log(`${status} ${result.step} (${duration})`);
      
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    this.log('=' .repeat(50));
    this.log(`Total: ${successfulSteps}/${totalSteps} steps passed`);
    this.log(`Duration: ${totalDuration}ms`);
    
    if (successfulSteps === totalSteps) {
      this.log('🎉 All validations passed!', 'success');
      return true;
    } else {
      this.log('💥 Some validations failed!', 'error');
      return false;
    }
  }
}

// Main execution
async function main() {
  const validator = new TypeValidator();
  const success = await validator.validate();
  
  process.exit(success ? 0 : 1);
}

// Run if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Validation script failed:', error);
    process.exit(1);
  });
}

export { TypeValidator };
