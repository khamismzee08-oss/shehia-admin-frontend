export const humanize = (value = "") =>
  String(value).toLowerCase().replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());

export const formatDate = (value, withTime = false) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {})
  }).format(d);
};

export const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0,2).map(x => x[0]).join("").toUpperCase() || "A";

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

export const toCsv = (rows) => {
  if (!rows?.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = v => `"${String(v ?? "").replaceAll('"','""')}"`;
  return [headers.map(esc).join(","), ...rows.map(r => headers.map(h => esc(r[h])).join(","))].join("\n");
};

// House numbers in this Shehia follow a fixed code: SH/UW/<ZONE>/<3-digit number>,
// e.g. SH/UW/A/123. Only the zone letter and the 3-digit number vary.
const HOUSE_NUMBER_RE = /^SH\/UW\/([A-Z])\/(\d{3})$/i;

export const formatHouseNumber = (value) => {
  if (!value) return "—";
  const v = String(value).trim().toUpperCase();
  return HOUSE_NUMBER_RE.test(v) ? v : value;
};

export const parseZoneFromHouseNumber = (value) => {
  if (!value) return null;
  const m = HOUSE_NUMBER_RE.exec(String(value).trim().toUpperCase());
  return m ? m[1] : null;
};

export const isValidHouseNumber = (value) =>
  !!value && HOUSE_NUMBER_RE.test(String(value).trim());

export const buildHouseNumber = (zone, number) =>
  `SH/UW/${String(zone || "").trim().toUpperCase()}/${String(number || "").trim()}`;
