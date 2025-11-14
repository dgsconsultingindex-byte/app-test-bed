// src/components/Toast.js
export default class Toast {
  static show(message, { timeout = 3000 } = {}) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.position = 'fixed';
      container.style.right = '16px';
      container.style.bottom = '16px';
      container.style.zIndex = 9999;
      document.body.appendChild(container);
    }
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = message;
    t.style.padding = '10px 14px';
    t.style.marginTop = '8px';
    t.style.borderRadius = '10px';
    t.style.background = 'var(--panel)';
    t.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
    container.appendChild(t);
    setTimeout(() => t.remove(), timeout);
  }
}
