// src/components/SubtaskList.js
export default class SubtaskList {
  constructor(task, { onToggle, onDelete, onAdd } = {}) {
    this.task = task;
    this.onToggle = onToggle;
    this.onDelete = onDelete;
    this.onAdd = onAdd;
    this.el = document.createElement('div');
    this.el.className = 'subtasks';
    this.render();
  }

  render() {
    this.el.innerHTML = '';
    (this.task.subtasks || []).forEach((st, idx) => {
      const div = document.createElement('div');
      div.className = 'subtask' + (st.completed ? ' completed' : '');
      const c = document.createElement('input');
      c.type = 'checkbox';
      c.checked = !!st.completed;
      c.addEventListener('change', () => this.onToggle && this.onToggle(idx, c.checked));
      const text = document.createElement('span');
      text.textContent = st.text;
      text.style.flex = '1';
      const del = document.createElement('button');
      del.className = 'small-btn';
      del.textContent = '✕';
      del.addEventListener('click', () => this.onDelete && this.onDelete(idx));
      div.appendChild(c); div.appendChild(text); div.appendChild(del);
      this.el.appendChild(div);
    });
    const add = document.createElement('div');
    add.className = 'subtask-add';
    add.textContent = '+ Add subtask';
    add.addEventListener('click', () => this.onAdd && this.onAdd());
    this.el.appendChild(add);
  }

  mount(to) { to.appendChild(this.el); }
  unmount() { this.el.remove(); }
}

