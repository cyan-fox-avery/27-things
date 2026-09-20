const screens = [...document.querySelectorAll('.screen')];
const memoryScreens = [...document.querySelectorAll('.memory-screen')];
const progressPill = document.getElementById('progress-pill');
const openBoxButton = document.getElementById('open-box');
const drawer = document.getElementById('memory-drawer');
const drawerButton = document.getElementById('drawer-button');
const drawerCloseTargets = [...document.querySelectorAll('[data-close-drawer]')];
const jumpLinks = [...document.querySelectorAll('[data-jump]')];
const finaleButton = document.querySelector('[data-finale-button]');
function sizeNote(screen) {
  const note = screen?.querySelector('.tucked-note');
  if (!note) return;
  note.style.setProperty('--note-open-height', `${note.scrollHeight + 24}px`);
}
function resetMemory(screen) {
  if (!screen) return;
  screen.classList.remove('note-open', 'finale-revealed');
  screen.querySelectorAll('[data-toggle-note]').forEach((toggle) => toggle.setAttribute('aria-expanded', 'false'));
  const note = screen.querySelector('.tucked-note');
  if (note) note.setAttribute('aria-hidden', 'true');
  screen.querySelector('[data-wish-candle]')?.classList.remove('blown');
}
function syncFinaleBody(screen) {
  const onFinale = screen?.id === 'memory-27';
  document.body.classList.toggle('finale-mode', onFinale && screen.classList.contains('note-open'));
  document.body.classList.toggle('finale-revealed', onFinale && screen.classList.contains('finale-revealed'));
}
function showScreen(id) {
  const target = document.getElementById(id);
  if (!target) return;
  screens.forEach((screen) => { screen.classList.remove('active'); if (screen.classList.contains('memory-screen')) resetMemory(screen); });
  document.body.classList.remove('finale-mode', 'finale-revealed');
  target.classList.add('active');
  if (target.dataset.memory && target.dataset.memory !== '00') {
    progressPill.textContent = `${target.dataset.memory} / 27`;
    requestAnimationFrame(() => sizeNote(target));
  } else progressPill.textContent = '01 / 27';
  closeDrawer();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function toggleNote(screen) {
  if (!screen) return;
  sizeNote(screen);
  const isOpen = screen.classList.toggle('note-open');
  screen.querySelectorAll('[data-toggle-note]').forEach((toggle) => toggle.setAttribute('aria-expanded', String(isOpen)));
  const note = screen.querySelector('.tucked-note');
  if (note) note.setAttribute('aria-hidden', String(!isOpen));
  if (!isOpen) screen.classList.remove('finale-revealed');
  syncFinaleBody(screen);
}
function openDrawer() { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); }
function closeDrawer() { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); }
openBoxButton?.addEventListener('click', () => showScreen('memory-01'));
drawerButton?.addEventListener('click', openDrawer);
drawerCloseTargets.forEach((el) => el.addEventListener('click', closeDrawer));
memoryScreens.forEach((screen) => screen.querySelectorAll('[data-toggle-note]').forEach((toggle) => toggle.addEventListener('click', () => toggleNote(screen))));
jumpLinks.forEach((link) => link.addEventListener('click', (event) => { const id = link.dataset.jump; if (!id) return; event.preventDefault(); showScreen(id); }));
document.querySelectorAll('[data-wish-candle]').forEach((candle) => candle.addEventListener('click', (event) => { event.stopPropagation(); candle.classList.toggle('blown'); }));
finaleButton?.addEventListener('click', () => {
  const screen = document.getElementById('memory-27');
  if (!screen) return;
  if (!screen.classList.contains('note-open')) toggleNote(screen);
  screen.classList.add('finale-revealed');
  sizeNote(screen);
  syncFinaleBody(screen);
  setTimeout(() => screen.querySelector('.birthday-finale')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
});
let touchStartX = null, touchStartY = null;
function activeMemoryIndex() { return memoryScreens.findIndex((screen) => screen.classList.contains('active')); }
document.addEventListener('touchstart', (event) => { const touch = event.changedTouches[0]; touchStartX = touch.clientX; touchStartY = touch.clientY; }, { passive: true });
document.addEventListener('touchend', (event) => {
  if (touchStartX === null || touchStartY === null) return;
  const touch = event.changedTouches[0], deltaX = touch.clientX - touchStartX, deltaY = touch.clientY - touchStartY;
  if (Math.abs(deltaX) > 75 && Math.abs(deltaY) < 60) {
    const index = activeMemoryIndex();
    if (index !== -1) {
      if (deltaX < 0 && memoryScreens[index + 1]) showScreen(memoryScreens[index + 1].id);
      else if (deltaX > 0 && memoryScreens[index - 1]) showScreen(memoryScreens[index - 1].id);
    }
  }
  touchStartX = null; touchStartY = null;
}, { passive: true });
window.addEventListener('resize', () => { const active = document.querySelector('.memory-screen.active'); if (active) sizeNote(active); });
showScreen('cover');
