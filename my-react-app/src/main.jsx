import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./LoginContext.jsx";
import { LibraryProvider } from "./LibraryContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <LibraryProvider>
        <App />
      </LibraryProvider>
    </AuthProvider>
  </StrictMode>,
);
