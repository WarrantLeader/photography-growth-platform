import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { StudioProvider } from "./state/StudioContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import Invoices from "./pages/Invoices";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetails from "./pages/LeadsDetail";
import Campaigns from "./pages/Campaigns";
import Projects from "./pages/Projects";
import ProjectFiles from "./pages/ProjectFiles";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
function WorkspaceData({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return (
    <StudioProvider
      key={auth?.userId || "signed-out"}
      storageKey={
        auth?.userId
          ? "mrt-studio-v1:" + auth.userId
          : "mrt-studio-v1:signed-out"
      }
    >
      {children}
    </StudioProvider>
  );
}
function Protected() {
  const auth = useAuth();
  if (auth?.loading)
    return <div className="auth-info">Checking your session…</div>;
  return auth?.user ? <Layout /> : <Navigate to="/login" replace />;
}
export default function App() {
  useEffect(() => {
    try {
      document.documentElement.dataset.theme =
        localStorage.getItem("mrt-theme") || "light";
    } catch {}
  }, []);
  return (
    <AuthProvider>
      <WorkspaceData>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<Protected />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/leads/:id" element={<LeadDetails />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/files" element={<ProjectFiles />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </WorkspaceData>
    </AuthProvider>
  );
}
