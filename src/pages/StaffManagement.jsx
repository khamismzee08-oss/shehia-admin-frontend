import { useEffect, useMemo, useState } from "react";
import { adminStaffApi } from "../api/api";
import { USER_STATUSES } from "../utils/constants";
import StatusBadge from "../components/common/StatusBadge";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import ErrorAlert from "../components/common/ErrorAlert";
import ConfirmModal from "../components/common/ConfirmModal";
import { formatDate } from "../utils/formatters";

const ZONES = ["A","B","C","D","E","F","G","H"];

export default function StaffManagement(){
  const [rows,setRows]=useState([]),[status,setStatus]=useState(""),[q,setQ]=useState("");
  const [loading,setLoading]=useState(true),[error,setError]=useState(null),[confirm,setConfirm]=useState(null);
  const [zoneEdits,setZoneEdits]=useState({});

  const load = async () => {
    setLoading(true); setError(null);
    try { setRows(await adminStaffApi.list(status || undefined)); }
    catch(e){ setError(e); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, [status]);

  const filtered = useMemo(() =>
    rows.filter(r => [r.zanId, r.fullName, r.assignedZone].join(" ").toLowerCase().includes(q.toLowerCase())),
  [rows, q]);

  const saveZone = async (staff) => {
    const zone = (zoneEdits[staff.id] ?? staff.assignedZone ?? "").trim();
    if (!/^[A-Za-z]$/.test(zone)) { setError({message:"Pick a single zone letter (A, B, C...) before saving."}); return; }
    try { await adminStaffApi.assignZone(staff.id, zone); load(); }
    catch(e){ setError(e); }
  };

  const changeStatus = (staff, newStatus) => setConfirm({ id: staff.id, status: newStatus, name: staff.zanId });
  const confirmStatus = async () => {
    try { await adminStaffApi.updateStatus(confirm.id, confirm.status); setConfirm(null); load(); }
    catch(e){ setError(e); setConfirm(null); }
  };

  return <div>
    <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
      <div><h1 className="page-title">Staff Management</h1><p className="page-subtitle">Approve, suspend and assign zones to staff accounts. Admin retains access to every zone.</p></div>
      <button className="btn btn-outline-secondary" onClick={load}><i className="bi bi-arrow-clockwise me-2"/>Refresh</button>
    </div>

    <div className="card-custom p-3 mb-3"><div className="d-flex flex-wrap gap-3 align-items-center"><div className="filter-pills">
      <button className={`btn btn-sm ${!status?"btn-shehia-primary":"btn-light"}`} onClick={()=>setStatus("")}>All</button>
      {USER_STATUSES.map(s=><button key={s} className={`btn btn-sm ${status===s?"btn-shehia-primary":"btn-light"}`} onClick={()=>setStatus(s)}>{s}</button>)}
    </div><div className="ms-auto search-box input-group input-group-sm"><span className="input-group-text bg-white"><i className="bi bi-search"/></span><input className="form-control" placeholder="Search username, zone..." value={q} onChange={e=>setQ(e.target.value)}/></div></div></div>

    <ErrorAlert error={error} onRetry={load}/>

    <div className="card-custom p-0">
      {loading ? <LoadingSpinner label="Loading staff..."/> : filtered.length ? <div className="table-wrap"><table className="table table-hover align-middle mb-0">
        <thead><tr><th>Username</th><th>Zone</th><th>Status</th><th>Registered</th><th className="text-end">Actions</th></tr></thead>
        <tbody>{filtered.map(s=><tr key={s.id}>
          <td className="fw-semibold">{s.zanId}</td>
          <td>
            <div className="input-group input-group-sm" style={{maxWidth:160}}>
              <select className="form-select" value={zoneEdits[s.id] ?? s.assignedZone ?? ""} onChange={e=>setZoneEdits(z=>({...z,[s.id]:e.target.value}))}>
                <option value="">Unassigned</option>
                {ZONES.map(z=><option key={z} value={z}>Zone {z}</option>)}
              </select>
              <button className="btn btn-outline-secondary" title="Save zone" onClick={()=>saveZone(s)}><i className="bi bi-check-lg"/></button>
            </div>
          </td>
          <td><StatusBadge value={s.status}/></td>
          <td>{formatDate(s.createdAt)}</td>
          <td className="text-end"><div className="btn-group btn-group-sm">
            {s.status === "PENDING" && <button className="btn btn-outline-success" onClick={()=>changeStatus(s,"ACTIVE")}>Approve</button>}
            {s.status === "ACTIVE" && <button className="btn btn-outline-danger" onClick={()=>changeStatus(s,"SUSPENDED")}>Suspend</button>}
            {s.status === "SUSPENDED" && <button className="btn btn-outline-success" onClick={()=>changeStatus(s,"ACTIVE")}>Reactivate</button>}
          </div></td>
        </tr>)}</tbody>
      </table></div> : <EmptyState icon="bi-person-badge" title="No staff accounts found" message="Staff appear here once they self-register from the login page."/>}
    </div>

    <ConfirmModal open={!!confirm} title="Change staff status?" message={confirm?`Set ${confirm.name} to ${confirm.status.toLowerCase()}?`:""} confirmText="Update status" onConfirm={confirmStatus} onClose={()=>setConfirm(null)} danger={confirm?.status==="SUSPENDED"}/>
  </div>;
}
