import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../api/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorAlert from "../components/common/ErrorAlert";
import StatCard from "../components/dashboard/StatCard";

export default function StaffDashboard() {
  const [data, setData] = useState(null), [error, setError] = useState(null);
  const { assignedZone } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    setError(null);
    try { setData(await dashboardApi.get("staff")); }
    catch (e) { setError(e); }
  };
  useEffect(() => { load(); }, []);

  if (!data && !error) return <LoadingSpinner label="Loading dashboard..." />;
  return <div>
    <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
      <div><h1 className="page-title">Zone {assignedZone} Dashboard</h1><p className="page-subtitle">Residents and issues within your assigned zone only.</p></div>
      <button className="btn btn-outline-secondary" onClick={load}><i className="bi bi-arrow-clockwise me-2"/>Refresh</button>
    </div>
    <ErrorAlert error={error} onRetry={load}/>
    {data && <div className="row g-3 mb-4">
      <div className="col-6 col-xl-3"><StatCard label="Zone Residents" value={data.totalResidents} icon="bi-people" sublabel={`${data.activeResidents} active`} onClick={()=>navigate("/staff/residents")}/></div>
      <div className="col-6 col-xl-3"><StatCard label="Pending Verification" value={data.pendingResidents} icon="bi-person-check" sublabel="awaiting review" onClick={()=>navigate("/staff/residents")}/></div>
      <div className="col-6 col-xl-3"><StatCard label="Zone Issues" value={data.totalIssues} icon="bi-exclamation-octagon" sublabel={`${data.urgentIssues} urgent`} onClick={()=>navigate("/staff/issues")}/></div>
      <div className="col-6 col-xl-3"><StatCard label="Pending Issues" value={data.pendingIssues} icon="bi-hourglass-split" sublabel="need attention" onClick={()=>navigate("/staff/issues")}/></div>
    </div>}
  </div>;
}
