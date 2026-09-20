const screens = [...document.querySelectorAll('.screen')];
const memoryScreens = [...document.querySelectorAll('.memory-screen')];
const progressPill = document.getElementById('progress-pill');
const openBoxButton = document.getElementById('open-box');
const drawer = document.getElementById('memory-drawer');
const drawerButton = document.getElementById('drawer-button');
const drawerCloseTargets = [...document.querySelectorAll('[data-close-drawer]')];
const jumpLinks = [...document.querySelectorAll('[data-jump]')];

function showScreen(id) {
  const target = document.getElementById(id);
  if (!target) return;

  screens.forEach((screen) => screen.classList.remove('active'));
  target.classList.add('active');

  if (target.dataset.memory && progressPill) {
    progressPill.textContent = `${target.dataset.memory} / 27`;
  }

  if (id === 'cover') {
    progressPill.textContent = '01 / 27';
  }

  closeDrawer();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleNote(screen) {
  if (!screen) return;
  const isOpen = screen.classList.toggle('note-open');
  const toggle = screen.querySelector('[data-toggle-note]');
  const note = screen.querySelector('.note-card');
  if (toggle) toggle.setAttribute('aria-expanded', String(isOpen));
  if (note) note.setAttribute('aria-hidden', String(!isOpen));
}

function openDrawer() {
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
}

function closeDrawer() {
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
}

openBoxButton?.addEventListener('click', () => showScreen('memory-01'));

drawerButton?.addEventListener('click', openDrawer);
drawerCloseTargets.forEach((el) => el.addEventListener('click', closeDrawer));

memoryScreens.forEach((screen) => {
  const toggle = screen.querySelector('[data-toggle-note]');
  toggle?.addEventListener('click', () => toggleNote(screen));
});

jumpLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.dataset.jump;
    if (!id) return;
    event.preventDefault();
    showScreen(id);
  });
});

let touchStartX = null;
let touchStartY = null;

function activeMemoryIndex() {
  return memoryScreens.findIndex((screen) => screen.classList.contains('active'));
}

document.addEventListener('touchstart', (event) => {
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });

document.addEventListener('touchend', (event) => {
  if (touchStartX === null || touchStartY === null) return;
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;

  if (Math.abs(deltaX) > 70 && Math.abs(deltaY) < 60) {
    const index = activeMemoryIndex();
    if (index !== -1) {
      if (deltaX < 0 && memoryScreens[index + 1]) {
        showScreen(memoryScreens[index + 1].id);
      } else if (deltaX > 0 && memoryScreens[index - 1]) {
        showScreen(memoryScreens[index - 1].id);
      }
    }
  }

  touchStartX = null;
  touchStartY = null;
}, { passive: true });

showScreen('cover');
