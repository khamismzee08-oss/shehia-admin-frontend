export default function EmptyState({ icon = "bi-inbox", title = "No records found", message = "There is nothing to display yet." }) {
  return <div className="empty-state">
    <i className={`bi ${icon}`} />
    <h5>{title}</h5>
    <p className="mb-0">{message}</p>
  </div>;
}
