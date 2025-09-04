#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface BundleAnalysis {
  totalSize: number;
  chunks: ChunkInfo[];
  recommendations: string[];
}

interface ChunkInfo {
  name: string;
  size: number;
  percentage: number;
  dependencies: string[];
}

class BundleOptimizer {
  private projectRoot: string;
  private bundleAnalysis: BundleAnalysis;

  constructor() {
    this.projectRoot = process.cwd();
    this.bundleAnalysis = {
      totalSize: 0,
      chunks: [],
      recommendations: [],
    };
  }

  async analyzeBundle(): Promise<void> {
    console.log('🔍 Analyzing bundle size...\n');

    try {
      // Run bundle analysis
      execSync('npm run build:analyze-bundle', {
        stdio: 'inherit',
        cwd: this.projectRoot,
      });

      // Analyze the bundle
      await this.analyzeChunks();
      this.generateRecommendations();
      this.printReport();
      this.saveReport();
    } catch (error) {
      console.error('❌ Error analyzing bundle:', error);
      process.exit(1);
    }
  }

  private async analyzeChunks(): Promise<void> {
    const buildDir = join(this.projectRoot, '.next');

    if (!existsSync(buildDir)) {
      throw new Error('Build directory not found. Run npm run build first.');
    }

    // Analyze client bundle
    const clientBundlePath = join(buildDir, 'analyze', 'client.html');
    if (existsSync(clientBundlePath)) {
      const bundleContent = readFileSync(clientBundlePath, 'utf-8');
      this.analyzeBundleContent(bundleContent);
    }
  }

  private analyzeBundleContent(content: string): void {
    // Extract chunk information from bundle analyzer output
    const chunkRegex = /chunks\/([^"]+)\.js/g;

    let match;
    const chunks = new Map<string, number>();

    while ((match = chunkRegex.exec(content)) !== null) {
      const chunkName = match[1];
      if (chunkName) {
        chunks.set(chunkName, (chunks.get(chunkName) || 0) + 1);
      }
    }

    // Calculate sizes and percentages
    let totalSize = 0;
    this.bundleAnalysis.chunks = Array.from(chunks.entries()).map(
      ([name, count]) => {
        const size = count * 10; // Rough estimate based on chunk count
        totalSize += size;
        return {
          name,
          size,
          percentage: 0,
          dependencies: this.getChunkDependencies(name),
        };
      }
    );

    this.bundleAnalysis.totalSize = totalSize;

    // Calculate percentages
    this.bundleAnalysis.chunks.forEach(chunk => {
      chunk.percentage = (chunk.size / totalSize) * 100;
    });

    // Sort by size
    this.bundleAnalysis.chunks.sort((a, b) => b.size - a.size);
  }

  private getChunkDependencies(chunkName: string): string[] {
    const dependencies: string[] = [];

    // Map chunk names to likely dependencies
    if (chunkName.includes('framer-motion')) {
      dependencies.push('framer-motion');
    }
    if (chunkName.includes('recharts')) {
      dependencies.push('recharts');
    }
    if (chunkName.includes('radix')) {
      dependencies.push('@radix-ui/*');
    }
    if (chunkName.includes('dnd-kit')) {
      dependencies.push('@dnd-kit/*');
    }
    if (chunkName.includes('tanstack')) {
      dependencies.push('@tanstack/*');
    }
    if (chunkName.includes('vendors')) {
      dependencies.push('node_modules/*');
    }

    return dependencies;
  }

  private generateRecommendations(): void {
    const recommendations: string[] = [];

    // Analyze heavy chunks
    const heavyChunks = this.bundleAnalysis.chunks.filter(
      chunk => chunk.percentage > 10
    );

    heavyChunks.forEach(chunk => {
      if (chunk.name.includes('framer-motion')) {
        recommendations.push(
          '🚀 Consider lazy loading framer-motion components or replacing with CSS animations for simple transitions'
        );
      }

      if (chunk.name.includes('recharts')) {
        recommendations.push(
          '📊 Recharts is heavy - consider lazy loading charts or using lighter alternatives like Chart.js'
        );
      }

      if (chunk.name.includes('radix')) {
        recommendations.push(
          "🎯 Radix UI components are being imported - ensure you're using selective imports and not importing entire packages"
        );
      }

      if (chunk.name.includes('vendors') && chunk.percentage > 50) {
        recommendations.push(
          '📦 Vendor chunk is very large - consider splitting heavy dependencies into separate chunks'
        );
      }
    });

    // General recommendations
    recommendations.push(
      '🔧 Enable tree shaking by using ES6 imports instead of CommonJS',
      '📱 Consider implementing code splitting for routes and heavy components',
      '⚡ Use dynamic imports for components that are not immediately needed',
      '🎨 Replace heavy animation libraries with CSS animations where possible'
    );

    this.bundleAnalysis.recommendations = recommendations;
  }

  private printReport(): void {
    console.log('📊 Bundle Analysis Report\n');
    console.log(`Total Bundle Size: ${this.bundleAnalysis.totalSize} KB\n`);

    console.log('📦 Chunk Breakdown:');
    this.bundleAnalysis.chunks.forEach(chunk => {
      console.log(
        `  ${chunk.name}: ${chunk.size} KB (${chunk.percentage.toFixed(1)}%)`
      );
      if (chunk.dependencies.length > 0) {
        console.log(`    Dependencies: ${chunk.dependencies.join(', ')}`);
      }
    });

    console.log('\n💡 Optimization Recommendations:');
    this.bundleAnalysis.recommendations.forEach(rec => {
      console.log(`  ${rec}`);
    });
  }

  private saveReport(): void {
    const reportPath = join(this.projectRoot, 'bundle-optimization-report.md');
    const report = this.generateMarkdownReport();
    writeFileSync(reportPath, report);
    console.log(`\n📄 Report saved to: ${reportPath}`);
  }

  private generateMarkdownReport(): string {
    const timestamp = new Date().toISOString();

    return `# Bundle Optimization Report

Generated: ${timestamp}

## Summary
- **Total Bundle Size**: ${this.bundleAnalysis.totalSize} KB
- **Chunks**: ${this.bundleAnalysis.chunks.length}

## Chunk Analysis

${this.bundleAnalysis.chunks
  .map(
    chunk => `
### ${chunk.name}
- **Size**: ${chunk.size} KB
- **Percentage**: ${chunk.percentage.toFixed(1)}%
- **Dependencies**: ${chunk.dependencies.join(', ') || 'None identified'}
`
  )
  .join('')}

## Recommendations

${this.bundleAnalysis.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps

1. Implement lazy loading for heavy components
2. Review and optimize imports
3. Consider code splitting strategies
4. Monitor bundle size after changes
`;
  }
}

// Run the optimizer
async function main() {
  const optimizer = new BundleOptimizer();
  await optimizer.analyzeBundle();
}

if (require.main === module) {
  main().catch(console.error);
}

export { BundleOptimizer };
