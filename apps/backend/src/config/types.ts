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

  //Payos
  payosClientId: string;
  payosApiKey: string;
  payosChecksumKey: string;
  payosApiUrl: string;

  //Cloudinary
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  cloudinaryCloudName: string;
  
  // Environment
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
}
