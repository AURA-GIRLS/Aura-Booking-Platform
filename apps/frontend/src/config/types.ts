export interface Config {
  // Client
  port: number;

  publicAPI: string;
  
  // Environment
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
}
