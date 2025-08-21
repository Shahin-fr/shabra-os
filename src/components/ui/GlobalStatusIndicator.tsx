"use client";

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useStatusStore } from '@/stores/statusStore';

export function GlobalStatusIndicator() {
  const { status, message, reset } = useStatusStore();

  // Auto-reset success and error states after a delay
  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => {
        reset();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, reset]);

  if (status === 'idle') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-20 right-6 z-50"
      >
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border border-white/20"
          style={{
            background: status === 'loading' 
              ? 'rgba(59, 130, 246, 0.95)' 
              : status === 'success'
              ? 'rgba(34, 197, 94, 0.95)'
              : 'rgba(239, 68, 68, 0.95)',
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.2),
              0 10px 30px ${status === 'loading' 
                ? 'rgba(59, 130, 246, 0.3)' 
                : status === 'success'
                ? 'rgba(34, 197, 94, 0.3)'
                : 'rgba(239, 68, 68, 0.3)'
              },
              inset 0 1px 0 rgba(255, 255, 255, 0.3)
            `
          }}
        >
          {/* Icon */}
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: status === 'loading' ? 360 : 0 }}
            transition={{ 
              duration: status === 'loading' ? 1 : 0.3, 
              repeat: status === 'loading' ? Infinity : 0,
              ease: "linear"
            }}
            className="flex-shrink-0"
          >
            {status === 'loading' && <Loader2 className="h-5 w-5 text-white" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-white" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-white" />}
          </motion.div>

          {/* Message */}
          {message && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white font-medium text-sm whitespace-nowrap"
            >
              {message}
            </motion.span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
