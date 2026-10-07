import { useState } from "react";
import { authApi } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Settings(){
 const {session}=useAuth(); const [form,setForm]=useState({currentPassword:"",newPassword:""}),[message,setMessage]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const submit=async e=>{e.preventDefault();setBusy(true);setMessage("");setError("");try{await authApi.changePassword({zanId:session?.zanId,...form});setMessage("Password changed successfully.");setForm({currentPassword:"",newPassword:""})}catch(e){setError(e.response?.data?.message||"Could not change password.")}finally{setBusy(false)}};
 return <div><div className="mb-4"><h1 className="page-title">Settings</h1><p className="page-subtitle">Manage the authenticated administrator account.</p></div>
 <div className="row g-4"><div className="col-lg-7"><div className="card-custom p-4"><h5>Change password</h5><p className="text-secondary small">This uses POST /auth/change-password. Other system-management endpoints are not present in the supplied backend.</p>{message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-danger">{error}</div>}<form onSubmit={submit}><label className="form-label">Current password</label><input type="password" className="form-control mb-3" required value={form.currentPassword} onChange={e=>setForm({...form,currentPassword:e.target.value})}/><label className="form-label">New password</label><input type="password" minLength="8" className="form-control mb-4" required value={form.newPassword} onChange={e=>setForm({...form,newPassword:e.target.value})}/><button className="btn btn-shehia-primary" disabled={busy}>{busy?"Updating...":"Update password"}</button></form></div></div>
 <div className="col-lg-5"><div className="card-custom p-4"><h5>API connection</h5><div className="detail-label">Base URL</div><div className="detail-value text-break">{import.meta.env.VITE_API_BASE_URL||"http://localhost:8080/api/v1"}</div><hr/><div className="detail-label">Authenticated ZanID</div><div className="detail-value">{session?.zanId||"—"}</div><div className="detail-label mt-3">Role</div><div className="detail-value">{session?.role||"—"}</div></div></div></div>
 </div>;
}
