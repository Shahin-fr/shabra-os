# Security Audit Report
Generated: 2025-10-08T14:29:52.189Z

## 📊 Summary
- **Total Files Scanned**: 672
- **Files with Issues**: 355
- **Total Issues Found**: 589

## 🚨 Critical Issues (75)

### hardcodedPasswords in src\app\(main)\login\page.test.tsx
- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: 'password123', password: 'password123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\app\(main)\login\page.test.tsx
- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: 'password123', password: 'password123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\app\api\seed\route.ts
- **Severity**: CRITICAL
- **Matches**: 10
- **Examples**: password: DEFAULT_ADMIN_PASSWORD, password: DEFAULT_USER_PASSWORD, password: DEFAULT_MANAGER_PASSWORD
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\app\api\users\route.test.ts
- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: 'password123', password: '123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\app\api\users\route.test.ts
- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: 'password123', password: '123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\app\api\users\route.ts
- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: Password = await bcrypt.hash(createUserData.password, password: hashedPassword
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\app\api\wiki\route.test.ts
- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'hashedpassword123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\app\api\wiki\route.test.ts
- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'hashedpassword123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\auth-local.ts
- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: { label: 'Password', password: true
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
- **Matches**: 2
- **Examples**: password: 'hashed-password-123', password: 'hashed-password'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\auth.test.ts
- **Severity**: CRITICAL
- **Matches**: 8
- **Examples**: password: 'hashed-password-123', password: true, password: true
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

### hardcodedSecrets in src\components\admin\attendance\WorkScheduleManagement.tsx
- **Severity**: CRITICAL
- **Matches**: 7
- **Examples**: key: 'saturday', key: 'sunday', key: 'monday'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\components\admin\CreateUserForm.tsx
- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: ''
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\components\admin\CreateUserForm.tsx
- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: z.string().min(8, password: ''
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedSecrets in src\components\dashboard\ActivityChart.tsx
- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: Key='name', Key='value'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedSecrets in src\components\dashboard\MobileClockInCard.tsx
- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: key='loading', key='button'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedSecrets in src\components\layout\EnhancedMobileBottomNavigation.tsx
- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: key="close", key="plus"
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedSecrets in src\components\layout\FloatingActionButton.tsx
- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: key='close', key='plus'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedSecrets in src\components\layout\Sidebar.tsx
- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: key='mobile-sidebar'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedSecrets in src\components\projects\MobileProjectsList.tsx
- **Severity**: CRITICAL
- **Matches**: 5
- **Examples**: key: 'name', key: 'description', key: 'status'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedSecrets in src\components\storyboard\IdeaBank.tsx
- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: key='list', key='detail'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\components\__tests__\LoginForm.test.tsx
- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'password123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\components\__tests__\LoginForm.test.tsx
- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: 'password123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedSecrets in src\components\__tests__\RealTimeCollaboration.test.tsx
- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: key: 'Enter'
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

### hardcodedPasswords in src\hooks\useAuth.ts
- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: string) => {, Password: !!password 
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedSecrets in src\lib\advanced-security.ts
- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: key = `${riskLevel}:${eventType}`
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\lib\config\constants.js
- **Severity**: CRITICAL
- **Matches**: 4
- **Examples**: PASSWORD = 'admin-password-123', PASSWORD = 'manager-password-123', PASSWORD = 'user-password-123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\lib\config\constants.js
- **Severity**: CRITICAL
- **Matches**: 8
- **Examples**: PASSWORD = 'admin-password-123';, PASSWORD = 'manager-password-123';, PASSWORD = 'user-password-123';
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\lib\config\constants.ts
- **Severity**: CRITICAL
- **Matches**: 4
- **Examples**: PASSWORD = 'admin-password-123', PASSWORD = 'manager-password-123', PASSWORD = 'user-password-123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\lib\config\constants.ts
- **Severity**: CRITICAL
- **Matches**: 8
- **Examples**: PASSWORD = 'admin-password-123';, PASSWORD = 'manager-password-123';, PASSWORD = 'user-password-123';
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\lib\config\env.ts
- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: PASSWORD: 'test-password-123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\lib\config\env.ts
- **Severity**: CRITICAL
- **Matches**: 16
- **Examples**: PASSWORD: z, PASSWORD: z, PASSWORD: z
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedSecrets in src\lib\database\cache-manager.ts
- **Severity**: CRITICAL
- **Matches**: 4
- **Examples**: Key = `projects:${page}:${limit}`, Key = `stories:${day}`, Key = 'storyTypes'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\lib\db-connection.js
- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password:
        process.env.DB_PASSWORD ||
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedSecrets in src\lib\error-handler.ts
- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: key = `${component}:${action}`, key = `${component}:${action}`
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\lib\errors\error-handler.ts
- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password=***'), password: undefined
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\lib\errors\error-handling.test.ts
- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: 'secret123', password: 'secret789'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\lib\errors\error-handling.test.ts
- **Severity**: CRITICAL
- **Matches**: 6
- **Examples**: Password=secret123 is invalid');, password=*** is invalid');, Password=secret123 is invalid');
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedSecrets in src\lib\errors\error-handling.test.ts
- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: secret: 'secret456'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedSecrets in src\lib\errors\error-handling.test.ts
- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: token: 'abc123'
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\lib\security\credential-generator.ts
- **Severity**: CRITICAL
- **Matches**: 5
- **Examples**: password = '', PASSWORD="${generateSecurePassword(16)}", PASSWORD="${generateSecurePassword(16)}"
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\lib\security\credential-generator.ts
- **Severity**: CRITICAL
- **Matches**: 12
- **Examples**: password = '';, password: string;, password: generateSecurePassword(20)
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

### hardcodedSecrets in src\lib\security.ts
- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: key = `${identifier}:${Math.floor(now / windowMs)}`
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\types\entities.ts
- **Severity**: CRITICAL
- **Matches**: 2
- **Examples**: password: string;, password: string;
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\types\schemas.ts
- **Severity**: CRITICAL
- **Matches**: 3
- **Examples**: password: PasswordSchema, password: PasswordSchema, password: PasswordSchema.optional()
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in src\types\validation.ts
- **Severity**: CRITICAL
- **Matches**: 1
- **Examples**: password: string): boolean {
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in prisma\seed-robust.ts
- **Severity**: CRITICAL
- **Matches**: 3
- **Examples**: Password = await bcrypt.hash('Password123', password: hashedPassword, password: hashedPassword
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in prisma\seed-simple.ts
- **Severity**: CRITICAL
- **Matches**: 3
- **Examples**: Password = await bcrypt.hash('Password123', password: hashedPassword, password: hashedPassword
- **Action Required**: IMMEDIATE - Remove hardcoded credentials

### hardcodedPasswords in prisma\seed.ts
- **Severity**: CRITICAL
- **Matches**: 6
- **Examples**: Password = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, password: hashedPassword, password: hashedPassword
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

## ⚠️  High Priority Issues (382)

### weakPasswords in src\app\(main)\action-center\page.tsx
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: admin, Admin, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\admin\announcements\page.tsx
- **Severity**: HIGH
- **Matches**: 12
- **Examples**: admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\admin\announcements\page.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\admin\attendance\page.tsx
- **Severity**: HIGH
- **Matches**: 9
- **Examples**: Admin, admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\admin\checklist-templates\page.tsx
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: admin, admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\admin\holidays\page.tsx
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: admin, Admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\admin\leave-requests\page.tsx
- **Severity**: HIGH
- **Matches**: 9
- **Examples**: Admin, admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\admin\users\page.tsx
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: admin, admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\content-calendar\page.test.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\content-calendar\page.test.tsx
- **Severity**: HIGH
- **Matches**: 7
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\content-calendar\page.tsx
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\login\page.test.tsx
- **Severity**: HIGH
- **Matches**: 10
- **Examples**: password123, password123, password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\login\page.test.tsx
- **Severity**: HIGH
- **Matches**: 17
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\meetings\new\page.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: Admin, Admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\meetings\page.tsx
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: Admin, Admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\meetings\page.tsx
- **Severity**: HIGH
- **Matches**: 7
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\meetings\[meetingId]\page.tsx
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\page.tsx
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: Admin, ADMIN, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\profile\[userId]\page.tsx
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: Admin, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\projects\page.test.tsx
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\projects\page.test.tsx
- **Severity**: HIGH
- **Matches**: 14
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\projects\page.tsx
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: Admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\projects\[projectId]\board\page.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\storyboard\page.test.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\storyboard\page.test.tsx
- **Severity**: HIGH
- **Matches**: 12
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\storyboard\page.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\tasks\page.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\team\page.tsx
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\(main)\team-calendar\page.tsx
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: admin, Admin, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\admin\storyboard\page.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: admin, admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\action-center\route.ts
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: admin, admin, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\action-center\summary\route.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\action-center\[id]\route.ts
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: admin, admin, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\announcements\route.ts
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: admin, ADMIN, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\announcements\[id]\route.ts
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: admin, ADMIN, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\attendance\route.ts
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: ADMIN, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\attendance\stats\route.test.ts
- **Severity**: HIGH
- **Matches**: 13
- **Examples**: Admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\attendance\stats\route.test.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\attendance\stats\route.ts
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: ADMIN, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\attendance\[id]\route.ts
- **Severity**: HIGH
- **Matches**: 10
- **Examples**: ADMIN, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\checklist-templates\route.ts
- **Severity**: HIGH
- **Matches**: 15
- **Examples**: ADMIN, ADMIN, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\checklist-templates\[id]\route.ts
- **Severity**: HIGH
- **Matches**: 10
- **Examples**: ADMIN, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\documents\route.ts
- **Severity**: HIGH
- **Matches**: 8
- **Examples**: admin, Admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\documents\[id]\route.ts
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: admin, ADMIN, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\employee-checklists\route.ts
- **Severity**: HIGH
- **Matches**: 11
- **Examples**: admin, Admin, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\employee-checklists\[id]\route.ts
- **Severity**: HIGH
- **Matches**: 8
- **Examples**: admin, ADMIN, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\holidays\route.ts
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: admin, admin, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\holidays\[id]\route.ts
- **Severity**: HIGH
- **Matches**: 9
- **Examples**: admin, admin, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\leave-requests\route.ts
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: ADMIN, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\leave-requests\[id]\route.ts
- **Severity**: HIGH
- **Matches**: 10
- **Examples**: ADMIN, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\security\audit-logs\route.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: admin, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\security\brute-force\route.ts
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: admin, ADMIN, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\security\overview\route.ts
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: admin, ADMIN, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\tasks-at-risk\route.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\team-activity\route.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\team-activity-today\route.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\team-activity-today\route.ts
- **Severity**: HIGH
- **Matches**: 7
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\team-calendar\route.ts
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: admin, admin, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\team-calendar\route.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\team-presence-stats\route.ts
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: ADMIN, admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\team-workload\route.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\urgent-tasks\route.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: ADMIN, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\admin\work-schedules\[userId]\route.ts
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: admin, admin, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

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

### weakPasswords in src\app\api\attendance\stats\route.test.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\calendar\next-event\route.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\content-slots\route.test.ts
- **Severity**: HIGH
- **Matches**: 10
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\debug\route.ts
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: Test, Test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\health\route.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\instapulse\pages\route.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\leave-requests\route.test.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\leave-requests\route.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\meetings\action-items\[actionItemId]\create-task\route.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\meetings\optimized\route.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\meetings\route.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\meetings\route.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\meetings\[meetingId]\action-items\route.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\meetings\[meetingId]\action-items\[actionItemId]\route.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\meetings\[meetingId]\route.ts
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: ADMIN, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\meetings\[meetingId]\talking-points\route.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\meetings\[meetingId]\talking-points\[talkingPointId]\route.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\profiles\route.ts
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: admin, admin, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\profiles\[userId]\route.ts
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: ADMIN, Admin, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\projects\route.test.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: ADMIN, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\projects\route.test.ts
- **Severity**: HIGH
- **Matches**: 11
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\projects\route.ts
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\projects\[projectId]\route.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\requests\route.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\seed\route.ts
- **Severity**: HIGH
- **Matches**: 18
- **Examples**: ADMIN, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\seed\route.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: Test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\stories\route.test.ts
- **Severity**: HIGH
- **Matches**: 45
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\stories\route.ts
- **Severity**: HIGH
- **Matches**: 14
- **Examples**: teSt, teSt, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\stories\[storyId]\route.test.ts
- **Severity**: HIGH
- **Matches**: 49
- **Examples**: test, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\stories\[storyId]\route.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\story-types\route.test.ts
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: Admin, Admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\story-types\route.test.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\tasks\route.test.ts
- **Severity**: HIGH
- **Matches**: 22
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\tasks\route.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: ADMIN, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\tasks\[taskId]\route.ts
- **Severity**: HIGH
- **Matches**: 7
- **Examples**: Admin, ADMIN, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\team-status\whos-out\route.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\users\route.test.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: password123, password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\users\route.test.ts
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: admin, ADMIN, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\users\route.test.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\users\route.ts
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: ADMIN, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\wiki\reorder\route.ts
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: admin, Admin, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\wiki\route.test.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\wiki\route.test.ts
- **Severity**: HIGH
- **Matches**: 8
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\wiki\route.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\wiki\route.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\wiki\upload\route.ts
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: admin, Admin, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\api\wiki\[documentId]\route.ts
- **Severity**: HIGH
- **Matches**: 10
- **Examples**: Admin, ADMIN, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\docs\[slug]\page.tsx
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\pitch\page.tsx
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: Test, Test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\providers.test.tsx
- **Severity**: HIGH
- **Matches**: 68
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\showcase\components\documentation-section.tsx
- **Severity**: HIGH
- **Matches**: 12
- **Examples**: Test, Test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\showcase\components\ecosystem-section.tsx
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\app\showcase\components\hero-section.tsx
- **Severity**: HIGH
- **Matches**: 7
- **Examples**: admin, admin, admin
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
- **Matches**: 3
- **Examples**: password123, password123, password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\auth.test.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\auth.test.ts
- **Severity**: HIGH
- **Matches**: 11
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\action-center\ActionCenterDashboard.tsx
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\action-center\ActionCenterDashboard.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\announcements\CreateAnnouncementModal.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\announcements\EditAnnouncementModal.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\attendance\AdminAttendanceDashboard.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: Admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\attendance\AttendanceLogTable.tsx
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\attendance\AttendanceLogTable.tsx
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\attendance\DeleteAttendanceModal.tsx
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\attendance\EditAttendanceModal.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\attendance\EditAttendanceModal.tsx
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\attendance\WorkScheduleManagement.tsx
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\checklist-templates\ChecklistTemplateDetails.tsx
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: ADMIN, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\checklist-templates\ChecklistTemplateDetails.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\checklist-templates\ChecklistTemplateForm.tsx
- **Severity**: HIGH
- **Matches**: 7
- **Examples**: ADMIN, ADMIN, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\checklist-templates\ChecklistTemplatesDashboard.tsx
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: ADMIN, ADMIN, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\checklist-templates\ChecklistTemplatesDashboard.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\CreateUserForm.tsx
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: ADMIN, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\dashboard\CompanyStatsWidget.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\dashboard\DashboardLayout.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\dashboard\HeroHeader.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\dashboard\NavigationCardsWidget.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\dashboard\WidgetGrid.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\holidays\HolidayManagement.tsx
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\holidays\HolidayManagement.tsx
- **Severity**: HIGH
- **Matches**: 7
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\leave\AdminLeaveManagement.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: Admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\leave\AdminLeaveManagement.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\leave\ApproveLeaveModal.tsx
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\leave\ApproveLeaveModal.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\leave\RejectLeaveModal.tsx
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\leave\RejectLeaveModal.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\SecurityDashboard.tsx
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\StoryIdeaManager.tsx
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\StoryTypeManager.tsx
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\team-calendar\CapacityForecastWidget.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\team-calendar\TeamCalendarDashboard.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\UsersTable.tsx
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: ADMIN, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\UsersTable.tsx
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\admin\UsersTableOptimized.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\announcements\AnnouncementCard.tsx
- **Severity**: HIGH
- **Matches**: 8
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\announcements\CreateAnnouncementModal.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\attendance\AttendanceHistory.tsx
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\attendance\DesktopAttendanceView.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\AnnouncementsWidget.tsx
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: test, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\index.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\mobile\MobileClockInCard.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\MobileAttendanceHistory.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\MobileDashboard.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\MyLatestTask.tsx
- **Severity**: HIGH
- **Matches**: 7
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\widgets\ActionCenterWidget.tsx
- **Severity**: HIGH
- **Matches**: 7
- **Examples**: admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\widgets\ActionCenterWidget.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\widgets\AnnouncementsWidget.tsx
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\widgets\AttendanceClockWidget.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\widgets\MyActiveProjectsWidget.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\widgets\MyRequestsWidget.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\widgets\MyTasksWidget.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\widgets\NextUpWidget.tsx
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\widgets\ProjectHealthOverview.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\widgets\ProjectHealthWidget.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\widgets\QuickActionsWidget.tsx
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: Admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\widgets\TasksAtRiskWidget.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\widgets\TasksAtRiskWidget.tsx
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\widgets\TeamActivityWidget.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\widgets\TeamActivityWidget.tsx
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\widgets\TeamPresenceWidget.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\widgets\TeamWorkloadWidget.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\widgets\TodaysFocusWidget.tsx
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\dashboard\widgets\WhosOutWidget.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\errors\ErrorBoundary.test.tsx
- **Severity**: HIGH
- **Matches**: 13
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\hr\RoleBadge.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\instapulse\reel-card.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\landing\layout\LandingHeader.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\landing\sections\FooterSection.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: 123456
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\landing\sections\index.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: Test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\landing\sections\TestimonialsSection.tsx
- **Severity**: HIGH
- **Matches**: 10
- **Examples**: Test, Test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\landing\ui\DemoForm.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: 123456
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\landing\ui\TestimonialCard.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: Test, Test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\layout\Header.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\layout\Sidebar.tsx
- **Severity**: HIGH
- **Matches**: 10
- **Examples**: ADMIN, ADMIN, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\lazy\AdminComponents.tsx
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\lazy\index.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\leave\MyLeaveRequestsTable.tsx
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\meetings\CreateMeetingForm.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\meetings\MeetingDetails.tsx
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\MobileDashboard.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\profile\ChecklistDetails.tsx
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: ADMIN, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\profile\ChecklistDetails.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\profile\ProfileChecklists.tsx
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: ADMIN, ADMIN, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\profile\ProfileChecklists.tsx
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\profile\ProfileDetails.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\profile\ProfileDocuments.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\profile\ProfileDocuments.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\profile\ProfileHRInfo.tsx
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\profile\ProfileOverview.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\profile\ProfileOverview.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\profile\ProfileTasksProjects.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
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

### weakPasswords in src\components\projects\MobileCreateProject.tsx
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: Admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\projects\MobileProjectsList.tsx
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: Admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\requests\UserRequestsList.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
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

### weakPasswords in src\components\storyboard\management\CreateStoryDialog.tsx
- **Severity**: HIGH
- **Matches**: 7
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\storyboard\management\index.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\storyboard\StoryCard.test.tsx
- **Severity**: HIGH
- **Matches**: 26
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\storyboard\StoryManagement.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\storyboard\StorySlot.test.tsx
- **Severity**: HIGH
- **Matches**: 11
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\storyboard\StoryTypeManager.test.tsx
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: admin, Admin, ADMIN
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

### weakPasswords in src\components\tasks\mobile\MobileTasksList.tsx
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: Test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\tasks\MobileTaskDetail.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\tasks\MobileTaskList.tsx
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\ui\button\Button.test.tsx
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\ui\Button.README.md
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: Test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\ui\calendar.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\ui\offline-indicator.tsx
- **Severity**: HIGH
- **Matches**: 8
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\ui\PWARegistration.tsx
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\__tests__\Accessibility.test.tsx
- **Severity**: HIGH
- **Matches**: 16
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\__tests__\AdminDashboard.test.tsx
- **Severity**: HIGH
- **Matches**: 19
- **Examples**: Admin, Admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\__tests__\AdminDashboard.test.tsx
- **Severity**: HIGH
- **Matches**: 49
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\__tests__\LoginForm.test.tsx
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: password123, password123, password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\__tests__\LoginForm.test.tsx
- **Severity**: HIGH
- **Matches**: 12
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\__tests__\RealTimeCollaboration.test.tsx
- **Severity**: HIGH
- **Matches**: 9
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\components\__tests__\StoryManagement.test.tsx
- **Severity**: HIGH
- **Matches**: 26
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\contexts\ErrorContext.test.tsx
- **Severity**: HIGH
- **Matches**: 41
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

### weakPasswords in src\e2e\create-story.spec.ts
- **Severity**: HIGH
- **Matches**: 9
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\meetings-flow.test.ts
- **Severity**: HIGH
- **Matches**: 25
- **Examples**: test, test, test
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
- **Matches**: 98
- **Examples**: Test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\test-utils.ts
- **Severity**: HIGH
- **Matches**: 18
- **Examples**: test, Test, TEST
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\hooks\useAdminDashboard.ts
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: admin, Admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\hooks\useAnimationPerformance.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\hooks\useCompanyStats.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\hooks\useErrorHandling.test.tsx
- **Severity**: HIGH
- **Matches**: 47
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\hooks\useHR.ts
- **Severity**: HIGH
- **Matches**: 32
- **Examples**: admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\hooks\useReducedMotion.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\hooks\useSlotManagement.ts
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\hooks\useStoryboardData.ts
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\hooks\useStoryboardOperations.ts
- **Severity**: HIGH
- **Matches**: 26
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\hooks\useStoryboardOperationsNew.ts
- **Severity**: HIGH
- **Matches**: 16
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\hooks\useStoryManagement.ts
- **Severity**: HIGH
- **Matches**: 16
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\hooks\useStoryMutations.ts
- **Severity**: HIGH
- **Matches**: 33
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\hooks\useTeamActivity.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\hooks\__tests__\useAdminDashboard.test.ts
- **Severity**: HIGH
- **Matches**: 13
- **Examples**: Admin, Admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\hooks\__tests__\useAdminDashboard.test.ts
- **Severity**: HIGH
- **Matches**: 7
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\hooks\__tests__\useRealtimeCollab.test.ts
- **Severity**: HIGH
- **Matches**: 19
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\hooks\__tests__\useStoryManagement.test.ts
- **Severity**: HIGH
- **Matches**: 18
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\hooks\__tests__\useUpdateTaskStatus.test.ts
- **Severity**: HIGH
- **Matches**: 10
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\accessibility-utils.ts
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\advanced-security.test.ts
- **Severity**: HIGH
- **Matches**: 11
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\attendance-utils.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\attendance-utils.ts
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\auth\authorization.ts
- **Severity**: HIGH
- **Matches**: 11
- **Examples**: ADMIN, ADMIN, Admin
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
- **Matches**: 14
- **Examples**: admin, Admin, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\cache-manager.test.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\client-error-recovery.test.ts
- **Severity**: HIGH
- **Matches**: 16
- **Examples**: test, Test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\config\constants.js
- **Severity**: HIGH
- **Matches**: 14
- **Examples**: Admin, admin, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\config\constants.js
- **Severity**: HIGH
- **Matches**: 11
- **Examples**: TEST, test, TEST
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\config\constants.ts
- **Severity**: HIGH
- **Matches**: 11
- **Examples**: Admin, admin, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\config\constants.ts
- **Severity**: HIGH
- **Matches**: 8
- **Examples**: TEST, test, TEST
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\config\env.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\config\env.ts
- **Severity**: HIGH
- **Matches**: 18
- **Examples**: ADMIN, ADMIN, ADMIN
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

### weakPasswords in src\lib\config\logging.ts
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\database\cache-manager.ts
- **Severity**: HIGH
- **Matches**: 7
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\database\pagination.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\database\__tests__\pagination.test.ts
- **Severity**: HIGH
- **Matches**: 15
- **Examples**: test, teSt, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\date-utils.test.ts
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: test, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\errors\error-handling.test.ts
- **Severity**: HIGH
- **Matches**: 22
- **Examples**: test, Test, TEST
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\jalali-localizer.ts
- **Severity**: HIGH
- **Matches**: 9
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\logger.config.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\middleware\auth-middleware.ts
- **Severity**: HIGH
- **Matches**: 10
- **Examples**: ADMIN, ADMIN, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\mock-data.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\performance\__tests__\simple-monitor.test.ts
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: Test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\prisma.ts
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: Test, Test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\queries.test.ts
- **Severity**: HIGH
- **Matches**: 8
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

### weakPasswords in src\lib\security\RateLimiter.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\security\security-config.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\security\security-config.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: 123456
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\security.test.ts
- **Severity**: HIGH
- **Matches**: 11
- **Examples**: test, Test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\security.test.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: 123456, 123456
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\standard-localizer.ts
- **Severity**: HIGH
- **Matches**: 7
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\state\index.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\test-prisma.ts
- **Severity**: HIGH
- **Matches**: 9
- **Examples**: test, Test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\utils\auth-utils.ts
- **Severity**: HIGH
- **Matches**: 18
- **Examples**: admin, admin, Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\utils.ts
- **Severity**: HIGH
- **Matches**: 5
- **Examples**: Admin, ADMIN, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\validation\__tests__\component-props.test.ts
- **Severity**: HIGH
- **Matches**: 10
- **Examples**: Test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\validators\story-validators.ts
- **Severity**: HIGH
- **Matches**: 16
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\lib\work-schedule-utils.ts
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\middleware.advanced-security.test.ts
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: test, Test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\middleware.security.test.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\middleware.test.ts
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: ADMIN, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\middleware.test.ts
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\middleware.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\services\action-center.service.ts
- **Severity**: HIGH
- **Matches**: 13
- **Examples**: admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\services\mobile.service.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\services\project.service.test.ts
- **Severity**: HIGH
- **Matches**: 19
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\services\story.service.test.ts
- **Severity**: HIGH
- **Matches**: 26
- **Examples**: test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\services\story.service.ts
- **Severity**: HIGH
- **Matches**: 14
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\stores\userStore.ts
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: Admin, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\test\setup.tsx
- **Severity**: HIGH
- **Matches**: 29
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\types\admin-dashboard.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: Admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\types\conventions.ts
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: teSt, teSt, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\types\entities.ts
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: ADMIN, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\types\entities.ts
- **Severity**: HIGH
- **Matches**: 18
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\types\hr.ts
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: Admin, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\types\hr.ts
- **Severity**: HIGH
- **Matches**: 7
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\types\index.ts
- **Severity**: HIGH
- **Matches**: 7
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\types\jest-dom.d.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\types\schemas.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\types\schemas.ts
- **Severity**: HIGH
- **Matches**: 12
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\types\state.ts
- **Severity**: HIGH
- **Matches**: 9
- **Examples**: teSt, teSt, teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\types\story-management.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: teSt
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\types\__tests__\type-system.test.ts
- **Severity**: HIGH
- **Matches**: 21
- **Examples**: ADMIN, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\types\__tests__\type-system.test.ts
- **Severity**: HIGH
- **Matches**: 58
- **Examples**: test, Test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\types\__tests__\type-system.test.ts
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: 123456, 123456, 123456
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in prisma\seed-robust.ts
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: Password123, Password123, Password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in prisma\seed-robust.ts
- **Severity**: HIGH
- **Matches**: 12
- **Examples**: Admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in prisma\seed-robust.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in prisma\seed-simple.ts
- **Severity**: HIGH
- **Matches**: 3
- **Examples**: Password123, Password123, Password123
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in prisma\seed-simple.ts
- **Severity**: HIGH
- **Matches**: 11
- **Examples**: Admin, admin, admin
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in prisma\seed-simple.ts
- **Severity**: HIGH
- **Matches**: 1
- **Examples**: Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in prisma\seed.ts
- **Severity**: HIGH
- **Matches**: 15
- **Examples**: ADMIN, ADMIN, ADMIN
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in prisma\seed.ts
- **Severity**: HIGH
- **Matches**: 4
- **Examples**: Test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in prisma\seed.ts
- **Severity**: HIGH
- **Matches**: 2
- **Examples**: 123456, 123456
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in prisma\wiki-seed.js
- **Severity**: HIGH
- **Matches**: 6
- **Examples**: admin, admin, admin
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

### weakPasswords in src\e2e\create-story.spec.ts
- **Severity**: HIGH
- **Matches**: 9
- **Examples**: test, test, test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\meetings-flow.test.ts
- **Severity**: HIGH
- **Matches**: 25
- **Examples**: test, test, test
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
- **Matches**: 98
- **Examples**: Test, test, Test
- **Action Required**: HIGH - Fix weak passwords and patterns

### weakPasswords in src\e2e\test-utils.ts
- **Severity**: HIGH
- **Matches**: 18
- **Examples**: test, Test, TEST
- **Action Required**: HIGH - Fix weak passwords and patterns

## 🔧 Medium Priority Issues (0)

## 📝 Low Priority Issues (89)

### consoleStatements in src\app\(main)\meetings\page.tsx
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.warn
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\(main)\page.tsx
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.warn
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\(main)\team\page.tsx
- **Severity**: LOW
- **Matches**: 3
- **Examples**: console.log, console.log, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\action-center\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\action-center\summary\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\action-center\[id]\route.ts
- **Severity**: LOW
- **Matches**: 2
- **Examples**: console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\announcements\route.ts
- **Severity**: LOW
- **Matches**: 2
- **Examples**: console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\announcements\[id]\route.ts
- **Severity**: LOW
- **Matches**: 2
- **Examples**: console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\checklist-templates\route.ts
- **Severity**: LOW
- **Matches**: 8
- **Examples**: console.log, console.log, console.log
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\checklist-templates\[id]\route.ts
- **Severity**: LOW
- **Matches**: 3
- **Examples**: console.error, console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\documents\route.ts
- **Severity**: LOW
- **Matches**: 3
- **Examples**: console.error, console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\documents\[id]\route.ts
- **Severity**: LOW
- **Matches**: 2
- **Examples**: console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\employee-checklists\route.ts
- **Severity**: LOW
- **Matches**: 2
- **Examples**: console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\employee-checklists\[id]\route.ts
- **Severity**: LOW
- **Matches**: 3
- **Examples**: console.error, console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\holidays\route.ts
- **Severity**: LOW
- **Matches**: 2
- **Examples**: console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\holidays\[id]\route.ts
- **Severity**: LOW
- **Matches**: 3
- **Examples**: console.error, console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\security\audit-logs\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\security\brute-force\route.ts
- **Severity**: LOW
- **Matches**: 2
- **Examples**: console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\security\overview\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\tasks-at-risk\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\team-activity\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\team-activity-today\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\team-calendar\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\team-presence-stats\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\team-workload\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\urgent-tasks\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\admin\work-schedules\[userId]\route.ts
- **Severity**: LOW
- **Matches**: 2
- **Examples**: console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\announcements\recent\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\announcements\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\announcements\[id]\read\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\calendar\next-event\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\errors\report\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\meetings\action-items\[actionItemId]\create-task\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\meetings\optimized\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\meetings\route.ts
- **Severity**: LOW
- **Matches**: 36
- **Examples**: console.error, console.log, console.log
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\meetings\[meetingId]\action-items\route.ts
- **Severity**: LOW
- **Matches**: 2
- **Examples**: console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\meetings\[meetingId]\action-items\[actionItemId]\route.ts
- **Severity**: LOW
- **Matches**: 2
- **Examples**: console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\meetings\[meetingId]\route.ts
- **Severity**: LOW
- **Matches**: 3
- **Examples**: console.error, console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\meetings\[meetingId]\talking-points\route.ts
- **Severity**: LOW
- **Matches**: 2
- **Examples**: console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\meetings\[meetingId]\talking-points\[talkingPointId]\route.ts
- **Severity**: LOW
- **Matches**: 2
- **Examples**: console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\profiles\route.ts
- **Severity**: LOW
- **Matches**: 8
- **Examples**: console.log, console.log, console.log
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\profiles\[userId]\route.ts
- **Severity**: LOW
- **Matches**: 2
- **Examples**: console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\requests\route.ts
- **Severity**: LOW
- **Matches**: 4
- **Examples**: console.log, console.log, console.log
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\team-status\whos-out\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\users\assignable\route.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\api\wiki\route.ts
- **Severity**: LOW
- **Matches**: 12
- **Examples**: console.log, console.log, console.log
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\app\showcase\components\ecosystem-section.tsx
- **Severity**: LOW
- **Matches**: 4
- **Examples**: console.log, console.log, console.log
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\components\admin\checklist-templates\ChecklistTemplatesDashboard.tsx
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\components\dashboard\widgets\ActionCenterWidget.tsx
- **Severity**: LOW
- **Matches**: 2
- **Examples**: console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\components\errors\ErrorBoundary.tsx
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\components\features\manager-dashboard\widgets\QuickLinksWidget.tsx
- **Severity**: LOW
- **Matches**: 5
- **Examples**: console.log, console.log, console.log
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\components\landing\ui\DemoForm.tsx
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.log
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\components\meetings\CreateMeetingForm.tsx
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.log
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\components\meetings\MeetingDetails.tsx
- **Severity**: LOW
- **Matches**: 6
- **Examples**: console.error, console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\components\meetings\MeetingsErrorBoundary.tsx
- **Severity**: LOW
- **Matches**: 2
- **Examples**: console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\components\meetings\MeetingWorkspace.tsx
- **Severity**: LOW
- **Matches**: 6
- **Examples**: console.error, console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\components\meetings\SimpleMeetingCard.tsx
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\components\requests\NewRequestForm.tsx
- **Severity**: LOW
- **Matches**: 9
- **Examples**: console.error, console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\components\ui\Button.README.md
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.log
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\components\ui\ErrorBoundary.tsx
- **Severity**: LOW
- **Matches**: 4
- **Examples**: console.error, console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\components\wiki\CreateWikiItem.tsx
- **Severity**: LOW
- **Matches**: 3
- **Examples**: console.log, console.log, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\components\wiki\MarkdownGuide.tsx
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.log
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\components\wiki\WikiContent.tsx
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\components\wiki\WikiSidebar.tsx
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\hooks\useErrorHandling.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.log
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\hooks\useMeetingsErrorHandler.ts
- **Severity**: LOW
- **Matches**: 2
- **Examples**: console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\hooks\useStoryManagement.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.warn
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\hooks\__tests__\useAdminDashboard.test.ts
- **Severity**: LOW
- **Matches**: 4
- **Examples**: console.error, console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\hooks\__tests__\useStoryManagement.test.ts
- **Severity**: LOW
- **Matches**: 4
- **Examples**: console.error, console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\hooks\__tests__\useUpdateTaskStatus.test.ts
- **Severity**: LOW
- **Matches**: 4
- **Examples**: console.error, console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\lib\advanced-security.ts
- **Severity**: LOW
- **Matches**: 6
- **Examples**: console.warn, console.log, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\lib\client-error-recovery.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.warn
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\lib\client-error-reporting.ts
- **Severity**: LOW
- **Matches**: 10
- **Examples**: console.error, console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\lib\cloudinary.ts
- **Severity**: LOW
- **Matches**: 2
- **Examples**: console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\lib\errors\error-handler.ts
- **Severity**: LOW
- **Matches**: 5
- **Examples**: console.error, console.error, console.warn
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\lib\errors\error-middleware.ts
- **Severity**: LOW
- **Matches**: 6
- **Examples**: console.error, console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\lib\jalali-localizer.ts
- **Severity**: LOW
- **Matches**: 25
- **Examples**: console.warn, console.warn, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\lib\logger.ts
- **Severity**: LOW
- **Matches**: 5
- **Examples**: console.error, console.warn, console.warn
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\lib\performance\simple-monitor.ts
- **Severity**: LOW
- **Matches**: 5
- **Examples**: console.warn, console.warn, console.warn
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\lib\persian-date-utils.ts
- **Severity**: LOW
- **Matches**: 5
- **Examples**: console.error, console.error, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\lib\prisma.ts
- **Severity**: LOW
- **Matches**: 14
- **Examples**: console.log, console.log, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\lib\security.ts
- **Severity**: LOW
- **Matches**: 2
- **Examples**: console.warn, console.log
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\lib\standard-localizer.ts
- **Severity**: LOW
- **Matches**: 4
- **Examples**: console.warn, console.warn, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\lib\validation\component-props.ts
- **Severity**: LOW
- **Matches**: 1
- **Examples**: console.warn
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in src\stores\wiki.store.ts
- **Severity**: LOW
- **Matches**: 19
- **Examples**: console.log, console.log, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in prisma\seed-robust.ts
- **Severity**: LOW
- **Matches**: 16
- **Examples**: console.log, console.log, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in prisma\seed-simple.ts
- **Severity**: LOW
- **Matches**: 14
- **Examples**: console.log, console.log, console.error
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in prisma\seed.ts
- **Severity**: LOW
- **Matches**: 52
- **Examples**: console.log, console.log, console.log
- **Action Required**: LOW - Consider fixing for production

### consoleStatements in prisma\wiki-seed.js
- **Severity**: LOW
- **Matches**: 6
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

### src\app\(auth)\login\page.tsx
- **environmentVariables** (INFO): 1 matches

### src\app\(main)\action-center\page.tsx
- **weakPasswords** (HIGH): 4 matches

### src\app\(main)\admin\announcements\page.tsx
- **weakPasswords** (HIGH): 12 matches
- **weakPasswords** (HIGH): 3 matches

### src\app\(main)\admin\attendance\page.tsx
- **weakPasswords** (HIGH): 9 matches

### src\app\(main)\admin\checklist-templates\page.tsx
- **weakPasswords** (HIGH): 5 matches

### src\app\(main)\admin\holidays\page.tsx
- **weakPasswords** (HIGH): 5 matches

### src\app\(main)\admin\leave-requests\page.tsx
- **weakPasswords** (HIGH): 9 matches

### src\app\(main)\admin\users\page.tsx
- **weakPasswords** (HIGH): 6 matches

### src\app\(main)\content-calendar\page.test.tsx
- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 7 matches

### src\app\(main)\content-calendar\page.tsx
- **weakPasswords** (HIGH): 2 matches

### src\app\(main)\login\page.test.tsx
- **hardcodedPasswords** (CRITICAL): 2 matches
- **hardcodedPasswords** (CRITICAL): 2 matches
- **weakPasswords** (HIGH): 10 matches
- **weakPasswords** (HIGH): 17 matches

### src\app\(main)\meetings\new\page.tsx
- **weakPasswords** (HIGH): 3 matches

### src\app\(main)\meetings\page.tsx
- **weakPasswords** (HIGH): 4 matches
- **weakPasswords** (HIGH): 7 matches
- **consoleStatements** (LOW): 1 matches

### src\app\(main)\meetings\[meetingId]\page.tsx
- **weakPasswords** (HIGH): 5 matches

### src\app\(main)\page.tsx
- **weakPasswords** (HIGH): 4 matches
- **consoleStatements** (LOW): 1 matches

### src\app\(main)\profile\[userId]\page.tsx
- **weakPasswords** (HIGH): 5 matches

### src\app\(main)\projects\page.test.tsx
- **weakPasswords** (HIGH): 2 matches
- **weakPasswords** (HIGH): 14 matches

### src\app\(main)\projects\page.tsx
- **weakPasswords** (HIGH): 2 matches

### src\app\(main)\projects\[projectId]\board\page.tsx
- **weakPasswords** (HIGH): 1 matches

### src\app\(main)\storyboard\page.test.tsx
- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 12 matches

### src\app\(main)\storyboard\page.tsx
- **weakPasswords** (HIGH): 1 matches

### src\app\(main)\tasks\page.tsx
- **weakPasswords** (HIGH): 1 matches

### src\app\(main)\team\page.tsx
- **weakPasswords** (HIGH): 2 matches
- **consoleStatements** (LOW): 3 matches

### src\app\(main)\team-calendar\page.tsx
- **weakPasswords** (HIGH): 4 matches

### src\app\admin\storyboard\page.tsx
- **weakPasswords** (HIGH): 3 matches

### src\app\api\admin\action-center\route.ts
- **weakPasswords** (HIGH): 6 matches
- **consoleStatements** (LOW): 1 matches

### src\app\api\admin\action-center\summary\route.ts
- **weakPasswords** (HIGH): 1 matches
- **consoleStatements** (LOW): 1 matches

### src\app\api\admin\action-center\[id]\route.ts
- **weakPasswords** (HIGH): 6 matches
- **consoleStatements** (LOW): 2 matches

### src\app\api\admin\announcements\route.ts
- **weakPasswords** (HIGH): 5 matches
- **consoleStatements** (LOW): 2 matches

### src\app\api\admin\announcements\[id]\route.ts
- **weakPasswords** (HIGH): 4 matches
- **consoleStatements** (LOW): 2 matches

### src\app\api\admin\attendance\route.ts
- **weakPasswords** (HIGH): 6 matches

### src\app\api\admin\attendance\stats\route.test.ts
- **weakPasswords** (HIGH): 13 matches
- **weakPasswords** (HIGH): 1 matches

### src\app\api\admin\attendance\stats\route.ts
- **weakPasswords** (HIGH): 6 matches

### src\app\api\admin\attendance\[id]\route.ts
- **weakPasswords** (HIGH): 10 matches

### src\app\api\admin\checklist-templates\route.ts
- **weakPasswords** (HIGH): 15 matches
- **consoleStatements** (LOW): 8 matches
- **environmentVariables** (INFO): 1 matches

### src\app\api\admin\checklist-templates\[id]\route.ts
- **weakPasswords** (HIGH): 10 matches
- **consoleStatements** (LOW): 3 matches

### src\app\api\admin\documents\route.ts
- **weakPasswords** (HIGH): 8 matches
- **consoleStatements** (LOW): 3 matches
- **environmentVariables** (INFO): 2 matches

### src\app\api\admin\documents\[id]\route.ts
- **weakPasswords** (HIGH): 3 matches
- **consoleStatements** (LOW): 2 matches

### src\app\api\admin\employee-checklists\route.ts
- **weakPasswords** (HIGH): 11 matches
- **consoleStatements** (LOW): 2 matches

### src\app\api\admin\employee-checklists\[id]\route.ts
- **weakPasswords** (HIGH): 8 matches
- **consoleStatements** (LOW): 3 matches

### src\app\api\admin\holidays\route.ts
- **weakPasswords** (HIGH): 6 matches
- **consoleStatements** (LOW): 2 matches

### src\app\api\admin\holidays\[id]\route.ts
- **weakPasswords** (HIGH): 9 matches
- **consoleStatements** (LOW): 3 matches

### src\app\api\admin\leave-requests\route.ts
- **weakPasswords** (HIGH): 6 matches

### src\app\api\admin\leave-requests\[id]\route.ts
- **weakPasswords** (HIGH): 10 matches

### src\app\api\admin\security\audit-logs\route.ts
- **weakPasswords** (HIGH): 2 matches
- **consoleStatements** (LOW): 1 matches

### src\app\api\admin\security\brute-force\route.ts
- **weakPasswords** (HIGH): 6 matches
- **consoleStatements** (LOW): 2 matches

### src\app\api\admin\security\overview\route.ts
- **weakPasswords** (HIGH): 3 matches
- **consoleStatements** (LOW): 1 matches

### src\app\api\admin\tasks-at-risk\route.ts
- **weakPasswords** (HIGH): 1 matches
- **consoleStatements** (LOW): 1 matches

### src\app\api\admin\team-activity\route.ts
- **weakPasswords** (HIGH): 1 matches
- **consoleStatements** (LOW): 1 matches

### src\app\api\admin\team-activity-today\route.ts
- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 7 matches
- **consoleStatements** (LOW): 1 matches

### src\app\api\admin\team-calendar\route.ts
- **weakPasswords** (HIGH): 4 matches
- **weakPasswords** (HIGH): 2 matches
- **consoleStatements** (LOW): 1 matches

### src\app\api\admin\team-presence-stats\route.ts
- **weakPasswords** (HIGH): 5 matches
- **consoleStatements** (LOW): 1 matches

### src\app\api\admin\team-workload\route.ts
- **weakPasswords** (HIGH): 1 matches
- **consoleStatements** (LOW): 1 matches

### src\app\api\admin\urgent-tasks\route.ts
- **weakPasswords** (HIGH): 2 matches
- **consoleStatements** (LOW): 1 matches

### src\app\api\admin\work-schedules\[userId]\route.ts
- **weakPasswords** (HIGH): 6 matches
- **consoleStatements** (LOW): 2 matches

### src\app\api\announcements\recent\route.ts
- **consoleStatements** (LOW): 1 matches

### src\app\api\announcements\route.ts
- **consoleStatements** (LOW): 1 matches

### src\app\api\announcements\[id]\read\route.ts
- **consoleStatements** (LOW): 1 matches

### src\app\api\attendance\route.test.ts
- **weakPasswords** (HIGH): 4 matches

### src\app\api\attendance\route.ts
- **weakPasswords** (HIGH): 8 matches

### src\app\api\attendance\stats\route.test.ts
- **weakPasswords** (HIGH): 2 matches

### src\app\api\calendar\next-event\route.ts
- **weakPasswords** (HIGH): 1 matches
- **consoleStatements** (LOW): 1 matches

### src\app\api\content-slots\route.test.ts
- **weakPasswords** (HIGH): 10 matches

### src\app\api\debug\route.ts
- **weakPasswords** (HIGH): 3 matches
- **environmentVariables** (INFO): 8 matches

### src\app\api\errors\report\route.ts
- **consoleStatements** (LOW): 1 matches

### src\app\api\health\route.ts
- **weakPasswords** (HIGH): 1 matches

### src\app\api\instapulse\pages\route.ts
- **weakPasswords** (HIGH): 1 matches

### src\app\api\instapulse\save-result\route.ts
- **environmentVariables** (INFO): 2 matches

### src\app\api\leave-requests\route.test.ts
- **weakPasswords** (HIGH): 1 matches

### src\app\api\leave-requests\route.ts
- **weakPasswords** (HIGH): 1 matches

### src\app\api\logs\route.ts
- **environmentVariables** (INFO): 1 matches

### src\app\api\meetings\action-items\[actionItemId]\create-task\route.ts
- **weakPasswords** (HIGH): 1 matches
- **consoleStatements** (LOW): 1 matches

### src\app\api\meetings\optimized\route.ts
- **weakPasswords** (HIGH): 1 matches
- **consoleStatements** (LOW): 1 matches
- **environmentVariables** (INFO): 1 matches

### src\app\api\meetings\route.ts
- **weakPasswords** (HIGH): 2 matches
- **weakPasswords** (HIGH): 1 matches
- **consoleStatements** (LOW): 36 matches
- **environmentVariables** (INFO): 1 matches

### src\app\api\meetings\[meetingId]\action-items\route.ts
- **weakPasswords** (HIGH): 2 matches
- **consoleStatements** (LOW): 2 matches

### src\app\api\meetings\[meetingId]\action-items\[actionItemId]\route.ts
- **weakPasswords** (HIGH): 2 matches
- **consoleStatements** (LOW): 2 matches

### src\app\api\meetings\[meetingId]\route.ts
- **weakPasswords** (HIGH): 3 matches
- **consoleStatements** (LOW): 3 matches

### src\app\api\meetings\[meetingId]\talking-points\route.ts
- **weakPasswords** (HIGH): 2 matches
- **consoleStatements** (LOW): 2 matches

### src\app\api\meetings\[meetingId]\talking-points\[talkingPointId]\route.ts
- **weakPasswords** (HIGH): 2 matches
- **consoleStatements** (LOW): 2 matches

### src\app\api\profiles\route.ts
- **weakPasswords** (HIGH): 3 matches
- **consoleStatements** (LOW): 8 matches
- **environmentVariables** (INFO): 1 matches

### src\app\api\profiles\[userId]\route.ts
- **weakPasswords** (HIGH): 4 matches
- **consoleStatements** (LOW): 2 matches

### src\app\api\projects\route.test.ts
- **weakPasswords** (HIGH): 2 matches
- **weakPasswords** (HIGH): 11 matches

### src\app\api\projects\route.ts
- **weakPasswords** (HIGH): 4 matches

### src\app\api\projects\[projectId]\route.ts
- **weakPasswords** (HIGH): 2 matches

### src\app\api\requests\route.ts
- **weakPasswords** (HIGH): 1 matches
- **consoleStatements** (LOW): 4 matches

### src\app\api\seed\route.ts
- **hardcodedPasswords** (CRITICAL): 10 matches
- **weakPasswords** (HIGH): 18 matches
- **weakPasswords** (HIGH): 2 matches

### src\app\api\stories\route.test.ts
- **weakPasswords** (HIGH): 45 matches

### src\app\api\stories\route.ts
- **weakPasswords** (HIGH): 14 matches

### src\app\api\stories\[storyId]\route.test.ts
- **weakPasswords** (HIGH): 49 matches

### src\app\api\stories\[storyId]\route.ts
- **weakPasswords** (HIGH): 2 matches

### src\app\api\story-types\route.test.ts
- **weakPasswords** (HIGH): 4 matches
- **weakPasswords** (HIGH): 1 matches

### src\app\api\tasks\route.test.ts
- **weakPasswords** (HIGH): 22 matches

### src\app\api\tasks\route.ts
- **weakPasswords** (HIGH): 2 matches

### src\app\api\tasks\[taskId]\route.ts
- **weakPasswords** (HIGH): 7 matches

### src\app\api\team-status\whos-out\route.ts
- **weakPasswords** (HIGH): 1 matches
- **consoleStatements** (LOW): 1 matches

### src\app\api\users\assignable\route.ts
- **consoleStatements** (LOW): 1 matches
- **environmentVariables** (INFO): 1 matches

### src\app\api\users\route.test.ts
- **hardcodedPasswords** (CRITICAL): 2 matches
- **hardcodedPasswords** (CRITICAL): 2 matches
- **weakPasswords** (HIGH): 2 matches
- **weakPasswords** (HIGH): 3 matches
- **weakPasswords** (HIGH): 1 matches

### src\app\api\users\route.ts
- **hardcodedPasswords** (CRITICAL): 2 matches
- **weakPasswords** (HIGH): 6 matches

### src\app\api\wiki\reorder\route.ts
- **weakPasswords** (HIGH): 4 matches

### src\app\api\wiki\route.test.ts
- **hardcodedPasswords** (CRITICAL): 1 matches
- **hardcodedPasswords** (CRITICAL): 1 matches
- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 8 matches

### src\app\api\wiki\route.ts
- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 1 matches
- **consoleStatements** (LOW): 12 matches

### src\app\api\wiki\upload\route.ts
- **weakPasswords** (HIGH): 4 matches

### src\app\api\wiki\[documentId]\route.ts
- **weakPasswords** (HIGH): 10 matches

### src\app\docs\[slug]\page.tsx
- **weakPasswords** (HIGH): 2 matches

### src\app\pitch\page.tsx
- **weakPasswords** (HIGH): 4 matches

### src\app\providers.test.tsx
- **weakPasswords** (HIGH): 68 matches

### src\app\showcase\components\documentation-section.tsx
- **weakPasswords** (HIGH): 12 matches

### src\app\showcase\components\ecosystem-section.tsx
- **weakPasswords** (HIGH): 5 matches
- **consoleStatements** (LOW): 4 matches

### src\app\showcase\components\hero-section.tsx
- **weakPasswords** (HIGH): 7 matches

### src\auth-local.ts
- **hardcodedPasswords** (CRITICAL): 2 matches
- **environmentVariables** (INFO): 1 matches

### src\auth.integration.test.ts
- **hardcodedPasswords** (CRITICAL): 2 matches
- **hardcodedPasswords** (CRITICAL): 9 matches
- **weakPasswords** (HIGH): 3 matches
- **weakPasswords** (HIGH): 3 matches
- **weakPasswords** (HIGH): 11 matches
- **environmentVariables** (INFO): 3 matches

### src\auth.test.ts
- **hardcodedPasswords** (CRITICAL): 2 matches
- **hardcodedPasswords** (CRITICAL): 8 matches
- **hardcodedSecrets** (CRITICAL): 1 matches
- **weakPasswords** (HIGH): 3 matches
- **weakPasswords** (HIGH): 2 matches
- **weakPasswords** (HIGH): 11 matches
- **environmentVariables** (INFO): 3 matches

### src\auth.ts
- **hardcodedPasswords** (CRITICAL): 2 matches
- **environmentVariables** (INFO): 22 matches

### src\components\admin\action-center\ActionCenterDashboard.tsx
- **weakPasswords** (HIGH): 2 matches
- **weakPasswords** (HIGH): 3 matches

### src\components\admin\announcements\CreateAnnouncementModal.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\admin\announcements\EditAnnouncementModal.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\admin\attendance\AdminAttendanceDashboard.tsx
- **weakPasswords** (HIGH): 3 matches

### src\components\admin\attendance\AttendanceLogTable.tsx
- **weakPasswords** (HIGH): 5 matches
- **weakPasswords** (HIGH): 5 matches

### src\components\admin\attendance\DeleteAttendanceModal.tsx
- **weakPasswords** (HIGH): 5 matches

### src\components\admin\attendance\EditAttendanceModal.tsx
- **weakPasswords** (HIGH): 3 matches
- **weakPasswords** (HIGH): 5 matches

### src\components\admin\attendance\WorkScheduleManagement.tsx
- **hardcodedSecrets** (CRITICAL): 7 matches
- **weakPasswords** (HIGH): 2 matches

### src\components\admin\checklist-templates\ChecklistTemplateDetails.tsx
- **weakPasswords** (HIGH): 6 matches
- **weakPasswords** (HIGH): 1 matches

### src\components\admin\checklist-templates\ChecklistTemplateForm.tsx
- **weakPasswords** (HIGH): 7 matches

### src\components\admin\checklist-templates\ChecklistTemplatesDashboard.tsx
- **weakPasswords** (HIGH): 4 matches
- **weakPasswords** (HIGH): 1 matches
- **consoleStatements** (LOW): 1 matches

### src\components\admin\CreateUserForm.tsx
- **hardcodedPasswords** (CRITICAL): 1 matches
- **hardcodedPasswords** (CRITICAL): 2 matches
- **weakPasswords** (HIGH): 6 matches

### src\components\admin\dashboard\CompanyStatsWidget.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\admin\dashboard\DashboardLayout.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\admin\dashboard\HeroHeader.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\admin\dashboard\NavigationCardsWidget.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\admin\dashboard\WidgetGrid.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\admin\holidays\HolidayManagement.tsx
- **weakPasswords** (HIGH): 4 matches
- **weakPasswords** (HIGH): 7 matches

### src\components\admin\leave\AdminLeaveManagement.tsx
- **weakPasswords** (HIGH): 3 matches
- **weakPasswords** (HIGH): 3 matches

### src\components\admin\leave\ApproveLeaveModal.tsx
- **weakPasswords** (HIGH): 2 matches
- **weakPasswords** (HIGH): 3 matches

### src\components\admin\leave\RejectLeaveModal.tsx
- **weakPasswords** (HIGH): 2 matches
- **weakPasswords** (HIGH): 3 matches

### src\components\admin\SecurityDashboard.tsx
- **weakPasswords** (HIGH): 4 matches

### src\components\admin\StoryIdeaManager.tsx
- **weakPasswords** (HIGH): 6 matches

### src\components\admin\StoryTypeManager.tsx
- **weakPasswords** (HIGH): 5 matches

### src\components\admin\team-calendar\CapacityForecastWidget.tsx
- **weakPasswords** (HIGH): 3 matches

### src\components\admin\team-calendar\TeamCalendarDashboard.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\admin\UsersTable.tsx
- **weakPasswords** (HIGH): 6 matches
- **weakPasswords** (HIGH): 5 matches

### src\components\admin\UsersTableOptimized.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\announcements\AnnouncementCard.tsx
- **weakPasswords** (HIGH): 8 matches

### src\components\announcements\CreateAnnouncementModal.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\attendance\AttendanceHistory.tsx
- **weakPasswords** (HIGH): 5 matches

### src\components\attendance\DesktopAttendanceView.tsx
- **weakPasswords** (HIGH): 3 matches

### src\components\dashboard\ActivityChart.tsx
- **hardcodedSecrets** (CRITICAL): 2 matches

### src\components\dashboard\AnnouncementsWidget.tsx
- **weakPasswords** (HIGH): 6 matches

### src\components\dashboard\index.ts
- **weakPasswords** (HIGH): 2 matches

### src\components\dashboard\mobile\MobileClockInCard.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\dashboard\MobileAttendanceHistory.tsx
- **weakPasswords** (HIGH): 3 matches

### src\components\dashboard\MobileClockInCard.tsx
- **hardcodedSecrets** (CRITICAL): 2 matches

### src\components\dashboard\MobileDashboard.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\dashboard\MyLatestTask.tsx
- **weakPasswords** (HIGH): 7 matches

### src\components\dashboard\widgets\ActionCenterWidget.tsx
- **weakPasswords** (HIGH): 7 matches
- **weakPasswords** (HIGH): 3 matches
- **consoleStatements** (LOW): 2 matches

### src\components\dashboard\widgets\AnnouncementsWidget.tsx
- **weakPasswords** (HIGH): 5 matches

### src\components\dashboard\widgets\AttendanceClockWidget.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\dashboard\widgets\MyActiveProjectsWidget.tsx
- **weakPasswords** (HIGH): 3 matches

### src\components\dashboard\widgets\MyRequestsWidget.tsx
- **weakPasswords** (HIGH): 3 matches

### src\components\dashboard\widgets\MyTasksWidget.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\dashboard\widgets\NextUpWidget.tsx
- **weakPasswords** (HIGH): 5 matches

### src\components\dashboard\widgets\ProjectHealthOverview.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\dashboard\widgets\ProjectHealthWidget.tsx
- **weakPasswords** (HIGH): 3 matches

### src\components\dashboard\widgets\QuickActionsWidget.tsx
- **weakPasswords** (HIGH): 2 matches

### src\components\dashboard\widgets\TasksAtRiskWidget.tsx
- **weakPasswords** (HIGH): 3 matches
- **weakPasswords** (HIGH): 5 matches

### src\components\dashboard\widgets\TeamActivityWidget.tsx
- **weakPasswords** (HIGH): 3 matches
- **weakPasswords** (HIGH): 2 matches

### src\components\dashboard\widgets\TeamPresenceWidget.tsx
- **weakPasswords** (HIGH): 3 matches

### src\components\dashboard\widgets\TeamWorkloadWidget.tsx
- **weakPasswords** (HIGH): 3 matches

### src\components\dashboard\widgets\TodaysFocusWidget.tsx
- **weakPasswords** (HIGH): 2 matches

### src\components\dashboard\widgets\WhosOutWidget.tsx
- **weakPasswords** (HIGH): 3 matches

### src\components\error\ErrorBoundary.tsx
- **environmentVariables** (INFO): 2 matches

### src\components\errors\ErrorBoundary.test.tsx
- **weakPasswords** (HIGH): 13 matches
- **environmentVariables** (INFO): 6 matches

### src\components\errors\ErrorBoundary.tsx
- **consoleStatements** (LOW): 1 matches
- **environmentVariables** (INFO): 1 matches

### src\components\features\manager-dashboard\widgets\QuickLinksWidget.tsx
- **consoleStatements** (LOW): 5 matches

### src\components\hr\RoleBadge.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\instapulse\reel-card.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\landing\layout\LandingHeader.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\landing\sections\FooterSection.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\landing\sections\index.ts
- **weakPasswords** (HIGH): 2 matches

### src\components\landing\sections\TestimonialsSection.tsx
- **weakPasswords** (HIGH): 10 matches

### src\components\landing\ui\DemoForm.tsx
- **weakPasswords** (HIGH): 1 matches
- **consoleStatements** (LOW): 1 matches

### src\components\landing\ui\TestimonialCard.tsx
- **weakPasswords** (HIGH): 3 matches

### src\components\layout\EnhancedMobileBottomNavigation.tsx
- **hardcodedSecrets** (CRITICAL): 2 matches

### src\components\layout\FloatingActionButton.tsx
- **hardcodedSecrets** (CRITICAL): 2 matches

### src\components\layout\Header.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\layout\Sidebar.tsx
- **hardcodedSecrets** (CRITICAL): 1 matches
- **weakPasswords** (HIGH): 10 matches

### src\components\lazy\AdminComponents.tsx
- **weakPasswords** (HIGH): 2 matches

### src\components\lazy\index.ts
- **weakPasswords** (HIGH): 1 matches

### src\components\leave\MyLeaveRequestsTable.tsx
- **weakPasswords** (HIGH): 5 matches

### src\components\meetings\CreateMeetingForm.tsx
- **weakPasswords** (HIGH): 1 matches
- **consoleStatements** (LOW): 1 matches

### src\components\meetings\MeetingDetails.tsx
- **weakPasswords** (HIGH): 5 matches
- **consoleStatements** (LOW): 6 matches

### src\components\meetings\MeetingsErrorBoundary.tsx
- **consoleStatements** (LOW): 2 matches
- **environmentVariables** (INFO): 2 matches

### src\components\meetings\MeetingWorkspace.tsx
- **consoleStatements** (LOW): 6 matches

### src\components\meetings\SimpleMeetingCard.tsx
- **consoleStatements** (LOW): 1 matches

### src\components\MobileDashboard.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\profile\ChecklistDetails.tsx
- **weakPasswords** (HIGH): 6 matches
- **weakPasswords** (HIGH): 3 matches

### src\components\profile\ProfileChecklists.tsx
- **weakPasswords** (HIGH): 6 matches
- **weakPasswords** (HIGH): 6 matches

### src\components\profile\ProfileDetails.tsx
- **weakPasswords** (HIGH): 3 matches

### src\components\profile\ProfileDocuments.tsx
- **weakPasswords** (HIGH): 3 matches
- **weakPasswords** (HIGH): 1 matches

### src\components\profile\ProfileHRInfo.tsx
- **weakPasswords** (HIGH): 5 matches

### src\components\profile\ProfileOverview.tsx
- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 3 matches

### src\components\profile\ProfileTasksProjects.tsx
- **weakPasswords** (HIGH): 3 matches

### src\components\projects\CreateProject.test.tsx
- **weakPasswords** (HIGH): 3 matches
- **weakPasswords** (HIGH): 9 matches

### src\components\projects\CreateProject.tsx
- **weakPasswords** (HIGH): 2 matches

### src\components\projects\MobileCreateProject.tsx
- **weakPasswords** (HIGH): 2 matches

### src\components\projects\MobileProjectsList.tsx
- **hardcodedSecrets** (CRITICAL): 5 matches
- **weakPasswords** (HIGH): 2 matches

### src\components\requests\NewRequestForm.tsx
- **consoleStatements** (LOW): 9 matches

### src\components\requests\UserRequestsList.tsx
- **weakPasswords** (HIGH): 3 matches

### src\components\storyboard\CreateStoryDialog.test.tsx
- **weakPasswords** (HIGH): 94 matches

### src\components\storyboard\CreateStoryDialog.tsx
- **weakPasswords** (HIGH): 3 matches

### src\components\storyboard\IdeaBank.tsx
- **hardcodedSecrets** (CRITICAL): 2 matches

### src\components\storyboard\management\CreateStoryDialog.tsx
- **weakPasswords** (HIGH): 7 matches

### src\components\storyboard\management\index.ts
- **weakPasswords** (HIGH): 2 matches

### src\components\storyboard\StoryCard.test.tsx
- **weakPasswords** (HIGH): 26 matches

### src\components\storyboard\StoryManagement.tsx
- **weakPasswords** (HIGH): 3 matches

### src\components\storyboard\StorySlot.test.tsx
- **weakPasswords** (HIGH): 11 matches

### src\components\storyboard\StoryTypeManager.test.tsx
- **weakPasswords** (HIGH): 5 matches
- **weakPasswords** (HIGH): 9 matches

### src\components\storyboard\StoryTypeManager.tsx
- **weakPasswords** (HIGH): 8 matches
- **weakPasswords** (HIGH): 9 matches

### src\components\tasks\mobile\MobileTasksList.tsx
- **weakPasswords** (HIGH): 2 matches

### src\components\tasks\MobileTaskDetail.tsx
- **weakPasswords** (HIGH): 3 matches

### src\components\tasks\MobileTaskList.tsx
- **weakPasswords** (HIGH): 3 matches

### src\components\ui\button\Button.test.tsx
- **weakPasswords** (HIGH): 2 matches

### src\components\ui\Button.README.md
- **weakPasswords** (HIGH): 6 matches
- **consoleStatements** (LOW): 1 matches

### src\components\ui\calendar.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\ui\ErrorBoundary.tsx
- **consoleStatements** (LOW): 4 matches
- **environmentVariables** (INFO): 1 matches

### src\components\ui\offline-indicator.tsx
- **weakPasswords** (HIGH): 8 matches

### src\components\ui\PWARegistration.tsx
- **weakPasswords** (HIGH): 1 matches

### src\components\wiki\CreateWikiItem.tsx
- **consoleStatements** (LOW): 3 matches

### src\components\wiki\MarkdownGuide.tsx
- **consoleStatements** (LOW): 1 matches

### src\components\wiki\WikiContent.tsx
- **consoleStatements** (LOW): 1 matches

### src\components\wiki\WikiSidebar.tsx
- **consoleStatements** (LOW): 1 matches

### src\components\__tests__\Accessibility.test.tsx
- **weakPasswords** (HIGH): 16 matches

### src\components\__tests__\AdminDashboard.test.tsx
- **weakPasswords** (HIGH): 19 matches
- **weakPasswords** (HIGH): 49 matches

### src\components\__tests__\LoginForm.test.tsx
- **hardcodedPasswords** (CRITICAL): 1 matches
- **hardcodedPasswords** (CRITICAL): 1 matches
- **weakPasswords** (HIGH): 6 matches
- **weakPasswords** (HIGH): 12 matches

### src\components\__tests__\RealTimeCollaboration.test.tsx
- **hardcodedSecrets** (CRITICAL): 1 matches
- **weakPasswords** (HIGH): 9 matches

### src\components\__tests__\StoryManagement.test.tsx
- **weakPasswords** (HIGH): 26 matches

### src\contexts\ErrorContext.test.tsx
- **weakPasswords** (HIGH): 41 matches

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

### src\e2e\create-story.spec.ts
- **weakPasswords** (HIGH): 9 matches

### src\e2e\meetings-flow.test.ts
- **weakPasswords** (HIGH): 25 matches

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
- **weakPasswords** (HIGH): 98 matches
- **environmentVariables** (INFO): 3 matches

### src\e2e\test-utils.ts
- **hardcodedPasswords** (CRITICAL): 1 matches
- **hardcodedPasswords** (CRITICAL): 2 matches
- **weakPasswords** (HIGH): 18 matches

### src\hooks\useAdminDashboard.ts
- **weakPasswords** (HIGH): 6 matches

### src\hooks\useAnimationPerformance.ts
- **weakPasswords** (HIGH): 1 matches

### src\hooks\useAuth.ts
- **hardcodedPasswords** (CRITICAL): 2 matches

### src\hooks\useCompanyStats.ts
- **weakPasswords** (HIGH): 1 matches

### src\hooks\useErrorHandling.test.tsx
- **weakPasswords** (HIGH): 47 matches

### src\hooks\useErrorHandling.ts
- **consoleStatements** (LOW): 1 matches

### src\hooks\useHR.ts
- **weakPasswords** (HIGH): 32 matches

### src\hooks\useMeetingsErrorHandler.ts
- **consoleStatements** (LOW): 2 matches
- **environmentVariables** (INFO): 1 matches

### src\hooks\useRealtimeCollab.ts
- **environmentVariables** (INFO): 1 matches

### src\hooks\useReducedMotion.ts
- **weakPasswords** (HIGH): 1 matches

### src\hooks\useSlotManagement.ts
- **weakPasswords** (HIGH): 3 matches

### src\hooks\useStoryboardData.ts
- **weakPasswords** (HIGH): 3 matches

### src\hooks\useStoryboardOperations.ts
- **weakPasswords** (HIGH): 26 matches

### src\hooks\useStoryboardOperationsNew.ts
- **weakPasswords** (HIGH): 16 matches

### src\hooks\useStoryManagement.ts
- **weakPasswords** (HIGH): 16 matches
- **consoleStatements** (LOW): 1 matches

### src\hooks\useStoryMutations.ts
- **weakPasswords** (HIGH): 33 matches

### src\hooks\useTeamActivity.ts
- **weakPasswords** (HIGH): 1 matches

### src\hooks\__tests__\useAdminDashboard.test.ts
- **weakPasswords** (HIGH): 13 matches
- **weakPasswords** (HIGH): 7 matches
- **consoleStatements** (LOW): 4 matches

### src\hooks\__tests__\useRealtimeCollab.test.ts
- **weakPasswords** (HIGH): 19 matches

### src\hooks\__tests__\useStoryManagement.test.ts
- **weakPasswords** (HIGH): 18 matches
- **consoleStatements** (LOW): 4 matches

### src\hooks\__tests__\useUpdateTaskStatus.test.ts
- **weakPasswords** (HIGH): 10 matches
- **consoleStatements** (LOW): 4 matches

### src\lib\accessibility-utils.ts
- **weakPasswords** (HIGH): 4 matches

### src\lib\advanced-security.test.ts
- **weakPasswords** (HIGH): 11 matches

### src\lib\advanced-security.ts
- **hardcodedSecrets** (CRITICAL): 1 matches
- **consoleStatements** (LOW): 6 matches
- **environmentVariables** (INFO): 2 matches

### src\lib\attendance-utils.ts
- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 4 matches

### src\lib\auth\authorization.ts
- **weakPasswords** (HIGH): 11 matches

### src\lib\auth-utils.test.ts
- **weakPasswords** (HIGH): 69 matches
- **weakPasswords** (HIGH): 2 matches

### src\lib\auth-utils.ts
- **weakPasswords** (HIGH): 14 matches

### src\lib\cache-manager.test.ts
- **weakPasswords** (HIGH): 1 matches

### src\lib\client-error-recovery.test.ts
- **weakPasswords** (HIGH): 16 matches

### src\lib\client-error-recovery.ts
- **consoleStatements** (LOW): 1 matches

### src\lib\client-error-reporting.ts
- **consoleStatements** (LOW): 10 matches

### src\lib\cloudinary.ts
- **consoleStatements** (LOW): 2 matches
- **environmentVariables** (INFO): 5 matches

### src\lib\config\constants.js
- **hardcodedPasswords** (CRITICAL): 4 matches
- **hardcodedPasswords** (CRITICAL): 8 matches
- **weakPasswords** (HIGH): 14 matches
- **weakPasswords** (HIGH): 11 matches

### src\lib\config\constants.ts
- **hardcodedPasswords** (CRITICAL): 4 matches
- **hardcodedPasswords** (CRITICAL): 8 matches
- **weakPasswords** (HIGH): 11 matches
- **weakPasswords** (HIGH): 8 matches

### src\lib\config\env.ts
- **hardcodedPasswords** (CRITICAL): 1 matches
- **hardcodedPasswords** (CRITICAL): 16 matches
- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 18 matches
- **weakPasswords** (HIGH): 26 matches
- **weakPasswords** (HIGH): 1 matches
- **environmentVariables** (INFO): 7 matches

### src\lib\config\logging.ts
- **weakPasswords** (HIGH): 4 matches
- **environmentVariables** (INFO): 2 matches

### src\lib\database\cache-manager.ts
- **hardcodedSecrets** (CRITICAL): 4 matches
- **weakPasswords** (HIGH): 7 matches

### src\lib\database\pagination.ts
- **weakPasswords** (HIGH): 1 matches

### src\lib\database\__tests__\pagination.test.ts
- **weakPasswords** (HIGH): 15 matches

### src\lib\date-utils.test.ts
- **weakPasswords** (HIGH): 3 matches

### src\lib\db-connection.js
- **hardcodedPasswords** (CRITICAL): 1 matches
- **environmentVariables** (INFO): 6 matches

### src\lib\error-handler.ts
- **hardcodedSecrets** (CRITICAL): 2 matches

### src\lib\errors\error-handler.ts
- **hardcodedPasswords** (CRITICAL): 2 matches
- **consoleStatements** (LOW): 5 matches
- **environmentVariables** (INFO): 2 matches

### src\lib\errors\error-handling.test.ts
- **hardcodedPasswords** (CRITICAL): 2 matches
- **hardcodedPasswords** (CRITICAL): 6 matches
- **hardcodedSecrets** (CRITICAL): 1 matches
- **hardcodedSecrets** (CRITICAL): 1 matches
- **weakPasswords** (HIGH): 22 matches

### src\lib\errors\error-middleware.ts
- **consoleStatements** (LOW): 6 matches

### src\lib\jalali-localizer.ts
- **weakPasswords** (HIGH): 9 matches
- **consoleStatements** (LOW): 25 matches

### src\lib\logger.config.ts
- **weakPasswords** (HIGH): 1 matches
- **environmentVariables** (INFO): 12 matches

### src\lib\logger.ts
- **consoleStatements** (LOW): 5 matches
- **environmentVariables** (INFO): 1 matches

### src\lib\middleware\auth-middleware.ts
- **weakPasswords** (HIGH): 10 matches

### src\lib\mock-data.ts
- **weakPasswords** (HIGH): 2 matches

### src\lib\performance\simple-monitor.ts
- **consoleStatements** (LOW): 5 matches

### src\lib\performance\__tests__\simple-monitor.test.ts
- **weakPasswords** (HIGH): 3 matches

### src\lib\persian-date-utils.ts
- **consoleStatements** (LOW): 5 matches

### src\lib\prisma.ts
- **weakPasswords** (HIGH): 6 matches
- **consoleStatements** (LOW): 14 matches
- **environmentVariables** (INFO): 8 matches

### src\lib\production-fixes.ts
- **environmentVariables** (INFO): 24 matches

### src\lib\queries.test.ts
- **weakPasswords** (HIGH): 8 matches

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

### src\lib\security\RateLimiter.ts
- **weakPasswords** (HIGH): 1 matches

### src\lib\security\security-config.ts
- **weakPasswords** (HIGH): 1 matches
- **weakPasswords** (HIGH): 1 matches
- **environmentVariables** (INFO): 1 matches

### src\lib\security\security-headers.ts
- **environmentVariables** (INFO): 2 matches

### src\lib\security.test.ts
- **weakPasswords** (HIGH): 11 matches
- **weakPasswords** (HIGH): 2 matches
- **environmentVariables** (INFO): 3 matches

### src\lib\security.ts
- **hardcodedSecrets** (CRITICAL): 1 matches
- **consoleStatements** (LOW): 2 matches
- **environmentVariables** (INFO): 3 matches

### src\lib\standard-localizer.ts
- **weakPasswords** (HIGH): 7 matches
- **consoleStatements** (LOW): 4 matches

### src\lib\state\index.ts
- **weakPasswords** (HIGH): 1 matches

### src\lib\test-prisma.ts
- **weakPasswords** (HIGH): 9 matches

### src\lib\utils\auth-utils.ts
- **weakPasswords** (HIGH): 18 matches

### src\lib\utils.ts
- **weakPasswords** (HIGH): 5 matches

### src\lib\validation\component-props.ts
- **consoleStatements** (LOW): 1 matches
- **environmentVariables** (INFO): 2 matches

### src\lib\validation\__tests__\component-props.test.ts
- **weakPasswords** (HIGH): 10 matches
- **environmentVariables** (INFO): 6 matches

### src\lib\validators\story-validators.ts
- **weakPasswords** (HIGH): 16 matches

### src\lib\work-schedule-utils.ts
- **weakPasswords** (HIGH): 4 matches

### src\middleware.advanced-security.test.ts
- **weakPasswords** (HIGH): 3 matches

### src\middleware.security.test.ts
- **weakPasswords** (HIGH): 1 matches

### src\middleware.test.ts
- **weakPasswords** (HIGH): 6 matches
- **weakPasswords** (HIGH): 4 matches

### src\middleware.ts
- **weakPasswords** (HIGH): 1 matches
- **environmentVariables** (INFO): 3 matches

### src\services\action-center.service.ts
- **weakPasswords** (HIGH): 13 matches

### src\services\mobile.service.ts
- **weakPasswords** (HIGH): 2 matches

### src\services\project.service.test.ts
- **weakPasswords** (HIGH): 19 matches

### src\services\story.service.test.ts
- **weakPasswords** (HIGH): 26 matches

### src\services\story.service.ts
- **weakPasswords** (HIGH): 14 matches

### src\stores\app.store.ts
- **environmentVariables** (INFO): 4 matches

### src\stores\userStore.ts
- **weakPasswords** (HIGH): 3 matches

### src\stores\wiki.store.ts
- **consoleStatements** (LOW): 19 matches

### src\test\setup.tsx
- **weakPasswords** (HIGH): 29 matches

### src\types\admin-dashboard.ts
- **weakPasswords** (HIGH): 1 matches

### src\types\conventions.ts
- **weakPasswords** (HIGH): 3 matches

### src\types\entities.ts
- **hardcodedPasswords** (CRITICAL): 2 matches
- **weakPasswords** (HIGH): 4 matches
- **weakPasswords** (HIGH): 18 matches

### src\types\hr.ts
- **weakPasswords** (HIGH): 4 matches
- **weakPasswords** (HIGH): 7 matches

### src\types\index.ts
- **weakPasswords** (HIGH): 7 matches

### src\types\jest-dom.d.ts
- **weakPasswords** (HIGH): 1 matches

### src\types\schemas.ts
- **hardcodedPasswords** (CRITICAL): 3 matches
- **weakPasswords** (HIGH): 2 matches
- **weakPasswords** (HIGH): 12 matches

### src\types\state.ts
- **weakPasswords** (HIGH): 9 matches

### src\types\story-management.ts
- **weakPasswords** (HIGH): 1 matches

### src\types\validation.ts
- **hardcodedPasswords** (CRITICAL): 1 matches

### src\types\__tests__\type-system.test.ts
- **weakPasswords** (HIGH): 21 matches
- **weakPasswords** (HIGH): 58 matches
- **weakPasswords** (HIGH): 6 matches

### prisma\seed-robust.ts
- **hardcodedPasswords** (CRITICAL): 3 matches
- **weakPasswords** (HIGH): 3 matches
- **weakPasswords** (HIGH): 12 matches
- **weakPasswords** (HIGH): 1 matches
- **consoleStatements** (LOW): 16 matches

### prisma\seed-simple.ts
- **hardcodedPasswords** (CRITICAL): 3 matches
- **weakPasswords** (HIGH): 3 matches
- **weakPasswords** (HIGH): 11 matches
- **weakPasswords** (HIGH): 1 matches
- **consoleStatements** (LOW): 14 matches

### prisma\seed.ts
- **hardcodedPasswords** (CRITICAL): 6 matches
- **weakPasswords** (HIGH): 15 matches
- **weakPasswords** (HIGH): 4 matches
- **weakPasswords** (HIGH): 2 matches
- **consoleStatements** (LOW): 52 matches
- **environmentVariables** (INFO): 10 matches

### prisma\wiki-seed.js
- **weakPasswords** (HIGH): 6 matches
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

### src\e2e\create-story.spec.ts
- **weakPasswords** (HIGH): 9 matches

### src\e2e\meetings-flow.test.ts
- **weakPasswords** (HIGH): 25 matches

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
- **weakPasswords** (HIGH): 98 matches
- **environmentVariables** (INFO): 3 matches

### src\e2e\test-utils.ts
- **hardcodedPasswords** (CRITICAL): 1 matches
- **hardcodedPasswords** (CRITICAL): 2 matches
- **weakPasswords** (HIGH): 18 matches

