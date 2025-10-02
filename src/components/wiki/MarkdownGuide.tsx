'use client';

import { HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function MarkdownGuide() {
  const [open, setOpen] = useState(false);

  const markdownExamples = [
    {
      title: 'عنوان‌ها',
      syntax: '# عنوان اصلی\n## عنوان فرعی\n### عنوان کوچک',
      description: 'برای ایجاد عنوان از # استفاده کنید'
    },
    {
      title: 'متن پررنگ و کج',
      syntax: '**متن پررنگ** و *متن کج*',
      description: 'از ** برای پررنگ و * برای کج استفاده کنید'
    },
    {
      title: 'لیست‌ها',
      syntax: '- آیتم اول\n- آیتم دوم\n  - زیرآیتم\n\n1. آیتم شماره‌دار\n2. آیتم دوم',
      description: 'از - برای لیست معمولی و از اعداد برای لیست شماره‌دار استفاده کنید'
    },
    {
      title: 'لینک و تصویر',
      syntax: '[متن لینک](https://example.com)\n![متن تصویر](image.jpg)',
      description: 'لینک‌ها و تصاویر را با این فرمت اضافه کنید'
    },
    {
      title: 'کد',
      syntax: 'متن `کد درون خطی`\n\n```javascript\nconst x = 1;\nconsole.log(x);\n```',
      description: 'از ` برای کد درون خطی و ``` برای بلوک کد استفاده کنید'
    },
    {
      title: 'نقل قول',
      syntax: '> این یک نقل قول است\n> می‌تواند چند خط باشد',
      description: 'از > برای ایجاد نقل قول استفاده کنید'
    },
    {
      title: 'جدول',
      syntax: '| ستون 1 | ستون 2 |\n|---------|--------|\n| داده 1  | داده 2  |',
      description: 'جداول را با | ایجاد کنید'
    },
    {
      title: 'خط افقی',
      syntax: '---\nیا\n***',
      description: 'برای ایجاد خط افقی از --- یا *** استفاده کنید'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          <HelpCircle className="h-3 w-3 me-1" />
          راهنمای Markdown
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>راهنمای Markdown</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Markdown یک زبان نشانه‌گذاری ساده است که به شما امکان ایجاد متن فرمت شده را می‌دهد.
          </p>
          
          {markdownExamples.map((example, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">{example.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{example.description}</p>
              <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                <pre className="whitespace-pre-wrap text-right">{example.syntax}</pre>
              </div>
            </div>
          ))}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">💡 نکات مفید</h3>
            <ul className="text-sm text-blue-700 space-y-1 text-right">
              <li>• برای ایجاد خط جدید، دو فاصله در انتهای خط اضافه کنید</li>
              <li>• می‌توانید HTML را مستقیماً در Markdown استفاده کنید</li>
              <li>• از تب "پیش‌نمایش" برای دیدن نتیجه نهایی استفاده کنید</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
