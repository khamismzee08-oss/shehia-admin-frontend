import { useState } from "react";
import { buildHouseNumber } from "../../utils/formatters";
import FileUploadInput from "../common/FileUploadInput";

const initial = {
  zanId: "", fullName: "", email: "", phoneNumber: "",
  houseNo: "", street: "", shehia: "", district: "", region: "",
  dateOfBirth: "", password: ""
};

export default function RegisterResidentModal({ open, zone, onClose, onSubmit }) {
  const [form, setForm] = useState(initial);
  const [idDocument, setIdDocument] = useState(null);
  const [proofOfResidence, setProofOfResidence] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError("");
    if (!/^\d{3}$/.test(form.houseNo) || form.houseNo === "000") {
      setError("House number must be exactly 3 digits and not 000, e.g. 123.");
      return;
    }
    setBusy(true);
    try {
      await onSubmit(
        {
          zanId: form.zanId.trim(),
          fullName: form.fullName.trim(),
          email: form.email.trim() || null,
          phoneNumber: form.phoneNumber.trim(),
          houseNumber: buildHouseNumber(zone, form.houseNo),
          street: form.street.trim(),
          shehia: form.shehia.trim(),
          district: form.district.trim(),
          region: form.region.trim(),
          dateOfBirth: form.dateOfBirth || null,
          password: form.password
        },
        { idDocument, proofOfResidence }
      );
      setForm(initial);
      setIdDocument(null);
      setProofOfResidence(null);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to register resident.");
    } finally { setBusy(false); }
  };

  return <div className="modal-backdrop-custom" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="modal-card p-4" style={{ maxWidth: 560 }}>
      <h5 className="mb-1">Register resident - Zone {zone}</h5>
      <p className="text-secondary small mb-3">The house number is fixed to your zone; only the 3-digit number is required.</p>
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      <form onSubmit={submit}>
        <div className="row g-2">
          <div className="col-6"><label className="form-label small fw-semibold">ZanID</label><input className="form-control form-control-sm" required value={form.zanId} onChange={set("zanId")}/></div>
          <div className="col-6"><label className="form-label small fw-semibold">Full name</label><input className="form-control form-control-sm" required value={form.fullName} onChange={set("fullName")}/></div>
          <div className="col-6"><label className="form-label small fw-semibold">Email</label><input type="email" className="form-control form-control-sm" value={form.email} onChange={set("email")}/></div>
          <div className="col-6"><label className="form-label small fw-semibold">Phone</label><input className="form-control form-control-sm" value={form.phoneNumber} onChange={set("phoneNumber")}/></div>
          <div className="col-6">
            <label className="form-label small fw-semibold">House number</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text">SH/UW/{zone}/</span>
              <input className="form-control" required maxLength={3} placeholder="123" value={form.houseNo} onChange={e=>setForm(f=>({...f, houseNo: e.target.value.replace(/\D/g,"")}))}/>
            </div>
          </div>
          <div className="col-6"><label className="form-label small fw-semibold">Street</label><input className="form-control form-control-sm" value={form.street} onChange={set("street")}/></div>
          <div className="col-6"><label className="form-label small fw-semibold">Shehia</label><input className="form-control form-control-sm" value={form.shehia} onChange={set("shehia")}/></div>
          <div className="col-6"><label className="form-label small fw-semibold">District</label><input className="form-control form-control-sm" value={form.district} onChange={set("district")}/></div>
          <div className="col-6"><label className="form-label small fw-semibold">Region</label><input className="form-control form-control-sm" value={form.region} onChange={set("region")}/></div>
          <div className="col-6"><label className="form-label small fw-semibold">Date of birth</label><input type="date" className="form-control form-control-sm" value={form.dateOfBirth} onChange={set("dateOfBirth")}/></div>
          <div className="col-6"><label className="form-label small fw-semibold">Temporary password</label><input type="password" className="form-control form-control-sm" required value={form.password} onChange={set("password")}/></div>
        </div>

        <hr className="my-3" />
        <p className="text-secondary small mb-2">
          Optional: attach the resident's documents now — pick a file or take a photo with the camera (laptop webcam or phone).
        </p>
        <div className="row g-2">
          <div className="col-md-6">
            <FileUploadInput label="ID document" onChange={setIdDocument} />
          </div>
          <div className="col-md-6">
            <FileUploadInput label="Proof of residence" onChange={setProofOfResidence} />
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <button type="button" className="btn btn-light btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-shehia-primary btn-sm" disabled={busy}>{busy ? "Registering..." : "Register resident"}</button>
        </div>
      </form>
    </div>
  </div>;
}
