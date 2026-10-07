import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../api/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorAlert from "../components/common/ErrorAlert";
import StatCard from "../components/dashboard/StatCard";
import ActivityChart from "../components/dashboard/ActivityChart";
import RecentActivity from "../components/dashboard/RecentActivity";

export default function Dashboard() {
  const [data,setData]=useState(null), [activity,setActivity]=useState([]), [error,setError]=useState(null), [days,setDays]=useState(7);
  const navigate=useNavigate();
  const load=async()=>{setError(null);try{const [d,a]=await Promise.all([dashboardApi.get(),dashboardApi.activity(days)]);setData(d);setActivity(a)}catch(e){setError(e)}};
  useEffect(()=>{load()},[days]);

  if(!data && !error) return <LoadingSpinner label="Loading dashboard..." />;
  return <div>
    <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
      <div><h1 className="page-title">Good day, Administrator</h1><p className="page-subtitle">Here is the latest operational picture from your Shehia API.</p></div>
      <button className="btn btn-outline-secondary" onClick={load}><i className="bi bi-arrow-clockwise me-2"/>Refresh</button>
    </div>
    <ErrorAlert error={error} onRetry={load}/>
    {data && <>
      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3"><StatCard label="Total Residents" value={data.totalResidents} icon="bi-people" sublabel={`${data.activeResidents} active`} onClick={()=>navigate("/residents")}/></div>
        <div className="col-6 col-xl-3"><StatCard label="Letters" value={data.totalLetters} icon="bi-file-earmark-text" sublabel={`${data.pendingLetters} pending`} onClick={()=>navigate("/letters")}/></div>
        <div className="col-6 col-xl-3"><StatCard label="Issues" value={data.totalIssues} icon="bi-exclamation-octagon" sublabel={`${data.urgentIssues} urgent`} onClick={()=>navigate("/issues")}/></div>
        <div className="col-6 col-xl-3"><StatCard label="Announcements" value={data.totalAnnouncements} icon="bi-megaphone" sublabel={`${data.publishedAnnouncements} published`} onClick={()=>navigate("/announcements")}/></div>
      </div>
      <div className="row g-4">
        <div className="col-xl-8">
          <div className="card-custom p-4">
            <div className="d-flex justify-content-between align-items-center mb-3"><div><h5 className="mb-1">Activity overview</h5><p className="small text-secondary mb-0">Counts returned by /admin/dashboard/activity</p></div>
              <select className="form-select form-select-sm w-auto" value={days} onChange={e=>setDays(Number(e.target.value))}><option value="7">7 days</option><option value="14">14 days</option><option value="30">30 days</option></select>
            </div>
            <ActivityChart data={activity}/>
          </div>
        </div>
        <div className="col-xl-4"><div className="card-custom p-4 h-100"><h5 className="mb-1">Attention queue</h5><p className="small text-secondary mb-2">Priorities derived from dashboard API.</p><RecentActivity dashboard={data}/></div></div>
      </div>
    </>}
  </div>;
}
