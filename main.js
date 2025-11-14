// main.js (root)
import TaskStore from './src/core/TaskStore.js';
import LocalStorageDriver from './src/drivers/LocalStorageDriver.js';
import MatrixView from './src/views/MatrixView.js';
import DailyView from './src/views/DailyView.js';
import StatsView from './src/views/StatsView.js';
import { Utils } from './src/core/Utils.js';
import Toast from './src/components/Toast.js';

// bootstrap app
const store = new TaskStore({ driver: new LocalStorageDriver() });

const dom = {
  loading: document.getElementById('loading'),
  appArea: document.getElementById('appArea'),
  viewDaily: document.getElementById('viewDaily'),
  viewMatrix: document.getElementById('viewMatrix'),
  viewStats: document.getElementById('viewStats')
};

const matrixView = new MatrixView({ store });
const dailyView = new DailyView({ store });
const statsView = new StatsView({ store });

function hideAllViews() {
  document.querySelectorAll('.view-section').forEach(s => s.style.display = 'none');
}
function setActiveButton(active) {
  [dom.viewDaily, dom.viewMatrix, dom.viewStats].forEach(b => b.classList.remove('active'));
  active.classList.add('active');
}

function wireNav() {
  dom.viewDaily.addEventListener('click', () => {
    hideAllViews();
    document.getElementById('dailyView').style.display = 'block';
    setActiveButton(dom.viewDaily);
    dailyView.render();
    store.setPref('currentView', 'daily');
  });
  dom.viewMatrix.addEventListener('click', () => {
    hideAllViews();
    document.getElementById('matrixView').style.display = 'block';
    setActiveButton(dom.viewMatrix);
    matrixView.render();
    store.setPref('currentView', 'matrix');
  });
  dom.viewStats.addEventListener('click', () => {
    hideAllViews();
    document.getElementById('statsView').style.display = 'block';
    setActiveButton(dom.viewStats);
    statsView.render();
    store.setPref('currentView', 'stats');
  });
}

async function init() {
  dom.loading.style.display = 'flex';
  await store.load();
  wireNav();
  matrixView.attach();
  dailyView.attach();
  statsView.attach();
  // initial view
  const current = store.getPref('currentView') || 'daily';
  if (current === 'matrix') dom.viewMatrix.click();
  else if (current === 'stats') dom.viewStats.click();
  else dom.viewDaily.click();

  dom.loading.classList.add('loading-hidden');
  setTimeout(() => dom.loading.style.display = 'none', 300);
}

init();

// expose simple debug
window.priobox = { store, Utils, Toast };
