export interface Config {
  // Server
  port: number;
  clientOrigin: string;
  
  // Database
  mongoUri: string;
  redisHost: string;
  redisPort: number;
  redisPassword: string;

  //azure
  azureClientId: string;
  azureClientSecret: string;
  azureTenantId: string;
  
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

  //Payos
  payosClientId: string;
  payosApiKey: string;
  payosChecksumKey: string;
  payosApiUrl: string;
  
  // Environment
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
}
