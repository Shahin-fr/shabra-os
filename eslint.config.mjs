import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';

export default [
  // Base JavaScript recommended rules
  js.configs.recommended,

  // TypeScript configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      react: react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
      prettier: prettier,
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'error',

      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      '@typescript-eslint/no-var-requires': 'error',

      // React specific rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import rules
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-unresolved': 'off',

      // Accessibility rules
      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          components: ['Link'],
          specialLink: ['hrefLeft', 'hrefRight'],
          aspects: ['invalidHref', 'preferButton'],
        },
      ],

      // General code quality
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',

      // Console usage rules - stricter in production
      'no-console': [
        process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        {
          allow:
            process.env.NODE_ENV === 'production'
              ? ['warn', 'error']
              : ['warn', 'error'],
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },

  // JavaScript files (non-TypeScript)
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      react: react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
      prettier: prettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // Browser environment files (React components, UI components)
  {
    files: [
      'src/components/**/*.{ts,tsx,js,jsx}',
      'src/app/**/*.{ts,tsx,js,jsx}',
      'src/hooks/**/*.{ts,tsx}',
      'src/stores/**/*.{ts,tsx}',
      'src/types/**/*.{ts,tsx}',
      'src/lib/**/*.{ts,tsx}',
      'public/**/*.{js,ts}',
    ],
    languageOptions: {
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        history: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        Image: 'readonly',
        Audio: 'readonly',
        Video: 'readonly',
        Canvas: 'readonly',
        WebGLRenderingContext: 'readonly',
        WebGL2RenderingContext: 'readonly',
        WebGLBuffer: 'readonly',
        WebGLProgram: 'readonly',
        WebGLShader: 'readonly',
        WebGLTexture: 'readonly',
        WebGLUniformLocation: 'readonly',
        WebGLActiveInfo: 'readonly',
        WebGLFramebuffer: 'readonly',
        WebGLRenderbuffer: 'readonly',
        WebGLVertexArrayObject: 'readonly',
        WebGLQuery: 'readonly',
        WebGLSampler: 'readonly',
        WebGLSync: 'readonly',
        WebGLTransformFeedback: 'readonly',
        // Performance API
        performance: 'readonly',
        PerformanceObserver: 'readonly',
        PerformanceEntry: 'readonly',
        PerformanceMark: 'readonly',
        PerformanceMeasure: 'readonly',
        PerformanceNavigationTiming: 'readonly',
        PerformanceResourceTiming: 'readonly',
        PerformancePaintTiming: 'readonly',
        PerformanceLayoutShift: 'readonly',
        PerformanceFirstInput: 'readonly',
        PerformanceLongTask: 'readonly',
        PerformanceEventTiming: 'readonly',
        // Animation API
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        // Timer functions
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        // PWA and Service Worker APIs
        caches: 'readonly',
        Cache: 'readonly',
        CacheStorage: 'readonly',
        ServiceWorker: 'readonly',
        ServiceWorkerRegistration: 'readonly',
        ServiceWorkerGlobalScope: 'readonly',
        // IndexedDB
        indexedDB: 'readonly',
        IDBFactory: 'readonly',
        IDBDatabase: 'readonly',
        IDBObjectStore: 'readonly',
        IDBIndex: 'readonly',
        IDBTransaction: 'readonly',
        IDBRequest: 'readonly',
        IDBOpenDBRequest: 'readonly',
        IDBCursor: 'readonly',
        IDBCursorWithValue: 'readonly',
        IDBKeyRange: 'readonly',
        // Web APIs
        IntersectionObserver: 'readonly',
        ResizeObserver: 'readonly',
        MutationObserver: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        // Global objects
        globalThis: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },

  // Node.js environment files (scripts, build tools, Prisma)
  {
    files: [
      'scripts/**/*.{js,ts}',
      'prisma/**/*.{js,ts}',
      'next.config.ts',
      'tailwind.config.ts',
      'vitest.config.ts',
      'playwright.config.ts',
      'postcss.config.mjs',
      'eslint.config.mjs',
    ],
    languageOptions: {
      globals: {
        // Node.js globals
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        require: 'readonly',
        console: 'readonly',
        NodeJS: 'readonly',
        // Node.js built-in modules
        fs: 'readonly',
        path: 'readonly',
        os: 'readonly',
        util: 'readonly',
        events: 'readonly',
        stream: 'readonly',
        crypto: 'readonly',
        http: 'readonly',
        https: 'readonly',
        url: 'readonly',
        querystring: 'readonly',
        child_process: 'readonly',
        cluster: 'readonly',
        dgram: 'readonly',
        dns: 'readonly',
        domain: 'readonly',
        net: 'readonly',
        punycode: 'readonly',
        readline: 'readonly',
        repl: 'readonly',
        string_decoder: 'readonly',
        tls: 'readonly',
        tty: 'readonly',
        v8: 'readonly',
        vm: 'readonly',
        zlib: 'readonly',
        // Timer functions
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },

  // Service Worker environment files
  {
    files: ['public/sw.js', '**/*.sw.{js,ts}'],
    languageOptions: {
      globals: {
        // Service Worker globals
        self: 'readonly',
        caches: 'readonly',
        Cache: 'readonly',
        CacheStorage: 'readonly',
        ServiceWorker: 'readonly',
        ServiceWorkerRegistration: 'readonly',
        ServiceWorkerGlobalScope: 'readonly',
        // Fetch API
        fetch: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        // Cache API
        // IndexedDB
        indexedDB: 'readonly',
        IDBFactory: 'readonly',
        IDBDatabase: 'readonly',
        IDBObjectStore: 'readonly',
        IDBIndex: 'readonly',
        IDBTransaction: 'readonly',
        IDBRequest: 'readonly',
        IDBOpenDBRequest: 'readonly',
        IDBCursor: 'readonly',
        IDBCursorWithValue: 'readonly',
        IDBKeyRange: 'readonly',
        // Console
        console: 'readonly',
        // Timer functions
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        // URL
        URL: 'readonly',
        URLSearchParams: 'readonly',
        // Global objects
        globalThis: 'readonly',
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },

  // Test environment files
  {
    files: [
      '**/*.test.{js,ts,jsx,tsx}',
      '**/*.spec.{js,ts,jsx,tsx}',
      '**/test/**/*.{js,ts,jsx,tsx}',
      'src/test/**/*.{js,ts,jsx,tsx}',
      'vitest.config.ts',
    ],
    languageOptions: {
      globals: {
        // Test globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        // Vitest globals
        vi: 'readonly',
        // Browser globals for component testing
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        // Global objects
        global: 'readonly',
        globalThis: 'readonly',
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'import/no-extraneous-dependencies': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // Configuration files
  {
    files: ['**/*.config.{js,ts,mjs}', '**/*.config.*.{js,ts,mjs}'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // Global ignores
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'coverage/**',
      '*.min.js',
      '*.bundle.js',
    ],
  },
];
