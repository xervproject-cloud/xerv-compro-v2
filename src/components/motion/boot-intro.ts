// @ts-nocheck
/**
 * Splash / boot intro — glassy X docks into the wordmark.
 * Module guard survives React Strict Mode remounts within the same page load.
 */

let bootHandled = false;
let bootCompleted = false;

export function isBootComplete() {
  return bootCompleted;
}

export function runBootIntro() {
  // Already finished this page load.
  if (bootCompleted) return "done";
  // Animation already in flight (Strict Mode remount) — keep it going.
  if (bootHandled) return "done";

  const html = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const boot = document.getElementById("boot");
  const bootX = document.querySelector(".boot-x");
  const destX = document.querySelector(".logo .mark-x");
  const wash = document.querySelector(".boot-wash");
  const glow = document.querySelector(".boot-glow");
  const bootBg = document.querySelector(".boot-bg");

  // Logo / boot markup not ready yet — ask caller to retry.
  if (!boot || !bootX || !destX) {
    return "retry";
  }

  bootHandled = true;

  const seenHere = sessionStorage.getItem("xerv-here") === "1";
  const fromNav = sessionStorage.getItem("xerv-nav") === "1";

  const skip =
    reduceMotion.matches ||
    seenHere ||
    fromNav ||
    (window.location.hash &&
      !/^#intro$/.test(window.location.hash) &&
      window.location.hash !== "#top");

  const bootClasses = ["is-docking", "is-letters", "is-nav", "is-hero", "is-end"];
  const INTRO_SPEED = 1.25;
  const beat = (ms) => ms / INTRO_SPEED;

  function removeBoot() {
    document.getElementById("boot")?.remove();
  }

  function finish() {
    bootCompleted = true;
    try {
      sessionStorage.setItem("xerv-here", "1");
    } catch {
      /* ignore */
    }
    html.classList.remove("is-booting");
    html.classList.add("is-revealed");
    document.dispatchEvent(new Event("xerv:booted"));
    window.setTimeout(() => {
      html.classList.remove(...bootClasses);
      removeBoot();
    }, beat(900));
  }

  if (skip) {
    bootCompleted = true;
    try {
      sessionStorage.setItem("xerv-here", "1");
    } catch {
      /* ignore */
    }
    html.classList.remove("is-booting");
    html.classList.add("is-revealed");
    removeBoot();
    document.dispatchEvent(new Event("xerv:booted"));
    return "done";
  }

  html.classList.add("is-booting");

  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));
  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix3 = (a, b, t) => [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  function run(duration, ease, render) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      function frame(now) {
        const u = Math.min(1, (now - t0) / duration);
        render(ease(u), u);
        if (u < 1) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  const VIOLET = [91, 47, 244];
  const TEAL = [66, 139, 149];
  const MAGENTA = [169, 5, 214];
  const ROSE = [168, 18, 96];
  const WINE = [72, 16, 64];
  const INDIGO = [36, 26, 94];
  const BLACK = [5, 5, 5];
  const DOCK_BG = [8, 4, 9];
  const HERO_TOP = [10, 7, 24];

  const GLOW_KEYS = [
    { t: 0, color: VIOLET, y: 14, alpha: 0.48, floor: BLACK, washTop: VIOLET, washBot: MAGENTA },
    { t: 0.2, color: MAGENTA, y: 18, alpha: 0.42, floor: BLACK, washTop: MAGENTA, washBot: VIOLET },
    { t: 0.36, color: TEAL, y: 16, alpha: 0.4, floor: BLACK, washTop: TEAL, washBot: BLACK },
    { t: 0.52, color: MAGENTA, y: 16, alpha: 0.4, floor: BLACK, washTop: MAGENTA, washBot: BLACK },
    { t: 0.68, color: ROSE, y: 42, alpha: 0.36, floor: DOCK_BG, washTop: ROSE, washBot: BLACK },
    { t: 0.84, color: WINE, y: 82, alpha: 0.4, floor: DOCK_BG, washTop: WINE, washBot: INDIGO },
    { t: 1, color: INDIGO, y: 108, alpha: 0.55, floor: HERO_TOP, washTop: HERO_TOP, washBot: INDIGO },
  ];

  function glowAt(t) {
    const u = Math.max(0, Math.min(1, t));
    let i = 0;
    while (i < GLOW_KEYS.length - 2 && u >= GLOW_KEYS[i + 1].t) i += 1;
    const a = GLOW_KEYS[i];
    const b = GLOW_KEYS[i + 1];
    const k = (u - a.t) / (b.t - a.t);
    return {
      color: mix3(a.color, b.color, k),
      y: lerp(a.y, b.y, k),
      alpha: lerp(a.alpha, b.alpha, k),
      floor: mix3(a.floor, b.floor, k),
      washTop: mix3(a.washTop, b.washTop, k),
      washBot: mix3(a.washBot, b.washBot, k),
    };
  }

  function paintGlow(t) {
    const liveBoot = document.getElementById("boot");
    const liveBg = document.querySelector(".boot-bg");
    const liveWash = document.querySelector(".boot-wash");
    const liveGlow = document.querySelector(".boot-glow");
    if (!liveBoot) return;

    const g = glowAt(t);
    const rampT = Math.max(0, (t - 0.55) / 0.45);
    const top = mix3(g.floor, HERO_TOP, rampT);
    const bot = mix3(g.floor, INDIGO, Math.max(0, (t - 0.42) / 0.58));

    liveBoot.style.setProperty("--glow-y", `${g.y}%`);
    liveBoot.style.setProperty("--glow-x", "50%");
    liveBoot.style.setProperty(
      "--glow",
      `rgba(${g.color[0]}, ${g.color[1]}, ${g.color[2]}, ${g.alpha})`
    );
    if (liveBg) {
      liveBg.style.background = `linear-gradient(180deg, rgb(${top[0]} ${top[1]} ${top[2]}) 0%, rgb(${bot[0]} ${bot[1]} ${bot[2]}) 100%)`;
    }
    if (liveWash) {
      liveWash.style.opacity = String(Math.max(0, 1 - t * 1.05) * 0.92);
      liveWash.style.background = `linear-gradient(180deg, rgba(${g.washTop[0]}, ${g.washTop[1]}, ${g.washTop[2]}, 0.32) 0%, rgba(${g.washBot[0]}, ${g.washBot[1]}, ${g.washBot[2]}, 0.32) 100%)`;
    }
    if (liveGlow) liveGlow.style.opacity = "1";
  }

  function markSize() {
    return Math.round(
      Math.min(96, Math.max(72, Math.min(window.innerWidth, window.innerHeight) * 0.09))
    );
  }

  function putMark(x, y, size, rot) {
    const liveX = document.querySelector(".boot-x");
    if (!liveX) return;
    liveX.classList.add("is-live");
    liveX.style.left = "0px";
    liveX.style.top = "0px";
    liveX.style.width = `${size}px`;
    liveX.style.height = `${size}px`;
    liveX.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
  }

  async function play() {
    const size = markSize();
    const cx = () => (window.innerWidth - size) / 2;
    const cy = () => (window.innerHeight - size) / 2;

    putMark(cx(), cy(), size, 0);
    paintGlow(0);

    await run(beat(2000), easeInOutCubic, (e) => {
      putMark(cx(), cy(), size, e * 360);
      paintGlow(e * 0.36);
    });

    await run(beat(1600), easeInOutCubic, (e) => {
      putMark(cx(), cy(), size, 360 + e * 360);
      paintGlow(0.36 + e * 0.16);
    });

    const mark = document.querySelector(".logo .mark-x");
    if (!mark) {
      finish();
      return;
    }
    const to = mark.getBoundingClientRect();
    const fromX = cx();
    const fromY = cy();

    html.classList.add("is-docking");

    await run(beat(1600), easeInOutCubic, (e) => {
      putMark(
        lerp(fromX, to.left, e),
        lerp(fromY, to.top, e),
        lerp(size, to.width, e),
        720 + e * 360
      );
      paintGlow(0.52 + e * 0.48);
    });

    html.classList.add("is-letters");
    await wait(beat(920));

    html.classList.add("is-nav");
    await wait(beat(1100));

    html.classList.add("is-hero");
    document.dispatchEvent(new Event("xerv:arriving"));
    await wait(beat(980));

    html.classList.add("is-end");
    await wait(beat(900));

    finish();
  }

  requestAnimationFrame(() => requestAnimationFrame(play));
  return "done";
}
