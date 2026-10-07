import { useEffect,useState } from "react";
import { announcementsApi } from "../api/api";
import { ANNOUNCEMENT_STATUSES } from "../utils/constants";
import AnnouncementTable from "../components/announcements/AnnouncementTable";
import AnnouncementForm from "../components/announcements/AnnouncementForm";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import ErrorAlert from "../components/common/ErrorAlert";
import ConfirmModal from "../components/common/ConfirmModal";

export default function Announcements(){
 const [rows,setRows]=useState([]),[status,setStatus]=useState(""),[form,setForm]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(null),[confirm,setConfirm]=useState(null);
 const load=async()=>{setLoading(true);try{setRows(await announcementsApi.list(status||undefined));setError(null)}catch(e){setError(e)}finally{setLoading(false)}};useEffect(()=>{load()},[status]);
 const run=async(fn)=>{try{await fn();load()}catch(e){setError(e)}};
 return <div><div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4"><div><h1 className="page-title">Announcements Management</h1><p className="page-subtitle">Create, publish and manage resident-facing announcements.</p></div><button className="btn btn-shehia-primary" onClick={()=>setForm({})}><i className="bi bi-plus-lg me-2"/>New announcement</button></div>
 <div className="card-custom p-3 mb-3"><div className="filter-pills"><button className={`btn btn-sm ${!status?"btn-shehia-primary":"btn-light"}`} onClick={()=>setStatus("")}>All</button>{ANNOUNCEMENT_STATUSES.map(s=><button key={s} className={`btn btn-sm ${status===s?"btn-shehia-primary":"btn-light"}`} onClick={()=>setStatus(s)}>{s}</button>)}</div></div>
 <ErrorAlert error={error} onRetry={load}/><div className="card-custom p-0">{loading?<LoadingSpinner label="Loading announcements..."/>:rows.length?<AnnouncementTable rows={rows} onEdit={setForm} onPublish={id=>run(()=>announcementsApi.publish(id))} onUnpublish={id=>run(()=>announcementsApi.unpublish(id))} onDelete={a=>setConfirm(a)}/>:<EmptyState icon="bi-megaphone" title="No announcements" message="Create your first announcement from the API-backed form."/>}</div>
 {form&&<AnnouncementForm announcement={form.id?form:null} onClose={()=>setForm(null)} onSaved={()=>{setForm(null);load()}}/>}
 <ConfirmModal open={!!confirm} title="Delete announcement?" message={confirm?`Delete “${confirm.title}”? This action is sent to the backend and cannot be undone here.`:""} confirmText="Delete" danger onClose={()=>setConfirm(null)} onConfirm={()=>run(async()=>{await announcementsApi.remove(confirm.id);setConfirm(null)})}/>
 </div>;
}
