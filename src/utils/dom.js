
export function $(selector) {
  return document.querySelector(selector);
}
export function $$(selector) {
  return document.querySelectorAll(selector);
}
export function hide(el) {
  el.style.display = 'none';
}
export function show(el) {
  el.style.display = 'block';
}
