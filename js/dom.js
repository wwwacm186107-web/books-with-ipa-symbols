/* Tiny DOM helper: h("button", {class:"x", text:"Hi"}, [children]) */
window.h = function (tag, attrs, kids) {
  const n = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => k === "text" ? (n.textContent = v) : n.setAttribute(k, v));
  (kids || []).forEach(k => n.appendChild(k));
  return n;
};
