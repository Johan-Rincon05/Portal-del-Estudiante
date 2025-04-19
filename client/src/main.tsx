import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Extend global env with supabase keys
declare global {
  interface ImportMetaEnv {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
  }
}

createRoot(document.getElementById("root")!).render(<App />);
