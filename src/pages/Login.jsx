import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({zanId:"", password:""});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const data = await login(form);
      if (data.role !== "ROLE_ADMIN" && data.role !== "ROLE_STAFF") {
        throw new Error("This portal is restricted to administrators and staff.");
      }
      if (data.mustChangePassword) {
        navigate("/change-password", { replace: true });
      } else if (data.role === "ROLE_STAFF") {
        navigate("/staff/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to sign in.");
    } finally { setBusy(false); }
  };

  return <div className="login-page">
    <section className="login-hero d-flex flex-column justify-content-between">
      <div>
        <div className="logo-large mb-4"><i className="bi bi-building-check" /></div>
        <h1 className="display-5 fw-bold">Shehia Administration Portal</h1>
        <p className="lead text-white-50 mt-3">A focused workspace for resident services, letters, community issues and announcements.</p>
      </div>
      <div className="small text-white-50">Secure JWT-based administration access</div>
    </section>
    <section className="login-card-wrap">
      <div className="login-card">
        <div className="mb-4">
          <div className="text-success fw-semibold small text-uppercase">Welcome back</div>
          <h2 className="fw-bold mt-2">Sign in to your dashboard</h2>
          <p className="text-secondary">Use your ZanID or staff username, and password.</p>
        </div>
        {error && <div className="alert alert-danger"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
        <form onSubmit={submit} className="card-custom p-4">
          <label className="form-label fw-semibold">ZanID / Staff username</label>
          <div className="input-group mb-3"><span className="input-group-text bg-white"><i className="bi bi-person-badge" /></span>
            <input className="form-control" required value={form.zanId} onChange={e=>setForm({...form,zanId:e.target.value})} placeholder="e.g. ADMIN001" />
          </div>
          <label className="form-label fw-semibold">Password</label>
          <div className="input-group mb-4"><span className="input-group-text bg-white"><i className="bi bi-lock" /></span>
            <input type="password" className="form-control" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Enter password" />
          </div>
          <button className="btn btn-shehia-primary w-100 py-2" disabled={busy}>{busy ? <><span className="spinner-border spinner-border-sm me-2"/>Signing in...</> : "Sign in"}</button>
        </form>
        <p className="small text-secondary mt-4">New staff member? <Link to="/staff/register">Register here</Link> - your account will need admin approval before you can sign in.</p>
      </div>
    </section>
  </div>;
}
