// src/components/Modal.js
export default class Modal {
  static confirm(message) {
    return new Promise((resolve) => {
      const res = confirm(message);
      resolve(res);
    });
  }
}

