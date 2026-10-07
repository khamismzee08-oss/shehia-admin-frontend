import StatusBadge from "../common/StatusBadge";
import { formatDate, formatHouseNumber, humanize } from "../../utils/formatters";

export default function ResidentTable({ rows, onView, onStatus }) {
  return <div className="table-wrap"><table className="table table-hover align-middle mb-0">
    <thead><tr><th>House Number</th><th>Resident</th><th>ZanID</th><th>Gender</th><th>Contact</th><th>Shehia</th><th>Status</th><th>Registered</th><th className="text-end">Actions</th></tr></thead>
    <tbody>{rows.map(r=><tr key={r.id}>
      <td>
        <div className="fw-semibold">{formatHouseNumber(r.houseNumber)}</div>
        <div className="small text-secondary">RES-{String(r.id).padStart(3,"0")}</div>
      </td>
      <td><div className="fw-semibold">{r.fullName}</div><div className="small text-secondary">{r.email || "No email"}</div></td>
      <td>{r.zanId}</td><td>{r.gender ? humanize(r.gender) : "—"}</td><td>{r.phoneNumber || "—"}</td><td>{r.shehia || "—"}</td><td><StatusBadge value={r.status}/></td>
      <td>{formatDate(r.createdAt)}</td>
      <td className="text-end"><div className="btn-group btn-group-sm">
        <button className="btn btn-light" onClick={()=>onView(r.id)} title="View"><i className="bi bi-eye"/></button>
        {r.status === "PENDING" && <button className="btn btn-outline-success" onClick={()=>onStatus(r,"ACTIVE")}>Verify</button>}
        {r.status === "ACTIVE" && <button className="btn btn-outline-danger" onClick={()=>onStatus(r,"SUSPENDED")}>Suspend</button>}
        {r.status === "SUSPENDED" && <button className="btn btn-outline-success" onClick={()=>onStatus(r,"ACTIVE")}>Activate</button>}
      </div></td>
    </tr>)}</tbody>
  </table></div>;
}
