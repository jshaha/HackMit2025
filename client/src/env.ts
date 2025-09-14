// Environment configuration for client-side

// Type for our environment variables
type Env = {
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
};

// Get environment variables with type safety
const getEnv = (): Env => {
  // In Vite, environment variables are available on import.meta.env
  // The 'as any' is used here because we've already defined the types in vite.config.ts
  const env = (import.meta as any).env;
  
  // Get values with fallbacks
  const domain = env.VITE_AUTH0_DOMAIN || '';
  const clientId = env.VITE_AUTH0_CLIENT_ID || '';
  
  return {
    AUTH0_DOMAIN: domain,
    AUTH0_CLIENT_ID: clientId,
  };
};

// Export the environment variables
export const env = getEnv();

// Log environment for debugging (only in development)
if ((import.meta as any).env.DEV) {
  console.log('Environment:', {
    AUTH0_DOMAIN: env.AUTH0_DOMAIN ? '***' + env.AUTH0_DOMAIN.slice(-8) : 'missing',
    AUTH0_CLIENT_ID: env.AUTH0_CLIENT_ID ? '***' + env.AUTH0_CLIENT_ID.slice(-4) : 'missing',
    nodeEnv: (import.meta as any).env.MODE,
  });
}
