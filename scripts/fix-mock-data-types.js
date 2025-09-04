const fs = require('fs');

// Helper function to create complete mock user data
function createCompleteMockUser(baseUser) {
  return {
    id: baseUser.id,
    email: baseUser.email,
    password: baseUser.password || 'hashedpassword123',
    firstName: baseUser.firstName || '',
    lastName: baseUser.lastName || '',
    avatar: baseUser.avatar || null,
    isActive: baseUser.isActive !== undefined ? baseUser.isActive : true,
    roles: baseUser.roles || ['EMPLOYEE'],
    createdAt: baseUser.createdAt || new Date('2024-01-01'),
    updatedAt: baseUser.updatedAt || new Date('2024-01-01'),
  };
}

// Fix users route test
function fixUsersRouteTest() {
  const filePath = 'src/app/api/users/route.test.ts';
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix mockUsers array
  const mockUsersRegex = /const mockUsers = \[([\s\S]*?)\];/;
  if (mockUsersRegex.test(content)) {
    content = content.replace(mockUsersRegex, (match, usersContent) => {
      const users = eval(`[${usersContent}]`);
      const completeUsers = users.map(user => createCompleteMockUser(user));
      return `const mockUsers = ${JSON.stringify(completeUsers, null, 2)};`;
    });
    modified = true;
  }

  // Fix mockInactiveUsers array
  const mockInactiveUsersRegex = /const mockInactiveUsers = \[([\s\S]*?)\];/;
  if (mockInactiveUsersRegex.test(content)) {
    content = content.replace(mockInactiveUsersRegex, (match, usersContent) => {
      const users = eval(`[${usersContent}]`);
      const completeUsers = users.map(user =>
        createCompleteMockUser({ ...user, isActive: false })
      );
      return `const mockInactiveUsers = ${JSON.stringify(completeUsers, null, 2)};`;
    });
    modified = true;
  }

  // Fix other mock user arrays
  const mockUserArrays = [
    'usersWithNullNames',
    'longNameUser',
    'specialCharUser',
    'unicodeUser',
    'emojiUser',
    'longEmailUser',
    'largeUserList',
    'mixedUserList',
  ];

  mockUserArrays.forEach(arrayName => {
    const regex = new RegExp(`const ${arrayName} = \\[([\\s\\S]*?)\\];`);
    if (regex.test(content)) {
      content = content.replace(regex, (match, usersContent) => {
        try {
          const users = eval(`[${usersContent}]`);
          const completeUsers = users.map(user => createCompleteMockUser(user));
          return `const ${arrayName} = ${JSON.stringify(completeUsers, null, 2)};`;
        } catch (e) {
          console.log(`Could not parse ${arrayName}:`, e.message);
          return match;
        }
      });
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed mock data types in: ${filePath}`);
  }
}

// Fix wiki route test
function fixWikiRouteTest() {
  const filePath = 'src/app/api/wiki/route.test.ts';
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix mockUser
  const mockUserRegex = /const mockUser = \{([\s\S]*?)\};/;
  if (mockUserRegex.test(content)) {
    content = content.replace(mockUserRegex, (match, userContent) => {
      try {
        const user = eval(`({${userContent}})`);
        const completeUser = createCompleteMockUser(user);
        return `const mockUser = ${JSON.stringify(completeUser, null, 2)};`;
      } catch (e) {
        console.log('Could not parse mockUser:', e.message);
        return match;
      }
    });
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed mock data types in: ${filePath}`);
  }
}

// Fix auth test
function fixAuthTest() {
  const filePath = 'src/auth.test.ts';
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix mockUser
  const mockUserRegex = /const mockUser = \{([\s\S]*?)\};/;
  if (mockUserRegex.test(content)) {
    content = content.replace(mockUserRegex, (match, userContent) => {
      try {
        const user = eval(`({${userContent}})`);
        const completeUser = createCompleteMockUser(user);
        return `const mockUser = ${JSON.stringify(completeUser, null, 2)};`;
      } catch (e) {
        console.log('Could not parse mockUser:', e.message);
        return match;
      }
    });
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed mock data types in: ${filePath}`);
  }
}

// Fix auth integration test
function fixAuthIntegrationTest() {
  const filePath = 'src/auth.integration.test.ts';
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix bcrypt.compare mock calls
  content = content.replace(
    /vi\.mocked\(bcrypt\.compare\)\.mockResolvedValue\(true\);/g,
    'vi.mocked(bcrypt.compare).mockResolvedValue(true as any);'
  );
  content = content.replace(
    /vi\.mocked\(bcrypt\.compare\)\.mockResolvedValue\(false\);/g,
    'vi.mocked(bcrypt.compare).mockResolvedValue(false as any);'
  );

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed bcrypt mock types in: ${filePath}`);
  }
}

// Run all fixes
console.log('Fixing mock data type mismatches...');
fixUsersRouteTest();
fixWikiRouteTest();
fixAuthTest();
fixAuthIntegrationTest();
console.log('Mock data type fixes completed!');
