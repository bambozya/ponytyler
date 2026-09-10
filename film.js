// Endless film strip slider: the photos are cloned on both sides, the frame in the middle is "developed",
// and once scrolling settles the strip quietly jumps back to the same photo in the middle set.
(() => {
  const reel = document.querySelector(".film-reel");
  if (!reel) return;
  const track = reel.querySelector(".film-track");
  const roll = reel.querySelector(".film-roll");
  const originals = [...roll.children];
  const count = originals.length;
  const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  const cloneFrame = (frame) => {
    const clone = frame.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    return clone;
  };
  roll.prepend(...originals.map(cloneFrame));
  roll.append(...originals.map(cloneFrame));
  const frames = [...roll.children];

  let shown = 0;
  let target = null;
  let touching = false;
  let ticking = false;
  let settleTimer;

  // Frame k (counted across all three sets) is centred at scrollLeft = offsetOf(k).
  const frameWidth = () => frames[0].offsetWidth;
  const offsetOf = (k) => k * frameWidth() + (frameWidth() - track.clientWidth) / 2;
  const current = () => Math.round((track.scrollLeft - offsetOf(0)) / frameWidth());

  const setActive = (index) => {
    if (index === shown) return;
    frames.forEach((frame, k) => frame.classList.toggle("is-active", k % count === index));
    shown = index;
  };
  const go = (k) => {
    target = Math.max(0, Math.min(frames.length - 1, k));
    track.scrollTo({ left: offsetOf(target), behavior });
  };
  const recentre = () => {
    target = null;
    if (touching) return;
    const k = current();
    if (k < count || k >= count * 2) track.scrollLeft = offsetOf(count + (k % count));
  };
  const settle = () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(recentre, 150);
  };

  track.scrollLeft = offsetOf(count);

  track.addEventListener("scroll", () => {
    settle();
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { setActive(current() % count); ticking = false; });
  }, { passive: true });
  track.addEventListener("touchstart", () => { touching = true; }, { passive: true });
  ["touchend", "touchcancel"].forEach((type) => track.addEventListener(type, () => { touching = false; settle(); }, { passive: true }));

  reel.querySelectorAll("[data-step]").forEach((button) => button.addEventListener("click", () => {
    go((target ?? current()) + Number(button.dataset.step));
  }));
  track.addEventListener("click", (event) => {
    const frame = event.target.closest(".film-frame");
    if (frame) go(frames.indexOf(frame));
  });
})();
