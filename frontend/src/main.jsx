import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/theme-toggle.css";
import "./styles/dashboard.css";
import "./styles/pages.css";
import "./styles/wizard.css";
import "./styles/loader.css";
import "./styles/motion.css";
import "./styles/creative.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
