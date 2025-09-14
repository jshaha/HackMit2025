import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Check for Supabase credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

console.log('Supabase configuration:', { url: SUPABASE_URL, key: SUPABASE_ANON_KEY?.substring(0, 20) + '...' });

createRoot(document.getElementById("root")!).render(<App />);