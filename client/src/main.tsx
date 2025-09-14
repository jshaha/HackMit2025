import { createRoot } from "react-dom/client";
import { Auth0Provider } from '@auth0/auth0-react';
import App from "./App";
import "./index.css";
import { env } from "./env";
import ErrorBoundary from "./components/ErrorBoundary";

// Helper to safely access environment variables
const getEnv = (key: string): string | undefined => {
  try {
    return (import.meta as any).env?.[key];
  } catch (error) {
    console.error(`Error accessing environment variable ${key}:`, error);
    return undefined;
  }
};

// Log environment variables (only in development)
if (getEnv('MODE') === 'development') {
  console.log('Environment:', {
    domain: env.AUTH0_DOMAIN,
    clientId: env.AUTH0_CLIENT_ID ? '***' + env.AUTH0_CLIENT_ID.slice(-4) : undefined,
    nodeEnv: getEnv('MODE')
  });
}

// Check if root element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Add a temporary loading message
rootElement.innerHTML = `
  <div style="
    padding: 20px; 
    font-family: Arial;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    flex-direction: column;
  ">
    <h2>Loading MindMap Application</h2>
    <p>Please wait while we load your environment...</p>
    <div style="margin-top: 20px; width: 100%; max-width: 300px; height: 4px; background: #e0e0e0; border-radius: 2px; overflow: hidden;">
      <div style="width: 100%; height: 100%; background: #4CAF50; animation: progress 2s ease-in-out infinite;"></div>
    </div>
    <style>
      @keyframes progress {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    </style>
  </div>
`;

// Render the app
const renderApp = () => {
  try {
    if (!env.AUTH0_DOMAIN || !env.AUTH0_CLIENT_ID) {
      throw new Error('Missing required Auth0 configuration. Please check your environment variables.');
    }

    createRoot(rootElement).render(
      <ErrorBoundary>
        <Auth0Provider
          domain={env.AUTH0_DOMAIN}
          clientId={env.AUTH0_CLIENT_ID}
          authorizationParams={{
            redirect_uri: window.location.origin,
            audience: `https://${env.AUTH0_DOMAIN}/api/v2/`
          }}
          cacheLocation="localstorage"
          useRefreshTokens={true}
        >
          <App />
        </Auth0Provider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    rootElement.innerHTML = `
      <div style="
        padding: 40px;
        font-family: Arial;
        color: #721c24;
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        max-width: 600px;
        margin: 40px auto;
      ">
        <h2 style="color: #721c24; margin-top: 0;">Failed to load application</h2>
        <p style="margin: 15px 0;">${error instanceof Error ? error.message : 'An unknown error occurred'}</p>
        <div style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 4px; font-family: monospace; font-size: 14px; overflow-x: auto;">
          <p><strong>Environment:</strong> ${getEnv('MODE') || 'development'}</p>
          <p><strong>Auth0 Domain:</strong> ${env.AUTH0_DOMAIN ? 'Configured' : 'Missing'}</p>
          <p><strong>Auth0 Client ID:</strong> ${env.AUTH0_CLIENT_ID ? 'Configured' : 'Missing'}</p>
        </div>
        <button 
          onclick="window.location.reload()" 
          style="
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #0d6efd;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
          "
        >
          Try Again
        </button>
      </div>
    `;
  }
};

// Start the app
renderApp();
