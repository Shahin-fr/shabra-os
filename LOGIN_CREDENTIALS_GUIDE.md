# 🔐 راهنمای ورود به سیستم - Login Credentials Guide

## ✅ اطلاعات ورود

### کاربران پیش‌فرض موجود در سیستم:

#### 1. **مدیر سیستم (Admin)**
- **ایمیل**: `admin@shabra.com`
- **رمز عبور**: `admin-password-123`
- **نقش**: ADMIN
- **دسترسی**: کامل به تمام بخش‌ها

#### 2. **کاربر عادی (Employee)**
- **ایمیل**: `user@shabra.com`
- **رمز عبور**: `user-password-123`
- **نقش**: EMPLOYEE
- **دسترسی**: محدود به وظایف خود

## 🔍 عیب‌یابی مشکل CredentialsSignin

### اگر هنوز نمی‌توانید وارد شوید:

#### 1. **بررسی Environment Variables**
```bash
# در Vercel Dashboard یا .env.local
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app
```

#### 2. **بررسی Console Browser**
- F12 را فشار دهید
- به تب Console بروید
- خطاهای JavaScript را بررسی کنید

#### 3. **بررسی Network Tab**
- F12 → Network tab
- سعی کنید وارد شوید
- درخواست‌های API را بررسی کنید

#### 4. **تست محلی**
```bash
# اجرای سرور محلی
npm run dev

# تست در localhost:3000
```

## 🛠️ راه‌حل‌های احتمالی

### مشکل 1: Environment Variables
```bash
# بررسی متغیرهای محیطی
echo $NEXTAUTH_SECRET
echo $NEXTAUTH_URL
```

### مشکل 2: Database Connection
```bash
# تست اتصال دیتابیس
npx tsx scripts/test-login.ts
```

### مشکل 3: Cache Browser
- Ctrl+Shift+R (Hard Refresh)
- یا Clear Browser Cache

### مشکل 4: Session Issues
- از تب Incognito/Private استفاده کنید
- یا تمام cookies را پاک کنید

## 🔧 اسکریپت‌های کمکی

### بررسی کاربران موجود:
```bash
npx tsx scripts/check-users.ts
```

### تست Authentication:
```bash
npx tsx scripts/test-auth.ts
```

### تست کامل Login:
```bash
npx tsx scripts/test-login.ts
```

## 📱 تست در مرورگرهای مختلف

### Chrome/Edge:
1. F12 → Console
2. بررسی خطاهای JavaScript
3. Network tab برای درخواست‌های API

### Firefox:
1. F12 → Console
2. بررسی خطاهای JavaScript
3. Network tab

### Safari:
1. Cmd+Option+I → Console
2. بررسی خطاهای JavaScript

## 🚨 مشکلات رایج

### "CredentialsSignin" Error:
- ✅ کاربر در دیتابیس وجود دارد
- ✅ رمز عبور صحیح است
- ✅ کاربر فعال است
- ❌ مشکل از NextAuth configuration

### "User not found":
- ❌ کاربر در دیتابیس وجود ندارد
- ✅ راه حل: `npx prisma db seed`

### "Invalid password":
- ❌ رمز عبور اشتباه است
- ✅ راه حل: از رمزهای بالا استفاده کنید

### "User not active":
- ❌ کاربر غیرفعال است
- ✅ راه حل: `npx tsx scripts/check-users.ts`

## 🔄 Reset کامل سیستم

اگر هیچ‌کدام از راه‌حل‌ها کار نکرد:

```bash
# 1. پاک کردن دیتابیس
npx prisma db push --force-reset

# 2. Seed کردن دیتابیس
npx prisma db seed

# 3. بررسی کاربران
npx tsx scripts/check-users.ts

# 4. تست ورود
npx tsx scripts/test-login.ts
```

## 📞 پشتیبانی

اگر هنوز مشکل دارید:

1. **Console Browser** را بررسی کنید
2. **Network Tab** را بررسی کنید
3. **Server Logs** را بررسی کنید
4. از **Incognito Mode** استفاده کنید

## ✅ تأیید نهایی

بعد از ورود موفق، باید بتوانید:
- ✅ Dashboard را ببینید
- ✅ Tasks اضافه کنید
- ✅ Projects ایجاد کنید
- ✅ Storyboard را ببینید
- ✅ Profile خود را ببینید

---

**نکته مهم**: همیشه از ایمیل و رمز عبور دقیق استفاده کنید (case-sensitive)
