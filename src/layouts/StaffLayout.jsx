import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const links = [
  {to:"/staff/dashboard", label:"Dashboard", icon:"bi-grid-1x2"},
  {to:"/staff/residents", label:"Residents", icon:"bi-people"},
  {to:"/staff/issues", label:"Issues", icon:"bi-exclamation-octagon"},
];

export default function StaffLayout() {
  const [open, setOpen] = useState(false);
  const { session, logout, assignedZone } = useAuth();
  const location = useLocation();
  const current = links.find(x => location.pathname.startsWith(x.to))?.label || "Dashboard";

  return <div className="app-shell">
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div className="d-flex align-items-center gap-3">
          <div className="brand-mark"><i className="bi bi-building-check" /></div>
          <div><div className="fw-bold">Shehia Portal</div><small className="text-white-50">Staff Workspace</small></div>
        </div>
      </div>
      <nav className="py-3 flex-grow-1">
        <div className="px-4 text-uppercase small text-white-50 mb-2">Zone {assignedZone || "-"}</div>
        {links.map(link => <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className="nav-link">
          <i className={`bi ${link.icon}`} /> <span>{link.label}</span>
        </NavLink>)}
      </nav>
      <div className="sidebar-footer">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="rounded-circle bg-white text-success d-grid place-items-center" style={{width:38,height:38}}>
            <i className="bi bi-person" />
          </div>
          <div className="min-w-0"><div className="small fw-semibold text-truncate">{session?.zanId || "Staff"}</div><div className="small text-white-50">Zone {assignedZone || "-"} Staff</div></div>
        </div>
        <button className="btn btn-outline-light btn-sm w-100" onClick={logout}><i className="bi bi-box-arrow-right me-2" />Sign out</button>
      </div>
    </aside>
    {open && <div className="overlay" onClick={() => setOpen(false)} />}
    <main className="main-area">
      <header className="topbar">
        <button className="btn btn-light mobile-menu me-2" onClick={() => setOpen(true)}><i className="bi bi-list fs-5" /></button>
        <div>
          <div className="fw-semibold">{current}</div>
          <div className="small text-secondary d-none d-sm-block">Zone {assignedZone || "-"} - Shehia Management System</div>
        </div>
        <div className="ms-auto d-flex align-items-center gap-2">
          <span className="badge text-bg-light border d-none d-md-inline-flex"><i className="bi bi-shield-check text-success me-1" /> Staff session · Zone {assignedZone || "-"}</span>
          <button className="btn btn-light rounded-circle" title="Profile"><i className="bi bi-person" /></button>
        </div>
      </header>
      <div className="page-content"><Outlet /></div>
    </main>
  </div>;
}
