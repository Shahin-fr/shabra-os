'use client';

import { motion } from 'framer-motion';
import { 
  HeroSection, 
  FeaturesSection, 
  BenefitsSection, 
  HowItWorksSection, 
  TestimonialsSection, 
  PricingSection, 
  CTASection, 
  FooterSection 
} from '@/components/landing/sections';
import { LandingHeader } from '@/components/landing/layout/LandingHeader';
import { ScrollIndicator } from '@/components/landing/ui/ScrollIndicator';

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <LandingHeader />
      
      {/* Scroll Progress Indicator */}
      <ScrollIndicator />
      
      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <motion.section
          id="hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          <HeroSection />
        </motion.section>

        {/* Features Section */}
        <motion.section
          id="features"
          className="py-20 bg-white"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <FeaturesSection />
        </motion.section>

        {/* Benefits Section */}
        <motion.section
          id="benefits"
          className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <BenefitsSection />
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          id="how-it-works"
          className="py-20 bg-white"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <HowItWorksSection />
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          id="testimonials"
          className="py-20 bg-gradient-to-r from-purple-50 to-pink-50"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <TestimonialsSection />
        </motion.section>

        {/* Pricing Section */}
        <motion.section
          id="pricing"
          className="py-20 bg-white"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <PricingSection />
        </motion.section>

        {/* CTA Section */}
        <motion.section
          id="cta"
          className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <CTASection />
        </motion.section>
      </main>

      {/* Footer */}
      <FooterSection />
    </div>
  );
}
