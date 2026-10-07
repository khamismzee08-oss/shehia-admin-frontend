import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { staffAuthApi } from "../api/api";

export default function StaffRegister() {
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await staffAuthApi.register({ username: form.username.trim(), password: form.password });
      setSuccess("Registration submitted. An administrator must assign you a zone and approve your account before you can sign in.");
      setForm({ username: "", password: "", confirmPassword: "" });
      setTimeout(() => navigate("/login", { replace: true }), 3500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to register.");
    } finally { setBusy(false); }
  };

  return <div className="login-page">
    <section className="login-hero d-flex flex-column justify-content-between">
      <div>
        <div className="logo-large mb-4"><i className="bi bi-building-check" /></div>
        <h1 className="display-5 fw-bold">Shehia Staff Registration</h1>
        <p className="lead text-white-50 mt-3">Staff accounts start pending until an administrator assigns your zone and approves access.</p>
      </div>
      <div className="small text-white-50">Secure JWT-based administration access</div>
    </section>
    <section className="login-card-wrap">
      <div className="login-card">
        <div className="mb-4">
          <div className="text-success fw-semibold small text-uppercase">Staff sign-up</div>
          <h2 className="fw-bold mt-2">Create your staff account</h2>
          <p className="text-secondary">Choose a username and password. This is your first login - registration only.</p>
        </div>
        {error && <div className="alert alert-danger"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
        {success && <div className="alert alert-success"><i className="bi bi-check-circle me-2" />{success}</div>}
        <form onSubmit={submit} className="card-custom p-4">
          <label className="form-label fw-semibold">Username</label>
          <div className="input-group mb-3"><span className="input-group-text bg-white"><i className="bi bi-person-badge" /></span>
            <input className="form-control" required value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="e.g. staff.zoneA" />
          </div>
          <label className="form-label fw-semibold">Password</label>
          <div className="input-group mb-3"><span className="input-group-text bg-white"><i className="bi bi-lock" /></span>
            <input type="password" className="form-control" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 6 characters" />
          </div>
          <label className="form-label fw-semibold">Confirm password</label>
          <div className="input-group mb-4"><span className="input-group-text bg-white"><i className="bi bi-lock" /></span>
            <input type="password" className="form-control" required value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} placeholder="Repeat password" />
          </div>
          <button className="btn btn-shehia-primary w-100 py-2" disabled={busy}>{busy ? <><span className="spinner-border spinner-border-sm me-2"/>Submitting...</> : "Register"}</button>
        </form>
        <p className="small text-secondary mt-4">Already have an approved account? <Link to="/login">Sign in</Link></p>
      </div>
    </section>
  </div>;
}
