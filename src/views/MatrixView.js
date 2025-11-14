// src/views/MatrixView.js
import TaskCard from '../components/TaskCard.js';
import SlidePanel from '../components/SlidePanel.js';
import SubtaskList from '../components/SubtaskList.js';
import Modal from '../components/Modal.js';
import { Utils } from '../core/Utils.js';
import Toast from '../components/Toast.js';

export default class MatrixView {
  constructor({ store }) {
    this.store = store;
    this.quadrants = ['do-first', 'schedule', 'delegate', 'eliminate'];
    this.panel = new SlidePanel();
    this.editingTaskId = null;
    this.searchTerm = '';
    this.store.subscribe(() => this.render());
    this.setupControls();
    this.setupPanelHandlers();
    this.setupDragTargets();
  }

  attach() {
    this.render();
  }

  setupControls() {
    document.getElementById('addBtn').addEventListener('click', async () => {
      const titleEl = document.getElementById('taskTitle');
      const title = titleEl.value.trim();
      if (!title) { titleEl.focus(); return; }
      const task = {
        title,
        description: document.getElementById('taskDescription').value.trim(),
        due: document.getElementById('taskDue').value || '',
        quadrant: document.getElementById('taskQuadrant').value || 'do-first',
        label: document.getElementById('taskLabel').value || ''
      };
      await this.store.addTask(task);
      titleEl.value = ''; document.getElementById('taskDescription').value = ''; document.getElementById('taskDue').value = '';
      Toast.show('Task added');
    });

    document.getElementById('clearBtn').addEventListener('click', async () => {
      const ok = await Modal.confirm('Clear all tasks? This cannot be undone.');
      if (!ok) return;
      this.store.tasks = {};
      await this.store.save();
    });

    document.getElementById('demoBtn').addEventListener('click', () => this.loadDemoData());
    document.getElementById('exportBtn').addEventListener('click', () => this.exportTasks());
    document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFileInput').click());
    document.getElementById('importFileInput').addEventListener('change', (e) => this.importTasks(e));

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
      this.searchTerm = searchInput.value.trim().toLowerCase();
      this.render();
    });

    document.getElementById('toggleCompletedBtn').addEventListener('click', () => {
      const show = !this.store.getPref('showCompleted');
      this.store.setPref('showCompleted', show);
      document.getElementById('toggleCompletedBtn').textContent = show ? 'Hide Completed' : 'Show Completed';
    });
  }

  setupPanelHandlers() {
    this.panel.onSave = async (data) => {
      if (!this.editingTaskId) return;
      await this.store.updateTask(this.editingTaskId, data);
      this.panel.close();
    };
    this.panel.onCancel = () => { this.panel.close(); };
    document.getElementById('addToCalendarBtn').addEventListener('click', () => {
      if (!this.editingTaskId) return;
      const t = this.store.getTask(this.editingTaskId);
      if (t) Utils.openGoogleCalendar(t);
    });
    document.getElementById('downloadICSBtn').addEventListener('click', () => {
      if (!this.editingTaskId) return;
      const t = this.store.getTask(this.editingTaskId);
      if (t) Utils.downloadICS(t);
    });
    document.getElementById('deleteFromPanelBtn').addEventListener('click', async () => {
      if (!this.editingTaskId) return;
      const ok = confirm('Delete this task?');
      if (!ok) return;
      await this.store.deleteTask(this.editingTaskId);
      this.panel.close();
    });

    document.getElementById('addSubtaskBtn').addEventListener('click', () => {
      if (!this.editingTaskId) return;
      const text = prompt('Subtask:');
      if (!text) return;
      const t = this.store.getTask(this.editingTaskId);
      if (!t.subtasks) t.subtasks = [];
      t.subtasks.push({ text: text.trim(), completed: false });
      this.store.save();
      this.panel.populate(t);
    });
  }

  setupDragTargets() {
    document.querySelectorAll('.quadrant').forEach(qEl => {
      qEl.addEventListener('dragover', (e) => { e.preventDefault(); qEl.classList.add('drop-over'); });
      qEl.addEventListener('dragleave', () => qEl.classList.remove('drop-over'));
      qEl.addEventListener('drop', (e) => {
        e.preventDefault(); qEl.classList.remove('drop-over');
        const taskId = e.dataTransfer.getData('text/plain');
        const target = qEl.dataset.q;
        if (taskId && target) this.store.updateTask(taskId, { quadrant: target });
      });
    });
  }

  render() {
    this.quadrants.forEach(q => {
      const el = document.getElementById(`${q}-tasks`);
      if (!el) return;
      el.innerHTML = '';
      let tasks = this.store.getTasksByQuadrant(q).slice();
      tasks.sort((a,b) => (a.due || '').localeCompare(b.due || '') || ((a.createdAt||0) - (b.createdAt||0)));
      tasks = tasks.filter(t => this.searchTerm ? ((t.title + ' ' + (t.description || '')).toLowerCase().includes(this.searchTerm)) : true);
      tasks.forEach(t => {
        if (!this.store.getPref('showCompleted') && t.completed) return;
        const card = new TaskCard(t, {
          onToggle: async (id) => { const task = this.store.getTask(id); await this.store.updateTask(id, { completed: !task.completed }); },
          onEdit: (id) => this.openEditPanel(id),
          onDelete: async (id) => {
            const ok = confirm('Delete this task?');
            if (!ok) return;
            await this.store.deleteTask(id);
          },
          onCalendar: (id) => {
            const task = this.store.getTask(id);
            if (task && task.due) Utils.openGoogleCalendar(task);
            else alert('Please add a due date first');
          }
        });
        card.mount(el);
      });
    });
    this.updateQuadrantStats();
  }

  updateQuadrantStats() {
    this.quadrants.forEach(q => {
      const tasks = this.store.getTasksByQuadrant(q);
      const total = tasks.length;
      const done = tasks.filter(t => t.completed).length;
      const pct = total === 0 ? 0 : Math.round((done / total) * 100);
      const countEl = document.getElementById(`${q}-count`);
      const fillEl = document.getElementById(`${q}-fill`);
      if (countEl) countEl.textContent = `(${done}/${total} done)`;
      if (fillEl) fillEl.style.width = pct + '%';
    });
  }

  openEditPanel(id) {
    this.editingTaskId = id;
    const task = this.store.getTask(id);
    if (!task) return;
    this.panel.populate(task);
    // render subtasks in panel
    const subListRoot = document.getElementById('subtasksList');
    subListRoot.innerHTML = '';
    const subList = new SubtaskList(task, {
      onToggle: async (idx, checked) => {
        task.subtasks[idx].completed = !!checked;
        await this.store.save();
        this.openEditPanel(id);
      },
      onDelete: async (idx) => {
        task.subtasks.splice(idx, 1);
        await this.store.save();
        this.openEditPanel(id);
      },
      onAdd: async () => {
        const text = prompt('Subtask:');
        if (!text) return;
        task.subtasks.push({ text: text.trim(), completed: false });
        await this.store.save();
        this.openEditPanel(id);
      }
    });
    subList.mount(subListRoot);
    this.panel.open();
  }

  exportTasks() {
    const data = JSON.stringify({ tasks: this.store.tasks }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'priobox-tasks.json';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  importTasks(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        if (obj.tasks) {
          Object.values(obj.tasks).forEach(t => {
            let id = t.id;
            if (!id || this.store.tasks[id]) id = this.store.generateId();
            this.store.tasks[id] = { ...t, id };
          });
          this.store.save();
          Toast.show('Imported tasks successfully');
        } else Toast.show('No tasks found in file');
      } catch (err) {
        Toast.show('Invalid JSON file');
        console.error(err);
      }
    };
    reader.readAsText(file);
    document.getElementById('importFileInput').value = '';
  }

  loadDemoData() {
    if (Object.keys(this.store.tasks).length > 0) {
      if (!confirm('This will replace your current tasks. Continue?')) return;
    }
    this.store.tasks = {};
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);
    const nextWeek = new Date(today.getTime() + 7 * 86400000);
    const yesterday = new Date(today.getTime() - 86400000);
    const fmt = (d) => d.toISOString().slice(0,10);
    const samples = [
      { title: 'Fix critical signup bug', quadrant: 'do-first', due: fmt(tomorrow), label: 'client', description: 'Users cannot complete registration', subtasks: [{ text: 'Reproduce', completed: true }, { text: 'Fix', completed: false }] },
      { title: 'Plan Q2 roadmap', quadrant: 'schedule', due: fmt(nextWeek), label: '', description: 'Strategic planning session', subtasks: [] },
      { title: 'Review social media posts', quadrant: 'delegate', due: '', label: 'personal', description: 'Quick 15-minute task' },
      { title: 'Clean old email subscriptions', quadrant: 'eliminate', due: '', label: '', description: 'Low priority cleanup' },
      { title: 'Submit quarterly report', quadrant: 'do-first', due: fmt(yesterday), label: 'client', description: 'Overdue - needs immediate attention' }
    ];
    samples.forEach(s => this.store.addTask(s));
  }
}

