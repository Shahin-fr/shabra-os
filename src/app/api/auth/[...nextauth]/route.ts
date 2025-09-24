import { handlers } from '@/auth';

// Force Node.js runtime to avoid Edge Runtime issues
export const runtime = 'nodejs';

export const { GET, POST } = handlers;
