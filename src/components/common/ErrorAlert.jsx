export default function ErrorAlert({ error, onRetry }) {
  if (!error) return null;
  const message = error.response?.data?.message || error.message || "Something went wrong.";
  return <div className="alert alert-danger d-flex align-items-center justify-content-between gap-3">
    <div><i className="bi bi-exclamation-triangle me-2" />{message}</div>
    {onRetry && <button className="btn btn-sm btn-outline-danger" onClick={onRetry}>Retry</button>}
  </div>;
}
