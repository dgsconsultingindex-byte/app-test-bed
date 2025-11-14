// src/components/TaskCard.js
import { Utils } from '../core/Utils.js';

export default class TaskCard {
  constructor(task, { onToggle, onEdit, onDelete, onCalendar } = {}) {
    this.task = task;
    this.onToggle = onToggle;
    this.onEdit = onEdit;
    this.onDelete = onDelete;
    this.onCalendar = onCalendar;
    this.el = this._render();
    this.setupDrag();
  }

  _render() {
    const div = document.createElement('div');
    div.className = 'task';
    div.dataset.id = this.task.id;
    if (this.task.completed) div.classList.add('completed');

    const left = document.createElement('div');
    left.className = 'task-left';

    const title = document.createElement('div');
    title.className = 'task-title';
    title.innerHTML = Utils.escapeHtml(this.task.title || '');

    if (this.task.label) {
      const tag = document.createElement('span');
      tag.className = `tag tag-${this.task.label}`;
      tag.textContent = this.task.label.charAt(0).toUpperCase() + this.task.label.slice(1);
      title.appendChild(tag);
    }

    left.appendChild(title);

    if (this.task.description) {
      const desc = document.createElement('div');
      desc.className = 'task-desc';
      desc.innerHTML = Utils.escapeHtml(this.task.description);
      left.appendChild(desc);
    }

    if (this.task.subtasks && this.task.subtasks.length) {
      const sub = document.createElement('div');
      sub.style.fontSize = '0.85rem';
      sub.style.color = 'var(--text-secondary)';
      const completed = this.task.subtasks.filter(s => s.completed).length;
      sub.textContent = `✓ ${completed}/${this.task.subtasks.length} subtasks`;
      left.appendChild(sub);
    }

    if (this.task.due) {
      const due = document.createElement('div');
      due.className = 'task-due';
      due.textContent = Utils.formatDateISO(this.task.due);
      left.appendChild(due);
    }

    const controls = document.createElement('div');
    controls.className = 'task-controls';
    controls.appendChild(this._btn(this.task.completed ? '↺' : '✔', () => this.onToggle && this.onToggle(this.task.id)));
    controls.appendChild(this._btn('✎', () => this.onEdit && this.onEdit(this.task.id)));
    controls.appendChild(this._btn('📅', () => this.onCalendar && this.onCalendar(this.task.id)));
    controls.appendChild(this._btn('✕', () => this.onDelete && this.onDelete(this.task.id)));

    div.appendChild(controls);
    div.appendChild(left);

    div.addEventListener('dblclick', () => this.onEdit && this.onEdit(this.task.id));

    return div;
  }

  _btn(text, onClick) {
    const b = document.createElement('button');
    b.className = 'small-btn';
    b.textContent = text;
    b.onclick = (e) => { e.stopPropagation(); onClick(); };
    return b;
  }

  setupDrag() {
    this.el.draggable = true;
    this.el.addEventListener('dragstart', (e) => {
      this.el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', this.task.id);
    });
    this.el.addEventListener('dragend', () => this.el.classList.remove('dragging'));
  }

  mount(to) { to.appendChild(this.el); }
  unmount() { this.el.remove(); }
}
