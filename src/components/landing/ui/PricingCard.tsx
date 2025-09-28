'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limitations: string[];
  color: 'blue' | 'purple' | 'green';
  popular: boolean;
  cta: string;
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  green: 'from-green-500 to-green-600',
};


export function PricingCard({ 
  name, 
  price, 
  period, 
  description, 
  features, 
  limitations, 
  color, 
  popular, 
  cta 
}: PricingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
        popular ? `border-${color}-500` : 'border-gray-200'
      } h-full`}
    >
      {/* Popular Badge */}
      {popular && (
        <div className={`absolute -top-4 start-1/2 transform -translate-x-1/2 bg-gradient-to-r ${colorClasses[color]} text-white px-6 py-2 rounded-full text-sm font-semibold`}>
          محبوب‌ترین
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        
        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-bold text-gray-900">{price}</span>
            <span className="text-gray-600 me-2">تومان</span>
          </div>
          <div className="text-gray-600">{period}</div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </div>
        ))}
        
        {limitations.map((limitation, index) => (
          <div key={`limitation-${index}`} className="flex items-center gap-3 opacity-50">
            <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span className="text-gray-500 line-through">{limitation}</span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
          popular
            ? `bg-gradient-to-r ${colorClasses[color]} text-white hover:shadow-lg`
            : `border-2 border-${color}-500 text-${color}-600 hover:bg-${color}-50`
        }`}
      >
        {cta}
      </motion.button>

      {/* Additional Info */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          شامل دموی رایگان 14 روزه
        </p>
      </div>
    </motion.div>
  );
}
