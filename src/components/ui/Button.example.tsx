import React, { useState } from 'react';
import { Button } from './Button';

/**
 * Button Component Examples
 * 
 * This file demonstrates all the features and variants of the Shabra UI Button component.
 * It showcases the design system implementation with hot pink primary color and electric blue secondary.
 */

export function ButtonExamples() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          شبرا UI - Button Component
        </h1>
        <p className="text-lg text-muted-foreground">
          نمونه‌های کامپوننت دکمه بر اساس سیستم طراحی شبرا
        </p>
      </div>

      {/* Variants Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
          انواع دکمه (Button Variants)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Primary Button */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Primary</h3>
            <Button variant="primary">
              دکمه اصلی
            </Button>
          </div>

          {/* Secondary Button */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Secondary</h3>
            <Button variant="secondary">
              دکمه ثانویه
            </Button>
          </div>

          {/* Ghost Button */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Ghost</h3>
            <Button variant="ghost">
              دکمه شبح
            </Button>
          </div>

          {/* Destructive Button */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Destructive</h3>
            <Button variant="destructive">
              حذف
            </Button>
          </div>
        </div>
      </section>

      {/* Sizes Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
          اندازه‌های دکمه (Button Sizes)
        </h2>
        
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm" variant="primary">
            کوچک
          </Button>
          <Button size="md" variant="primary">
            متوسط
          </Button>
          <Button size="lg" variant="primary">
            بزرگ
          </Button>
        </div>
      </section>

      {/* States Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
          حالت‌های دکمه (Button States)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Normal State */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">عادی</h3>
            <Button variant="primary">
              دکمه عادی
            </Button>
          </div>

          {/* Loading State */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">در حال بارگذاری</h3>
            <Button variant="primary" isLoading>
              در حال بارگذاری...
            </Button>
          </div>

          {/* Disabled State */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">غیرفعال</h3>
            <Button variant="primary" isDisabled>
              غیرفعال
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
          نمایش تعاملی (Interactive Demo)
        </h2>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            روی دکمه زیر کلیک کنید تا حالت بارگذاری را مشاهده کنید:
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="primary" 
              isLoading={isLoading}
              onClick={handleLoadingDemo}
            >
              {isLoading ? 'در حال بارگذاری...' : 'شروع بارگذاری'}
            </Button>
            
            <Button 
              variant="secondary" 
              isLoading={isLoading}
              onClick={handleLoadingDemo}
            >
              {isLoading ? 'Loading...' : 'Start Loading'}
            </Button>
          </div>
        </div>
      </section>

      {/* All Variants with All Sizes */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
          تمام ترکیبات (All Combinations)
        </h2>
        
        <div className="space-y-8">
          {(['primary', 'secondary', 'ghost', 'destructive'] as const).map((variant) => (
            <div key={variant} className="space-y-4">
              <h3 className="text-lg font-medium text-foreground capitalize">
                {variant} Variant
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant={variant} size="sm">
                  Small
                </Button>
                <Button variant={variant} size="md">
                  Medium
                </Button>
                <Button variant={variant} size="lg">
                  Large
                </Button>
                <Button variant={variant} size="sm" isLoading>
                  Loading
                </Button>
                <Button variant={variant} size="md" isDisabled>
                  Disabled
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RTL Support Demo */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
          پشتیبانی از راست به چپ (RTL Support)
        </h2>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            این دکمه‌ها به طور کامل از متن فارسی و راست به چپ پشتیبانی می‌کنند:
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">
              دکمه فارسی
            </Button>
            <Button variant="secondary">
              دکمه با آیکون 🚀
            </Button>
            <Button variant="ghost">
              متن ترکیبی English + فارسی
            </Button>
            <Button variant="destructive">
              حذف فایل
            </Button>
          </div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
          ویژگی‌های دسترسی (Accessibility Features)
        </h2>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            این دکمه‌ها دارای ویژگی‌های دسترسی کامل هستند:
          </p>
          
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>پشتیبانی کامل از صفحه‌خوان‌ها (Screen Readers)</li>
            <li>حالت‌های فوکوس واضح برای ناوبری با کیبورد</li>
            <li>ویژگی‌های ARIA مناسب برای حالت بارگذاری</li>
            <li>اندازه‌های لمسی مناسب برای دستگاه‌های موبایل</li>
            <li>کنتراست رنگی مناسب طبق استاندارد WCAG AA</li>
          </ul>
        </div>
      </section>

      {/* Code Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
          نمونه کد (Code Examples)
        </h2>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">استفاده پایه:</h4>
            <code className="text-sm text-foreground">
              {`<Button>دکمه من</Button>`}
            </code>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">با نوع و اندازه:</h4>
            <code className="text-sm text-foreground">
              {`<Button variant="secondary" size="lg">دکمه بزرگ</Button>`}
            </code>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">با حالت بارگذاری:</h4>
            <code className="text-sm text-foreground">
              {`<Button isLoading>در حال بارگذاری...</Button>`}
            </code>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ButtonExamples;
