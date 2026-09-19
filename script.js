const progressCurrent = document.getElementById("progress-current");
const memories = [...document.querySelectorAll(".memory")];
const cover = document.querySelector(".cover");

function setProgress(value) {
 if (progressCurrent) {
   progressCurrent.textContent = value;
 }
}

if ("IntersectionObserver" in window) {
 const memoryObserver = new IntersectionObserver(
   (entries) => {
     const visibleEntries = entries
       .filter((entry) => entry.isIntersecting)
       .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

     if (visibleEntries.length > 0) {
       const currentMemory = visibleEntries[0].target.dataset.memory;
       setProgress(currentMemory);
     }
   },
   {
     root: null,
     rootMargin: "-28% 0px -28% 0px",
     threshold: [0.15, 0.35, 0.55, 0.75]
   }
 );

 memories.forEach((memory) => memoryObserver.observe(memory));

 if (cover) {
   const coverObserver = new IntersectionObserver(
     (entries) => {
       entries.forEach((entry) => {
         if (entry.isIntersecting && entry.intersectionRatio > 0.45) {
           setProgress("00");
         }
       });
     },
     {
       threshold: [0.45, 0.7]
     }
   );

   coverObserver.observe(cover);
 }
} else {
 setProgress("01");
}

const beginButton = document.querySelector(".begin-button");

if (beginButton) {
 beginButton.addEventListener("click", () => {
   window.setTimeout(() => setProgress("01"), 350);
 });
}