// src/core/StorageDriver.js
export default class StorageDriver {
  // Minimal local default - override with concrete driver
  async load() {
    try {
      const rawTasks = localStorage.getItem('priobox_tasks');
      const rawPrefs = localStorage.getItem('priobox_prefs');
      const tasks = rawTasks ? (JSON.parse(rawTasks).tasks || {}) : {};
      const prefs = rawPrefs ? JSON.parse(rawPrefs) : {};
      return { tasks, prefs };
    } catch (err) {
      console.error('StorageDriver.load error', err);
      return { tasks: {}, prefs: {} };
    }
  }

  async save({ tasks, prefs }) {
    try {
      if (tasks !== undefined) localStorage.setItem('priobox_tasks', JSON.stringify({ tasks }));
      if (prefs !== undefined) localStorage.setItem('priobox_prefs', JSON.stringify(prefs));
      return true;
    } catch (err) {
      console.error('StorageDriver.save error', err);
      return false;
    }
  }
}

