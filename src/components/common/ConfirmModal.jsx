export default function ConfirmModal({ open, title, message, confirmText = "Confirm", onConfirm, onClose, danger = false }) {
  if (!open) return null;
  return <div className="modal-backdrop-custom" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="modal-card p-4">
      <div className="d-flex align-items-start gap-3">
        <div className={`rounded-circle p-3 ${danger ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success"}`}>
          <i className={`bi ${danger ? "bi-exclamation-triangle" : "bi-check2-circle"} fs-5`} />
        </div>
        <div className="flex-grow-1">
          <h5 className="mb-1">{title}</h5>
          <p className="text-secondary mb-4">{message}</p>
          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-light" onClick={onClose}>Cancel</button>
            <button className={`btn ${danger ? "btn-danger" : "btn-shehia-primary"}`} onClick={onConfirm}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  </div>;
}
