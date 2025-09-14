import { createRoot } from "react-dom/client";
import { Auth0Provider } from '@auth0/auth0-react';
import App from "./App";
import "./index.css";

// Get Auth0 credentials from environment or use defaults
const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN || "dev-fn17cva7nqyzrv01.us.auth0.com";
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID || "9Lolf38FMSAOTgkbFUTtLDA1XIxMT0Ib";

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