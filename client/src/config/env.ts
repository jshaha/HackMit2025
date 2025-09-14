// Environment configuration for Vite
const env = {
  // API
  API_URL: import.meta.env.VITE_API_URL as string,
  
  // Application
  NODE_ENV: import.meta.env.MODE as string,
  
  // Optional features
  ENABLE_ANALYTICS: (import.meta.env.VITE_ENABLE_ANALYTICS || 'false') === 'true',
  
  // Third-party services
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY as string,
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  ANTHROPIC_API_KEY: (import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.ANTHROPIC_API_KEY) as string,
  
  // Any other environment variables
  ...import.meta.env
} as const;

// Type safety for environment variables
export type EnvKeys = keyof typeof env;

// Validate required environment variables
const requiredVars: EnvKeys[] = [];
for (const key of requiredVars) {
  if (!env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export { env };