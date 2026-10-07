import { useEffect,useState } from "react";
import { dashboardApi, residentsApi, lettersApi, issuesApi, announcementsApi } from "../api/api";
import { toCsv } from "../utils/formatters";
import ActivityChart from "../components/dashboard/ActivityChart";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorAlert from "../components/common/ErrorAlert";

export default function Reports(){
 const [data,setData]=useState(null),[activity,setActivity]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(null),[days,setDays]=useState(30);
 const load=async()=>{setLoading(true);try{const [d,a]=await Promise.all([dashboardApi.get(),dashboardApi.activity(days)]);setData(d);setActivity(a);setError(null)}catch(e){setError(e)}finally{setLoading(false)}};useEffect(()=>{load()},[days]);
 const exportType=async(type)=>{try{let rows=[];if(type==="residents")rows=await residentsApi.list();if(type==="letters")rows=await lettersApi.list();if(type==="issues")rows=await issuesApi.list();if(type==="announcements")rows=await announcementsApi.list();const flat=rows.map(r=>Object.fromEntries(Object.entries(r).filter(([,v])=>typeof v!=="object"||v===null)));const blob=new Blob([toCsv(flat)],{type:"text/csv;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`shehia-${type}-report.csv`;a.click()}catch(e){setError(e)}};
 if(loading&&!data)return <LoadingSpinner label="Loading reports..."/>;
 return <div><div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4"><div><h1 className="page-title">Reports & Analytics</h1><p className="page-subtitle">Operational metrics and API-backed CSV exports.</p></div><button className="btn btn-outline-secondary" onClick={load}><i className="bi bi-arrow-clockwise me-2"/>Refresh</button></div><ErrorAlert error={error} onRetry={load}/>
 {data&&<><div className="row g-3 mb-4">{[["Residents",data.totalResidents,"bi-people"],["Letters",data.totalLetters,"bi-file-earmark-text"],["Issues",data.totalIssues,"bi-exclamation-octagon"],["Announcements",data.totalAnnouncements,"bi-megaphone"]].map(([l,v,i])=><div className="col-6 col-xl-3" key={l}><div className="card-custom p-3 d-flex align-items-center gap-3"><div className="stat-icon"><i className={`bi ${i}`}/></div><div><div className="stat-label">{l}</div><div className="stat-value">{v}</div></div></div></div>)}</div>
 <div className="card-custom p-4 mb-4"><div className="d-flex justify-content-between align-items-center mb-3"><div><h5 className="mb-1">Activity trend</h5><p className="small text-secondary mb-0">Daily counts returned by the backend.</p></div><select className="form-select form-select-sm w-auto" value={days} onChange={e=>setDays(+e.target.value)}><option value="7">7 days</option><option value="30">30 days</option><option value="60">60 days</option></select></div><ActivityChart data={activity}/></div>
 <div className="card-custom p-4"><h5>Export API data</h5><p className="small text-secondary">Exports use the live admin endpoints. Nested resident objects are intentionally omitted from the simple CSV.</p><div className="d-flex flex-wrap gap-2">{["residents","letters","issues","announcements"].map(x=><button key={x} className="btn btn-outline-success" onClick={()=>exportType(x)}><i className="bi bi-download me-2"/>{x}</button>)}</div></div></>}</div>;
}
