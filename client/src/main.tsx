import { createRoot } from "react-dom/client";
import { Auth0Provider } from '@auth0/auth0-react';
import App from "./App";
import "./index.css";

// Get Auth0 credentials from environment variables
const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID;

if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID) {
  throw new Error('Missing required Auth0 environment variables: VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID');
}

console.log('Auth0 configuration:', { domain: AUTH0_DOMAIN, clientId: AUTH0_CLIENT_ID });

createRoot(document.getElementById("root")!).render(
  <Auth0Provider
    domain={AUTH0_DOMAIN}
    clientId={AUTH0_CLIENT_ID}
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
    useRefreshTokens={true}
    cacheLocation="localstorage"
  >
    <App />
  </Auth0Provider>
);