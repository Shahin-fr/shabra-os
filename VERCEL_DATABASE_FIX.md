# 🐘 رفع مشکل دیتابیس PostgreSQL در Vercel

## 🚨 مشکل
- ✅ Localhost کار می‌کند
- ❌ Vercel نمی‌تواند وارد شود (CredentialsSignin)
- 🔍 **علت**: دیتابیس PostgreSQL در Vercel خالی است

## 🔧 راه‌حل‌های موجود

### روش 1: استفاده از Seed API (توصیه شده)

#### 1. Seed کردن از طریق API:
```bash
# بعد از دیپلوی، این URL را در browser باز کنید:
https://your-domain.vercel.app/api/seed

# یا از terminal:
curl -X POST https://your-domain.vercel.app/api/seed
```

#### 2. بررسی وضعیت دیتابیس:
```bash
# بررسی وضعیت:
curl https://your-domain.vercel.app/api/seed

# یا در browser:
https://your-domain.vercel.app/api/seed
```

### روش 2: استفاده از اسکریپت Seed

#### 1. Seed کردن با اسکریپت:
```bash
# با URL دامنه:
npx tsx scripts/seed-vercel-api.ts https://your-domain.vercel.app

# یا با environment variable:
VERCEL_URL=https://your-domain.vercel.app npx tsx scripts/seed-vercel-api.ts
```

#### 2. تست دیتابیس:
```bash
# تست اتصال و محتویات:
npx tsx scripts/test-vercel-db.ts
```

### روش 3: Seed محلی با اتصال به Production DB

#### 1. تنظیم Environment Variables:
```bash
# در .env.local
PRISMA_DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
POSTGRES_URL="postgresql://username:password@host:port/database?schema=public"
```

#### 2. Seed کردن:
```bash
# Seed کردن دیتابیس production:
npx tsx scripts/seed-production.ts
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

### مرحله 1: بررسی وضعیت فعلی
```bash
# بررسی دیتابیس Vercel:
npx tsx scripts/test-vercel-db.ts
```

### مرحله 2: Seed کردن دیتابیس
```bash
# روش 1: از طریق API (توصیه شده)
# در browser: https://your-domain.vercel.app/api/seed

# روش 2: از طریق اسکریپت
npx tsx scripts/seed-vercel-api.ts https://your-domain.vercel.app
```

### مرحله 3: تست ورود
1. باز کردن `https://your-domain.vercel.app/login`
2. ورود با `admin@shabra.com` / `admin-password-123`
3. بررسی عملکرد سیستم

## 🔍 عیب‌یابی

### اگر Seed API کار نکرد:
1. **بررسی Environment Variables** در Vercel Dashboard
2. **بررسی اتصال دیتابیس** از طریق `/api/debug`
3. **بررسی Logs** در Vercel Dashboard

### اگر هنوز CredentialsSignin می‌دهد:
1. **بررسی Console Browser** برای خطاهای JavaScript
2. **بررسی Network Tab** برای درخواست‌های API
3. **بررسی Server Logs** در Vercel Dashboard
4. **تست با Incognito Mode**

### اگر دیتابیس اتصال ندارد:
1. **بررسی `PRISMA_DATABASE_URL`** در Vercel
2. **بررسی `POSTGRES_URL`** در Vercel
3. **بررسی دسترسی دیتابیس** از Vercel
4. **بررسی Firewall و Security Groups**

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
1. **Logs Vercel** را بررسی کنید
2. **Console Browser** را بررسی کنید
3. از **`/api/debug`** برای بررسی وضعیت استفاده کنید
4. **دیتابیس را دوباره seed** کنید

---

**نکته مهم**: حتماً دیتابیس PostgreSQL در Vercel را seed کنید تا کاربران پیش‌فرض ایجاد شوند!
