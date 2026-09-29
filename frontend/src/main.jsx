import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/variables.css";
import "./index.css";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/theme-toggle.css";
import "./styles/dashboard.css";
import "./styles/pages.css";
import "./styles/wizard.css";
import "./styles/loader.css";
import "./styles/motion.css";
import "./styles/creative.css";
import "./styles/integration.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
