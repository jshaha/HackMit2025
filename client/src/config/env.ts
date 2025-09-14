// Environment configuration for Vite
const env = {
  // Auth0 (optional - only if using Auth0)
  AUTH0_DOMAIN: import.meta.env.VITE_AUTH0_DOMAIN as string,
  AUTH0_CLIENT_ID: import.meta.env.VITE_AUTH0_CLIENT_ID as string,
  
  // API
  API_URL: import.meta.env.VITE_API_URL as string,
  
  // Third-party services
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY as string,
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  ANTHROPIC_API_KEY: (import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.ANTHROPIC_API_KEY) as string
};

// Type safety for environment variables
type EnvKeys = keyof typeof env;

// Validate required environment variables (Supabase is optional for development)
const requiredVars: EnvKeys[] = [];
for (const key of requiredVars) {
  if (!env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export { env };