export interface Config {
  // Client
  port: number;

  publicAPI: string;

  googleClientId: string;
  
  // Environment
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
}
