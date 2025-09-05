# 🚀 دیپلوی رفع شده - Deployment Fixed

## ✅ مشکل رفع شده
خطای TypeScript در فایل‌های اسکریپت که باعث شکست build در Vercel می‌شد، رفع شده است.

## 🔧 تغییرات اعمال شده

### فایل‌های اصلاح شده:
1. **`scripts/quick-fix-vercel.ts`** - اضافه کردن `as any` برای type casting
2. **`scripts/seed-vercel-api.ts`** - اضافه کردن `as any` برای type casting

### خطاهای رفع شده:
- ❌ `'statusData' is of type 'unknown'` → ✅ **رفع شد**
- ❌ `'seedData' is of type 'unknown'` → ✅ **رفع شد**
- ❌ `'verifyData' is of type 'unknown'` → ✅ **رفع شد**

## 🚀 مراحل دیپلوی

### 1. Commit و Push تغییرات:
```bash
git add .
git commit -m "Fix TypeScript errors in scripts"
git push origin main
```

### 2. دیپلوی در Vercel:
- Vercel به صورت خودکار تغییرات را detect می‌کند
- Build process شروع می‌شود
- اگر موفق بود، URL جدید دریافت می‌کنید

### 3. Seed کردن دیتابیس:
```bash
# بعد از دیپلوی موفق، این URL را باز کنید:
https://your-domain.vercel.app/api/seed

# یا از terminal:
npx tsx scripts/quick-fix-vercel.ts https://your-domain.vercel.app
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

## 🛠️ اسکریپت‌های کمکی

### Seed کردن دیتابیس:
```bash
# روش 1: از طریق API (توصیه شده)
# در browser: https://your-domain.vercel.app/api/seed

# روش 2: از طریق اسکریپت
npx tsx scripts/quick-fix-vercel.ts https://your-domain.vercel.app
```

### بررسی وضعیت:
```bash
# بررسی دیتابیس:
npx tsx scripts/test-vercel-db.ts

# بررسی از طریق API:
curl https://your-domain.vercel.app/api/seed
```

## ✅ تأیید نهایی

بعد از دیپلوی و seed کردن، باید بتوانید:
- ✅ با `admin@shabra.com` وارد شوید
- ✅ با `user@shabra.com` وارد شوید
- ✅ با `manager@shabra.com` وارد شوید
- ✅ تمام بخش‌های سیستم کار کنند

## 🔍 عیب‌یابی

### اگر دیپلوی شکست خورد:
1. **بررسی Logs** در Vercel Dashboard
2. **بررسی Environment Variables**
3. **تست Build محلی**: `npm run build`

### اگر Seed کار نکرد:
1. **بررسی Console Browser** برای خطاهای JavaScript
2. **بررسی Network Tab** برای درخواست‌های API
3. **بررسی Server Logs** در Vercel Dashboard

### اگر هنوز CredentialsSignin می‌دهد:
1. **بررسی دیتابیس**: `https://your-domain.vercel.app/api/seed`
2. **Seed کردن دوباره**: `https://your-domain.vercel.app/api/seed`
3. **تست با Incognito Mode**

## 📋 چک‌لیست دیپلوی

- [ ] Build محلی موفق است (`npm run build`)
- [ ] تغییرات commit و push شده‌اند
- [ ] Vercel build موفق است
- [ ] دیتابیس seed شده است
- [ ] Authentication کار می‌کند
- [ ] تمام بخش‌ها کار می‌کنند

---

**نکته مهم**: حتماً بعد از دیپلوی، دیتابیس را seed کنید تا کاربران پیش‌فرض ایجاد شوند!
