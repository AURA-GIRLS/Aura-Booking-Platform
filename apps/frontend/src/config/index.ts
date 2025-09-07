import dotenv from 'dotenv';
import type { Config } from './types';

// Load environment variables
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.dev";
dotenv.config({ path: envFile });


export const config = {
  // Server
  port: Number(process.env.PORT || 3000),
  publicAPI: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production'
} satisfies Config;


