import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { Brand, Icon } from "./UI";
import { useAuth } from "../auth/AuthContext";
const items = [
  ["/dashboard", "grid", "Overview"],
  ["/leads", "users", "Leads & clients"],
  ["/campaigns", "campaign", "Campaigns"],
  ["/projects", "briefcase", "Projects"],
  ["/files", "folder", "Project files"],
  ["/invoices", "file", "Invoices"],
  ["/analytics", "chart", "Analytics"],
];
export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const auth = useAuth();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useLayoutEffect(() => {
    if (!open) return;
    const mobile = window.matchMedia("(max-width: 640px)");
    if (!mobile.matches) return;
    const y = window.scrollY;
    const x = window.scrollX;
    const body = document.body;
    const html = document.documentElement;
    const saved = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    const htmlOverflow = html.style.overflow;
    body.style.position = "fixed";
    body.style.top = `${-y}px`;
    body.style.left = `${-x}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    const resize = () => {
      if (!mobile.matches) closeRef.current();
    };
    document.addEventListener("keydown", escape);
    mobile.addEventListener("change", resize);
    return () => {
      Object.assign(body.style, saved);
      html.style.overflow = htmlOverflow;
      window.scrollTo(x, y);
      document.removeEventListener("keydown", escape);
      mobile.removeEventListener("change", resize);
    };
  }, [open]);
  return createPortal(
    <>
      <div
        className={"sidebar-shade " + (open ? "visible" : "")}
        onClick={onClose}
      />
      <aside
        id="studio-sidebar"
        aria-label="Studio navigation"
        className={"sidebar " + (open ? "open" : "")}
      >
        <button
          className="icon-button sidebar-close"
          aria-label="Close navigation"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
        <Brand />
        <div className="workspace-card">
          <div className="avatar">T</div>
          <div>
            Tiago’s workspace<small>Photography CRM</small>
          </div>
          <span>⌄</span>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {items.map(([to, icon, label]) => (
            <NavLink
              to={to}
              key={to}
              onClick={onClose}
              className={({ isActive }) =>
                "nav-item " + (isActive ? "active" : "")
              }
            >
              <Icon name={icon} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <NavLink to="/files" className="nas-card" onClick={onClose}>
            <Icon name="drive" />
            <div>
              UGREEN NAS<small>Project file access</small>
            </div>
            <Icon name="arrow" size={13} />
          </NavLink>
          <NavLink to="/settings" className="nav-item" onClick={onClose}>
            <Icon name="settings" />
            <span>Settings</span>
          </NavLink>
          <button className="nav-item" onClick={auth?.logout}>
            <Icon name="logout" />
            <span>Leave workspace</span>
          </button>
          <div className="profile">
            <div className="avatar peach">TA</div>
            <div>
              Tiago Arnell<small>Mr T Captures</small>
            </div>
            <span className="status-dot" />
          </div>
        </div>
      </aside>
    </>,
    document.body,
  );
}
