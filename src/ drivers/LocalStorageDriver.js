// src/drivers/LocalStorageDriver.js
export default class LocalStorageDriver {
  constructor({ tasksKey = 'priobox_tasks', prefsKey = 'priobox_prefs' } = {}) {
    this.tasksKey = tasksKey;
    this.prefsKey = prefsKey;
  }

  async load() {
    try {
      const rawTasks = localStorage.getItem(this.tasksKey);
      const rawPrefs = localStorage.getItem(this.prefsKey);
      const tasks = rawTasks ? (JSON.parse(rawTasks).tasks || {}) : {};
      const prefs = rawPrefs ? JSON.parse(rawPrefs) : {};
      return { tasks, prefs };
    } catch (err) {
      console.error('LocalStorageDriver.load error', err);
      return { tasks: {}, prefs: {} };
    }
  }

  async save({ tasks, prefs }) {
    try {
      if (tasks !== undefined) localStorage.setItem(this.tasksKey, JSON.stringify({ tasks }));
      if (prefs !== undefined) localStorage.setItem(this.prefsKey, JSON.stringify(prefs));
      return true;
    } catch (err) {
      console.error('LocalStorageDriver.save error', err);
      return false;
    }
  }
}

