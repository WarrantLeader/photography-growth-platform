import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Icon } from "./UI";
import { useAuth } from "../auth/AuthContext";
import { useStudio } from "../state/StudioContext";
export default function Layout() {
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { storageError } = useStudio();
  const names: Record<string, string> = {
    dashboard: "Overview",
    leads: "Leads & clients",
    campaigns: "Campaigns",
    projects: "Projects",
    files: "Project files",
    analytics: "Analytics",
    invoices: "Invoices",
    settings: "Settings",
  };
  return (
    <div className="app-shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="main-shell">
        <header className="topbar">
          <div>
            <button
              className="icon-button mobile-menu"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
              aria-expanded={open}
              aria-controls="studio-sidebar"
            >
              <Icon name="menu" />
            </button>
            <span>Workspace</span>
            <Icon name="chevron" size={12} />
            <b>{names[pathname.split("/")[1]] || "Studio"}</b>
          </div>
          <div>
            <span className="demo-pill">
              {auth?.demo ? "Demo workspace" : "Signed in"}
            </span>
            <div className="avatar">TA</div>
          </div>
        </header>
        <main className="content">
          {storageError && (
            <div className="notice error" role="alert">
              {storageError}
            </div>
          )}
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>Mr T Captures · Studio workspace</span>
          <span>Records saved in this browser</span>
        </footer>
      </div>
    </div>
  );
}
