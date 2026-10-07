export default function StatCard({ label, value, icon, sublabel, onClick }) {
  return <div className="card-custom stat-card h-100 p-3">
    <div className="d-flex justify-content-between gap-3">
      <div>
        <div className="stat-label mb-2">{label}</div>
        <div className="stat-value">{value ?? "—"}</div>
        {sublabel && <div className="small text-secondary mt-2">{sublabel}</div>}
        {onClick && <button className="btn btn-link p-0 mt-2 stat-link" onClick={onClick}>View details <i className="bi bi-arrow-right" /></button>}
      </div>
      <div className="stat-icon"><i className={`bi ${icon}`} /></div>
    </div>
  </div>;
}
