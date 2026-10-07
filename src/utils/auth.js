const TOKEN_KEY = "shehia_admin_token";
const SESSION_KEY = "shehia_admin_session";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getSession = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
  catch { return null; }
};
export const saveSession = (data) => {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
};
export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
};
