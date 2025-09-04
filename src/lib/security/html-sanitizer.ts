/**
 * Secure HTML Sanitizer
 * Removes potentially dangerous HTML elements and attributes to prevent XSS attacks
 */

import { logger } from '../logger';

// TODO: ALLOWED_TAGS not used - needs to be restored or removed
// const ALLOWED_TAGS = [
//   'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
//   'p', 'br', 'hr',
//   'strong', 'b', 'em', 'i', 'u', 's',
//   'ul', 'ol', 'li',
//   'blockquote', 'pre', 'code',
//   'a', 'img',
//   'table', 'thead', 'tbody', 'tr', 'th', 'td',
//   'div', 'span'
// ];

// Allowed HTML attributes
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'title', 'target'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  code: ['class'],
  pre: ['class'],
  div: ['class'],
  span: ['class'],
  table: ['class', 'width'],
  th: ['class', 'colspan', 'rowspan'],
  td: ['class', 'colspan', 'rowspan'],
};

// Allowed CSS classes (whitelist approach)
const ALLOWED_CSS_CLASSES = [
  'language-',
  'hljs',
  'highlight',
  'text-',
  'bg-',
  'border-',
  'rounded-',
  'p-',
  'm-',
  'w-',
  'h-',
  'flex',
  'grid',
  'hidden',
  'block',
  'prose',
  'markdown',
];

/**
 * Sanitize HTML content by removing dangerous elements and attributes
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    // Create a temporary DOM element to parse and sanitize HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove dangerous elements
    removeDangerousElements(tempDiv);

    // Sanitize attributes
    sanitizeAttributes(tempDiv);

    // Remove any remaining script tags and event handlers
    removeScriptsAndEvents(tempDiv);

    // Get sanitized HTML
    const sanitized = tempDiv.innerHTML;

    // Additional regex-based cleanup for any remaining dangerous content
    return performRegexCleanup(sanitized);
  } catch (error) {
    logger.error('HTML sanitization error:', error as Error);
    // Return empty string on error to prevent XSS
    return '';
  }
}

/**
 * Remove dangerous HTML elements
 */
function removeDangerousElements(element: Element): void {
  const dangerousSelectors = [
    'script',
    'object',
    'embed',
    'applet',
    'form',
    'input',
    'textarea',
    'select',
    'button',
    'iframe',
    'frame',
    'frameset',
    'noframes',
    'noscript',
    'style',
    'link',
    'meta',
    'title',
    'head',
    'body',
  ];

  dangerousSelectors.forEach(selector => {
    const elements = element.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });
}

/**
 * Sanitize HTML attributes
 */
function sanitizeAttributes(element: Element): void {
  const allElements = element.querySelectorAll('*');

  allElements.forEach(el => {
    const tagName = el.tagName.toLowerCase();
    const allowedAttrs = ALLOWED_ATTRIBUTES[tagName] || [];

    // Get all attributes
    const attributes = Array.from(el.attributes);

    attributes.forEach(attr => {
      const attrName = attr.name.toLowerCase();
      const attrValue = attr.value;

      // Remove attribute if not allowed
      if (!allowedAttrs.includes(attrName)) {
        el.removeAttribute(attrName);
        return;
      }

      // Special handling for specific attributes
      if (attrName === 'href') {
        // Only allow safe URLs
        if (!isSafeUrl(attrValue)) {
          el.removeAttribute(attrName);
        }
      } else if (attrName === 'src') {
        // Only allow safe image sources
        if (!isSafeImageSource(attrValue)) {
          el.removeAttribute(attrName);
        }
      } else if (attrName === 'class') {
        // Sanitize CSS classes
        const sanitizedClasses = sanitizeCssClasses(attrValue);
        if (sanitizedClasses) {
          el.setAttribute(attrName, sanitizedClasses);
        } else {
          el.removeAttribute(attrName);
        }
      }
    });
  });
}

/**
 * Remove any remaining script tags and event handlers
 */
function removeScriptsAndEvents(element: Element): void {
  // Remove elements with event handlers
  const elementsWithEvents = element.querySelectorAll('*');
  elementsWithEvents.forEach(el => {
    const attributes = Array.from(el.attributes);
    attributes.forEach(attr => {
      if (attr.name.startsWith('on') || attr.name.startsWith('javascript:')) {
        el.removeAttribute(attr.name);
      }
    });
  });
}

/**
 * Check if URL is safe
 */
function isSafeUrl(url: string): boolean {
  if (!url) return false;

  // Allow relative URLs
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return true;
  }

  // Allow data URLs for images only
  if (url.startsWith('data:image/')) {
    return true;
  }

  // Allow HTTPS URLs
  if (url.startsWith('https://')) {
    return true;
  }

  // Allow HTTP URLs only for localhost in development
  if (
    process.env.NODE_ENV === 'development' &&
    url.startsWith('http://localhost')
  ) {
    return true;
  }

  return false;
}

/**
 * Check if image source is safe
 */
function isSafeImageSource(src: string): boolean {
  if (!src) return false;

  // Allow relative URLs
  if (src.startsWith('/') || src.startsWith('./') || src.startsWith('../')) {
    return true;
  }

  // Allow data URLs for images
  if (src.startsWith('data:image/')) {
    return true;
  }

  // Allow HTTPS URLs
  if (src.startsWith('https://')) {
    return true;
  }

  // Allow HTTP URLs only for localhost in development
  if (
    process.env.NODE_ENV === 'development' &&
    src.startsWith('http://localhost')
  ) {
    return true;
  }

  return false;
}

/**
 * Sanitize CSS classes
 */
function sanitizeCssClasses(classes: string): string {
  if (!classes) return '';

  const classList = classes.split(' ').filter(Boolean);
  const sanitizedClasses = classList.filter(className => {
    // Check if class is in whitelist
    return ALLOWED_CSS_CLASSES.some(
      allowed =>
        className.startsWith(allowed) ||
        className === allowed ||
        /^[a-zA-Z0-9_-]+$/.test(className) // Allow alphanumeric, underscore, hyphen
    );
  });

  return sanitizedClasses.join(' ');
}

/**
 * Perform additional regex-based cleanup
 */
function performRegexCleanup(html: string): string {
  return (
    html
      // Remove any remaining script tags
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      // Remove any remaining event handlers
      .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
      // Remove javascript: URLs
      .replace(/javascript:/gi, '')
      // Remove vbscript: URLs
      .replace(/vbscript:/gi, '')
      // Remove data: URLs that aren't images
      .replace(/data:(?!image\/)[^;]*;base64,[^"']*/gi, '')
      // Remove any remaining dangerous protocols
      .replace(/[a-z]+:\/\/(?!https?:\/\/)[^"']*/gi, '')
  );
}

/**
 * Sanitize HTML content for server-side use (when DOM is not available)
 */
export function sanitizeHtmlServer(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Server-side regex-based sanitization
  return (
    html
      // Remove script tags
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      // Remove object, embed, applet tags
      .replace(/<(object|embed|applet)[^>]*>.*?<\/(object|embed|applet)>/gi, '')
      // Remove iframe tags
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      // Remove form tags
      .replace(/<form[^>]*>.*?<\/form>/gi, '')
      // Remove input, textarea, select, button tags
      .replace(/<(input|textarea|select|button)[^>]*>/gi, '')
      // Remove event handlers
      .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
      // Remove javascript: URLs
      .replace(/javascript:/gi, '')
      // Remove vbscript: URLs
      .replace(/vbscript:/gi, '')
      // Remove data: URLs that aren't images
      .replace(/data:(?!image\/)[^;]*;base64,[^"']*/gi, '')
      // Remove any remaining dangerous protocols
      .replace(/[a-z]+:\/\/(?!https?:\/\/)[^"']*/gi, '')
  );
}
