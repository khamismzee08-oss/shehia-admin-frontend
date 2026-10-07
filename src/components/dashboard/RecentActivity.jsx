import { formatDate, humanize } from "../../utils/formatters";

export default function RecentActivity({ dashboard }) {
  const items = [
    ["Residents", dashboard?.pendingResidents, "Pending resident registrations"],
    ["Letters", dashboard?.pendingLetters, "Pending letter applications"],
    ["Issues", dashboard?.urgentIssues, "Urgent issues needing attention"],
    ["Announcements", dashboard?.publishedAnnouncements, "Published announcements"]
  ];
  return <div>
    {items.map(([label, value, text]) => <div className="activity-item" key={label}>
      <div className="activity-dot" />
      <div className="flex-grow-1">
        <div className="fw-semibold">{label}</div>
        <div className="small text-secondary">{text}</div>
      </div>
      <strong>{value ?? 0}</strong>
    </div>)}
    <div className="small text-secondary mt-3">Dashboard values are loaded directly from the backend API.</div>
  </div>;
}
