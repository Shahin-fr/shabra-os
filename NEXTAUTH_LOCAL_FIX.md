# راهنمای حل مشکل NextAuth در محیط لوکال

## 🔍 مشکل شناسایی شده

خطای `ClientFetchError` در NextAuth معمولاً به دلیل مشکلات زیر است:

1. **تنظیمات نادرست NEXTAUTH_URL**
2. **مشکل در trustHost**
3. **تنظیمات cookies نادرست**

## ✅ راه‌حل پیاده‌سازی شده

### 1. تنظیمات NextAuth به‌روزرسانی شد

```typescript
const authConfig = {
  secret: process.env.NEXTAUTH_SECRET || 'local-development-secret-key-minimum-32-characters-long',
  trustHost: true, // Allow localhost for development
  useSecureCookies: process.env.NODE_ENV === 'production',
  // ... rest of config
};
```

### 2. فایل .env.local به‌روزرسانی شد

```env
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="local-development-secret-key-minimum-32-characters-long"
DATABASE_URL="file:./dev.db"
```

### 3. دیتابیس SQLite راه‌اندازی شد

- فایل `dev.db` ایجاد شد
- کاربران پیش‌فرض اضافه شدند
- Prisma schema برای SQLite تنظیم شد

## 🚀 مراحل تست

### مرحله 1: بررسی سرور
```bash
# بررسی اینکه سرور در حال اجرا است
Get-Process -Name "node"
```

### مرحله 2: تست احراز هویت
```bash
# اجرای تست کامل
node scripts/complete-local-setup.js
```

### مرحله 3: تست در مرورگر
1. باز کردن: http://localhost:3001
2. رفتن به: http://localhost:3001/login
3. ورود با:
   - **Admin**: admin@shabra.com / admin123
   - **Manager**: manager@shabra.com / manager123
   - **User**: user@shabra.com / user123

## 🔧 عیب‌یابی

### اگر هنوز خطا دارید:

#### 1. پاک کردن cache مرورگر
- Ctrl + Shift + R (Hard Refresh)
- یا باز کردن در Incognito Mode

#### 2. بررسی لاگ‌های سرور
```bash
# متوقف کردن سرور
Get-Process -Name "node" | Stop-Process -Force

# اجرای مجدد با لاگ‌های کامل
npm run dev
```

#### 3. بررسی فایل‌های محیطی
```bash
# بررسی .env.local
type .env.local

# بررسی دیتابیس
dir dev.db
```

#### 4. بازنشانی کامل
```bash
# حذف دیتابیس و راه‌اندازی مجدد
Remove-Item dev.db -Force
npm run db:reset-local
npm run dev
```

## 📋 وضعیت فعلی

✅ **دیتابیس**: SQLite راه‌اندازی شده  
✅ **کاربران**: 3 کاربر پیش‌فرض ایجاد شده  
✅ **احراز هویت**: تنظیمات NextAuth به‌روزرسانی شده  
✅ **سرور**: در حال اجرا روی پورت 3001  
✅ **تنظیمات محیطی**: .env.local تنظیم شده  

## 🎯 آدرس‌های مهم

- **صفحه اصلی**: http://localhost:3001
- **ورود**: http://localhost:3001/login
- **API Auth**: http://localhost:3001/api/auth/[...nextauth]

## ⚠️ نکات مهم

1. **پورت 3001**: سرور روی پورت 3001 اجرا می‌شود (3000 اشغال بود)
2. **HTTP**: برای لوکال از HTTP استفاده می‌شود (نه HTTPS)
3. **دیتابیس جداگانه**: دیتابیس لوکال جدا از ورسل است
4. **تنظیمات محیطی**: .env.local فقط برای لوکال است

## 🆘 اگر مشکل ادامه داشت

1. **بررسی Console مرورگر** برای خطاهای JavaScript
2. **بررسی Network Tab** برای درخواست‌های ناموفق
3. **بررسی لاگ‌های سرور** در Terminal
4. **اجرای تست کامل** با `node scripts/complete-local-setup.js`

## 🎉 نتیجه

با این تنظیمات، باید بتوانید بدون مشکل وارد سیستم شوید و از تمام قابلیت‌های سیستم استفاده کنید.
