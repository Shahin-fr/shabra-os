// Input sanitization utilities to prevent XSS and injection attacks
// Provides safe input processing for user-generated content

export class InputSanitizer {
  /**
   * Sanitizes HTML content to prevent XSS attacks
   */
  static sanitizeHTML(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove potentially dangerous HTML tags and attributes
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
      .replace(/<input\b[^<]*>/gi, '')
      .replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, '')
      .replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, '')
      .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '')
      .replace(/<link\b[^<]*>/gi, '')
      .replace(/<meta\b[^<]*>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:/gi, '')
      .replace(/expression\s*\(/gi, '');
  }

  /**
   * Sanitizes plain text by removing dangerous characters
   */
  static sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  /**
   * Sanitizes URLs to prevent protocol-based attacks
   */
  static sanitizeURL(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    const url = input.trim();

    // Only allow http, https, and relative URLs
    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('/')
    ) {
      return url;
    }

    // If it's a relative URL without protocol, make it safe
    if (url.startsWith('./') || url.startsWith('../') || !url.includes('://')) {
      return url;
    }

    // Block potentially dangerous protocols
    return '';
  }

  /**
   * Sanitizes email addresses
   */
  static sanitizeEmail(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    const email = input.trim().toLowerCase();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(email)) {
      return email;
    }

    return '';
  }

  /**
   * Sanitizes file names to prevent path traversal attacks
   */
  static sanitizeFileName(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/[<>:"|?*]/g, '') // Remove invalid characters
      .replace(/\.\./g, '') // Remove path traversal attempts
      .replace(/^[/\\]+/, '') // Remove leading slashes
      .trim();
  }

  /**
   * Sanitizes SQL-like input (though Prisma provides protection)
   */
  static sanitizeSQL(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove common SQL injection patterns
    return input
      .replace(/['";]/g, '') // Remove quotes and semicolons
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove SQL comment start
      .replace(/\*\//g, '') // Remove SQL comment end
      .replace(/union\s+select/gi, '') // Remove UNION SELECT
      .replace(/drop\s+table/gi, '') // Remove DROP TABLE
      .replace(/delete\s+from/gi, '') // Remove DELETE FROM
      .trim();
  }

  /**
   * Sanitizes JSON input
   */
  static sanitizeJSON(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    try {
      // Parse and re-stringify to ensure valid JSON
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed);
    } catch {
      return '';
    }
  }

  /**
   * Comprehensive sanitization for user input
   */
  static sanitizeUserInput(
    input: string,
    type:
      | 'html'
      | 'text'
      | 'url'
      | 'email'
      | 'filename'
      | 'sql'
      | 'json' = 'text'
  ): string {
    switch (type) {
      case 'html':
        return this.sanitizeHTML(input);
      case 'url':
        return this.sanitizeURL(input);
      case 'email':
        return this.sanitizeEmail(input);
      case 'filename':
        return this.sanitizeFileName(input);
      case 'sql':
        return this.sanitizeSQL(input);
      case 'json':
        return this.sanitizeJSON(input);
      case 'text':
      default:
        return this.sanitizeText(input);
    }
  }
}
