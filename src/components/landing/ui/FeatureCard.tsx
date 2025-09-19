'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'indigo' | 'red';
  benefits: string[];
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  indigo: 'from-indigo-500 to-indigo-600',
  red: 'from-red-500 to-red-600',
};

const iconBgClasses = {
  blue: 'bg-blue-100',
  purple: 'bg-purple-100',
  green: 'bg-green-100',
  orange: 'bg-orange-100',
  indigo: 'bg-indigo-100',
  red: 'bg-red-100',
};

const iconColorClasses = {
  blue: 'text-blue-600',
  purple: 'text-purple-600',
  green: 'text-green-600',
  orange: 'text-orange-600',
  indigo: 'text-indigo-600',
  red: 'text-red-600',
};

export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  color, 
  benefits 
}: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full"
    >
      {/* Icon */}
      <div className={`w-16 h-16 ${iconBgClasses[color]} rounded-xl flex items-center justify-center mb-6`}>
        <Icon className={`w-8 h-8 ${iconColorClasses[color]}`} />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6 leading-relaxed">
        {description}
      </p>

      {/* Benefits List */}
      <ul className="space-y-2">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      {/* Learn More Link */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        className={`mt-6 text-sm font-semibold bg-gradient-to-r ${colorClasses[color]} text-white px-4 py-2 rounded-lg hover:shadow-md transition-all duration-300`}
      >
        بیشتر بدانید
      </motion.button>
    </motion.div>
  );
}
