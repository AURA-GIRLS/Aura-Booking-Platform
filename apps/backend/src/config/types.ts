export interface Config {
  // Server
  port: number;
  clientOrigin: string;
  
  // Database
  mongoUri: string;
  redisUri: string;
  
  // Security
  jwtSecret: string;
  
  // Email Service
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  
  // Third-party services
  googleClientId: string;
  googleClientSecret: string;
  sepayApiKey: string;
  cloudinaryApiKey: string;
  resendApiKey: string;
  twilioApiKey: string;
  upstashRedisUrl: string;
  
  // Environment
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
}
