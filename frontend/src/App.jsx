import { Routes, Route } from "react-router";

import LandingPage from "./pages/LandingPage.jsx";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  return (
    <Routes>
      {/* LANDING PAGE */}
      <Route
        path="/"
        element={<LandingPage />}
      />

      {/* LOGIN */}
      <Route
        path="/login"
        element={<Auth initialMode="login" />}
      />

      {/* REGISTER */}
      <Route
        path="/register"
        element={<Auth initialMode="register" />}
      />

      {/* DASHBOARD */}
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />
    </Routes>
  );
}