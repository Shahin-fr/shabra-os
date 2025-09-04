#!/usr/bin/env node

/**
 * Script to replace console statements with logger calls
 * Implements: [CRITICAL PRIORITY 8: Production Console Log Eradication]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SOURCE_DIR = path.join(__dirname, '..', 'src');
const EXCLUDE_DIRS = ['node_modules', '.next', 'coverage', 'dist', 'build'];
const EXCLUDE_FILES = ['*.d.ts', '*.min.js', '*.bundle.js'];

// Console statement patterns to replace
const CONSOLE_PATTERNS = [
  {
    pattern: /console\.log\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\s*\)/g,
    replacement: "logger.info('$1', $2)",
    description: 'console.log with context',
  },
  {
    pattern: /console\.log\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    replacement: "logger.info('$1')",
    description: 'console.log without context',
  },
  {
    pattern: /console\.warn\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\s*\)/g,
    replacement: "logger.warn('$1', $2)",
    description: 'console.warn with context',
  },
  {
    pattern: /console\.warn\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    replacement: "logger.warn('$1')",
    description: 'console.warn without context',
  },
  {
    pattern: /console\.error\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\s*\)/g,
    replacement: "logger.error('$1', $2)",
    description: 'console.error with context',
  },
  {
    pattern: /console\.error\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    replacement: "logger.error('$1')",
    description: 'console.error without context',
  },
  {
    pattern: /console\.info\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\s*\)/g,
    replacement: "logger.info('$1', $2)",
    description: 'console.info with context',
  },
  {
    pattern: /console\.info\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    replacement: "logger.info('$1')",
    description: 'console.info without context',
  },
  {
    pattern: /console\.debug\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\s*\)/g,
    replacement: "logger.debug('$1', $2)",
    description: 'console.debug with context',
  },
  {
    pattern: /console\.debug\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    replacement: "logger.debug('$1')",
    description: 'console.debug without context',
  },
];

// Logger import patterns
const LOGGER_IMPORT_PATTERNS = [
  {
    pattern: /import\s+{\s*([^}]+)}\s+from\s+['"`]@\/lib\/logger['"`];?/g,
    replacement: "import { $1 } from '@/lib/logger';",
    description: 'logger import',
  },
];

function shouldExcludeFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);

  // Check if file is in excluded directories
  for (const excludeDir of EXCLUDE_DIRS) {
    if (relativePath.includes(excludeDir)) {
      return true;
    }
  }

  // Check if file matches excluded patterns
  for (const excludePattern of EXCLUDE_FILES) {
    if (path.basename(filePath).match(excludePattern.replace('*', '.*'))) {
      return true;
    }
  }

  return false;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;

    // Check if logger import already exists
    const hasLoggerImport =
      content.includes('@/lib/logger') ||
      content.includes("from '@/lib/logger'");

    // Replace console statements
    for (const pattern of CONSOLE_PATTERNS) {
      const matches = newContent.match(pattern.pattern);
      if (matches) {
        newContent = newContent.replace(pattern.pattern, pattern.replacement);
        modified = true;
        console.log(
          `  ✓ Replaced ${pattern.description} in ${path.basename(filePath)}`
        );
      }
    }

    // Add logger import if needed and console statements were found
    if (modified && !hasLoggerImport) {
      // Find the last import statement
      const importMatch = newContent.match(
        /(import\s+.*?from\s+['"`][^'"`]+['"`];?\n?)/g
      );

      if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        const loggerImport = "\nimport { logger } from '@/lib/logger';\n";

        newContent = newContent.replace(lastImport, lastImport + loggerImport);
        console.log(`  ✓ Added logger import to ${path.basename(filePath)}`);
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`  ✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!shouldExcludeFile(fullPath)) {
          traverse(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext) && !shouldExcludeFile(fullPath)) {
          files.push(fullPath);
        }
      }
    }
  }

  traverse(dir);
  return files;
}

function main() {
  console.log('🚀 Starting console statement replacement...\n');

  // Find all TypeScript/JavaScript files
  const files = findFiles(SOURCE_DIR);
  console.log(`📁 Found ${files.length} files to process\n`);

  let processedCount = 0;
  let modifiedCount = 0;

  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`🔍 Processing: ${relativePath}`);

    if (processFile(file)) {
      modifiedCount++;
    }
    processedCount++;
  }

  console.log(`\n✅ Console replacement completed!`);
  console.log(`📊 Summary:`);
  console.log(`   - Files processed: ${processedCount}`);
  console.log(`   - Files modified: ${modifiedCount}`);
  console.log(`   - Files unchanged: ${processedCount - modifiedCount}`);

  if (modifiedCount > 0) {
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Review the changes in modified files`);
    console.log(`   2. Test the application to ensure logging works correctly`);
    console.log(`   3. Run 'npm run build' to verify no compilation errors`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { processFile, findFiles };
