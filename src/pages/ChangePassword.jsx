import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function ChangePassword() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [form,setForm] = useState({currentPassword:"",newPassword:""});
  const [error,setError] = useState("");
  const [ok,setOk] = useState("");
  const [busy,setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault(); setError(""); setOk(""); setBusy(true);
    try {
      await authApi.changePassword({zanId:session?.zanId,currentPassword:form.currentPassword,newPassword:form.newPassword});
      setOk("Password changed successfully. You can now continue to the dashboard.");
      const dest = session?.role === "ROLE_STAFF" ? "/staff/dashboard" : "/dashboard";
      setTimeout(()=>navigate(dest,{replace:true}),800);
    } catch(err) { setError(err.response?.data?.message || "Could not change password."); }
    finally { setBusy(false); }
  };

  return <div className="login-page">
    <section className="login-hero d-flex flex-column justify-content-center">
      <div className="logo-large mb-4"><i className="bi bi-shield-lock" /></div>
      <h1 className="display-6 fw-bold">Protect your account</h1>
      <p className="lead text-white-50">Your administrator account requires a password change before normal access.</p>
    </section>
    <section className="login-card-wrap">
      <div className="login-card">
        <div className="mb-4"><div className="text-success fw-semibold small">SECURITY</div><h2 className="fw-bold mt-2">Change password</h2></div>
        {error && <div className="alert alert-danger">{error}</div>}
        {ok && <div className="alert alert-success">{ok}</div>}
        <form onSubmit={submit} className="card-custom p-4">
          <label className="form-label fw-semibold">Current password</label>
          <input type="password" className="form-control mb-3" required value={form.currentPassword} onChange={e=>setForm({...form,currentPassword:e.target.value})}/>
          <label className="form-label fw-semibold">New password</label>
          <input type="password" minLength="8" className="form-control mb-4" required value={form.newPassword} onChange={e=>setForm({...form,newPassword:e.target.value})}/>
          <button className="btn btn-shehia-primary w-100" disabled={busy}>{busy ? "Saving..." : "Change password"}</button>
          <button type="button" className="btn btn-link w-100 mt-2 text-secondary" onClick={logout}>Sign out</button>
        </form>
      </div>
    </section>
  </div>;
}
