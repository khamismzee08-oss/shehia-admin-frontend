export default function LoadingSpinner({ label = "Loading..." }) {
  return <div className="d-flex flex-column align-items-center justify-content-center py-5 text-secondary">
    <div className="spinner-border text-success mb-2" role="status" />
    <span className="small">{label}</span>
  </div>;
}
