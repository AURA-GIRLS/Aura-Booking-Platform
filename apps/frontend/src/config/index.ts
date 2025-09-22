import dotenv from 'dotenv';
import type { Config } from './types';

// Load environment variables
const envFile = process.env.NEXT_PUBLIC_NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile });
// console.log(`Using environment file: ${envFile}`);

export const config = {
  // Server
  port: Number(process.env.NEXT_PUBLIC_PORT || 3000),
  publicAPI: process.env.NEXT_PUBLIC_API_URL || '',
  originalAPI: process.env.NEXT_PUBLIC_ORIGINAL_API || '',
  // Third-party services
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',

  // Environment
  nodeEnv: process.env.NEXT_PUBLIC_NODE_ENV || 'development',
  isDevelopment: process.env.NEXT_PUBLIC_NODE_ENV !== 'production',
  isProduction: process.env.NEXT_PUBLIC_NODE_ENV === 'production'
} satisfies Config;


