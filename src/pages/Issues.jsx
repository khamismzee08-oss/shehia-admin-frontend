import { useEffect,useMemo,useState } from "react";
import { issuesApi } from "../api/api";
import { ISSUE_STATUSES } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import IssueTable from "../components/issues/IssueTable";
import IssueDetails from "../components/issues/IssueDetails";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import ErrorAlert from "../components/common/ErrorAlert";

export default function Issues(){
 const { isStaff, assignedZone } = useAuth();
 const scope = isStaff ? "staff" : "admin";
 const [rows,setRows]=useState([]),[status,setStatus]=useState(""),[q,setQ]=useState(""),[selected,setSelected]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(null);
 const load=async()=>{setLoading(true);try{setRows(await issuesApi.list(status||undefined,scope));setError(null)}catch(e){setError(e)}finally{setLoading(false)}};useEffect(()=>{load()},[status]);
 const filtered=useMemo(()=>rows.filter(i=>[i.reportNumber,i.resident?.fullName,i.category,i.priority,i.status,i.location].join(" ").toLowerCase().includes(q.toLowerCase())),[rows,q]);
 return <div><div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4"><div><h1 className="page-title">Issue Management</h1><p className="page-subtitle">{isStaff?`Issues reported within Zone ${assignedZone} only.`:"Assign, reprioritize and move community reports through their lifecycle."}</p></div><button className="btn btn-outline-secondary" onClick={load}><i className="bi bi-arrow-clockwise me-2"/>Refresh</button></div>
 <div className="card-custom p-3 mb-3"><div className="d-flex flex-wrap gap-3 align-items-center"><div className="filter-pills"><button className={`btn btn-sm ${!status?"btn-shehia-primary":"btn-light"}`} onClick={()=>setStatus("")}>All</button>{ISSUE_STATUSES.map(s=><button key={s} className={`btn btn-sm ${status===s?"btn-shehia-primary":"btn-light"}`} onClick={()=>setStatus(s)}>{s}</button>)}</div><div className="ms-auto search-box input-group input-group-sm"><span className="input-group-text bg-white"><i className="bi bi-search"/></span><input className="form-control" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search report, resident, category..."/></div></div></div>
 <ErrorAlert error={error} onRetry={load}/><div className="card-custom p-0">{loading?<LoadingSpinner label="Loading issues..."/>:filtered.length?<IssueTable rows={filtered} onOpen={setSelected} onAction={setSelected}/>:<EmptyState icon="bi-exclamation-octagon" title="No issues found" message="Try another status or search term."/>}</div>
 {selected&&<IssueDetails issue={selected} scope={scope} onClose={()=>setSelected(null)} onSaved={()=>{setSelected(null);load()}}/>}</div>;
}
