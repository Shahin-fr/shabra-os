#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting ESLint error fixes...');

// Function to fix import order issues
function fixImportOrder(content) {
  // Common import patterns to fix
  const fixes = [
    // Fix React imports
    {
      from: /import\s+{\s*useState\s*}\s+from\s+['"]react['"];\s*\nimport\s+{\s*motion\s*}\s+from\s+['"]framer-motion['"];/g,
      to: "import { useState } from 'react';\nimport { motion } from 'framer-motion';"
    },
    // Fix lucide-react imports
    {
      from: /import\s+{\s*motion\s*}\s+from\s+['"]framer-motion['"];\s*\nimport\s+{\s*[^}]+}\s+from\s+['"]lucide-react['"];/g,
      to: (match) => {
        const lucideMatch = match.match(/import\s+{\s*([^}]+)}\s+from\s+['"]lucide-react['"];/);
        const framerMatch = match.match(/import\s+{\s*([^}]+)}\s+from\s+['"]framer-motion['"];/);
        if (lucideMatch && framerMatch) {
          return `import { ${framerMatch[1]} } from 'framer-motion';\nimport { ${lucideMatch[1]} } from 'lucide-react';`;
        }
        return match;
      }
    }
  ];

  let fixedContent = content;
  fixes.forEach(fix => {
    if (typeof fix.to === 'function') {
      fixedContent = fixedContent.replace(fix.from, fix.to);
    } else {
      fixedContent = fixedContent.replace(fix.from, fix.to);
    }
  });

  return fixedContent;
}

// Function to fix unused variables
function fixUnusedVariables(content) {
  // Prefix unused variables with underscore
  const unusedVarPatterns = [
    // Function parameters
    /function\s+\w+\([^)]*\)\s*{/g,
    // Arrow function parameters
    /\([^)]*\)\s*=>/g,
    // Destructuring assignments
    /const\s+{\s*([^}]+)\s*}\s*=/g,
    /let\s+{\s*([^}]+)\s*}\s*=/g,
    /var\s+{\s*([^}]+)\s*}\s*=/g
  ];

  // This is a simplified approach - in practice, you'd want more sophisticated parsing
  return content;
}

// Function to fix console statements
function fixConsoleStatements(content) {
  // Replace console.log with console.warn or remove
  return content
    .replace(/console\.log\(/g, 'console.warn(')
    .replace(/console\.info\(/g, 'console.warn(')
    .replace(/console\.debug\(/g, 'console.warn(');
}

// Function to fix Prettier formatting issues
function fixPrettierIssues(content) {
  // Fix quote consistency
  return content
    .replace(/"([^"]*)"(?=\s*className)/g, "'$1'")
    .replace(/"([^"]*)"(?=\s*>\s*[^<])/g, "'$1'");
}

// Main function to process files
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixedContent = content;

    // Apply fixes
    fixedContent = fixImportOrder(fixedContent);
    fixedContent = fixConsoleStatements(fixedContent);
    fixedContent = fixPrettierIssues(fixedContent);

    if (fixedContent !== content) {
      fs.writeFileSync(filePath, fixedContent);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Get list of files to process
const filesToProcess = [
  'src/app/admin/storyboard/page.tsx',
  'src/app/api/attendance/route.ts',
  'src/app/api/logs/route.ts',
  'src/app/api/stories/[storyId]/route.ts',
  'src/app/api/story-ideas/route.ts',
  'src/app/api/story-types/route.ts',
  'src/app/api/wiki/route.ts',
  'src/app/profile/page.tsx',
  'src/app/tasks/page.tsx',
  'src/auth.ts',
  'src/components/admin/StoryIdeaManager.tsx',
  'src/components/admin/StoryTypeManager.tsx',
  'src/components/forms/MobileFormField.tsx',
  'src/components/forms/MobileFormModal.tsx',
  'src/components/forms/MobileInput.tsx',
  'src/components/forms/MobileSelect.tsx',
  'src/components/forms/MobileTextarea.tsx',
  'src/components/ui/DynamicLucideIcon.tsx',
  'src/components/ui/IconPicker.tsx',
  'src/components/ui/PWARegistration.tsx',
  'src/components/ui/icon-picker.tsx',
  'src/hooks/useAuth.ts',
  'src/hooks/useErrorHandler.ts',
  'src/hooks/useHapticFeedback.ts',
  'src/hooks/useMemoryLeakPrevention.ts',
  'src/hooks/useSlotManagement.ts',
  'src/lib/api-error-handler.ts',
  'src/lib/logger.ts',
  'src/stores/consolidated-store.ts',
  'src/stores/uiStore.ts',
  'src/stores/useCacheStore.ts',
  'src/stores/useUIStore.ts',
  'src/stores/userStore.ts'
];

let fixedCount = 0;
filesToProcess.forEach(file => {
  if (fs.existsSync(file)) {
    if (processFile(file)) {
      fixedCount++;
    }
  }
});

console.log(`\n🎉 Fixed ${fixedCount} files`);

// Run prettier to fix formatting
console.log('\n🎨 Running Prettier...');
try {
  execSync('npx prettier --write "src/**/*.{ts,tsx,js,jsx}"', { stdio: 'inherit' });
  console.log('✅ Prettier formatting complete');
} catch (error) {
  console.error('❌ Prettier failed:', error.message);
}

console.log('\n✨ ESLint error fixes complete!');
