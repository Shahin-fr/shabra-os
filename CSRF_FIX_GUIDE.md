# راهنمای حل مشکل CSRF در NextAuth

## 🔍 مشکل شناسایی شده

خطای `MissingCSRF` در NextAuth v5 معمولاً به دلیل مشکلات زیر است:

1. **تنظیمات نادرست cookies**
2. **مشکل در CSRF token configuration**
3. **Cache قدیمی مرورگر**
4. **تنظیمات نادرست secure cookies**

## ✅ راه‌حل پیاده‌سازی شده

### 1. تنظیمات CSRF به‌روزرسانی شد

```typescript
const authConfig = {
  // CSRF configuration for local development
  csrfToken: {
    name: 'next-auth.csrf-token',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  // ... rest of config
};
```

### 2. تنظیمات Cookies به‌روزرسانی شد

```typescript
cookies: {
  sessionToken: {
    name: process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    }
  },
  // ... other cookies
}
```

### 3. Cache پاک شد

- Next.js cache پاک شد
- Prisma cache پاک شد
- Prisma client دوباره تولید شد

## 🚀 مراحل تست

### مرحله 1: پاک کردن Cache مرورگر
```
1. باز کردن Developer Tools (F12)
2. کلیک راست روی Refresh button
3. انتخاب "Empty Cache and Hard Reload"
یا
Ctrl + Shift + R
```

### مرحله 2: تست در Incognito Mode
```
1. باز کردن Incognito/Private window
2. رفتن به: http://localhost:3000/login
3. ورود با:
   - Admin: admin@shabra.com / admin123
   - Manager: manager@shabra.com / manager123
   - User: user@shabra.com / user123
```

### مرحله 3: بررسی Console
```
1. باز کردن Developer Tools (F12)
2. رفتن به Console tab
3. بررسی خطاهای JavaScript
4. بررسی Network tab برای درخواست‌های ناموفق
```

## 🔧 عیب‌یابی پیشرفته

### اگر هنوز خطا دارید:

#### 1. پاک کردن کامل Cache
```bash
# اجرای اسکریپت پاک کردن cache
npm run auth:clear-cache

# متوقف کردن سرور
Get-Process -Name "node" | Stop-Process -Force

# اجرای مجدد سرور
npm run dev
```

#### 2. بررسی تنظیمات محیطی
```bash
# بررسی .env.local
type .env.local

# بررسی دیتابیس
node scripts/complete-local-setup.js
```

#### 3. تست احراز هویت
```bash
# تست کامل احراز هویت
node scripts/test-local-auth.js
```

## 📋 تنظیمات مهم

### فایل .env.local
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="local-development-secret-key-minimum-32-characters-long"
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
```

### تنظیمات NextAuth
- `trustHost: true` برای لوکال
- `useSecureCookies: false` برای HTTP
- `sameSite: 'lax'` برای CSRF
- `secure: false` برای لوکال

## 🎯 آدرس‌های مهم

- **صفحه اصلی**: http://localhost:3000
- **ورود**: http://localhost:3000/login
- **API Auth**: http://localhost:3000/api/auth/[...nextauth]
- **CSRF Token**: http://localhost:3000/api/auth/csrf

## ⚠️ نکات مهم

1. **پورت 3000**: سرور روی پورت 3000 اجرا می‌شود
2. **HTTP**: برای لوکال از HTTP استفاده می‌شود
3. **Cache**: همیشه cache مرورگر را پاک کنید
4. **Incognito**: برای تست از Incognito Mode استفاده کنید

## 🆘 اگر مشکل ادامه داشت

### بررسی لاگ‌های سرور
```bash
# متوقف کردن سرور
Get-Process -Name "node" | Stop-Process -Force

# اجرای مجدد با لاگ‌های کامل
npm run dev
```

### بررسی Network Tab
1. باز کردن Developer Tools
2. رفتن به Network tab
3. تلاش برای ورود
4. بررسی درخواست‌های `/api/auth/signin` و `/api/auth/csrf`

### بررسی Console
1. باز کردن Developer Tools
2. رفتن به Console tab
3. بررسی خطاهای JavaScript
4. بررسی خطاهای NextAuth

## 🎉 نتیجه

با این تنظیمات، مشکل CSRF باید حل شود و بتوانید بدون مشکل وارد سیستم شوید.

### دستورات مفید:
```bash
# پاک کردن cache
npm run auth:clear-cache

# تست احراز هویت
npm run auth:test

# راه‌اندازی کامل
npm run setup:local

# اجرای سرور
npm run dev
```
