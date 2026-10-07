import { useEffect,useMemo,useState } from "react";
import { lettersApi } from "../api/api";
import { LETTER_STATUSES } from "../utils/constants";
import { downloadBlob } from "../utils/formatters";
import LetterTable from "../components/letters/LetterTable";
import LetterReview from "../components/letters/LetterReview";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import ErrorAlert from "../components/common/ErrorAlert";

export default function Letters(){
 const [rows,setRows]=useState([]),[status,setStatus]=useState(""),[q,setQ]=useState(""),[review,setReview]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(null);
 const load=async()=>{setLoading(true);try{setRows(await lettersApi.list(status||undefined));setError(null)}catch(e){setError(e)}finally{setLoading(false)}}; useEffect(()=>{load()},[status]);
 const filtered=useMemo(()=>rows.filter(l=>[l.referenceNumber,l.resident?.fullName,l.resident?.zanId,l.letterType].join(" ").toLowerCase().includes(q.toLowerCase())),[rows,q]);
 const download=async(ref)=>{try{downloadBlob(await lettersApi.pdf(ref),`${ref}.pdf`)}catch(e){setError(e)}};
 if(review)return <LetterReview refNo={review} onBack={()=>setReview(null)} onSaved={()=>{setReview(null);load()}}/>;
 return <div><div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4"><div><h1 className="page-title">Letter Management</h1><p className="page-subtitle">Review applications and open generated PDF documents.</p></div><button className="btn btn-outline-secondary" onClick={load}><i className="bi bi-arrow-clockwise me-2"/>Refresh</button></div>
 <div className="card-custom p-3 mb-3"><div className="d-flex flex-wrap gap-3 align-items-center"><div className="filter-pills"><button className={`btn btn-sm ${!status?"btn-shehia-primary":"btn-light"}`} onClick={()=>setStatus("")}>All</button>{LETTER_STATUSES.map(s=><button className={`btn btn-sm ${status===s?"btn-shehia-primary":"btn-light"}`} key={s} onClick={()=>setStatus(s)}>{s}</button>)}</div><div className="ms-auto search-box input-group input-group-sm"><span className="input-group-text bg-white"><i className="bi bi-search"/></span><input className="form-control" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search reference or resident..."/></div></div></div>
 <ErrorAlert error={error} onRetry={load}/><div className="card-custom p-0">{loading?<LoadingSpinner label="Loading letters..."/>:filtered.length?<LetterTable rows={filtered} onReview={setReview} onDownload={download}/>:<EmptyState icon="bi-file-earmark-text" title="No letters found" message="Try another status or search term."/>}</div></div>;
}
