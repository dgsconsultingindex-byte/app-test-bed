// src/core/Utils.js
export const Utils = {
  escapeHtml(text = '') {
    const d = document.createElement('div'); d.textContent = text; return d.innerHTML;
  },
  formatDateISO(dateStr) {
    if (!dateStr) return '';
    try { return new Date(dateStr).toISOString().slice(0,10); } catch { return dateStr; }
  },
  getDaysDiff(dateStr) {
    if (!dateStr) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    const date = new Date(dateStr); date.setHours(0,0,0,0);
    return Math.round((date - today) / (1000*60*60*24));
  },
  formatDateFriendly(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' });
  },

  // Calendar helpers
  openGoogleCalendar(task) {
    if (!task || !task.due) { alert('Task must have a due date to add to Google Calendar'); return; }
    const start = new Date(task.due + 'T09:00:00');
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const formatDate = (dt) => dt.toISOString().slice(0, 19).replace(/-|:/g, '') + 'Z';
    const dates = `${formatDate(start)}/${formatDate(end)}`;
    const text = encodeURIComponent(task.title || 'Task');
    const details = encodeURIComponent(task.description || '');
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`, '_blank');
  },

  generateICS(task) {
    if (!task || !task.due) return null;
    const start = new Date(task.due + 'T09:00:00');
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const formatDate = (dt) => dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PrioBox//EN',
      'BEGIN:VEVENT',
      `UID:${task.id}@priobox`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${(task.title || '').replace(/[,;]/g, '')}`,
      `DESCRIPTION:${(task.description||'').replace(/\n/g,'\\n').replace(/[,;]/g, '')}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    return ics;
  },

  downloadICS(task) {
    const ics = this.generateICS(task);
    if (!ics) { alert('Task must have a due date to export to calendar'); return; }
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${(task.title || 'task').slice(0, 40)}.ics`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }
};

