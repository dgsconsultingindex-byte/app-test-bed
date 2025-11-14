// src/views/DailyView.js
import { Utils } from '../core/Utils.js';

export default class DailyView {
  constructor({ store }) {
    this.store = store;
    this.store.subscribe(() => this.render());
  }

  attach() { this.render(); }

  render() {
    const today = new Date();
    document.getElementById('dailyDate').textContent = today.toLocaleDateString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric' });

    const all = this.store.getAllTasks();
    const todayDue = this.store.getDueToday();
    const overdue = this.store.getOverdue();
    const upcoming = all.filter(t => {
      const diff = Utils.getDaysDiff(t.due);
      return diff !== null && diff > 0 && diff <= 7 && !t.completed;
    });

    document.getElementById('todayDue').textContent = todayDue.length;
    document.getElementById('overdueCount').textContent = overdue.length;
    document.getElementById('upcomingCount').textContent = upcoming.length;

    const container = document.getElementById('dailyTasks');
    container.innerHTML = '';
    if (overdue.length > 0) this.renderSection(container, 'Overdue', overdue, 'var(--overdue)');
    if (todayDue.length > 0) this.renderSection(container, 'Due Today', todayDue, 'var(--accent-1)');
    if (upcoming.length > 0) this.renderSection(container, 'This Week', upcoming, 'var(--approach)');

    if (overdue.length === 0 && todayDue.length === 0 && upcoming.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="35" height="35" rx="5" fill="currentColor"/><rect x="55" y="10" width="35" height="35" rx="5" fill="currentColor"/><rect x="10" y="55" width="35" height="35" rx="5" fill="currentColor"/><rect x="55" y="55" width="35" height="35" rx="5" fill="currentColor"/></svg>
        <h3>All caught up!</h3><p>No urgent tasks. Great job staying organized.</p></div>`;
    }
  }

  renderSection(container, title, tasks, color) {
    const section = document.createElement('div');
    section.innerHTML = `<h3 style="color:${color};margin:16px 0 8px 0">${title}</h3>`;
    tasks.sort((a,b) => (a.due || '').localeCompare(b.due || '')).forEach(t => {
      const wrapper = document.createElement('div');
      wrapper.className = 'task';
      wrapper.innerHTML = `<div class="task-left"><div class="task-title">${Utils.escapeHtml(t.title)}</div>` +
        (t.description ? `<div class="task-desc">${Utils.escapeHtml(t.description)}</div>` : '') +
        (t.due ? `<div class="task-due">${Utils.formatDateISO(t.due)}</div>` : '') + `</div>`;
      wrapper.addEventListener('dblclick', () => {
        document.getElementById('panelTitle').textContent = 'Edit task';
        document.getElementById('pTitle').value = t.title;
        document.getElementById('pDesc').value = t.description || '';
        document.getElementById('pDue').value = t.due || '';
        document.getElementById('pQuadrant').value = t.quadrant || 'do-first';
        document.getElementById('pLabel').value = t.label || '';
        document.getElementById('pCompleted').checked = !!t.completed;
        document.getElementById('slidePanel').classList.add('show');
        document.getElementById('panelBackdrop').classList.add('show');
      });
      section.appendChild(wrapper);
    });
    container.appendChild(section);
  }
}
