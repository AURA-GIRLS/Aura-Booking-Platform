import { config } from "config";

export function getCookieDomain(): string | undefined {
  if (!config.isProduction) return undefined;
  
  try {
    const url = new URL(config.clientOrigin);
    const hostname = url.hostname;
    
    // Không set domain cho localhost
    if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
      return undefined;
    }
    console.log("is production:", config.isProduction);
    console.log('Determined cookie domain:', `.${hostname}`);
    return `.${hostname}`;
  } catch {
    return undefined;
  }
}