import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import { getToken, clearSession } from "../utils/auth";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" }
});

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) clearSession();
    return Promise.reject(error);
  }
);

const unwrap = r => r.data;

// Some pages (Residents, Issues, Dashboard) are shared between the admin and
// staff dashboards. Staff only ever manage their own assigned zone, which the
// backend enforces on the /staff/** endpoints - the frontend just needs to
// point at the right prefix. Defaults to "admin" everywhere so existing
// call sites are unaffected.
const prefixFor = (scope) => (scope === "staff" ? "/staff" : "/admin");

export const authApi = {
  login: data => api.post("/auth/login", data).then(unwrap),
  changePassword: data => api.post("/auth/change-password", data).then(unwrap),
  logout: () => api.post("/auth/logout").then(unwrap)
};

// Staff self-registration (first login) - public, no auth required.
export const staffAuthApi = {
  register: data => api.post("/staff/register", data).then(unwrap),
  profile: () => api.get("/staff/profile").then(unwrap)
};

// Admin-only staff lifecycle management: approve/suspend accounts and
// assign the zone (A, B, C...) each staff member is responsible for.
export const adminStaffApi = {
  list: status => api.get("/admin/staff", { params: status ? { status } : {} }).then(unwrap),
  get: id => api.get(`/admin/staff/${id}`).then(unwrap),
  updateStatus: (id, status) => api.put(`/admin/staff/${id}/status`, { status }).then(unwrap),
  assignZone: (id, zone) => api.put(`/admin/staff/${id}/zone`, { zone }).then(unwrap)
};

export const dashboardApi = {
  get: (scope = "admin") => api.get(`${prefixFor(scope)}/dashboard`).then(unwrap),
  activity: (days, scope = "admin") => api.get(`${prefixFor(scope)}/dashboard/activity`, { params: { days } }).then(unwrap)
};

export const residentsApi = {
  list: (status, scope = "admin") => api.get(`${prefixFor(scope)}/residents`, { params: status ? { status } : {} }).then(unwrap),
  get: (id, scope = "admin") => api.get(`${prefixFor(scope)}/residents/${id}`).then(unwrap),
  updateStatus: (id, status, scope = "admin") => api.put(`${prefixFor(scope)}/residents/${id}/status`, { status }).then(unwrap),
  verify: (id, status = "ACTIVE") => api.put(`/admin/residents/${id}/verify`, null, { params: { status } }).then(unwrap),
  // Staff-only: register a new resident, house number must fall in the
  // staff member's own zone (enforced server-side).
  //
  // CHANGED: now sends multipart/form-data instead of JSON, so staff can
  // attach an "idDocument" and/or "proofOfResidence" file (picked or
  // captured with the device camera) — see FileUploadInput used in
  // RegisterResidentModal. `files` is optional so existing callers that
  // pass no files still work; axios detects the FormData body and sets the
  // multipart Content-Type + boundary itself (overriding the instance's
  // default "application/json" header).
  register: (data, files = {}) => {
    const body = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) body.append(key, value);
    });
    if (files.idDocument) body.append("idDocument", files.idDocument);
    if (files.proofOfResidence) body.append("proofOfResidence", files.proofOfResidence);
    return api.post("/staff/residents/register", body).then(unwrap);
  }
};

export const issuesApi = {
  list: (status, scope = "admin") => api.get(`${prefixFor(scope)}/issues`, { params: status ? { status } : {} }).then(unwrap),
  get: (repNo, scope = "admin") => api.get(`${prefixFor(scope)}/issues/${encodeURIComponent(repNo)}`).then(unwrap),
  status: (repNo, status, scope = "admin") => api.put(`${prefixFor(scope)}/issues/${encodeURIComponent(repNo)}/status`, { status }).then(unwrap),
  assign: (repNo, officer, scope = "admin") => api.put(`${prefixFor(scope)}/issues/${encodeURIComponent(repNo)}/assign`, { officer }).then(unwrap),
  priority: (repNo, priority, scope = "admin") => api.put(`${prefixFor(scope)}/issues/${encodeURIComponent(repNo)}/priority`, { priority }).then(unwrap)
};
export const lettersApi = {
  list: status => api.get("/admin/letters", { params: status ? { status } : {} }).then(unwrap),
  get: ref => api.get(`/admin/letters/${encodeURIComponent(ref)}`).then(unwrap),
  review: (ref, data) => api.put(`/admin/letters/${encodeURIComponent(ref)}/review`, data).then(unwrap),
  // NOTE: the shared `api` instance defaults to Accept: application/json,
  // but these two endpoints are declared with produces = TEXT_HTML_VALUE /
  // APPLICATION_PDF_VALUE on the backend. Without overriding Accept here,
  // Spring throws HttpMediaTypeNotAcceptableException (406), which then
  // gets forwarded to /error as an unauthenticated request and comes back
  // as a misleading empty-body 403. Overriding Accept per-call fixes this.
  preview: ref => api.get(`/admin/letters/${encodeURIComponent(ref)}/preview`, { responseType: "text", headers: { Accept: "text/html" } }).then(unwrap),
  pdf: ref => api.get(`/admin/letters/${encodeURIComponent(ref)}/pdf`, { responseType: "blob", headers: { Accept: "application/pdf" } }).then(r => r.data),
  // Admin write/edit access on the letter preview: persist hand-edited
  // HTML as the new source of truth for this letter (used for both the
  // preview and the generated PDF from then on), or discard it to fall
  // back to the auto-generated template again.
  updateContent: (ref, html) => api.put(`/admin/letters/${encodeURIComponent(ref)}/content`, { html }).then(unwrap),
  resetContent: ref => api.delete(`/admin/letters/${encodeURIComponent(ref)}/content`).then(unwrap)
};

export const announcementsApi = {
  list: status => api.get("/admin/announcements", { params: status ? { status } : {} }).then(unwrap),
  get: id => api.get(`/admin/announcements/${id}`).then(unwrap),
  create: data => api.post("/admin/announcements", data).then(unwrap),
  update: (id, data) => api.put(`/admin/announcements/${id}`, data).then(unwrap),
  publish: id => api.put(`/admin/announcements/${id}/publish`).then(unwrap),
  unpublish: id => api.put(`/admin/announcements/${id}/unpublish`).then(unwrap),
  remove: id => api.delete(`/admin/announcements/${id}`).then(unwrap)
};

export default api;
