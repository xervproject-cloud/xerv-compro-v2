// @ts-nocheck
import Lenis from "lenis";

type NavigateFn = (href: string) => void;

export function initSiteEffects(navigate: NavigateFn): () => void {
  const disposers: Array<() => void> = [];
  const on = (target: EventTarget | null, type: string, handler: EventListener, opts?: AddEventListenerOptions) => {
    if (!target) return;
    target.addEventListener(type, handler, opts);
    disposers.push(() => target.removeEventListener(type, handler, opts));
  };

/* ============================================================
   XERV Project — interaction layer

   1 · tone ramp   a single gradient anchored to document space,
                   sampled per frame — the page slides through it
                   instead of switching palettes at section edges
   2 · scroll spy  for the anchors nested under "Home"
   3 · parallax    hero scroll-out, heading lag, project stills
   4 · reveals     word-level blur entrances
   5 · reel        Also delivered: the pointer becomes project footage.
                   Selected work cycles those stills on the stage.
   ============================================================ */

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* ============================================================
   0 · INTRO
   Medium glassy X spins in place (Figma: size does not change),
   takes one more turn while the wash is still held high, then
   docks into the wordmark with a last spin that lands upright.
   ============================================================ */

/* boot intro lives in boot-intro.ts */


/* ── colour helpers ─────────────────────────────────────────── */
function parseHex(hex) {
  const v = hex.trim().replace('#', '');
  const n = parseInt(v.length === 3 ? v.replace(/./g, '$&$&') : v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function css(rgb) {
  return `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;
}

function luminance(rgb) {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function clamp01(n) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/* Where the ink turns over, from the luminance behind it.

   The turn is a mix from light to dark, which means it passes through
   mid grey — and mid grey against a mid background is the one pairing
   that cannot be read at all. Running the curve through itself leaves
   both ends exactly where they were and crosses that middle in about
   half the distance, so the unreadable moment is over before it can
   be noticed. */
function inkFlip(l) {
  const t = smoothstep(0.3, 0.46, l);
  return t * t * (3 - 2 * t);
}

/* ── write only what actually changed ───────────────────────────
   Everything below runs on every animated frame, and most of it is
   asking for a value it already set. A custom property written to
   the root invalidates style for the whole document — and this page
   wraps every word and several hundred characters in their own span
   — so a redundant write is not free. */
const written = new WeakMap();

function put(el, prop, value) {
  let seen = written.get(el);
  if (!seen) {
    seen = new Map();
    written.set(el, seen);
  }
  if (seen.get(prop) === value) return;
  seen.set(prop, value);

  if (prop.charCodeAt(0) === 45) el.style.setProperty(prop, value);
  else el.style[prop] = value;
}

/* ============================================================
   1 · TONE RAMP
   Each section declares the colour its content should sit on.
   Stops are pinned to the first and last *visible leaf* inside
   the section, so the space between two sections becomes the
   runway the gradient travels along. Nothing ever snaps.
   ============================================================ */
const LIGHT_INK = [244, 243, 241];
const DARK_INK = [11, 11, 13];

const toneSections = Array.from(document.querySelectorAll('[data-tone-start]'));
const caseStudyPage = !!document.querySelector('.cs-hero');
const compactTone = window.matchMedia('(max-width: 767px)');
const CASE_MOBILE_PAPER = [36, 26, 94];
let stops = [];

function mobileCaseTone() {
  return caseStudyPage && compactTone.matches;
}

function clampCaseTone(rgb) {
  if (!mobileCaseTone() || !rgb) return rgb;
  return luminance(rgb) > 0.2 ? CASE_MOBILE_PAPER : rgb;
}

function deepEdge(root_, takeLast) {
  let el = root_;
  for (let depth = 0; depth < 8; depth += 1) {
    const kids = Array.from(el.children).filter((kid) => kid.getClientRects().length > 0);
    if (!kids.length) break;
    el = takeLast ? kids[kids.length - 1] : kids[0];
  }
  return el;
}

function measureStops() {
  const offset = window.scrollY;
  const vh = window.innerHeight;

  /* Where every region begins and ends, before any colour is placed:
     a waypoint has to know how far it is to the *next* region's first
     line, and that is not known until the whole page is measured. */
  const regions = toneSections.map((section) => {
    /* Regions that pin their contents have to be measured by their own
       box: a stuck child's rect reports where it is parked, not where
       it belongs in the document. */
    const box = section.hasAttribute('data-tone-box');
    const headEl = box ? section : deepEdge(section, false);
    const footEl = box ? section : deepEdge(section, true);

    return {
      section,
      from: clampCaseTone(parseHex(section.dataset.toneStart)),
      to: clampCaseTone(parseHex(section.dataset.toneEnd || section.dataset.toneStart)),
      head: headEl.getBoundingClientRect().top + offset,
      foot: footEl.getBoundingClientRect().bottom + offset,
    };
  });

  stops = [];
  let carried = null;

  regions.forEach((region, i) => {
    /* data-tone-lead pins the previous colour until N viewports
       before this region, so a long stretch of scrolling can hold
       its tone and then turn over quickly and deliberately. */
    const lead = parseFloat(region.section.dataset.toneLead || '0');
    if (lead > 0 && carried) stops.push({ y: region.head - lead * vh, color: carried });

    stops.push({ y: region.head, color: region.from });
    stops.push({ y: Math.max(region.foot, region.head + 1), color: region.to });
    carried = region.to;

    /* data-tone-via bends the runway out to the next region. Left to
       itself a ramp takes the straight line between two colours, and
       the straight line from a deep violet to white runs through grey
       — the further apart they are, the more washed out the middle
       of the journey looks. Waypoints hold the hue up across it.
       Written as `#hex@fraction` along the gap. */
    const via = region.section.dataset.toneVia;
    const next = regions[i + 1];
    if (!via || !next) return;

    const span = next.head - region.foot;
    if (span <= 0) return;

    for (const step of via.split(',')) {
      const [hex, at] = step.split('@');
      stops.push({
        y: region.foot + span * clamp01(parseFloat(at)),
        color: clampCaseTone(parseHex(hex)),
      });
    }
  });

  stops.sort((a, b) => a.y - b.y);
}

function toneAt(y) {
  if (!stops.length) return parseHex('#0a0718');
  if (y <= stops[0].y) return clampCaseTone(stops[0].color);

  for (let i = 1; i < stops.length; i += 1) {
    if (y <= stops[i].y) {
      const a = stops[i - 1];
      const b = stops[i];
      const span = b.y - a.y;
      const mixed = span <= 0 ? b.color : mix(a.color, b.color, clamp01((y - a.y) / span));
      return clampCaseTone(mixed);
    }
  }

  return clampCaseTone(stops[stops.length - 1].color);
}

/* ── ink, row by row, down the sidebar ──────────────────────────
   The sidebar is a full-height column pinned to the window, so where
   the ramp turns hard its head can be sitting on violet while its
   foot is already on paper. One ink cannot serve both ends: measured
   through the turn out of "Also delivered", the logo came out dark on
   violet at 1.3:1, which is no contrast at all.

   Each row therefore reads the backdrop at its own height instead of
   the page's. Only while the column is pinned, though — once it
   scrolls with everything else its position is no longer fixed and
   the page's own ink is the right answer again. */
const wideLayout = window.matchMedia('(min-width: 1024px)');
const inkRows = Array.from(document.querySelectorAll('.sidebar-top, .nav-link, .subnav li'));

let zones = [];

function measureZones() {
  if (!wideLayout.matches) {
    for (const el of inkRows) {
      put(el, '--fg', '');
      put(el, '--muted', '');
      put(el, '--faint', '');
    }
    zones = [];
    return;
  }

  const vh = window.innerHeight;
  zones = inkRows.map((el) => {
    const box = el.getBoundingClientRect();
    return { el, at: clamp01((box.top + box.height / 2) / vh) };
  });
}

/* Nine samples rather than a handful: a fast turn in the ramp reads
   as a kink if the gradient is described too coarsely. */
const SAMPLES = 9;

const contactEl = document.getElementById('contact');

function paintContactWash() {
  if (!contactEl) {
    put(root, '--contact-wash', '0');
    if (root.classList.contains('is-contact-wash')) root.classList.remove('is-contact-wash');
    return;
  }

  const vh = window.innerHeight;
  const top = contactEl.getBoundingClientRect().top;
  const start = vh * 0.9;
  const end = Math.max(72, vh * 0.2);
  const t = clamp01((start - top) / (start - end));
  put(root, '--contact-wash', t.toFixed(3));

  const on = t > 0.03;
  if (root.classList.contains('is-contact-wash') !== on) {
    root.classList.toggle('is-contact-wash', on);
  }
}

function paintTone() {
  const top = window.scrollY;
  const vh = window.innerHeight;

  const parts = [];
  let centre = null;

  for (let i = 0; i < SAMPLES; i += 1) {
    const k = i / (SAMPLES - 1);
    const rgb = toneAt(top + vh * k);
    parts.push(`${css(rgb)} ${(k * 100).toFixed(2)}%`);
    if (i === (SAMPLES - 1) / 2) centre = rgb;
  }

  /* Published as a variable so anything that must be opaque can paint
     the identical ramp instead of approximating it with one flat
     colour and seaming against it. Held steady through a section, it
     writes nothing at all. */
  put(root, '--ramp', `linear-gradient(180deg, ${parts.join(', ')})`);

  /* Text colour follows the backdrop's luminance. The crossover
     band is narrow and every ramp is shaped so it lands in the
     empty space between two sections. The stage is the exception:
     it covers the page without recolouring it, so it pulls the ink
     light by however much of the window it has taken. */
  const veil = stageCover(top);
  const inkAt = compactTone.matches ? 0.18 : 0.5;
  const t = mobileCaseTone()
    ? 0
    : inkFlip(luminance(toneAt(top + vh * inkAt))) * (1 - veil);
  const ink = mix(LIGHT_INK, DARK_INK, t);

  put(root, '--bg', css(centre));
  put(root, '--fg', css(ink));
  put(root, '--muted', `rgb(${ink[0]} ${ink[1]} ${ink[2]} / 0.64)`);
  put(root, '--faint', `rgb(${ink[0]} ${ink[1]} ${ink[2]} / 0.42)`);
  put(root, '--grain-op', (0.035 + t * 0.02).toFixed(3));

  paintContactWash();

  for (const zone of zones) {
    const local = inkFlip(luminance(toneAt(top + vh * zone.at))) * (1 - veil);
    const shade = mix(LIGHT_INK, DARK_INK, local);

    put(zone.el, '--fg', css(shade));
    put(zone.el, '--muted', `rgb(${shade[0]} ${shade[1]} ${shade[2]} / 0.64)`);
    put(zone.el, '--faint', `rgb(${shade[0]} ${shade[1]} ${shade[2]} / 0.42)`);
  }
}

/* ============================================================
   2 · SCROLL SPY
   Section tops are measured once and compared as numbers. Reading
   them back from the DOM mid-frame would force a layout on every
   frame of every scroll, between the writes either side of it.
   ============================================================ */
const spyPairs = Array.from(document.querySelectorAll('.subnav-link'))
  .map((link) => ({ link, target: document.getElementById(link.dataset.scrollspy || ''), top: 0 }))
  .filter((pair) => pair.target);

function measureSpy() {
  const offset = window.scrollY;
  for (const pair of spyPairs) {
    pair.top = pair.target.getBoundingClientRect().top + offset;
  }
}

function paintSpy(y) {
  if (!spyPairs.length) return;

  const line = y + window.innerHeight * 0.42;
  let current = spyPairs[0];

  for (const pair of spyPairs) {
    if (pair.top <= line) current = pair;
  }

  for (const pair of spyPairs) {
    pair.link.classList.toggle('is-active', pair === current);
  }
}

/* ============================================================
   3 · PARALLAX
   Depth comes from two places: the hero drifting out of focus
   as it leaves, and each project still sliding inside the frame
   that reveals it. Section titles stay locked to their copy.
   ============================================================ */
const motionOK = !reduceMotion.matches;

const heroDisplay = document.querySelector('.section-intro .display');
const heroBody = document.querySelector('.section-intro .intro-body');

/* ── the stage ───────────────────────────────────────────────────
   The frame is pinned, so scrolling swaps its contents rather than
   moving it. Scroll picks the slide; the exchange itself is played
   on a timeline, because a per-letter cascade needs its own clock. */
const track = document.querySelector('.stage-track');
const stage = document.querySelector('.stage');
const media = document.querySelector('.stage-media');
const shots = Array.from(document.querySelectorAll('.stage-shot'));
const ruleFill = document.querySelector('.stage-rule i');
const slides = Array.from(document.querySelectorAll('.slide'));
const stageCopy = document.querySelector('.stage-copy');

function fillShotFrames() {
  slides.forEach((slide, i) => {
    const shot = shots[i];
    if (!shot) return;
    const srcs = (slide.dataset.images || '')
      .split(',')
      .map((src) => src.trim())
      .filter(Boolean);
    if (!srcs.length) return;
    shot.style.backgroundImage = 'none';
    shot.replaceChildren(
      ...srcs.map((src, n) => {
        const frame = document.createElement('span');
        frame.className = n === 0 ? 'stage-frame is-active' : 'stage-frame';
        frame.style.backgroundImage = `url("${src}")`;
        return frame;
      })
    );
  });
}

fillShotFrames();

const stageLive = motionOK && track && stage && media && ruleFill && slides.length > 0;
const exitTimers = new WeakMap();
const slideListeners = new Set();

let stageTop = 0;
let stageRun = 1;
let active = -1;

function splitChars(node) {
  for (const kid of Array.from(node.childNodes)) {
    if (kid.nodeType === Node.ELEMENT_NODE) {
      splitChars(kid);
      continue;
    }

    if (kid.nodeType !== Node.TEXT_NODE || !kid.textContent.trim()) continue;

    const frag = document.createDocumentFragment();

    for (const chunk of kid.textContent.split(/(\s+)/)) {
      if (!chunk) continue;

      if (!chunk.trim()) {
        frag.appendChild(document.createTextNode(chunk));
        continue;
      }

      const word = document.createElement('span');
      word.className = 'cw';

      for (const character of Array.from(chunk)) {
        const cell = document.createElement('span');
        cell.className = 'c';
        cell.textContent = character;
        word.appendChild(cell);
      }

      frag.appendChild(word);
    }

    node.replaceChild(frag, kid);
  }
}

if (stageLive) {
  for (const slide of slides) {
    const name = slide.querySelector('.slide-name');
    if (!name) continue;

    splitChars(name);

    /* A touch of jitter on the stagger keeps the cascade from reading
       as a metronome. */
    Array.from(name.querySelectorAll('.c')).forEach((cell, i) => {
      cell.style.setProperty('--ci', (i + Math.random() * 1.8).toFixed(2));
    });
  }
}

function setActive(next) {
  if (next === active) return;

  const leaving = slides[active];
  active = next;

  shots.forEach((shot, i) => shot.classList.toggle('is-live', i === active));

  if (leaving) {
    leaving.classList.remove('is-live');
    leaving.classList.add('is-out');
    window.clearTimeout(exitTimers.get(leaving));
    exitTimers.set(
      leaving,
      window.setTimeout(() => leaving.classList.remove('is-out'), 900)
    );
  }

  /* -1 parks the run: everything steps back so the next arrival is a
     first arrival again. */
  const arriving = slides[active];
  if (arriving) {
    window.clearTimeout(exitTimers.get(arriving));
    arriving.classList.remove('is-out');
    arriving.classList.add('is-live');
  }

  for (const listener of slideListeners) listener(active);
}

const SHOT_FRAME_MS = 750;
let shotTicker = null;

function cycleLiveShot(index) {
  window.clearInterval(shotTicker);
  shotTicker = null;
  shots.forEach((shot, n) => {
    if (n === index) return;
    shot.querySelectorAll('.stage-frame').forEach((frame, i) => {
      frame.classList.toggle('is-active', i === 0);
    });
  });
  if (reduceMotion.matches || index < 0) return;
  const frames = shots[index] ? shots[index].querySelectorAll('.stage-frame') : [];
  if (frames.length < 2) return;
  let i = 0;
  frames.forEach((frame, n) => {
    if (frame.classList.contains('is-active')) i = n;
  });
  shotTicker = window.setInterval(() => {
    frames[i].classList.remove('is-active');
    i = (i + 1) % frames.length;
    frames[i].classList.add('is-active');
  }, SHOT_FRAME_MS);
}

slideListeners.add(cycleLiveShot);

/* How much of the window the frame is currently covering. The page
   keeps its own light straight through the run, so this is what tells
   the ink to turn: the sidebar sits on the photograph long before the
   page beneath it has any reason to change colour. */
function stageCover(y) {
  if (!stageLive) return 0;

  const vh = window.innerHeight;
  const rising = clamp01((y - (stageTop - vh)) / vh);
  const leaving = clamp01((y - (stageTop + stageRun)) / vh);

  return smoothstep(0.25, 0.95, rising) * (1 - smoothstep(0.05, 0.75, leaving));
}

function measureStage() {
  if (!track || !stageCopy) return;

  stageTop = track.getBoundingClientRect().top + window.scrollY;
  stageRun = Math.max(1, track.offsetHeight - window.innerHeight);

  /* The slides overlap, so the container has to reserve room for the
     tallest one or the section would collapse around the shortest. */
  let tallest = 0;
  for (const slide of slides) tallest = Math.max(tallest, slide.scrollHeight);
  if (tallest) stageCopy.style.minHeight = `${tallest}px`;
}

function measureParallax() {
  measureStage();
}

function paintParallax(y) {
  if (!motionOK) return;

  const vh = window.innerHeight;

  if (heroDisplay) {
    const gone = clamp01(y / (vh * 0.8));
    put(heroDisplay, '--py', `${(-gone * 72).toFixed(1)}px`);
    put(heroDisplay, '--sb', `${(gone * 14).toFixed(2)}px`);
    put(heroDisplay, '--so', (1 - gone).toFixed(3));
    if (heroBody) put(heroBody, '--py', `${(-gone * 34).toFixed(1)}px`);
  }

  if (!stageLive) return;

  const progress = clamp01((y - stageTop) / stageRun);
  put(ruleFill, 'transform', `scaleX(${progress.toFixed(4)})`);
  put(ruleFill, '--p', progress.toFixed(4));

  /* The frame is held against the top of the window for its whole
     life, including the stretch before and after it would normally
     be pinned. It never slides past an edge — it dissolves in over
     the page and dissolves back off it, which is why there is no
     seam to soften. Opacity follows the real scroll rather than the
     damped copy so the ink can flip in step with it. */
  const real = window.scrollY;
  const rising = clamp01((real - (stageTop - vh)) / vh);
  const leaving = clamp01((real - (stageTop + stageRun)) / vh);
  const veil = stageCover(real);

  /* The hold is released the moment nothing is showing, so the frame
     goes back to its own position instead of trailing the page as an
     invisible sheet over whatever comes next. */
  const held = veil <= 0.001 ? 0 : leaving > 0 ? leaving * vh : -(1 - rising) * vh;

  put(stage, 'transform', `translate3d(0, ${held.toFixed(1)}px, 0)`);
  put(stage, 'opacity', veil.toFixed(3));
  stage.classList.toggle('is-passive', veil < 0.98);

  /* The first project waits for the frame to actually be arriving
     before it plays. At rest this runs on load, and letters that
     resolve behind a transparent frame have spent their entrance on
     nobody. Parked again on the way out, so coming back plays it
     afresh — the same as every other reveal on the page. */
  setActive(veil < 0.12 ? -1 : Math.min(slides.length - 1, Math.floor(progress * slides.length)));

  /* Each still travels through its own frame rather than the stack
     travelling as one. As one, the drift was measured from whichever
     slide was current, so it had to snap back to the start at every
     handover. Measured from its own life a still simply keeps going,
     and hands over to the next while both are still mid-travel. The
     copy continues to change on its own clock: that mix — a
     background answering the scroll under type that does not — is
     what gives the exchange somewhere to happen. */
  const span = progress * slides.length;

  for (let i = 0; i < shots.length; i += 1) {
    const u = span - i;

    /* Long faded, or not yet begun: left alone, and not left holding
       a compositor layer either. */
    if (u < -0.4 || u > 1.6) {
      put(shots[i], 'transform', '');
      put(shots[i], 'will-change', '');
      continue;
    }

    /* Held inside the frame's own margin at both ends, so a still
       that overruns its life can never show its edge. */
    const t = Math.min(1.35, Math.max(-0.35, u));

    put(shots[i], 'will-change', 'transform');
    put(
      shots[i],
      'transform',
      `translate3d(0, ${(6 - t * 12).toFixed(2)}%, 0) scale(${(1.06 - t * 0.04).toFixed(4)})`
    );
  }
}

/* ============================================================
   SMOOTH SCROLL
   The wheel no longer moves the page directly. It sets a target and
   the view travels there over 1.3s on an exponential ease-out — a
   long glide that starts fast and settles slowly, which is what
   gives the whole page its weight. Lenis animates the real scroll
   position rather than transforming a wrapper, so `position: sticky`,
   `scrollY` and the pinned stage all keep working untouched.

   Desktop only, and never against someone's stated preference: a
   trackpad or wheel has inertia to borrow, a touchscreen already has
   its own and resents having it replaced.
   ============================================================ */
const smoothOK = motionOK && window.innerWidth > 991;

const lenis = smoothOK
  ? new Lenis({
      duration: 1.3,
      easing: (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t)),
      orientation: 'vertical',
      /* Driven from the page's own loop below, so there is one frame
         clock rather than two competing for the same frame. */
      autoRaf: false,
      stopInertiaOnNavigate: true,
    })
  : null;

if (lenis) {
  /* Anchors have to be intercepted rather than left to the browser:
     smooth scrolling is off at the CSS level while Lenis is running,
     so an untouched hash link would hard-cut to its target. */
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;

    const link = event.target.closest('a[href^="#"]');
    const id = link && link.hash ? decodeURIComponent(link.hash.slice(1)) : '';
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    event.preventDefault();
    /* Selected work is a pinned stage. Landing on the section top
       still leaves the frame dissolving over empty page; a small
       extra drop puts the first project fully in the window. */
    const extra = id === 'work' ? Math.round(window.innerHeight * 0.12) : 0;
    lenis.scrollTo(target, { offset: extra });
    window.history.replaceState(null, '', link.hash);
  });
}

/* ============================================================
   MASTER LOOP
   Tone and the scroll spy track the scroll position itself so the
   gradient stays locked to the document. Parallax reads a damped
   copy, one step further behind: the stills keep travelling for a
   moment after the page has settled. That trail is kept short while
   Lenis is running, because the glide is already doing the work and
   lag on top of lag only reads as slack.
   ============================================================ */
const DAMPING = lenis ? 0.28 : 0.09;
const frameTasks = [];

let smoothY = window.scrollY;
let lastY = -1;
let lastSmooth = -1;

function remeasure() {
  measureStops();
  measureZones();
  measureParallax();
  measureSpy();
}

compactTone.addEventListener('change', remeasure);

let rafId = 0;
let dead = false;
function tick(time) {
  if (dead) return;
  /* Before anything reads the position, so every paint in this frame
     sees where the page actually is now. */
  if (lenis) lenis.raf(time);

  const y = window.scrollY;

  if (motionOK) {
    smoothY += (y - smoothY) * DAMPING;
    if (Math.abs(y - smoothY) < 0.08) smoothY = y;
  } else {
    smoothY = y;
  }

  if (y !== lastY) {
    lastY = y;
    paintTone();
    paintSpy(y);
  } else {
    paintContactWash();
  }

  if (smoothY !== lastSmooth) {
    lastSmooth = smoothY;
    paintParallax(smoothY);
  }

  for (const task of frameTasks) task();

  rafId = requestAnimationFrame(tick);
}

window.addEventListener('resize', () => {
  remeasure();
  lastY = -1;
});

remeasure();
paintTone();
paintSpy(window.scrollY);
paintParallax(smoothY);
requestAnimationFrame(tick);

if (lenis && document.documentElement.classList.contains('is-booting')) {
  lenis.stop();
  document.addEventListener(
    'xerv:booted',
    () => {
      lenis.start();
      remeasure();
    },
    { once: true }
  );
}

/* Section heights settle once webfonts and images land. */
window.addEventListener('load', () => {
  remeasure();
  lastY = -1;
});

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    remeasure();
    lastY = -1;
  });
}

/* ============================================================
   4 · REVEALS
   Headlines and body copy are split into words and brought in out
   of focus, one word behind the last. Everything else fades up.
   Whatever arrives together is ordered the way it would be read:
   down the page first, then across it.
   ============================================================ */
const WORDED = '.display, .title, .lead, .note-copy';
const FADED = [
  '.eyebrow',
  '.principles li',
  '.disciplines li',
  '.note-key',
  '.values li',
  '.rest-list li',
  '.contact-head',
  '.foot',
].join(',');

/* No block should take longer than this to finish its cascade, so
   a long paragraph simply steps faster than a short heading. */
const CASCADE_MS = 300;
const GROUP_STEP_MS = 45;
const GROUP_CAP = 6;

function wrapWords(node, counter) {
  for (const kid of Array.from(node.childNodes)) {
    if (kid.nodeType === Node.TEXT_NODE) {
      if (!kid.textContent.trim()) continue;

      const frag = document.createDocumentFragment();

      for (const part of kid.textContent.split(/(\s+)/)) {
        if (!part) continue;

        if (!part.trim()) {
          frag.appendChild(document.createTextNode(part));
          continue;
        }

        const word = document.createElement('span');
        word.className = 'w';
        word.style.setProperty('--i', String(counter.n));
        word.textContent = part;
        frag.appendChild(word);
        counter.n += 1;
      }

      node.replaceChild(frag, kid);
    } else if (kid.nodeType === Node.ELEMENT_NODE) {
      wrapWords(kid, counter);
    }
  }
}

const worded = Array.from(document.querySelectorAll(WORDED));

if ('IntersectionObserver' in window && !reduceMotion.matches) {
  for (const el of worded) {
    const counter = { n: 0 };
    wrapWords(el, counter);
    const step = Math.max(5, Math.min(22, Math.round(CASCADE_MS / Math.max(1, counter.n))));
    el.style.setProperty('--step', `${step}ms`);
  }

  const faded = Array.from(document.querySelectorAll(FADED));
  for (const el of faded) el.classList.add('fade');

  const revealer = new IntersectionObserver(
    (entries) => {
      const arrived = entries.filter((entry) => entry.isIntersecting);
      if (!arrived.length) return;

      /* Reading order. Tops are bucketed before they are compared so
         that items sharing a row — columns, a grid of cards — are
         ordered left to right rather than by a stray pixel. */
      arrived.sort((a, b) => {
        const rowA = Math.round(a.boundingClientRect.top / 28);
        const rowB = Math.round(b.boundingClientRect.top / 28);
        return rowA - rowB || a.boundingClientRect.left - b.boundingClientRect.left;
      });

      arrived.forEach((entry, i) => {
        const el = entry.target;
        const extra = 0;
        const delay = extra + Math.min(i, GROUP_CAP) * GROUP_STEP_MS;

        el.style.setProperty('--d', `${delay}ms`);
        el.classList.add('reveal');
        revealer.unobserve(el);

        if (el.classList.contains('fade')) {
          window.setTimeout(() => el.classList.add('settled'), 700 + delay);
        }
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.15 }
  );

  const watch = () => {
    for (const el of [...worded, ...faded]) revealer.observe(el);
  };

  if (document.documentElement.classList.contains('is-booting')) {
    document.addEventListener('xerv:arriving', watch, { once: true });
  } else {
    watch();
  }
} else {
  for (const el of document.querySelectorAll(`${WORDED},${FADED}`)) {
    el.classList.add('reveal');
  }
}

/* ============================================================
   6 · PROJECT BRIDGE
   Hover warms the case-study HTML (one page, not the whole
   index). Click carries the still you are looking at into the
   next page so the change reads as the same frame, not a cut.
   ============================================================ */
const warmed = new Set();
const BRIDGE_KEY = 'xerv-bridge';

const BRIDGE_POS = 'center 28%';
const BRIDGE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const LEAVE_FADE_MS = 420;
const LEAVE_GROW_MS = 680;
const ARRIVE_MS = 1080;
const CHROME_IN_MS = 460;
const SWAP_MS = 280;

function stillSrc(el) {
  if (!el) return '';
  if (el.tagName === 'IMG') return el.currentSrc || el.src;
  const bg = getComputedStyle(el).backgroundImage;
  const match = /url\((['"]?)(.*?)\1\)/.exec(bg);
  return match ? match[2] : '';
}

function warm(href) {
  if (!href || warmed.has(href)) return;
  warmed.add(href);
  fetch(href, { credentials: 'same-origin' }).catch(() => {});
}

function placeLayer(layer, box, radius) {
  layer.style.top = `${box.top}px`;
  layer.style.left = `${box.left}px`;
  layer.style.width = `${box.width}px`;
  layer.style.height = `${box.height}px`;
  if (radius) layer.style.borderRadius = radius;
}

function readBox(el) {
  const box = el.getBoundingClientRect();
  return {
    top: box.top,
    left: box.left,
    width: box.width,
    height: box.height,
    radius: getComputedStyle(el).borderRadius || '0px',
  };
}

function writeBridge(src, box) {
  try {
    sessionStorage.setItem(BRIDGE_KEY, JSON.stringify({ src, box, pos: BRIDGE_POS }));
  } catch (err) {
    /* navigation still proceeds from the caller */
  }
}

function paintLayer(layer, src) {
  layer.style.backgroundImage = `url("${src}")`;
  layer.style.backgroundPosition = BRIDGE_POS;
  layer.style.backgroundSize = 'cover';
  layer.style.transformOrigin = '0 0';
}

function holdLayer(src, box) {
  const layer = document.createElement('div');
  layer.id = 'bridge-layer';
  layer.className = 'bridge-layer';
  paintLayer(layer, src);
  placeLayer(layer, box, box.radius);
  document.documentElement.appendChild(layer);
  return layer;
}

/* FLIP: dest geometry is applied immediately, the visual starts at
   `from` via transform, then eases to identity. Layout properties
   stay still so the compositor only has to move a texture. */
function morphLayer(layer, from, to, ms) {
  const tw = Math.max(1, to.width);
  const th = Math.max(1, to.height);
  const sx = Math.max(0.001, from.width / tw);
  const sy = Math.max(0.001, from.height / th);
  const dx = from.left - to.left;
  const dy = from.top - to.top;
  const fromR = parseFloat(from.radius) || 0;

  layer.style.transition = 'none';
  layer.style.willChange = 'transform, border-radius';
  placeLayer(layer, to, `${fromR / sx}px / ${fromR / sy}px`);
  layer.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`;
  void layer.offsetWidth;
  layer.style.transition = `transform ${ms}ms ${BRIDGE_EASE}, border-radius ${ms}ms ${BRIDGE_EASE}`;
  layer.style.transform = 'translate3d(0, 0, 0) scale(1)';
  layer.style.borderRadius = to.radius || '1.25rem';
}

function guessHeroBox() {
  const main = document.querySelector('.main');
  const section = document.querySelector('.section');
  const root = getComputedStyle(document.documentElement);
  const fs = parseFloat(root.fontSize) || 16;
  const gut = section ? parseFloat(getComputedStyle(section).paddingLeft) : 2 * fs;
  const frame = 1.75 * fs;
  const rect = main
    ? main.getBoundingClientRect()
    : { left: 24, width: window.innerWidth - 48 };
  const width = Math.max(240, rect.width - gut - frame);
  const height = width * (10 / 16);
  const left = rect.left + gut;
  const vh = window.innerHeight;
  const top = Math.min(vh * 0.14, 11 * fs) + Math.min(vh * 0.34, 20 * fs);
  return { top, left, width, height, radius: '1.25rem' };
}

function stillFromRow(row) {
  const shot = row.querySelector('.rest-shot');
  const cover = stillSrc(shot) || stillSrc(row);
  const reel = document.querySelector('.reel');
  const frame = reel && reel.querySelector('.reel-frame');
  const active = frame && frame.querySelector('img.is-active');
  const shown = reel && parseFloat(getComputedStyle(reel).opacity) > 0.18;
  const live = shown && stillSrc(active);
  return {
    el: shown && frame ? frame : shot || row,
    src: live || cover,
  };
}

function coverThenGo(href, still, srcOverride) {
  const src = srcOverride || stillSrc(still);
  const box = still ? readBox(still) : null;

  writeBridge(src, box);

  if (!src || !box || box.width < 2 || box.height < 2) {
    navigate(href);
    return;
  }

  const layer = holdLayer(src, box);
  const html = document.documentElement;
  html.classList.add('is-leaving');

  const reel = document.querySelector('.reel');
  if (reel) reel.style.opacity = '0';
  if (lenis) lenis.stop();

  const grow = box.width < window.innerWidth * 0.42;
  const leaveMs = grow ? LEAVE_GROW_MS : LEAVE_FADE_MS;

  if (grow) {
    requestAnimationFrame(() => {
      const dest = guessHeroBox();
      writeBridge(src, dest);
      morphLayer(layer, box, dest, leaveMs);
    });
  }

  let gone = false;
  const go = () => {
    if (gone) return;
    gone = true;
    navigate(href);
  };

  const primed = Promise.all([
    fetch(href, { credentials: 'same-origin' }).catch(() => null),
    new Promise((resolve) => {
      const img = new Image();
      img.onload = img.onerror = resolve;
      img.src = src;
    }),
    new Promise((resolve) => window.setTimeout(resolve, leaveMs)),
  ]);

  primed.then(go);
  window.setTimeout(go, 1600);
}

function openProject(href, still, event, srcOverride) {
  if (!href) return;
  if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
  if (event) event.preventDefault();

  const dest = new URL(href, location.href);
  if (!/^\/works\/[^/]+\/?$/.test(dest.pathname)) {
    navigate(dest.href);
    return;
  }

  warm(href);

  if (reduceMotion.matches || window.matchMedia('(max-width: 767px)').matches) {
    navigate(href);
    return;
  }

  coverThenGo(href, still, srcOverride);
}

(function settleBridge() {
  if (window.matchMedia('(max-width: 767px)').matches) {
    try {
      sessionStorage.removeItem(BRIDGE_KEY);
    } catch (err) {}
    const leftover = document.getElementById('bridge-layer');
    if (leftover) leftover.remove();
    document.documentElement.classList.remove(
      'is-bridging',
      'is-arriving',
      'is-landed',
      'is-bridge-swap'
    );
    return;
  }

  if (!document.documentElement.classList.contains('is-bridging')) return;

  let payload = {};
  try {
    payload = JSON.parse(sessionStorage.getItem(BRIDGE_KEY) || '{}');
    sessionStorage.removeItem(BRIDGE_KEY);
  } catch (err) {
    sessionStorage.removeItem(BRIDGE_KEY);
  }

  window.scrollTo(0, 0);
  if (lenis) {
    lenis.scrollTo(0, { immediate: true });
    lenis.start();
  }

  const html = document.documentElement;
  const hero = document.querySelector('.cs-hero-shot');
  const heroImg = hero && hero.querySelector('img');
  let layer = document.getElementById('bridge-layer');
  let finished = false;

  if (!layer) {
    const src = payload.src || (heroImg && (heroImg.currentSrc || heroImg.src)) || '';
    layer = holdLayer(src, payload.box || { top: 0, left: 0, width: 0, height: 0, radius: '0px' });
  }

  const finish = () => {
    if (finished || !layer) return;
    finished = true;
    html.classList.add('is-bridge-swap');
    window.setTimeout(() => {
      layer.remove();
      html.classList.remove('is-bridging', 'is-arriving', 'is-landed', 'is-bridge-swap');
    }, SWAP_MS);
  };

  const land = () => {
    if (!hero) {
      finish();
      return;
    }

    const from = payload.box || readBox(layer);
    const destRect = hero.getBoundingClientRect();
    const dest = {
      top: destRect.top,
      left: destRect.left,
      width: destRect.width,
      height: destRect.height,
      radius: getComputedStyle(hero).borderRadius || '1.25rem',
    };

    html.classList.remove('is-bridging');
    html.classList.add('is-arriving');

    const dist =
      Math.hypot(from.left - dest.left, from.top - dest.top) + Math.abs(from.width - dest.width);
    const ms = Math.round(Math.min(ARRIVE_MS, Math.max(400, dist * 1.2)));
    const chromeAt = Math.min(CHROME_IN_MS, Math.round(ms * 0.4));

    requestAnimationFrame(() => {
      morphLayer(layer, from, dest, ms);
      window.setTimeout(() => html.classList.add('is-landed'), chromeAt);
      layer.addEventListener(
        'transitionend',
        (event) => {
          if (event.propertyName === 'transform' || event.propertyName === 'border-radius') finish();
        },
        { once: true }
      );
      window.setTimeout(finish, ms + 90);
    });
  };

  const play = () => {
    const fonts =
      document.fonts && document.fonts.ready
        ? Promise.race([document.fonts.ready, new Promise((resolve) => window.setTimeout(resolve, 240))])
        : Promise.resolve();
    fonts.then(() => requestAnimationFrame(() => requestAnimationFrame(land)));
  };

  if (heroImg && !heroImg.complete) {
    heroImg.addEventListener('load', play, { once: true });
    window.setTimeout(play, 400);
  } else {
    play();
  }
})();

/* ============================================================
   5 · THE REEL
   Over the Also delivered rows, the native cursor is replaced by
   that project's footage. Selected work plays the same loop on the
   stage background instead, so the pointer stays a pointer.
   ============================================================ */
const restRows = Array.from(document.querySelectorAll('.rest-list [data-images]'));

if (finePointer.matches && !reduceMotion.matches && restRows.length) {
  const FRAME_MS = 750;

  const reel = document.createElement('div');
  reel.className = 'reel';
  reel.setAttribute('aria-hidden', 'true');
  reel.innerHTML =
    '<span class="reel-label">View case study</span>' + '<div class="reel-frame"></div>';
  document.body.appendChild(reel);

  const frame = reel.querySelector('.reel-frame');

  const label = reel.querySelector('.reel-label');

  /* Warm every still up front so the loop never stutters. */
  const cache = new Map();
  function framesFor(source) {
    if (cache.has(source)) return cache.get(source);

    const list = (source.dataset.images || '')
      .split(',')
      .map((src) => src.trim())
      .filter(Boolean)
      .map((src) => {
        const img = new Image();
        img.src = src;
        img.alt = '';
        img.decoding = 'async';
        return img;
      });

    cache.set(source, list);
    return list;
  }

  for (const source of restRows) framesFor(source);

  let shown = 0;
  let targetShown = 0;
  let held = null;
  let parked = false;
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let toX = x;
  let toY = y;
  let ticker = null;

  function mount(source) {
    const list = source ? framesFor(source) : [];
    if (!list.length) return;

    frame.replaceChildren(...list);
    list.forEach((img, i) => img.classList.toggle('is-active', i === 0));
    if (label) label.textContent = source.dataset.reelLabel || 'View case study';

    let i = 0;
    window.clearInterval(ticker);
    if (list.length > 1) {
      ticker = window.setInterval(() => {
        list[i].classList.remove('is-active');
        i = (i + 1) % list.length;
        list[i].classList.add('is-active');
      }, FRAME_MS);
    }
  }

  function bindReel(target, resolve) {
    target.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse') return;

      held = target;
      x = toX = event.clientX;
      y = toY = event.clientY;
      mount(resolve());
      targetShown = 1;
    });

    target.addEventListener('pointermove', (event) => {
      toX = event.clientX;
      toY = event.clientY;
    });

    target.addEventListener('pointerleave', () => {
      if (held !== target) return;
      held = null;
      targetShown = 0;
    });
  }

  for (const row of restRows) bindReel(row, () => row);

  frameTasks.push(function follow() {
    if (shown < 0.002 && targetShown === 0) {
      if (!parked) {
        parked = true;
        put(reel, 'opacity', '0.000');
        window.clearInterval(ticker);
      }
      return;
    }

    parked = false;

    x += (toX - x) * 0.16;
    y += (toY - y) * 0.16;
    shown += (targetShown - shown) * 0.14;

    put(reel, 'opacity', shown.toFixed(3));
    put(
      reel,
      'transform',
      `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${(
        0.88 + shown * 0.12
      ).toFixed(4)})`
    );
  });
}

for (const btn of document.querySelectorAll('.slide-go')) {
  btn.addEventListener('pointerenter', () => {
    const slide = btn.closest('.slide');
    warm(slide?.dataset.href || btn.getAttribute('href'));
  });
  btn.addEventListener('click', (event) => {
    const slide = btn.closest('.slide');
    const href = slide?.dataset.href || btn.getAttribute('href');
    const idx = slides.indexOf(slide);
    const shot = shots[idx];
    const live = (shot && shot.querySelector('.stage-frame.is-active')) || shot;
    openProject(href, live, event);
  });
}

for (const row of restRows) {
  row.addEventListener('pointerenter', () => warm(row.href));
  row.addEventListener('click', (event) => {
    if (row.classList.contains('is-more')) return;
    const picked = stillFromRow(row);
    openProject(row.href, picked.el, event, picked.src);
  });
}

  document.querySelectorAll('.cs-more-card').forEach((card) => {
  card.addEventListener('pointerenter', () => warm(card.href));
  card.addEventListener('click', (event) => {
    openProject(card.href, card.querySelector('.cs-more-shot') || card, event);
  });
});

/* ============================================================
   6 · MOBILE MENU
   Below 768px the sidebar collapses behind a burger and Start a
   project joins the same list. Wider viewports never take this
   path — the floating pill and open sidebar stay as they are.
   ============================================================ */
(function mobileMenu() {
  const html = document.documentElement;
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav') || document.querySelector('.nav');
  const main = document.querySelector('.main');
  if (!toggle || !nav) return;

  const mq = window.matchMedia('(max-width: 767px)');

  function isOpen() {
    return html.classList.contains('is-menu');
  }

  function close(restore) {
    if (!isOpen()) {
      if (main) main.inert = false;
      return;
    }
    html.classList.remove('is-menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    nav.removeAttribute('data-lenis-prevent');
    if (main) main.inert = false;
    if (typeof lenis !== 'undefined' && lenis) lenis.start();
    if (restore) toggle.focus({ preventScroll: true });
  }

  function open() {
    if (!mq.matches || isOpen()) return;
    html.classList.add('is-menu');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    nav.setAttribute('data-lenis-prevent', '');
    if (main) main.inert = true;
    if (typeof lenis !== 'undefined' && lenis) lenis.stop();
  }

  toggle.addEventListener('click', () => {
    if (isOpen()) close(false);
    else open();
  });

  nav.addEventListener('click', (event) => {
    if (!mq.matches || !event.target.closest('a[href]')) return;
    close(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close(true);
  });

  mq.addEventListener('change', (event) => {
    if (!event.matches) {
      close(false);
      html.classList.remove('is-nav-scrim', 'is-nav-scrim-dark');
    }
  });

  const stage = document.querySelector('.stage');

  function syncScrim() {
    if (!mq.matches) {
      html.classList.remove('is-nav-scrim', 'is-nav-scrim-dark');
      return;
    }
    html.classList.toggle('is-nav-scrim', window.scrollY > 8);
    if (stage) {
      const box = stage.getBoundingClientRect();
      html.classList.toggle('is-nav-scrim-dark', box.top <= 8 && box.bottom > 80);
    } else {
      html.classList.remove('is-nav-scrim-dark');
    }
  }

  syncScrim();
  window.addEventListener('scroll', syncScrim, { passive: true });
})();

/* ============================================================
   7 · PAGE LEAVE
   Collapse the open section list as one height, in parallel
   with the column fade, then paint the next document.
   ============================================================ */
(function pageLeave() {
  const html = document.documentElement;
  const fromNav = sessionStorage.getItem('xerv-nav') === '1';
  if (fromNav) sessionStorage.removeItem('xerv-nav');

  const OPEN_MT = '0.4rem';
  const OPEN_MB = '1.1rem';
  const EASE_IN = 'cubic-bezier(0.4, 0, 0.2, 1)';
  const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

  function currentSubnav() {
    const open = document.querySelector('.nav-item.is-current .subnav');
    return open && open.querySelector('li') ? open : null;
  }

  function measureOpenHeight(el) {
    const probe = el.cloneNode(true);
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = [
      'position:absolute',
      'visibility:hidden',
      'pointer-events:none',
      'height:auto',
      'max-height:none',
      'overflow:visible',
      'opacity:1',
      `margin:${OPEN_MT} 0 ${OPEN_MB}`,
      `width:${el.getBoundingClientRect().width || el.parentElement?.clientWidth || 0}px`,
    ].join(';');
    el.parentElement.appendChild(probe);
    const height = probe.scrollHeight;
    probe.remove();
    return height;
  }

  function runHeight(el, from, to, duration, easing) {
    if (!el.animate) {
      el.style.height = to.height;
      el.style.marginTop = to.marginTop;
      el.style.marginBottom = to.marginBottom;
      el.style.opacity = to.opacity;
      return Promise.resolve();
    }
    el.style.overflow = 'hidden';
    el.style.willChange = 'height, opacity, margin';
    return el
      .animate([from, to], { duration, easing, fill: 'forwards' })
      .finished.catch(() => {})
      .finally(() => {
        el.style.willChange = '';
      });
  }

  function expandSubnav(el) {
    const height = `${measureOpenHeight(el)}px`;
    el.style.height = '0px';
    el.style.marginTop = '0px';
    el.style.marginBottom = '0px';
    el.style.opacity = '0';
    el.style.overflow = 'hidden';
    return runHeight(
      el,
      { height: '0px', marginTop: '0px', marginBottom: '0px', opacity: 0 },
      { height, marginTop: OPEN_MT, marginBottom: OPEN_MB, opacity: 1 },
      420,
      EASE_OUT
    ).then(() => {
      el.style.height = '';
      el.style.marginTop = '';
      el.style.marginBottom = '';
      el.style.opacity = '';
      el.style.overflow = '';
    });
  }

  function collapseSubnav(el) {
    const height = `${el.scrollHeight}px`;
    const styles = getComputedStyle(el);
    return runHeight(
      el,
      {
        height,
        marginTop: styles.marginTop,
        marginBottom: styles.marginBottom,
        opacity: 1,
      },
      { height: '0px', marginTop: '0px', marginBottom: '0px', opacity: 0 },
      380,
      EASE_IN
    );
  }

  function pauseShaders() {
    document.querySelectorAll('[data-paper-shader]').forEach((node) => {
      try {
        node.paperShaderMount?.setSpeed(0);
      } catch {
        /* ignore */
      }
    });
  }

  if (html.classList.contains('is-nav-enter')) {
    if (reduceMotion.matches) {
      html.classList.remove('is-nav-enter');
    } else {
      const open = currentSubnav();
      requestAnimationFrame(() => {
        html.classList.add('is-nav-in');
        const done = open ? expandSubnav(open) : Promise.resolve();
        const finish = () => {
          html.classList.remove('is-nav-enter', 'is-nav-in');
        };
        done.then(finish);
        window.setTimeout(finish, 560);
      });
    }
  }

  function pagePath(href) {
    const url = new URL(href, location.href);
    let path = url.pathname.replace(/\/index\.html$/i, '/');
    if (path.length > 1) path = path.replace(/\/$/, '');
    return path || '/';
  }

  function isModified(event) {
    return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
  }

  let leaving = false;

  function go(href) {
    navigate(href);
  }

  function leaveTo(href, subnav, destItem) {
    if (leaving) return;
    leaving = true;
    try {
      sessionStorage.setItem('xerv-nav', '1');
    } catch (err) {
      go(href);
      return;
    }

    if (reduceMotion.matches) {
      go(href);
      return;
    }

    html.classList.add('is-nav-exit');
    pauseShaders();

    const fromDot = document.querySelector(
      '.nav-item.is-current > .nav-link .nav-dot, .nav-item.is-current > .nav-crumb .nav-dot'
    );
    const toDot = destItem && destItem.querySelector('.nav-dot');
    const collapsing = subnav ? collapseSubnav(subnav) : Promise.resolve();
    const fly =
      fromDot && toDot && fromDot !== toDot
        ? flyNavPip(fromDot, toDot, subnav, collapsing)
        : Promise.resolve();

    const cap = window.setTimeout(() => go(href), 520);
    Promise.all([collapsing, fly]).then(() => {
      window.clearTimeout(cap);
      go(href);
    });
  }

  const nav = document.querySelector('.nav');
  if (!nav) return;

  function ensurePip() {
    let pip = document.querySelector('.nav-pip');
    if (pip) return pip;
    pip = document.createElement('span');
    pip.className = 'nav-pip';
    pip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(pip);
    return pip;
  }

  function dotCenter(el) {
    const box = el.getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  }

  function collapseShift(subnav, fromItem, toItem) {
    if (!subnav || !fromItem || !toItem || fromItem === toItem) return 0;
    const items = [...nav.querySelectorAll('.nav-list > .nav-item')];
    if (items.indexOf(toItem) <= items.indexOf(fromItem)) return 0;
    const styles = getComputedStyle(subnav);
    return subnav.scrollHeight + parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
  }

  function flyNavPip(fromDot, toDot, subnav, until) {
    const fromItem = fromDot.closest('.nav-item');
    const toItem = toDot.closest('.nav-item');
    const start = dotCenter(fromDot);
    const follow = collapseShift(subnav, fromItem, toItem) > 1;
    const hopMs = follow ? 150 : 280;

    const pip = ensurePip();
    const at = (x, y) => `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;

    html.classList.add('is-pip-fly');
    pip.classList.add('is-on');
    pip.style.transform = at(start.x, start.y);

    return new Promise((resolve) => {
      const t0 = performance.now();
      let raf = 0;
      let settled = false;

      const finish = () => {
        if (settled) return;
        settled = true;
        cancelAnimationFrame(raf);
        const dest = dotCenter(toDot);
        pip.style.transform = at(dest.x, dest.y);
        resolve();
      };

      const tick = (now) => {
        if (settled) return;
        const dest = dotCenter(toDot);
        const t = Math.min(1, (now - t0) / hopMs);
        const k = 1 - (1 - t) ** 3;
        pip.style.transform = at(
          start.x + (dest.x - start.x) * k,
          start.y + (dest.y - start.y) * k
        );
        if (t < 1 || follow) {
          raf = requestAnimationFrame(tick);
          return;
        }
        finish();
      };

      raf = requestAnimationFrame(tick);
      if (until && follow) until.then(finish);
    });
  }

  nav.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || !nav.contains(link)) return;
    if (link.classList.contains('subnav-link')) return;
    if (isModified(event) || leaving) return;

    const dest = new URL(link.href, location.href);
    if (dest.origin !== location.origin) return;
    if (pagePath(dest.href) === pagePath(location.href)) return;

    event.preventDefault();
    leaveTo(dest.href, currentSubnav(), link.closest('.nav-item'));
  });

  const logo = document.querySelector('.logo[href]');
  if (logo) {
    logo.addEventListener('click', (event) => {
      if (isModified(event) || leaving) return;
      const dest = new URL(logo.href, location.href);
      if (dest.origin !== location.origin) return;
      if (pagePath(dest.href) === pagePath(location.href)) return;
      event.preventDefault();
      leaveTo(dest.href, currentSubnav(), nav.querySelector('.nav-list > .nav-item'));
    });
  }
})();

/* ============================================================
   8 · DOCK GLOW
   A brand-violet spotlight rides the pointer across the hero
   card. The lerp keeps it from snapping; reduced motion skips it.
   ============================================================ */
(function dockGlow() {
  const card = document.querySelector('.dock-card');
  if (!card || !finePointer.matches || reduceMotion.matches) return;

  let x = 0.5;
  let y = 0.4;
  let tx = 0.5;
  let ty = 0.4;
  let raf = 0;

  function paint() {
    x += (tx - x) * 0.08;
    y += (ty - y) * 0.08;
    card.style.setProperty('--spot-x', `${(x * 100).toFixed(2)}%`);
    card.style.setProperty('--spot-y', `${(y * 100).toFixed(2)}%`);
    if (Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001) {
      raf = requestAnimationFrame(paint);
    } else {
      raf = 0;
    }
  }

  function kick() {
    if (!raf) raf = requestAnimationFrame(paint);
  }

  card.addEventListener('pointerenter', () => {
    card.classList.add('is-lit');
  });

  card.addEventListener('pointermove', (event) => {
    const box = card.getBoundingClientRect();
    const w = box.width || 1;
    const h = box.height || 1;
    tx = Math.min(1, Math.max(0, (event.clientX - box.left) / w));
    ty = Math.min(1, Math.max(0, (event.clientY - box.top) / h));
    kick();
  });

  card.addEventListener('pointerleave', () => {
    card.classList.remove('is-lit');
    tx = 0.5;
    ty = 0.4;
    kick();
  });
})();

/* ============================================================
   9 · WORKS FILTER
   Discipline chips on the index. Empty filters stay honest.
   ============================================================ */
(function worksFilter() {
  const root = document.querySelector('.section-works');
  if (!root) return;

  const buttons = Array.from(root.querySelectorAll('.work-filter-btn'));
  const items = Array.from(root.querySelectorAll('.works-index > li'));

  function apply(id) {
    for (const item of items) {
      const tags = (item.dataset.services || '').split(/\s+/).filter(Boolean);
      item.hidden = !(id === 'all' || tags.includes(id));
    }
    for (const btn of buttons) {
      const on = btn.dataset.filter === id;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    remeasure();
  }

  const group = root.querySelector('.work-filter');
  if (group) {
    group.addEventListener('click', (event) => {
      const btn = event.target.closest('.work-filter-btn');
      if (!btn) return;
      apply(btn.dataset.filter);
    });
  }
})();

  disposers.push(() => {
    dead = true;
    if (typeof rafId !== 'undefined') cancelAnimationFrame(rafId);
    if (lenis) {
      try { lenis.destroy(); } catch (_) {}
    }
  });

  return () => {
    for (const dispose of disposers) {
      try { dispose(); } catch (_) {}
    }
  };
}
