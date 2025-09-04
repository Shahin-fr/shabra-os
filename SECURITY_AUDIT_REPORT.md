# Security Audit Report

Generated: 2025-08-27T20:36:47.167Z

## 📊 Summary

- **Total Files Scanned**: 187
- **Files with Issues**: 92
- **Total Issues Found**: 188

## 🚨 Critical Issues (45)

### hardcodedPasswords in src\app\api\auth\login\route.test.ts

- **Severity**: CRITICAL
- **Matches**: 30
- **Examples**: password: 'hashedPassword123', password: 'password123', password: 'password123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\app\api\auth\login\route.test.ts

- **Severity**: CRITICAL
- **Matches**: 34
- **Examples**: password: 'hashedPassword123', password: 'password123', password: 'password123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\app\login\page.test.tsx

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'password123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\app\login\page.test.tsx

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'password123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\auth.integration.test.ts

- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: 'hashed-password-123', password: 'password123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\auth.integration.test.ts

- **Severity**: CRITICAL
- **Matches**: 9
- **Examples**: password: 'hashed-password-123', password: 'password123', password: true
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\auth.test.ts

- **Severity**: CRITICAL
- **Matches**: 3
- **Examples**: password: 'hashed-password-123', password: 'password123', password: 'hashed-password'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\auth.test.ts

- **Severity**: CRITICAL
- **Matches**: 9
- **Examples**: password: 'hashed-password-123', password: 'password123', password: true
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedSecrets in src\auth.test.ts

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: SECRET: 'test-secret-key'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\auth.ts

- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: { label: 'Password', password: true
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedSecrets in src\components\dashboard\ActivityChart.tsx

- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: Key='name', Key='value'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\auth.e2e.spec.ts

- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: 'testpassword123', Password: 'wrongpassword'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\auth.e2e.spec.ts

- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: 'testpassword123', Password: 'wrongpassword'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\content-creation.e2e.spec.ts

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'testpassword123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\content-creation.e2e.spec.ts

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'testpassword123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\project-management.e2e.spec.ts

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'testpassword123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\project-management.e2e.spec.ts

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'testpassword123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\README.md

- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: 'testpassword123', Password: 'wrongpassword'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\README.md

- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: 'testpassword123', Password: 'wrongpassword'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\test-utils.ts

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: Password: 'wrongpassword'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\test-utils.ts

- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: config.testing.userPassword, Password: 'wrongpassword'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\lib\config\env.ts

- **Severity**: CRITICAL
- **Matches**: 4
- **Examples**: PASSWORD: 'test-password-123', PASSWORD: 'admin-password-123', PASSWORD: 'user-password-123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\lib\config\env.ts

- **Severity**: CRITICAL
- **Matches**: 16
- **Examples**: PASSWORD: z.string().min(8, PASSWORD: z.string().min(8, PASSWORD: z.string().min(8
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedSecrets in src\lib\database\cache-manager.ts

- **Severity**: CRITICAL
- **Matches**: 4
- **Examples**: Key = `projects:${page}:${limit}`, Key = `stories:day:${day}`, Key = 'story-types:all'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\lib\security\credential-generator.ts

- **Severity**: CRITICAL
- **Matches**: 5
- **Examples**: password = '', PASSWORD="${generateSecurePassword(16)}", PASSWORD="${generateSecurePassword(16)}"
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\lib\security\credential-generator.ts

- **Severity**: CRITICAL
- **Matches**: 12
- **Examples**: password = '';
  , password: string , password: generateSecurePassword(20)
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedSecrets in src\lib\security\credential-generator.ts

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: SECRET="${secret}"
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\lib\security\input-validator.ts

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: {
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\lib\test-prisma.ts

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'hashedpassword'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\lib\test-prisma.ts

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'hashedpassword'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in prisma\seed.ts

- **Severity**: CRITICAL
- **Matches**: 9
- **Examples**: Password = config.development.adminPassword;, Password = config.development.userPassword;, Password = config.development.managerPassword;
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in prisma\wiki-seed.js

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'hashedpassword'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in prisma\wiki-seed.js

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'hashedpassword'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in prisma\wiki-seed.ts

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'hashedpassword'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in prisma\wiki-seed.ts

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'hashedpassword'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\auth.e2e.spec.ts

- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: 'testpassword123', Password: 'wrongpassword'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\auth.e2e.spec.ts

- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: 'testpassword123', Password: 'wrongpassword'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\content-creation.e2e.spec.ts

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'testpassword123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\content-creation.e2e.spec.ts

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'testpassword123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\project-management.e2e.spec.ts

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'testpassword123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\project-management.e2e.spec.ts

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'testpassword123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\README.md

- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: 'testpassword123', Password: 'wrongpassword'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\README.md

- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: 'testpassword123', Password: 'wrongpassword'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\test-utils.ts

- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: Password: 'wrongpassword'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\e2e\test-utils.ts

- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: config.testing.userPassword, Password: 'wrongpassword'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

## ⚠️ High Priority Issues (116)

### weakPasswords in src\app\api\attendance\route.test.ts

- **Severity**: HIGH
- **Matches**: 4
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\attendance\route.ts

- **Severity**: HIGH
- **Matches**: 8
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\auth\login\route.test.ts

- **Severity**: HIGH
- **Matches**: 27
- **Examples**: Password123, password123, password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\auth\login\route.test.ts

- **Severity**: HIGH
- **Matches**: 3
- **Examples**: ADMIN, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\auth\login\route.test.ts

- **Severity**: HIGH
- **Matches**: 30
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\content-slots\route.test.ts

- **Severity**: HIGH
- **Matches**: 7
- **Examples**: test, Test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\health\route.ts

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\projects\route.test.ts

- **Severity**: HIGH
- **Matches**: 5
- **Examples**: Admin, ADMIN, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\projects\route.test.ts

- **Severity**: HIGH
- **Matches**: 7
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\stories\route.test.ts

- **Severity**: HIGH
- **Matches**: 30
- **Examples**: test, Test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\stories\[storyId]\route.test.ts

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\story-types\route.test.ts

- **Severity**: HIGH
- **Matches**: 51
- **Examples**: Admin, Admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\story-types\route.test.ts

- **Severity**: HIGH
- **Matches**: 2
- **Examples**: test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\story-types\route.ts

- **Severity**: HIGH
- **Matches**: 6
- **Examples**: Admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\story-types\[storyTypeId]\route.ts

- **Severity**: HIGH
- **Matches**: 10
- **Examples**: Admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\story-types\[storyTypeId]\route.ts

- **Severity**: HIGH
- **Matches**: 2
- **Examples**: teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\tasks\route.test.ts

- **Severity**: HIGH
- **Matches**: 14
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\users\route.test.ts

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\wiki\route.test.ts

- **Severity**: HIGH
- **Matches**: 7
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\content-calendar\page.test.tsx

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\content-calendar\page.test.tsx

- **Severity**: HIGH
- **Matches**: 7
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\docs\[slug]\page.tsx

- **Severity**: HIGH
- **Matches**: 2
- **Examples**: teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\login\page.test.tsx

- **Severity**: HIGH
- **Matches**: 9
- **Examples**: password123, password123, password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\login\page.test.tsx

- **Severity**: HIGH
- **Matches**: 15
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\page.tsx

- **Severity**: HIGH
- **Matches**: 3
- **Examples**: Admin, ADMIN, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\projects\page.test.tsx

- **Severity**: HIGH
- **Matches**: 2
- **Examples**: admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\projects\page.test.tsx

- **Severity**: HIGH
- **Matches**: 14
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\projects\page.tsx

- **Severity**: HIGH
- **Matches**: 2
- **Examples**: Admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\providers.test.tsx

- **Severity**: HIGH
- **Matches**: 68
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\storyboard\page.test.tsx

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\storyboard\page.test.tsx

- **Severity**: HIGH
- **Matches**: 12
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\storyboard\page.tsx

- **Severity**: HIGH
- **Matches**: 28
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\test-employee\page.tsx

- **Severity**: HIGH
- **Matches**: 2
- **Examples**: Test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\auth.integration.test.ts

- **Severity**: HIGH
- **Matches**: 3
- **Examples**: password123, password123, password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\auth.integration.test.ts

- **Severity**: HIGH
- **Matches**: 3
- **Examples**: ADMIN, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\auth.integration.test.ts

- **Severity**: HIGH
- **Matches**: 11
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\auth.test.ts

- **Severity**: HIGH
- **Matches**: 4
- **Examples**: password123, password123, password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\auth.test.ts

- **Severity**: HIGH
- **Matches**: 2
- **Examples**: ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\auth.test.ts

- **Severity**: HIGH
- **Matches**: 12
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\EmployeeDashboard.tsx

- **Severity**: HIGH
- **Matches**: 2
- **Examples**: teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\index.ts

- **Severity**: HIGH
- **Matches**: 2
- **Examples**: test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\MyLatestTask.tsx

- **Severity**: HIGH
- **Matches**: 7
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\projects\CreateProject.test.tsx

- **Severity**: HIGH
- **Matches**: 3
- **Examples**: Admin, ADMIN, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\projects\CreateProject.test.tsx

- **Severity**: HIGH
- **Matches**: 9
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\projects\CreateProject.tsx

- **Severity**: HIGH
- **Matches**: 2
- **Examples**: Admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\storyboard\CreateStoryDialog.test.tsx

- **Severity**: HIGH
- **Matches**: 94
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\storyboard\CreateStoryDialog.tsx

- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\storyboard\DraggableStoryList.tsx

- **Severity**: HIGH
- **Matches**: 4
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\storyboard\StoryCard.test.tsx

- **Severity**: HIGH
- **Matches**: 15
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\storyboard\StoryManagement.tsx

- **Severity**: HIGH
- **Matches**: 25
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\storyboard\StorySlot.test.tsx

- **Severity**: HIGH
- **Matches**: 11
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\storyboard\StoryTypeManager.test.tsx

- **Severity**: HIGH
- **Matches**: 3
- **Examples**: ADMIN, Admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\storyboard\StoryTypeManager.test.tsx

- **Severity**: HIGH
- **Matches**: 9
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\storyboard\StoryTypeManager.tsx

- **Severity**: HIGH
- **Matches**: 8
- **Examples**: Admin, admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\storyboard\StoryTypeManager.tsx

- **Severity**: HIGH
- **Matches**: 9
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\storyboard\TemplatePalette.test.tsx

- **Severity**: HIGH
- **Matches**: 3
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\ui\button\Button.test.tsx

- **Severity**: HIGH
- **Matches**: 2
- **Examples**: test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\ui\calendar.tsx

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\ui\PWARegistration.tsx

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\auth.e2e.spec.ts

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\auth.e2e.spec.ts

- **Severity**: HIGH
- **Matches**: 42
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\content-creation.e2e.spec.ts

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\content-creation.e2e.spec.ts

- **Severity**: HIGH
- **Matches**: 91
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\project-management.e2e.spec.ts

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\project-management.e2e.spec.ts

- **Severity**: HIGH
- **Matches**: 70
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\README.md

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\README.md

- **Severity**: HIGH
- **Matches**: 145
- **Examples**: Test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\run-e2e-tests.ts

- **Severity**: HIGH
- **Matches**: 96
- **Examples**: Test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\test-utils.ts

- **Severity**: HIGH
- **Matches**: 18
- **Examples**: test, Test, TEST
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\auth-utils.test.ts

- **Severity**: HIGH
- **Matches**: 69
- **Examples**: Admin, Admin, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\auth-utils.test.ts

- **Severity**: HIGH
- **Matches**: 2
- **Examples**: test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\auth-utils.ts

- **Severity**: HIGH
- **Matches**: 11
- **Examples**: admin, Admin, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\cache-manager.test.ts

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\cache-manager.ts

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\config\env.ts

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\config\env.ts

- **Severity**: HIGH
- **Matches**: 16
- **Examples**: ADMIN, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\config\env.ts

- **Severity**: HIGH
- **Matches**: 26
- **Examples**: test, Test, TEST
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\config\env.ts

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: 123456
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\database\cache-manager.ts

- **Severity**: HIGH
- **Matches**: 5
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\date-utils.test.ts

- **Severity**: HIGH
- **Matches**: 3
- **Examples**: test, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\logger.config.ts

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\middleware\auth-middleware.ts

- **Severity**: HIGH
- **Matches**: 4
- **Examples**: ADMIN, ADMIN, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\middleware\validation-middleware.ts

- **Severity**: HIGH
- **Matches**: 4
- **Examples**: test, test, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\mock-data.ts

- **Severity**: HIGH
- **Matches**: 2
- **Examples**: test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\performance\bundle-analyzer.ts

- **Severity**: HIGH
- **Matches**: 9
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\queries.test.ts

- **Severity**: HIGH
- **Matches**: 11
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\security\credential-generator.ts

- **Severity**: HIGH
- **Matches**: 6
- **Examples**: admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\security\credential-generator.ts

- **Severity**: HIGH
- **Matches**: 18
- **Examples**: test, Test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\security\credential-generator.ts

- **Severity**: HIGH
- **Matches**: 3
- **Examples**: 123456, 123456, 123456
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\security\credential-generator.ts

- **Severity**: HIGH
- **Matches**: 2
- **Examples**: qwerty, qwerty
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\security\html-sanitizer.ts

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\security\input-validator.ts

- **Severity**: HIGH
- **Matches**: 3
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\security\InputSanitizer.ts

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\state\index.ts

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\state-index.ts

- **Severity**: HIGH
- **Matches**: 5
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\state-manager.ts

- **Severity**: HIGH
- **Matches**: 11
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\test-prisma.ts

- **Severity**: HIGH
- **Matches**: 6
- **Examples**: test, Test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\utils.ts

- **Severity**: HIGH
- **Matches**: 5
- **Examples**: Admin, ADMIN, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\middleware.test.ts

- **Severity**: HIGH
- **Matches**: 3
- **Examples**: test, Test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\stores\useAppStore.ts

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\types\state.ts

- **Severity**: HIGH
- **Matches**: 9
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in prisma\seed.ts

- **Severity**: HIGH
- **Matches**: 14
- **Examples**: admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in prisma\wiki-seed.js

- **Severity**: HIGH
- **Matches**: 2
- **Examples**: admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in prisma\wiki-seed.js

- **Severity**: HIGH
- **Matches**: 11
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in prisma\wiki-seed.ts

- **Severity**: HIGH
- **Matches**: 2
- **Examples**: admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in prisma\wiki-seed.ts

- **Severity**: HIGH
- **Matches**: 11
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\auth.e2e.spec.ts

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\auth.e2e.spec.ts

- **Severity**: HIGH
- **Matches**: 42
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\content-creation.e2e.spec.ts

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\content-creation.e2e.spec.ts

- **Severity**: HIGH
- **Matches**: 91
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\project-management.e2e.spec.ts

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\project-management.e2e.spec.ts

- **Severity**: HIGH
- **Matches**: 70
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\README.md

- **Severity**: HIGH
- **Matches**: 1
- **Examples**: password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\README.md

- **Severity**: HIGH
- **Matches**: 145
- **Examples**: Test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\run-e2e-tests.ts

- **Severity**: HIGH
- **Matches**: 96
- **Examples**: Test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\test-utils.ts

- **Severity**: HIGH
- **Matches**: 18
- **Examples**: test, Test, TEST
- **Action Required**: HIGH - Fix weak passwords and patterns

## 🔧 Medium Priority Issues (0)

## 📝 Low Priority Issues (9)

### consoleStatements in src\components\dashboard\EmployeeDashboard.tsx

- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\e2e\run-e2e-tests.ts

- **Severity**: LOW
- **Matches**: 4
- **Examples**: console.log, console.log, console.log
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\lib\config\env.ts

- **Severity**: LOW
- **Matches**: 6
- **Examples**: console.error, console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\lib\logger.ts

- **Severity**: LOW
- **Matches**: 4
- **Examples**: console.debug, console.info, console.warn
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\lib\state-manager.ts

- **Severity**: LOW
- **Matches**: 3
- **Examples**: console.error, console.warn, console.log
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in prisma\seed.ts

- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.log
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in prisma\wiki-seed.js

- **Severity**: LOW
- **Matches**: 6
- **Examples**: console.log, console.log, console.log
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in prisma\wiki-seed.ts

- **Severity**: LOW
- **Matches**: 6
- **Examples**: console.log, console.log, console.log
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\e2e\run-e2e-tests.ts

- **Severity**: LOW
- **Matches**: 4
- **Examples**: console.log, console.log, console.log
- **Action Required**: LOW - Consider fixing for production

## 🎯 Recommendations

### Immediate Actions (Critical & High)

1. **Remove all hardcoded passwords** from source code
2. **Replace weak passwords** with secure alternatives
3. **Move credentials** to environment variables
4. **Use secure credential generation** for development

### Environment Setup

1. **Copy env.template** to .env.local
2. **Generate secure credentials** using scripts/generate-secure-credentials.js
3. **Update database connection strings**
4. **Set strong NEXTAUTH_SECRET**

### Security Best Practices

1. **Never commit** .env files to version control
2. **Use strong passwords** (16+ characters, mixed case, symbols)
3. **Rotate secrets** regularly in production
4. **Monitor credential access** and usage

## 🔍 Files with Issues

### src\app\api\attendance\route.test.ts

- **weakPasswords** (HIGH): 4 matches

### src\app\api\attendance\route.ts

- **weakPasswords** (HIGH): 8 matches

### src\app\api\auth\login\route.test.ts

- **hardcodedPasswords** (CRITICAL): 30 matches
- **hardcodedPasswords** (CRITICAL): 34 matches
- **weakPasswords** (HIGH): 27 matches
- **weakPasswords** (HIGH): 3 matches
- **weakPasswords** (HIGH): 30 matches

### src\app\api\content-slots\route.test.ts

- **weakPasswords** (HIGH): 7 matches

### src\app\api\health\route.ts

- **weakPasswords** (HIGH): 1 matches

### src\app\api\logs\route.ts

- **environmentVariables** (INFO): 1 matches

### src\app\api\projects\route.test.ts

- **weakPasswords** (HIGH): 5 matches
- **weakPasswords** (HIGH): 7 matches
- **environmentVariables** (INFO): 6 matches

### src\app\api\stories\route.test.ts

- **weakPasswords** (HIGH): 30 matches

### src\app\api\stories\[storyId]\route.test.ts

- **weakPasswords** (HIGH): 1 matches

### src\app\api\story-types\route.test.ts

- **weakPasswords** (HIGH): 51 matches
- **weakPasswords** (HIGH): 2 matches

### src\app\api\story-types\route.ts

- **weakPasswords** (HIGH): 6 matches

### src\app\api\story-types\[storyTypeId]\route.ts

- **weakPasswords** (HIGH): 10 matches
- **weakPasswords** (HIGH): 2 matches

### src\app\api\tasks\route.test.ts

- **weakPasswords** (HIGH): 14 matches

### src\app\api\users\route.test.ts

- **weakPasswords** (HIGH): 1 matches

### src\app\api\wiki\route.test.ts

- **weakPasswords** (HIGH): 7 matches

### src\app\content-calendar\page.test.tsx

- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 7 matches

### src\app\docs\[slug]\page.tsx

- **weakPasswords** (HIGH): 2 matches

### src\app\login\page.test.tsx

- **hardcodedPasswords** (CRITICAL): 1 matches
- **hardcodedPasswords** (CRITICAL): 1 matches
- **weakPasswords** (HIGH): 9 matches
- **weakPasswords** (HIGH): 15 matches

### src\app\page.tsx

- **weakPasswords** (HIGH): 3 matches

### src\app\projects\page.test.tsx

- **weakPasswords** (HIGH): 2 matches
- **weakPasswords** (HIGH): 14 matches

### src\app\projects\page.tsx

- **weakPasswords** (HIGH): 2 matches

### src\app\providers.test.tsx

- **weakPasswords** (HIGH): 68 matches

### src\app\storyboard\page.test.tsx

- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 12 matches

### src\app\storyboard\page.tsx

- **weakPasswords** (HIGH): 28 matches

### src\app\test-employee\page.tsx

- **weakPasswords** (HIGH): 2 matches

### src\auth.integration.test.ts

- **hardcodedPasswords** (CRITICAL): 2 matches
- **hardcodedPasswords** (CRITICAL): 9 matches
- **weakPasswords** (HIGH): 3 matches
- **weakPasswords** (HIGH): 3 matches
- **weakPasswords** (HIGH): 11 matches
- **environmentVariables** (INFO): 3 matches

### src\auth.test.ts

- **hardcodedPasswords** (CRITICAL): 3 matches
- **hardcodedPasswords** (CRITICAL): 9 matches
- **hardcodedSecrets** (CRITICAL): 1 matches
- **weakPasswords** (HIGH): 4 matches
- **weakPasswords** (HIGH): 2 matches
- **weakPasswords** (HIGH): 12 matches
- **environmentVariables** (INFO): 3 matches

### src\auth.ts

- **hardcodedPasswords** (CRITICAL): 2 matches
- **environmentVariables** (INFO): 3 matches

### src\components\dashboard\ActivityChart.tsx

- **hardcodedSecrets** (CRITICAL): 2 matches

### src\components\dashboard\EmployeeDashboard.tsx

- **weakPasswords** (HIGH): 2 matches
- **consoleStatements** (LOW): 1 matches

### src\components\dashboard\index.ts

- **weakPasswords** (HIGH): 2 matches

### src\components\dashboard\MyLatestTask.tsx

- **weakPasswords** (HIGH): 7 matches

### src\components\error\ErrorBoundary.tsx

- **environmentVariables** (INFO): 3 matches

### src\components\projects\CreateProject.test.tsx

- **weakPasswords** (HIGH): 3 matches
- **weakPasswords** (HIGH): 9 matches

### src\components\projects\CreateProject.tsx

- **weakPasswords** (HIGH): 2 matches

### src\components\storyboard\CreateStoryDialog.test.tsx

- **weakPasswords** (HIGH): 94 matches

### src\components\storyboard\CreateStoryDialog.tsx

- **weakPasswords** (HIGH): 3 matches

### src\components\storyboard\DraggableStoryList.tsx

- **weakPasswords** (HIGH): 4 matches

### src\components\storyboard\RealTimeCollaboration.tsx

- **environmentVariables** (INFO): 1 matches

### src\components\storyboard\StoryCard.test.tsx

- **weakPasswords** (HIGH): 15 matches

### src\components\storyboard\StoryManagement.tsx

- **weakPasswords** (HIGH): 25 matches

### src\components\storyboard\StorySlot.test.tsx

- **weakPasswords** (HIGH): 11 matches

### src\components\storyboard\StoryTypeManager.test.tsx

- **weakPasswords** (HIGH): 3 matches
- **weakPasswords** (HIGH): 9 matches

### src\components\storyboard\StoryTypeManager.tsx

- **weakPasswords** (HIGH): 8 matches
- **weakPasswords** (HIGH): 9 matches

### src\components\storyboard\TemplatePalette.test.tsx

- **weakPasswords** (HIGH): 3 matches

### src\components\ui\button\Button.test.tsx

- **weakPasswords** (HIGH): 2 matches

### src\components\ui\calendar.tsx

- **weakPasswords** (HIGH): 1 matches

### src\components\ui\PWARegistration.tsx

- **weakPasswords** (HIGH): 1 matches
- **environmentVariables** (INFO): 6 matches

### src\e2e\auth.e2e.spec.ts

- **hardcodedPasswords** (CRITICAL): 2 matches
- **hardcodedPasswords** (CRITICAL): 2 matches
- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 42 matches

### src\e2e\content-creation.e2e.spec.ts

- **hardcodedPasswords** (CRITICAL): 1 matches
- **hardcodedPasswords** (CRITICAL): 1 matches
- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 91 matches

### src\e2e\project-management.e2e.spec.ts

- **hardcodedPasswords** (CRITICAL): 1 matches
- **hardcodedPasswords** (CRITICAL): 1 matches
- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 70 matches

### src\e2e\README.md

- **hardcodedPasswords** (CRITICAL): 2 matches
- **hardcodedPasswords** (CRITICAL): 2 matches
- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 145 matches

### src\e2e\run-e2e-tests.ts

- **weakPasswords** (HIGH): 96 matches
- **consoleStatements** (LOW): 4 matches
- **environmentVariables** (INFO): 3 matches

### src\e2e\test-utils.ts

- **hardcodedPasswords** (CRITICAL): 1 matches
- **hardcodedPasswords** (CRITICAL): 2 matches
- **weakPasswords** (HIGH): 18 matches

### src\lib\auth-utils.test.ts

- **weakPasswords** (HIGH): 69 matches
- **weakPasswords** (HIGH): 2 matches

### src\lib\auth-utils.ts

- **weakPasswords** (HIGH): 11 matches

### src\lib\cache-manager.test.ts

- **weakPasswords** (HIGH): 1 matches

### src\lib\cache-manager.ts

- **weakPasswords** (HIGH): 1 matches

### src\lib\config\env.ts

- **hardcodedPasswords** (CRITICAL): 4 matches
- **hardcodedPasswords** (CRITICAL): 16 matches
- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 16 matches
- **weakPasswords** (HIGH): 26 matches
- **weakPasswords** (HIGH): 1 matches
- **consoleStatements** (LOW): 6 matches
- **environmentVariables** (INFO): 5 matches

### src\lib\database\cache-manager.ts

- **hardcodedSecrets** (CRITICAL): 4 matches
- **weakPasswords** (HIGH): 5 matches

### src\lib\date-utils.test.ts

- **weakPasswords** (HIGH): 3 matches

### src\lib\logger.config.ts

- **weakPasswords** (HIGH): 1 matches
- **environmentVariables** (INFO): 13 matches

### src\lib\logger.ts

- **consoleStatements** (LOW): 4 matches
- **environmentVariables** (INFO): 1 matches

### src\lib\middleware\auth-middleware.ts

- **weakPasswords** (HIGH): 4 matches

### src\lib\middleware\validation-middleware.ts

- **weakPasswords** (HIGH): 4 matches

### src\lib\mock-data.ts

- **weakPasswords** (HIGH): 2 matches

### src\lib\performance\bundle-analyzer.ts

- **weakPasswords** (HIGH): 9 matches

### src\lib\prisma.ts

- **environmentVariables** (INFO): 4 matches

### src\lib\queries.test.ts

- **weakPasswords** (HIGH): 11 matches

### src\lib\security\credential-generator.ts

- **hardcodedPasswords** (CRITICAL): 5 matches
- **hardcodedPasswords** (CRITICAL): 12 matches
- **hardcodedSecrets** (CRITICAL): 1 matches
- **weakPasswords** (HIGH): 6 matches
- **weakPasswords** (HIGH): 18 matches
- **weakPasswords** (HIGH): 3 matches
- **weakPasswords** (HIGH): 2 matches

### src\lib\security\html-sanitizer.ts

- **weakPasswords** (HIGH): 1 matches
- **environmentVariables** (INFO): 2 matches

### src\lib\security\input-validator.ts

- **hardcodedPasswords** (CRITICAL): 1 matches
- **weakPasswords** (HIGH): 3 matches

### src\lib\security\InputSanitizer.ts

- **weakPasswords** (HIGH): 1 matches

### src\lib\security\security-headers.ts

- **environmentVariables** (INFO): 2 matches

### src\lib\state\index.ts

- **weakPasswords** (HIGH): 1 matches

### src\lib\state-index.ts

- **weakPasswords** (HIGH): 5 matches

### src\lib\state-manager.ts

- **weakPasswords** (HIGH): 11 matches
- **consoleStatements** (LOW): 3 matches

### src\lib\test-prisma.ts

- **hardcodedPasswords** (CRITICAL): 1 matches
- **hardcodedPasswords** (CRITICAL): 1 matches
- **weakPasswords** (HIGH): 6 matches

### src\lib\utils.ts

- **weakPasswords** (HIGH): 5 matches

### src\middleware.test.ts

- **weakPasswords** (HIGH): 3 matches

### src\middleware.ts

- **environmentVariables** (INFO): 1 matches

### src\stores\useAppStore.ts

- **weakPasswords** (HIGH): 1 matches
- **environmentVariables** (INFO): 1 matches

### src\types\state.ts

- **weakPasswords** (HIGH): 9 matches

### prisma\seed.ts

- **hardcodedPasswords** (CRITICAL): 9 matches
- **weakPasswords** (HIGH): 14 matches
- **consoleStatements** (LOW): 1 matches

### prisma\wiki-seed.js

- **hardcodedPasswords** (CRITICAL): 1 matches
- **hardcodedPasswords** (CRITICAL): 1 matches
- **weakPasswords** (HIGH): 2 matches
- **weakPasswords** (HIGH): 11 matches
- **consoleStatements** (LOW): 6 matches

### prisma\wiki-seed.ts

- **hardcodedPasswords** (CRITICAL): 1 matches
- **hardcodedPasswords** (CRITICAL): 1 matches
- **weakPasswords** (HIGH): 2 matches
- **weakPasswords** (HIGH): 11 matches
- **consoleStatements** (LOW): 6 matches

### src\e2e\auth.e2e.spec.ts

- **hardcodedPasswords** (CRITICAL): 2 matches
- **hardcodedPasswords** (CRITICAL): 2 matches
- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 42 matches

### src\e2e\content-creation.e2e.spec.ts

- **hardcodedPasswords** (CRITICAL): 1 matches
- **hardcodedPasswords** (CRITICAL): 1 matches
- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 91 matches

### src\e2e\project-management.e2e.spec.ts

- **hardcodedPasswords** (CRITICAL): 1 matches
- **hardcodedPasswords** (CRITICAL): 1 matches
- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 70 matches

### src\e2e\README.md

- **hardcodedPasswords** (CRITICAL): 2 matches
- **hardcodedPasswords** (CRITICAL): 2 matches
- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 145 matches

### src\e2e\run-e2e-tests.ts

- **weakPasswords** (HIGH): 96 matches
- **consoleStatements** (LOW): 4 matches
- **environmentVariables** (INFO): 3 matches

### src\e2e\test-utils.ts

- **hardcodedPasswords** (CRITICAL): 1 matches
- **hardcodedPasswords** (CRITICAL): 2 matches
- **weakPasswords** (HIGH): 18 matches
