const fs = require('fs');
const path = require('path');

// Files to fix
const files = [
  'src/components/forms/MobileInput.tsx',
  'src/components/forms/MobileTextarea.tsx',
  'src/components/forms/MobileSelect.tsx',
  'src/components/data/MobileDataCard.tsx',
  'src/components/data/MobileDataList.tsx',
  'src/components/data/MobileInfiniteScroll.tsx',
  'src/components/projects/MobileCreateProject.tsx',
  'src/components/projects/MobileProjectsList.tsx',
  'src/components/dashboard/MobileClockInCard.tsx',
  'src/components/dashboard/MobileDashboard.tsx',
  'src/components/dashboard/SwipeableStatsCard.tsx',
  'src/components/dashboard/QuickActionCard.tsx',
  'src/components/dashboard/MobileAttendanceHistory.tsx',
  'src/components/layout/FloatingActionButton.tsx',
  'src/components/layout/MobileBottomNavigation.tsx',
  'src/components/tasks/MobileTaskCreationModal.tsx',
  'src/components/tasks/MobileTaskDetail.tsx',
  'src/components/tasks/MobileTaskList.tsx',
];

// Import order rules
const importOrder = [
  'react',
  'next',
  'lucide-react',
  'framer-motion',
  'date-fns',
  '@tanstack/react-query',
  'zustand',
  '@/components/ui',
  '@/components/forms',
  '@/components/data',
  '@/components/projects',
  '@/components/tasks',
  '@/components/dashboard',
  '@/components/layout',
  '@/components/calendar',
  '@/hooks',
  '@/lib',
  '@/types',
  '@/stores',
];

function fixImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Extract all imports
    const importRegex = /^import\s+.*?from\s+['"][^'"]+['"];?$/gm;
    const imports = content.match(importRegex) || [];

    if (imports.length === 0) return;

    // Remove all imports from content
    content = content.replace(importRegex, '');

    // Sort imports by order
    const sortedImports = imports.sort((a, b) => {
      const getImportType = importStr => {
        const match = importStr.match(/from\s+['"]([^'"]+)['"]/);
        if (!match) return 999;
        const from = match[1];

        if (from.startsWith('react')) return 0;
        if (from.startsWith('next')) return 1;
        if (from.startsWith('lucide-react')) return 2;
        if (from.startsWith('framer-motion')) return 3;
        if (from.startsWith('date-fns')) return 4;
        if (from.startsWith('@tanstack')) return 5;
        if (from.startsWith('zustand')) return 6;
        if (from.startsWith('@/components/ui')) return 7;
        if (from.startsWith('@/components/forms')) return 8;
        if (from.startsWith('@/components/data')) return 9;
        if (from.startsWith('@/components/projects')) return 10;
        if (from.startsWith('@/components/tasks')) return 11;
        if (from.startsWith('@/components/dashboard')) return 12;
        if (from.startsWith('@/components/layout')) return 13;
        if (from.startsWith('@/components/calendar')) return 14;
        if (from.startsWith('@/hooks')) return 15;
        if (from.startsWith('@/lib')) return 16;
        if (from.startsWith('@/types')) return 17;
        if (from.startsWith('@/stores')) return 18;
        return 999;
      };

      return getImportType(a) - getImportType(b);
    });

    // Group imports and add empty lines between groups
    let groupedImports = [];
    let currentGroup = [];
    let lastType = -1;

    for (const importStr of sortedImports) {
      const match = importStr.match(/from\s+['"]([^'"]+)['"]/);
      const from = match ? match[1] : '';
      let type = 0;

      if (from.startsWith('react')) type = 0;
      else if (from.startsWith('next')) type = 1;
      else if (from.startsWith('lucide-react')) type = 2;
      else if (from.startsWith('framer-motion')) type = 3;
      else if (from.startsWith('date-fns')) type = 4;
      else if (from.startsWith('@tanstack')) type = 5;
      else if (from.startsWith('zustand')) type = 6;
      else if (from.startsWith('@/components/ui')) type = 7;
      else if (from.startsWith('@/components/forms')) type = 8;
      else if (from.startsWith('@/components/data')) type = 9;
      else if (from.startsWith('@/components/projects')) type = 10;
      else if (from.startsWith('@/components/tasks')) type = 11;
      else if (from.startsWith('@/components/dashboard')) type = 12;
      else if (from.startsWith('@/components/layout')) type = 13;
      else if (from.startsWith('@/components/calendar')) type = 14;
      else if (from.startsWith('@/hooks')) type = 15;
      else if (from.startsWith('@/lib')) type = 16;
      else if (from.startsWith('@/types')) type = 17;
      else if (from.startsWith('@/stores')) type = 18;
      else type = 999;

      if (type !== lastType && currentGroup.length > 0) {
        groupedImports.push(currentGroup.join('\n'));
        currentGroup = [];
      }

      currentGroup.push(importStr);
      lastType = type;
    }

    if (currentGroup.length > 0) {
      groupedImports.push(currentGroup.join('\n'));
    }

    // Add imports back to content
    const newImports = groupedImports.join('\n\n');
    content = newImports + '\n\n' + content;

    // Clean up extra newlines
    content = content.replace(/\n{3,}/g, '\n\n');

    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Fix all files
files.forEach(fixImports);
console.log('Import fixing complete!');
