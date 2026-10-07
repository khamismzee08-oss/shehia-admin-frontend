import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { residentsApi } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { USER_STATUSES } from "../utils/constants";
import ResidentTable from "../components/residents/ResidentTable";
import RegisterResidentModal from "../components/residents/RegisterResidentModal";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import ErrorAlert from "../components/common/ErrorAlert";
import ConfirmModal from "../components/common/ConfirmModal";

export default function Residents(){
  const [rows,setRows]=useState([]),[status,setStatus]=useState(""),[q,setQ]=useState(""),[loading,setLoading]=useState(true),[error,setError]=useState(null),[confirm,setConfirm]=useState(null),[showRegister,setShowRegister]=useState(false);
  const navigate=useNavigate();
  const { isStaff, assignedZone } = useAuth();
  const scope = isStaff ? "staff" : "admin";
  const load=async()=>{setLoading(true);setError(null);try{setRows(await residentsApi.list(status||undefined, scope))}catch(e){setError(e)}finally{setLoading(false)}};
  useEffect(()=>{load()},[status]);
  const filtered=useMemo(()=>rows.filter(r=>[r.fullName,r.zanId,r.email,r.phoneNumber,r.shehia,r.houseNumber].join(" ").toLowerCase().includes(q.toLowerCase())),[rows,q]);
  const changeStatus=(r,s)=>setConfirm({id:r.id,status:s,name:r.fullName});
  const confirmStatus=async()=>{try{await residentsApi.updateStatus(confirm.id,confirm.status,scope);setConfirm(null);load()}catch(e){setError(e);setConfirm(null)}};
  return <div>
    <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4"><div><h1 className="page-title">Resident Management</h1><p className="page-subtitle">{isStaff?`Residents in Zone ${assignedZone} only.`:"Review, verify and manage resident accounts from the API."}</p></div>
      <div className="d-flex gap-2">
        {isStaff && <button className="btn btn-shehia-primary" onClick={()=>setShowRegister(true)}><i className="bi bi-person-plus me-2"/>Register resident</button>}
        <button className="btn btn-outline-secondary" onClick={load}><i className="bi bi-arrow-clockwise me-2"/>Refresh</button>
      </div>
    </div>
    <div className="card-custom p-3 mb-3"><div className="d-flex flex-wrap gap-3 align-items-center"><div className="filter-pills">
      <button className={`btn btn-sm ${!status?"btn-shehia-primary":"btn-light"}`} onClick={()=>setStatus("")}>All</button>
      {USER_STATUSES.map(s=><button key={s} className={`btn btn-sm ${status===s?"btn-shehia-primary":"btn-light"}`} onClick={()=>setStatus(s)}>{s}</button>)}
    </div><div className="ms-auto search-box input-group input-group-sm"><span className="input-group-text bg-white"><i className="bi bi-search"/></span><input className="form-control" placeholder="Search resident, ZanID, house number..." value={q} onChange={e=>setQ(e.target.value)}/></div></div></div>
    <ErrorAlert error={error} onRetry={load}/>
    <div className="card-custom p-0">{loading?<LoadingSpinner label="Loading residents..."/>:filtered.length?<ResidentTable rows={filtered} onView={id=>navigate(isStaff?`/staff/residents/${id}`:`/residents/${id}`)} onStatus={changeStatus}/>:<EmptyState icon="bi-people" title="No residents found" message="Try another status or search term."/>}</div>
    <ConfirmModal open={!!confirm} title="Change resident status?" message={confirm?`Set ${confirm.name} to ${confirm.status.toLowerCase()}?`: ""} confirmText="Update status" onConfirm={confirmStatus} onClose={()=>setConfirm(null)} danger={confirm?.status==="SUSPENDED"}/>
    {isStaff && <RegisterResidentModal open={showRegister} zone={assignedZone} onClose={()=>setShowRegister(false)} onSubmit={async(data,files)=>{await residentsApi.register(data,files);load()}}/>}
  </div>;
}
