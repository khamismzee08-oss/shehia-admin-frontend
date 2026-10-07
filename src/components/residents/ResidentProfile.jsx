import StatusBadge from "../common/StatusBadge";
import { formatDate, formatHouseNumber, humanize } from "../../utils/formatters";

export default function ResidentProfile({ resident, onStatus }) {
  if(!resident) return null;
  const fields=[["Full name",resident.fullName],["ZanID",resident.zanId],["Resident ID",`RES-${String(resident.id).padStart(3,"0")}`],["Gender",resident.gender ? humanize(resident.gender) : null],["Date of birth",formatDate(resident.dateOfBirth)],["Phone",resident.phoneNumber],["Email",resident.email],["House number",formatHouseNumber(resident.houseNumber)],["Shehia",resident.shehia],["Street",resident.street],["District",resident.district],["Region",resident.region]];
  return <div className="card-custom p-4">
    <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
      <div className="profile-avatar">{resident.fullName?.split(" ").slice(0,2).map(x=>x[0]).join("")}</div>
      <div className="flex-grow-1"><h4 className="mb-1">{resident.fullName}</h4><div className="text-secondary">{resident.zanId}</div></div>
      <StatusBadge value={resident.status}/>
      {resident.status !== "PENDING" && <button className={`btn btn-sm ${resident.status==="ACTIVE"?"btn-outline-danger":"btn-outline-success"}`} onClick={()=>onStatus(resident.id,resident.status==="ACTIVE"?"SUSPENDED":"ACTIVE")}>{resident.status==="ACTIVE"?"Suspend":"Activate"}</button>}
    </div>
    <div className="row g-3">{fields.map(([l,v])=><div className="col-md-6 col-xl-4" key={l}><div className="detail-label">{l}</div><div className="detail-value">{v || "—"}</div></div>)}</div>
    <hr className="my-4"/>
    <div className="row g-3">
      {[["ZanID document",resident.idDocumentUrl],["Proof of residence",resident.proofOfResidenceUrl]].map(([label,url])=><div className="col-md-6" key={label}>
        <div className="detail-label mb-2">{label}</div>{url ? <a className="document-link text-success" href={url} target="_blank" rel="noreferrer"><i className="bi bi-file-earmark-arrow-down"/> Open document <i className="bi bi-box-arrow-up-right ms-auto"/></a> : <div className="text-secondary small">No document URL supplied by API.</div>}
      </div>)}
    </div>
  </div>;
}
