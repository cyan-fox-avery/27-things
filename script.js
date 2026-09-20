const cover = document.getElementById("cover");
const memoryScreens = [...document.querySelectorAll(".memory-screen")];
const openBoxButton = document.getElementById("open-box");
const drawer = document.getElementById("memory-drawer");
const drawerOpenButtons = [...document.querySelectorAll(".drawer-open")];
const drawerCloseButtons = [...document.querySelectorAll(".drawer-close, .drawer-backdrop")];
const photoViewer = document.getElementById("photo-viewer");
const photoViewerImage = document.getElementById("photo-viewer-image");
const photoViewerCloseButtons = [...document.querySelectorAll(".photo-viewer-close, .photo-viewer-backdrop")];
const toast = document.getElementById("toast");

let currentScreen = "cover";
let lastFocus = null;
let toastTimer = null;
let touchStartX = 0;
let touchStartY = 0;

function getMemoryScreen(number) {
  return document.querySelector(`.memory-screen[data-memory="${number}"]`);
}

function closeAllNotes() {
  document.querySelectorAll(".keepsake.is-open").forEach((keepsake) => {
    keepsake.classList.remove("is-open");
    const button = keepsake.querySelector(".note-tab");
    if (button) button.setAttribute("aria-expanded", "false");
  });
}

function showScreen(target, options = {}) {
  const { updateHash = true, focus = false } = options;

  closeAllNotes();
  closeDrawer(false);
  closePhotoViewer(false);

  if (target === "cover") {
    memoryScreens.forEach((screen) => {
      screen.hidden = true;
      screen.classList.remove("is-active");
    });
    cover.hidden = false;
    cover.classList.add("is-active");
    currentScreen = "cover";
    if (updateHash) history.replaceState(null, "", window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (focus) openBoxButton.focus({ preventScroll: true });
    return;
  }

  const nextScreen = getMemoryScreen(target);
  if (!nextScreen) return;

  cover.hidden = true;
  cover.classList.remove("is-active");

  memoryScreens.forEach((screen) => {
    const active = screen === nextScreen;
    screen.hidden = !active;
    screen.classList.toggle("is-active", active);
  });

  currentScreen = target;
  if (updateHash) history.replaceState(null, "", `#memory-${target}`);
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (focus) {
    const firstControl = nextScreen.querySelector(".note-tab");
    if (firstControl) firstControl.focus({ preventScroll: true });
  }
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1900);
}

function openDrawer() {
  lastFocus = document.activeElement;
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  const closeButton = drawer.querySelector(".drawer-close");
  if (closeButton) closeButton.focus({ preventScroll: true });
}

function closeDrawer(returnFocus = true) {
  if (!drawer.classList.contains("is-open")) return;
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (returnFocus && lastFocus instanceof HTMLElement) lastFocus.focus({ preventScroll: true });
}

function openPhotoViewer(src, alt) {
  lastFocus = document.activeElement;
  photoViewerImage.src = src;
  photoViewerImage.alt = alt;
  photoViewer.classList.add("is-open");
  photoViewer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  const closeButton = photoViewer.querySelector(".photo-viewer-close");
  if (closeButton) closeButton.focus({ preventScroll: true });
}

function closePhotoViewer(returnFocus = true) {
  if (!photoViewer.classList.contains("is-open")) return;
  photoViewer.classList.remove("is-open");
  photoViewer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  window.setTimeout(() => {
    photoViewerImage.src = "";
    photoViewerImage.alt = "";
  }, 220);
  if (returnFocus && lastFocus instanceof HTMLElement) lastFocus.focus({ preventScroll: true });
}

openBoxButton.addEventListener("click", () => showScreen("01", { focus: true }));

document.querySelectorAll(".note-tab").forEach((button) => {
  button.addEventListener("click", () => {
    const keepsake = button.closest(".keepsake");
    const willOpen = !keepsake.classList.contains("is-open");
    keepsake.classList.toggle("is-open", willOpen);
    button.setAttribute("aria-expanded", String(willOpen));

    if (willOpen) {
      window.setTimeout(() => {
        const note = keepsake.querySelector(".memory-note");
        if (note) note.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 220);
    }
  });
});

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.disabled) return;
    const target = button.dataset.go;
    showScreen(target, { focus: true });
  });
});

drawerOpenButtons.forEach((button) => button.addEventListener("click", openDrawer));
drawerCloseButtons.forEach((button) => button.addEventListener("click", () => closeDrawer(true)));

photoViewerCloseButtons.forEach((button) => button.addEventListener("click", () => closePhotoViewer(true)));

document.querySelectorAll(".photo-button").forEach((button) => {
  button.addEventListener("click", (event) => {
    if (event.target.closest(".doodle-button")) return;
    openPhotoViewer(button.dataset.photo, button.dataset.photoAlt || "Enlarged photograph");
  });
});

const sunButton = document.querySelector(".sun-button");
if (sunButton) {
  sunButton.addEventListener("click", (event) => {
    event.stopPropagation();
    sunButton.classList.toggle("is-played");
    if (sunButton.classList.contains("is-played")) showToast("there it is - that brightness");
  });
}

function goRelative(direction) {
  if (currentScreen === "cover") {
    if (direction > 0) showScreen("01", { focus: false });
    return;
  }

  const current = Number.parseInt(currentScreen, 10);
  if (!Number.isFinite(current)) return;

  const next = current + direction;
  if (next < 1) {
    showScreen("cover", { focus: false });
    return;
  }

  const target = String(next).padStart(2, "0");
  if (getMemoryScreen(target)) {
    showScreen(target, { focus: false });
  } else if (direction > 0) {
    showToast("the rest of the memory box is coming next");
  }
}

function isInteractiveTarget(target) {
  return Boolean(target.closest("button, a, input, textarea, select, .memory-note"));
}

document.addEventListener("touchstart", (event) => {
  if (drawer.classList.contains("is-open") || photoViewer.classList.contains("is-open")) return;
  if (event.touches.length !== 1 || isInteractiveTarget(event.target)) return;
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}, { passive: true });

document.addEventListener("touchend", (event) => {
  if (!touchStartX && !touchStartY) return;
  if (drawer.classList.contains("is-open") || photoViewer.classList.contains("is-open")) return;
  if (event.changedTouches.length !== 1) return;

  const endX = event.changedTouches[0].clientX;
  const endY = event.changedTouches[0].clientY;
  const dx = endX - touchStartX;
  const dy = endY - touchStartY;

  touchStartX = 0;
  touchStartY = 0;

  if (Math.abs(dx) < 65 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
  goRelative(dx < 0 ? 1 : -1);
}, { passive: true });

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (photoViewer.classList.contains("is-open")) {
      closePhotoViewer(true);
      return;
    }
    if (drawer.classList.contains("is-open")) {
      closeDrawer(true);
      return;
    }
  }

  const active = document.activeElement;
  const editing = active && ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName);
  if (editing || drawer.classList.contains("is-open") || photoViewer.classList.contains("is-open")) return;

  if (event.key === "ArrowRight") goRelative(1);
  if (event.key === "ArrowLeft") goRelative(-1);
});

const hashMatch = window.location.hash.match(/^#memory-(\d{2})$/);
if (hashMatch && getMemoryScreen(hashMatch[1])) {
  showScreen(hashMatch[1], { updateHash: false, focus: false });
} else {
  showScreen("cover", { updateHash: false, focus: false });
}
