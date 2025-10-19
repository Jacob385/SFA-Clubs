export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}
export function cssEscape(s) {
  return String(s).replace(/["\\]/g, "\\$&");
}
