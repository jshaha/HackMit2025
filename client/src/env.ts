// Environment configuration for client-side
export const env = {
  AUTH0_DOMAIN: import.meta.env.VITE_AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: import.meta.env.VITE_AUTH0_CLIENT_ID,
} as const;

// Validate required environment variables
const requiredEnvVars = {
  VITE_AUTH0_DOMAIN: env.AUTH0_DOMAIN,
  VITE_AUTH0_CLIENT_ID: env.AUTH0_CLIENT_ID,
};

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
