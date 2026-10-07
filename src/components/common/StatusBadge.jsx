import { humanize } from "../../utils/formatters";

const tone = value => {
  const v = String(value || "").toUpperCase();
  if (["ACTIVE","VERIFIED","PUBLISHED","SIGNED","APPROVED","RESOLVED","CLOSED","LOW"].includes(v)) return "status-green";
  if (["PENDING","MEDIUM","DRAFT","ASSIGNED","CHANGES_REQUESTED"].includes(v)) return "status-yellow";
  if (["SUSPENDED","REJECTED","HIGH","URGENT"].includes(v)) return "status-red";
  if (["IN_PROGRESS","EVENT","NOTICE"].includes(v)) return "status-blue";
  return "status-gray";
};

export default function StatusBadge({ value }) {
  return <span className={`status-badge ${tone(value)}`}>
    <span className="rounded-circle" style={{width:6,height:6,background:"currentColor"}} /> {humanize(value)}
  </span>;
}
