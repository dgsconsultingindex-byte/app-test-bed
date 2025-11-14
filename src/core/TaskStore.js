// src/core/TaskStore.js
import StorageDriver from './StorageDriver.js';

export default class TaskStore {
  constructor({ driver = null } = {}) {
    this.driver = driver || new StorageDriver();
    this.tasks = {};
    this.prefs = { showCompleted: true, theme: 'light', currentView: 'daily', onboardingSeen: false, schemaVersion: 1 };
    this.listeners = new Set();
  }

  async load() {
    const { tasks = {}, prefs = {} } = await this.driver.load();
    this.tasks = tasks || {};
    Object.values(this.tasks).forEach(t => { if (!t.subtasks) t.subtasks = []; if (!t.createdAt) t.createdAt = Date.now(); });
    this.prefs = { ...this.prefs, ...prefs };
    this._notify();
  }

  async save() {
    await this.driver.save({ tasks: this.tasks, prefs: this.prefs });
    this._notify();
  }

  subscribe(cb) { this.listeners.add(cb); return () => this.listeners.delete(cb); }
  _notify() { for (const cb of this.listeners) cb(); }

  generateId() { return `t-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`; }

  async addTask(task) {
    const id = this.generateId();
    this.tasks[id] = {
      id,
      title: task.title || 'Untitled',
      description: task.description || '',
      due: task.due || '',
      quadrant: task.quadrant || 'do-first',
      label: task.label || '',
      completed: false,
      subtasks: task.subtasks || [],
      createdAt: Date.now(),
      ...task
    };
    await this.save();
    return id;
  }

  async updateTask(id, updates) {
    if (!this.tasks[id]) return false;
    this.tasks[id] = { ...this.tasks[id], ...updates };
    await this.save();
    return true;
  }

  async deleteTask(id) {
    if (!this.tasks[id]) return false;
    delete this.tasks[id];
    await this.save();
    return true;
  }

  getTask(id) { return this.tasks[id]; }
  getAllTasks() { return Object.values(this.tasks); }
  getTasksByQuadrant(q) { return this.getAllTasks().filter(t => t.quadrant === q); }

  setPref(key, val) { this.prefs[key] = val; return this.save(); }
  getPref(key) { return this.prefs[key]; }

  // Computed helpers
  getOverdue() {
    const now = new Date(); now.setHours(0,0,0,0);
    return this.getAllTasks().filter(t => t.due && new Date(t.due) < now && !t.completed);
  }

  getDueToday() {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    return this.getAllTasks().filter(t => {
      if (!t.due) return false;
      const d = new Date(t.due);
      return d >= today && d < tomorrow && !t.completed;
    });
  }

  search(term) {
    if (!term || !term.trim()) return this.getAllTasks();
    const q = term.toLowerCase();
    return this.getAllTasks().filter(t => (t.title + ' ' + (t.description||'') + ' ' + (t.label||'')).toLowerCase().includes(q));
  }
}
