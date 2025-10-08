'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkipLink {
  href: string;
  label: string;
}

interface SkipLinksProps {
  links: SkipLink[];
  className?: string;
}

export function SkipLinks({ links, className }: SkipLinksProps) {
  return (
    <div className={cn('sr-only focus-within:not-sr-only', className)}>
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="
            block px-4 py-2 m-2 bg-blue-600 text-white rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition-all duration-200
            hover:bg-blue-700
          "
          onClick={(e) => {
            e.preventDefault();
            const target = document.querySelector(link.href);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
              (target as HTMLElement).focus();
            }
          }}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

// Default skip links for the application
const defaultSkipLinks: SkipLink[] = [
  { href: '#main-content', label: 'برو به محتوای اصلی' },
  { href: '#navigation', label: 'برو به منوی اصلی' },
  { href: '#search', label: 'برو به جستجو' },
];

export function DefaultSkipLinks({ className }: { className?: string }) {
  return <SkipLinks links={defaultSkipLinks} className={className} />;
}
