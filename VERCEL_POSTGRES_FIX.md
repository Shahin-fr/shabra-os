# 🐘 رفع مشکل PostgreSQL در Vercel - Vercel PostgreSQL Fix

## 🚨 مشکل اصلی
`CredentialsSignin` error در Vercel به دلیل خالی بودن دیتابیس PostgreSQL است. کاربران پیش‌فرض در دیتابیس production وجود ندارند.

## ✅ راه‌حل‌های موجود

### روش 1: استفاده از API Seed (توصیه شده)

#### 1. Seed کردن دیتابیس از طریق API:
```bash
# در Vercel Dashboard یا terminal
curl -X POST https://your-domain.vercel.app/api/seed
```

#### 2. بررسی وضعیت دیتابیس:
```bash
curl https://your-domain.vercel.app/api/seed
```

### روش 2: Seed محلی با اتصال به دیتابیس Production

#### 1. تنظیم Environment Variables:
```bash
# در .env.local
PRISMA_DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
POSTGRES_URL="postgresql://username:password@host:port/database?schema=public"
```

#### 2. اجرای Seed:
```bash
# Seed کردن دیتابیس
npx tsx scripts/seed-production.ts

# یا
npx prisma db seed
```

### روش 3: استفاده از Vercel CLI

#### 1. نصب Vercel CLI:
```bash
npm i -g vercel
```

#### 2. Login و Deploy:
```bash
vercel login
vercel env pull .env.local
```

#### 3. Seed کردن:
```bash
npx tsx scripts/seed-production.ts
```

## 🔧 اسکریپت‌های کمکی

### بررسی دیتابیس Production:
```bash
npx tsx scripts/check-production-db.ts
```

### Seed کردن دیتابیس:
```bash
npx tsx scripts/seed-production.ts
```

### تست Authentication:
```bash
npx tsx scripts/test-login.ts
```

## 🔑 کاربران پیش‌فرض

بعد از seed کردن، این کاربران در دسترس خواهند بود:

### مدیر سیستم:
- **ایمیل**: `admin@shabra.com`
- **رمز عبور**: `admin-password-123`
- **نقش**: ADMIN

### کاربر عادی:
- **ایمیل**: `user@shabra.com`
- **رمز عبور**: `user-password-123`
- **نقش**: EMPLOYEE

### مدیر پروژه:
- **ایمیل**: `manager@shabra.com`
- **رمز عبور**: `manager-password-123`
- **نقش**: MANAGER

## 🚀 مراحل کامل رفع مشکل

### مرحله 1: بررسی دیتابیس
```bash
# بررسی اتصال و محتویات دیتابیس
npx tsx scripts/check-production-db.ts
```

### مرحله 2: Seed کردن دیتابیس
```bash
# Seed کردن کاربران پیش‌فرض
npx tsx scripts/seed-production.ts
```

### مرحله 3: تست Authentication
```bash
# تست ورود کاربران
npx tsx scripts/test-login.ts
```

### مرحله 4: تست در Browser
1. باز کردن `https://your-domain.vercel.app/login`
2. ورود با `admin@shabra.com` / `admin-password-123`
3. بررسی عملکرد سیستم

## 🔍 عیب‌یابی

### اگر Seed API کار نکرد:
1. بررسی Environment Variables در Vercel
2. بررسی اتصال دیتابیس
3. بررسی Logs در Vercel Dashboard

### اگر هنوز CredentialsSignin می‌دهد:
1. بررسی Console Browser
2. بررسی Network Tab
3. بررسی Server Logs
4. تست با Incognito Mode

### اگر دیتابیس اتصال ندارد:
1. بررسی `PRISMA_DATABASE_URL`
2. بررسی `POSTGRES_URL`
3. بررسی دسترسی دیتابیس از Vercel
4. بررسی Firewall و Security Groups

## 📊 API Endpoints

### Seed Database:
```bash
POST /api/seed
```

### Check Database Status:
```bash
GET /api/seed
```

### Debug System:
```bash
GET /api/debug
```

## ✅ تأیید نهایی

بعد از seed کردن، باید بتوانید:
- ✅ با `admin@shabra.com` وارد شوید
- ✅ با `user@shabra.com` وارد شوید
- ✅ با `manager@shabra.com` وارد شوید
- ✅ تمام بخش‌های سیستم کار کنند

## 🆘 پشتیبانی

اگر هنوز مشکل دارید:
1. Logs Vercel را بررسی کنید
2. Console Browser را بررسی کنید
3. از `/api/debug` برای بررسی وضعیت استفاده کنید
4. دیتابیس را دوباره seed کنید

---

**نکته مهم**: حتماً دیتابیس PostgreSQL را seed کنید تا کاربران پیش‌فرض ایجاد شوند.
