// src/components/SlidePanel.js
export default class SlidePanel {
  constructor({ panelId = 'slidePanel', backdropId = 'panelBackdrop' } = {}) {
    this.panel = document.getElementById(panelId);
    this.backdrop = document.getElementById(backdropId);
    this.onSave = null;
    this.onCancel = null;
    this.setup();
  }

  setup() {
    const cancel = document.getElementById('panelCancel');
    const save = document.getElementById('panelSave');
    cancel?.addEventListener('click', () => this.cancel());
    save?.addEventListener('click', () => this.save());
    this.backdrop?.addEventListener('click', () => this.cancel());
  }

  open() { this.panel.classList.add('show'); this.backdrop.classList.add('show'); this.panel.setAttribute('aria-hidden', 'false'); }
  close() { this.panel.classList.remove('show'); this.backdrop.classList.remove('show'); this.panel.setAttribute('aria-hidden', 'true'); }

  populate(task) {
    document.getElementById('panelTitle').textContent = 'Edit task';
    document.getElementById('pTitle').value = task.title || '';
    document.getElementById('pDesc').value = task.description || '';
    document.getElementById('pDue').value = task.due || '';
    document.getElementById('pQuadrant').value = task.quadrant || 'do-first';
    document.getElementById('pLabel').value = task.label || '';
    document.getElementById('pCompleted').checked = !!task.completed;
  }

  read() {
    return {
      title: document.getElementById('pTitle').value.trim(),
      description: document.getElementById('pDesc').value.trim(),
      due: document.getElementById('pDue').value || '',
      quadrant: document.getElementById('pQuadrant').value,
      label: document.getElementById('pLabel').value,
      completed: !!document.getElementById('pCompleted').checked
    };
  }

  save() { if (this.onSave) this.onSave(this.read()); }
  cancel() { if (this.onCancel) this.onCancel(); this.close(); }
}

