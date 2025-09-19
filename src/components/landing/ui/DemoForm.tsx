'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export function DemoForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    companySize: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your API
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          درخواست شما ثبت شد!
        </h3>
        <p className="text-gray-600 mb-6">
          تیم ما در کمتر از 24 ساعت با شما تماس خواهد گرفت
        </p>
        <Button
          onClick={() => setIsSubmitted(false)}
          variant="outline"
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          ارسال درخواست جدید
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
          نام و نام خانوادگی *
        </Label>
        <Input
          id="name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="mt-1"
          placeholder="نام خود را وارد کنید"
        />
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          ایمیل *
        </Label>
        <Input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="mt-1"
          placeholder="example@company.com"
        />
      </div>

      {/* Phone */}
      <div>
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
          شماره تماس *
        </Label>
        <Input
          id="phone"
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className="mt-1"
          placeholder="09123456789"
        />
      </div>

      {/* Company */}
      <div>
        <Label htmlFor="company" className="text-sm font-medium text-gray-700">
          نام شرکت *
        </Label>
        <Input
          id="company"
          type="text"
          required
          value={formData.company}
          onChange={(e) => handleInputChange('company', e.target.value)}
          className="mt-1"
          placeholder="نام شرکت خود را وارد کنید"
        />
      </div>

      {/* Position */}
      <div>
        <Label htmlFor="position" className="text-sm font-medium text-gray-700">
          سمت
        </Label>
        <Input
          id="position"
          type="text"
          value={formData.position}
          onChange={(e) => handleInputChange('position', e.target.value)}
          className="mt-1"
          placeholder="مدیرعامل، مدیر فناوری و..."
        />
      </div>

      {/* Company Size */}
      <div>
        <Label htmlFor="companySize" className="text-sm font-medium text-gray-700">
          اندازه شرکت
        </Label>
        <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="انتخاب کنید" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-10">1-10 نفر</SelectItem>
            <SelectItem value="11-50">11-50 نفر</SelectItem>
            <SelectItem value="51-200">51-200 نفر</SelectItem>
            <SelectItem value="200+">بیش از 200 نفر</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Message */}
      <div>
        <Label htmlFor="message" className="text-sm font-medium text-gray-700">
          پیام (اختیاری)
        </Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          className="mt-1"
          placeholder="نیازهای خاص خود را شرح دهید..."
          rows={4}
        />
      </div>

      {/* Submit Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          درخواست دموی رایگان
          <ArrowLeft className="mr-2 w-5 h-5" />
        </Button>
      </motion.div>

      {/* Privacy Note */}
      <p className="text-xs text-gray-500 text-center">
        با ارسال این فرم، شما با قوانین حریم خصوصی ما موافقت می‌کنید
      </p>
    </form>
  );
}
