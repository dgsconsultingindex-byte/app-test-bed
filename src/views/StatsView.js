// src/views/StatsView.js
import { Utils } from '../core/Utils.js';

export default class StatsView {
  constructor({ store }) {
    this.store = store;
    this.quadrants = ['do-first', 'schedule', 'delegate', 'eliminate'];
    this.store.subscribe(() => this.render());
  }

  attach() { this.render(); }

  render() {
    const all = this.store.getAllTasks();
    const total = all.length;
    const completed = all.filter(t => t.completed).length;
    const active = total - completed;
    const overdue = all.filter(t => { const d = Utils.getDaysDiff(t.due); return d !== null && d < 0 && !t.completed; }).length;

    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('activeTasks').textContent = active;
    document.getElementById('overdueStats').textContent = overdue;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    document.getElementById('completionRate').textContent = `${completionRate}% completion rate`;
    document.getElementById('completedBar').style.width = completionRate + '%';
    document.getElementById('activeBar').style.width = (total > 0 ? Math.round((active / total) * 100) : 0) + '%';

    this.quadrants.forEach(q => {
      const label = q.replace('-', '');
      const count = all.filter(t => t.quadrant === q).length;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      const statEl = document.getElementById(`${label}Stat`);
      const barEl = document.getElementById(`${label}Bar`);
      if (statEl) statEl.textContent = count;
      if (barEl) barEl.style.width = pct + '%';
    });

    this.renderInsights(all, total, completed, overdue, completionRate);
  }

  renderInsights(all, total, completed, overdue, completionRate) {
    const insights = [];
    if (overdue > 0) insights.push(`You have ${overdue} overdue task${overdue > 1 ? 's' : ''} that need immediate attention.`);
    if (completionRate >= 70) insights.push(`Great job! You're completing ${completionRate}% of your tasks.`);
    else if (completionRate < 30 && total > 5) insights.push(`Consider breaking down tasks into smaller, more manageable pieces.`);
    const doFirstCount = all.filter(t => t.quadrant === 'do-first').length;
    const eliminateCount = all.filter(t => t.quadrant === 'eliminate').length;
    if (doFirstCount > total * 0.5 && total > 5) insights.push(`Over half your tasks are in "Do First". Consider if some could be scheduled or delegated.`);
    if (eliminateCount > 5) insights.push(`You have ${eliminateCount} tasks in "Eliminate". Consider removing low-value items.`);
    if (total === completed && total > 0) insights.push(`All tasks completed! Time to set new goals.`);
    if (insights.length === 0) insights.push(`Keep adding tasks and tracking your progress to see personalized insights.`);
    document.getElementById('insightsList').innerHTML = insights.map(i => `<li>${i}</li>`).join('');
  }
}
