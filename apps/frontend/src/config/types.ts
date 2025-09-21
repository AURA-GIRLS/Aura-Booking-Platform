export interface Config {
  // Client
  port: number;

  publicAPI: string;
  publicClient: string;

  googleClientId: string;
  
  // Environment
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
}
