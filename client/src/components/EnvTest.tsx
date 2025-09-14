import { useEffect } from 'react';

// Helper to safely access environment variables
const getEnv = (key: string): string | undefined => {
  try {
    return (import.meta as any).env?.[key];
  } catch (error) {
    console.error(`Error accessing environment variable ${key}:`, error);
    return undefined;
  }
};

export default function EnvTest() {
  useEffect(() => {
    console.log('Environment Variables:', {
      VITE_AUTH0_DOMAIN: getEnv('VITE_AUTH0_DOMAIN'),
      VITE_AUTH0_CLIENT_ID: getEnv('VITE_AUTH0_CLIENT_ID'),
      NODE_ENV: getEnv('MODE'),
    });
  }, []);

  const domain = getEnv('VITE_AUTH0_DOMAIN');
  const clientId = getEnv('VITE_AUTH0_CLIENT_ID');
  const nodeEnv = getEnv('MODE');

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded m-4">
      <h2 className="font-bold mb-2">Environment Test</h2>
      <div className="space-y-2">
        <p><strong>VITE_AUTH0_DOMAIN:</strong> {domain ? '✅ Loaded' : '❌ Missing'}</p>
        <p><strong>VITE_AUTH0_CLIENT_ID:</strong> {clientId ? '✅ Loaded' : '❌ Missing'}</p>
        <p><strong>NODE_ENV:</strong> {nodeEnv || 'unknown'}</p>
      </div>
      <p className="mt-4 text-sm">Check the browser console for more detailed environment information.</p>
    </div>
  );
}
