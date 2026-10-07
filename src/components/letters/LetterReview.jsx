import { useEffect,useRef,useState } from "react";
import { lettersApi } from "../../api/api";
import { LETTER_STATUSES } from "../../utils/constants";
import { formatDate,humanize } from "../../utils/formatters";
import { resolveFileUrl } from "../../utils/fileUrl";
import StatusBadge from "../common/StatusBadge";
import LetterPreview from "./LetterPreview";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorAlert from "../common/ErrorAlert";

export default function LetterReview({refNo,onBack,onSaved}){
 const [letter,setLetter]=useState(null),[html,setHtml]=useState(""),[status,setStatus]=useState("APPROVED"),[comments,setComments]=useState(""),[error,setError]=useState(null),[busy,setBusy]=useState(false);
 const [editing,setEditing]=useState(false),[savingContent,setSavingContent]=useState(false),[contentError,setContentError]=useState(null);
 const previewRef=useRef(null);
 const load=async()=>{try{setError(null);const [l,h]=await Promise.all([lettersApi.get(refNo),lettersApi.preview(refNo)]);setLetter(l);setHtml(h);setStatus(l.status==="PENDING"||l.status==="SIGNED"?"APPROVED":l.status);setComments(l.adminComments||"")}catch(e){setError(e)}};
 useEffect(()=>{load()},[refNo]);
 const submit=async()=>{setBusy(true);try{await lettersApi.review(refNo,{status,adminComments:comments});onSaved?.();}catch(e){setError(e)}finally{setBusy(false)}};
 const startEdit=()=>{setContentError(null);setEditing(true)};
 const cancelEdit=()=>{setContentError(null);setEditing(false)};
 const saveEdit=async()=>{
  const edited=previewRef.current?.getHtml();
  if(!edited){setContentError({message:"Could not read the edited letter content."});return}
  setSavingContent(true);setContentError(null);
  try{
   const updated=await lettersApi.updateContent(refNo,edited);
   setLetter(updated);
   setHtml(await lettersApi.preview(refNo));
   setEditing(false);
  }catch(e){setContentError(e)}
  finally{setSavingContent(false)}
 };
 const resetContent=async()=>{
  setSavingContent(true);setContentError(null);
  try{
   const updated=await lettersApi.resetContent(refNo);
   setLetter(updated);
   setHtml(await lettersApi.preview(refNo));
   setEditing(false);
  }catch(e){setContentError(e)}
  finally{setSavingContent(false)}
 };
 if(!letter&&!error)return <LoadingSpinner label="Loading letter review..."/>;
 return <div><div className="d-flex align-items-center gap-3 mb-4"><button className="btn btn-light" onClick={onBack}><i className="bi bi-arrow-left"/></button><div><h1 className="page-title">Review Letter Application</h1><p className="page-subtitle">{refNo}</p></div><div className="ms-auto"><StatusBadge value={letter?.status}/></div></div>
 <ErrorAlert error={error} onRetry={load}/>{letter&&<><div className="card-custom p-4 mb-4"><div className="row g-3"><div className="col-md-6"><div className="detail-label">Template</div><div className="detail-value">{humanize(letter.letterType)}</div></div><div className="col-md-6"><div className="detail-label">Resident</div><div className="detail-value">{letter.resident?.fullName} <span className="text-secondary fw-normal">({letter.resident?.zanId})</span></div></div><div className="col-md-6"><div className="detail-label">Submitted</div><div className="detail-value">{formatDate(letter.submittedAt,true)}</div></div><div className="col-md-6"><div className="detail-label">Supporting document</div><div>{letter.supportingDocUrl?<a href={resolveFileUrl(letter.supportingDocUrl)} target="_blank" rel="noreferrer" className="text-success">Open document <i className="bi bi-box-arrow-up-right"/></a>:<span className="text-secondary">No URL supplied</span>}</div></div></div></div>
 <div className="card-custom p-4 mb-4">
  <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
   <h5 className="mb-0"><i className="bi bi-file-earmark-text me-2"/>Letter Preview{letter.customContent&&<span className="badge bg-warning-subtle text-warning-emphasis ms-2">Edited</span>}</h5>
   <div className="d-flex gap-2">
    {!editing&&<button className="btn btn-sm btn-outline-secondary" onClick={async()=>{const b=await lettersApi.pdf(refNo);const u=URL.createObjectURL(b);window.open(u,"_blank")}}><i className="bi bi-filetype-pdf me-1"/>Open PDF</button>}
    {!editing&&<button className="btn btn-sm btn-outline-primary" onClick={startEdit}><i className="bi bi-pencil me-1"/>Edit letter</button>}
    {!editing&&letter.customContent&&<button className="btn btn-sm btn-outline-danger" disabled={savingContent} onClick={resetContent}><i className="bi bi-arrow-counterclockwise me-1"/>Reset to original</button>}
    {editing&&<button className="btn btn-sm btn-light" disabled={savingContent} onClick={cancelEdit}>Cancel</button>}
    {editing&&<button className="btn btn-sm btn-shehia-primary" disabled={savingContent} onClick={saveEdit}>{savingContent?"Saving...":"Save changes"}</button>}
   </div>
  </div>
  {editing&&<div className="alert alert-info py-2 px-3 mb-3 small">Click directly into the letter below to edit its text, then <strong>Save changes</strong>. This becomes the version used for the PDF and for the resident's copy.</div>}
  <ErrorAlert error={contentError} onRetry={null}/>
  <LetterPreview ref={previewRef} html={html} editable={editing}/>
 </div>
 <div className="card-custom p-4"><h5>Decision</h5><div className="row g-3 align-items-end"><div className="col-md-4"><label className="form-label">Decision</label><select className="form-select" value={status} onChange={e=>setStatus(e.target.value)}><option value="APPROVED">Approve</option><option value="REJECTED">Reject</option><option value="CHANGES_REQUESTED">Request changes</option></select></div><div className="col-md-8"><label className="form-label">Comments</label><input className="form-control" value={comments} onChange={e=>setComments(e.target.value)} placeholder="Add decision comments"/></div><div className="col-12"><button className="btn btn-shehia-primary" disabled={busy||editing} onClick={submit}>{busy?"Submitting...":"Submit decision"}</button></div></div></div></>}</div>
}
