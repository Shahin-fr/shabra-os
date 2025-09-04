const fs = require('fs');

// Files that need cleanup
const filesToClean = [
  'src/app/content-calendar/page.test.tsx',
  'src/app/projects/page.test.tsx',
  'src/app/providers.test.tsx',
  'src/app/storyboard/page.test.tsx',
  'src/app/storyboard/page.tsx',
  'src/components/dashboard/EmployeeDashboard.tsx',
  'src/components/projects/CreateProject.test.tsx',
  'src/components/storyboard/CreateStoryDialog.test.tsx',
  'src/components/storyboard/RealTimeCollaboration.tsx',
  'src/components/storyboard/StoryboardHeader.tsx',
  'src/components/storyboard/StoryCard.test.tsx',
  'src/components/storyboard/StorySlot.test.tsx',
  'src/components/storyboard/StoryTypeManager.test.tsx',
  'src/components/storyboard/TemplatePalette.test.tsx',
  'src/auth.test.ts',
  'src/lib/cache-manager.test.ts',
  'src/lib/database/cache-manager.ts',
  'src/lib/security/RateLimiter.ts',
];

function cleanupFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remove unused imports
  const unusedImports = [
    {
      pattern:
        /import \{ [^}]*fireEvent[^}]* \} from '@testing-library\/react';/g,
      replacement:
        "import { render, screen, waitFor } from '@testing-library/react';",
    },
    {
      pattern:
        /import \{ [^}]*fireEvent[^}]* \} from '@testing-library\/react';/g,
      replacement: "import { render, screen } from '@testing-library/react';",
    },
    {
      pattern:
        /import \{ [^}]*waitFor[^}]* \} from '@testing-library\/react';/g,
      replacement: "import { render, screen } from '@testing-library/react';",
    },
    {
      pattern: /import \{ [^}]*Suspense[^}]* \} from 'react';/g,
      replacement: "import { lazy, useMemo } from 'react';",
    },
    {
      pattern: /import \{ [^}]*Plus[^}]* \} from 'lucide-react';/g,
      replacement: "import { CalendarIcon } from 'lucide-react';",
    },
    {
      pattern: /import \{ [^}]*Minus[^}]* \} from 'lucide-react';/g,
      replacement: "import { CalendarIcon } from 'lucide-react';",
    },
    {
      pattern:
        /import \{ [^}]*Tooltip[^}]* \} from '\.\.\/\.\.\/components\/ui\/tooltip';/g,
      replacement: '',
    },
    {
      pattern: /import ContentCalendarPage from '\.\/page';/g,
      replacement: '',
    },
    { pattern: /import ProjectsPage from '\.\/page';/g, replacement: '' },
    { pattern: /import StoryboardPage from '\.\/page';/g, replacement: '' },
  ];

  unusedImports.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  // Remove unused lazy components
  const lazyComponents = [
    'CreateStoryDialog',
    'StoryCanvas',
    'TemplatePalette',
    'StoryTypeManager',
    'CreateStoryDialogSkeleton',
    'StoryCanvasSkeleton',
    'TemplatePaletteSkeleton',
    'StoryTypeManagerSkeleton',
  ];

  lazyComponents.forEach(component => {
    const pattern = new RegExp(
      `const ${component} = lazy\\([^)]+\\);?\\n?`,
      'g'
    );
    if (pattern.test(content)) {
      content = content.replace(pattern, '');
      modified = true;
    }
  });

  // Remove unused skeleton components
  const skeletonComponents = [
    'CreateStoryDialogSkeleton',
    'StoryCanvasSkeleton',
    'TemplatePaletteSkeleton',
    'StoryTypeManagerSkeleton',
  ];

  skeletonComponents.forEach(component => {
    const pattern = new RegExp(
      `const ${component} = \\(\\) => \\([\\s\\S]*?\\);?\\n?`,
      'g'
    );
    if (pattern.test(content)) {
      content = content.replace(pattern, '');
      modified = true;
    }
  });

  // Remove unused variables
  const unusedVars = [
    'slotCount',
    'onAddSlot',
    'onRemoveSlot',
    'attendanceLoading',
    'manualRefresh',
    'cacheVersion',
    'lastCacheClear',
    'now',
  ];

  unusedVars.forEach(varName => {
    // Remove variable declarations
    const varPattern = new RegExp(`\\s*${varName}[^=]*= [^;]+;?\\n?`, 'g');
    if (varPattern.test(content)) {
      content = content.replace(varPattern, '');
      modified = true;
    }
  });

  // Remove unused parameters
  const unusedParams = ['onOpenChange', 'onValueChange', 'props', 'container'];

  unusedParams.forEach(param => {
    // Remove from destructuring
    const destructuringPattern = new RegExp(
      `(\\{[^}]*),\\s*${param}([^}]*\\})`,
      'g'
    );
    if (destructuringPattern.test(content)) {
      content = content.replace(destructuringPattern, '$1$2');
      modified = true;
    }

    // Remove standalone parameters
    const standalonePattern = new RegExp(
      `(\\w+):\\s*\\{[^}]*\\},\\s*${param}\\s*:\\s*any`,
      'g'
    );
    if (standalonePattern.test(content)) {
      content = content.replace(standalonePattern, '$1: { ... }');
      modified = true;
    }
  });

  // Remove unused consoleSpy
  if (content.includes('const consoleSpy = {')) {
    content = content.replace(/const consoleSpy = \{[\s\S]*?\};?\n?/g, '');
    modified = true;
  }

  // Remove unused mockCredentials
  if (content.includes('const mockCredentials = {')) {
    content = content.replace(/const mockCredentials = \{[\s\S]*?\};?\n?/g, '');
    modified = true;
  }

  // Fix unused generic type parameter
  if (content.includes('export function withCache<T>(')) {
    content = content.replace(
      /export function withCache<T>\(/g,
      'export function withCache('
    );
    modified = true;
  }

  // Fix unused target parameter
  if (content.includes('target: any,')) {
    content = content.replace(/target: any,/g, '');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Cleaned up: ${filePath}`);
  } else {
    console.log(`No cleanup needed: ${filePath}`);
  }
}

// Clean up each file
console.log('Cleaning up unused code...');
filesToClean.forEach(cleanupFile);
console.log('Unused code cleanup completed!');
