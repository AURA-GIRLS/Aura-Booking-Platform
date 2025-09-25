import { config } from "config";

export function getCookieDomain(): string | undefined {
  if (!config.isProduction) return undefined;
  
  try {
    const url = new URL(config.clientOrigin);
    const hostname = url.hostname; // www.auramakeup.click
    
    // Không set domain cho localhost
    if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
      return undefined;
    }
    
    // Extract root domain từ hostname
    const parts = hostname.split('.');
    let rootDomain: string;
    
    if (parts.length >= 2) {
      // Lấy 2 phần cuối: auramakeup.click
      rootDomain = parts.slice(-2).join('.');
    } else {
      // Fallback nếu hostname không có subdomain
      rootDomain = hostname;
    }
    
    const cookieDomain = `.${rootDomain}`;
    console.log("is production:", config.isProduction);
    console.log('Client hostname:', hostname);
    console.log('Determined cookie domain:', cookieDomain);
    
    return cookieDomain;
  } catch (error) {
    console.error('Failed to determine cookie domain:', error);
    return undefined;
  }
}