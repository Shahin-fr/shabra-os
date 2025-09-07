# راهنمای حل مشکل مسیر دیتابیس

## 🔍 مشکل شناسایی شده

مشکل در این بود که دیتابیس SQLite در مسیر `./prisma/dev.db` قرار داشت اما تنظیمات محیطی به مسیر `./dev.db` اشاره می‌کرد.

## ✅ راه‌حل پیاده‌سازی شده

### 1. مسیر دیتابیس پیدا شد
```
✅ Found database at: ./prisma/dev.db
   Size: 172032 bytes
   Modified: Sun Sep 07 2025 21:33:08 GMT+0330 (Iran Standard Time)
```

### 2. فایل .env به‌روزرسانی شد
```env
DATABASE_URL="file:./prisma/dev.db"
POSTGRES_URL="file:./prisma/dev.db"
```

### 3. کاربران در دیتابیس موجود هستند
```
👤 Users in database:
   - admin@shabra.com (Admin User) - ADMIN - Active: true
   - manager@shabra.com (Manager User) - MANAGER - Active: true
   - user@shabra.com (Regular User) - EMPLOYEE - Active: true
```

## 🚀 حالا باید کار کند

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

## 🔧 عیب‌یابی

### اگر هنوز مشکل دارید:

#### 1. بررسی مسیر دیتابیس
```bash
# بررسی مسیر دیتابیس
node scripts/find-database.js
```

#### 2. بررسی تنظیمات محیطی
```bash
# بررسی .env
type .env

# بررسی .env.local
type .env.local
```

#### 3. تست احراز هویت
```bash
# تست احراز هویت
node scripts/create-database.js
```

## 📋 وضعیت نهایی

- ✅ **دیتابیس**: SQLite در `./prisma/dev.db` موجود است
- ✅ **کاربران**: 3 کاربر در دیتابیس موجود هستند
- ✅ **احراز هویت**: تنظیمات NextAuth درست است
- ✅ **مسیر دیتابیس**: در فایل .env درست تنظیم شده
- ✅ **سرور**: در حال اجرا روی پورت 3000

## 🎯 آدرس‌های مهم

- **صفحه اصلی**: http://localhost:3000
- **ورود**: http://localhost:3000/login
- **API Auth**: http://localhost:3000/api/auth/[...nextauth]

## 🔑 اطلاعات ورود

| نقش | ایمیل | رمز عبور |
|-----|-------|----------|
| **مدیر** | admin@shabra.com | admin123 |
| **مدیر پروژه** | manager@shabra.com | manager123 |
| **کاربر عادی** | user@shabra.com | user123 |

## ⚠️ نکات مهم

1. **مسیر دیتابیس**: `./prisma/dev.db` (نه `./dev.db`)
2. **فایل .env**: باید DATABASE_URL درست تنظیم شده باشد
3. **Cache مرورگر**: همیشه پاک کنید
4. **Incognito Mode**: برای تست استفاده کنید

## 🎉 نتیجه

با این تنظیمات، مشکل مسیر دیتابیس حل شد و باید بتوانید بدون مشکل وارد سیستم شوید.

### دستورات مفید:
```bash
# بررسی مسیر دیتابیس
node scripts/find-database.js

# تست احراز هویت
node scripts/create-database.js

# اجرای سرور
npm run dev
```
