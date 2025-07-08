import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { STLFileProvider } from "./contexts/STLFileContext";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <STLFileProvider>
        <App />
      </STLFileProvider>
    </AuthProvider>
  </BrowserRouter>
);
