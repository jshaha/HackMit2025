import { createRoot } from "react-dom/client";
import { Auth0Provider } from '@auth0/auth0-react';
import App from "./App";
import "./index.css";
import { env } from "./env";

createRoot(document.getElementById("root")!).render(
  <Auth0Provider
    domain={env.AUTH0_DOMAIN}
    clientId={env.AUTH0_CLIENT_ID}
    authorizationParams={{
      redirectUri: window.location.origin
    }}
  >
    <App />
  </Auth0Provider>
);
