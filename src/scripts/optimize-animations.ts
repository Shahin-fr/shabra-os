#!/usr/bin/env tsx

/**
 * Script to automatically optimize Framer Motion animations
 * Converts problematic properties to hardware-accelerated equivalents
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const srcDir = 'src';

// Patterns to find and replace
const optimizations = [
  // Progress bar width animations
  {
    pattern: /animate=\{\{\s*width:\s*`\$\{([^}]+)\}%`\s*\}\}/g,
    replacement: (_match: string, variable: string) =>
      `animate={{ scaleX: ${variable} / 100 }}`
  },
  
  // Height auto animations
  {
    pattern: /animate=\{\{\s*opacity:\s*1,\s*height:\s*'auto'\s*\}\}/g,
    replacement: `animate={{ opacity: 1 }}`
  },
  
  // Initial height 0 animations
  {
    pattern: /initial=\{\{\s*opacity:\s*0,\s*height:\s*0\s*\}\}/g,
    replacement: `initial={{ opacity: 0 }}`
  },
  
  // Width 0 initial animations
  {
    pattern: /initial=\{\{\s*width:\s*0\s*\}\}/g,
    replacement: `initial={{ scaleX: 0 }}`
  },
  
  // Motion div to OptimizedMotion
  {
    pattern: /<motion\.div/g,
    replacement: `<OptimizedMotion`
  },
  
  // Closing motion div tags
  {
    pattern: /<\/motion\.div>/g,
    replacement: `</OptimizedMotion>`
  },
  
  // Motion imports
  {
    pattern: /import\s*{\s*motion\s*}\s*from\s*['"]framer-motion['"];?/g,
    replacement: `import { OptimizedMotion } from '@/components/ui/OptimizedMotion';`
  },
  
  // Add overflow hidden to progress containers
  {
    pattern: /className=['"]([^'"]*bg-gray-200[^'"]*rounded-full[^'"]*h-2[^'"]*)['"]/g,
    replacement: `className="$1 overflow-hidden"`
  },
  
  // Add transform origin to progress bars
  {
    pattern: /className=['"]([^'"]*h-2[^'"]*rounded-full[^'"]*bg-\[#ff0a54\][^'"]*)['"]/g,
    replacement: `className="$1" style={{ transformOrigin: 'left center' }}`
  }
];

function processFile(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    for (const optimization of optimizations) {
      const before = newContent;
      if (typeof optimization.replacement === 'function') {
        newContent = newContent.replace(optimization.pattern, optimization.replacement);
      } else {
        newContent = newContent.replace(optimization.pattern, optimization.replacement);
      }
      
      if (newContent !== before) {
        modified = true;
      }
    }
    
    if (modified) {
      writeFileSync(filePath, newContent, 'utf8');
      // File optimized successfully
      return true;
    }
    
    return false;
  } catch (error) {
    // Error processing file
    return false;
  }
}

function walkDirectory(dir: string): number {
  let processedCount = 0;
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other build directories
        if (['node_modules', '.next', 'dist', 'build'].includes(item)) {
          continue;
        }
        processedCount += walkDirectory(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        if (processFile(fullPath)) {
          processedCount++;
        }
      }
    }
  } catch (error) {
    // Error reading directory
  }
  
  return processedCount;
}

// Main execution
// Starting animation optimization
walkDirectory(srcDir);
// Optimization complete
