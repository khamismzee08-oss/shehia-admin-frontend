import { useEffect,useState } from "react";
import { useNavigate,useParams } from "react-router-dom";
import { residentsApi, lettersApi, issuesApi } from "../api/api";
import { useAuth } from "../context/AuthContext";
import ResidentProfile from "../components/residents/ResidentProfile";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorAlert from "../components/common/ErrorAlert";
import StatusBadge from "../components/common/StatusBadge";
import { formatDate,humanize } from "../utils/formatters";

export default function ResidentDetails(){
  const {id}=useParams(),navigate=useNavigate(); const [resident,setResident]=useState(null),[letters,setLetters]=useState([]),[issues,setIssues]=useState([]),[error,setError]=useState(null);
  const { isStaff } = useAuth();
  const scope = isStaff ? "staff" : "admin";
  const backTo = isStaff ? "/staff/residents" : "/residents";
  const load=async()=>{
    try{
      setError(null);
      if (isStaff) {
        // Staff have no /staff/letters endpoint - letter history is
        // admin/resident-facing only, so skip it here.
        const [r,i]=await Promise.all([residentsApi.get(id,scope),issuesApi.list(undefined,scope)]);
        setResident(r);setLetters([]);setIssues((i||[]).filter(x=>x.resident?.id===Number(id)));
      } else {
        const [r,l,i]=await Promise.all([residentsApi.get(id,scope),lettersApi.list(),issuesApi.list(undefined,scope)]);
        setResident(r);setLetters((l||[]).filter(x=>x.resident?.id===Number(id)));setIssues((i||[]).filter(x=>x.resident?.id===Number(id)));
      }
    }catch(e){setError(e)}
  };
  useEffect(()=>{load()},[id]);
  if(!resident&&!error)return <LoadingSpinner label="Loading resident profile..."/>;
  return <div>
    <div className="d-flex align-items-center gap-3 mb-4"><button className="btn btn-light" onClick={()=>navigate(backTo)}><i className="bi bi-arrow-left"/></button><div><h1 className="page-title">Resident Profile</h1><p className="page-subtitle">{resident?.fullName || "Resident"}</p></div></div>
    <ErrorAlert error={error} onRetry={load}/>
    {resident&&<><ResidentProfile resident={resident} onStatus={async(id,status)=>{await residentsApi.updateStatus(id,status,scope);load()}}/>
    <div className="row g-4 mt-1">
      {!isStaff && <div className="col-lg-6"><div className="card-custom p-4 h-100"><div className="d-flex justify-content-between mb-3"><h5><i className="bi bi-file-earmark-text text-success me-2"/>Letter History</h5><button className="btn btn-sm btn-light" onClick={()=>navigate("/letters")}>View all</button></div>{letters.length?letters.slice(0,6).map(l=><div className="d-flex align-items-center justify-content-between py-2 border-bottom" key={l.id}><div><div className="fw-semibold">{l.referenceNumber}</div><div className="small text-secondary">{humanize(l.letterType)} · {formatDate(l.submittedAt)}</div></div><StatusBadge value={l.status}/></div>):<div className="text-secondary small">No letters returned for this resident.</div>}</div></div>}
      <div className={isStaff ? "col-lg-12" : "col-lg-6"}><div className="card-custom p-4 h-100"><div className="d-flex justify-content-between mb-3"><h5><i className="bi bi-exclamation-octagon text-danger me-2"/>Issue Reports</h5><button className="btn btn-sm btn-light" onClick={()=>navigate(isStaff?"/staff/issues":"/issues")}>View all</button></div>{issues.length?issues.slice(0,6).map(i=><div className="d-flex align-items-center justify-content-between py-2 border-bottom" key={i.id}><div><div className="fw-semibold">{i.reportNumber}</div><div className="small text-secondary">{humanize(i.category)} · {formatDate(i.createdAt)}</div></div><StatusBadge value={i.status}/></div>):<div className="text-secondary small">No issues returned for this resident.</div>}</div></div>
    </div></>}
  </div>;
}
