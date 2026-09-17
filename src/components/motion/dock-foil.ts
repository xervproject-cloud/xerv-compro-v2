// @ts-nocheck
import {
  ShaderMount,
  lensDistortionFragmentShader,
  ShaderFitOptions,
} from "@paper-design/shaders";

function foilSheet() {
  const size = 768;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("no 2d context"));

  const wash = ctx.createLinearGradient(0, 0, size, size);
  wash.addColorStop(0, "#F59E2A");
  wash.addColorStop(0.24, "#5B2FF4");
  wash.addColorStop(0.5, "#120828");
  wash.addColorStop(0.74, "#3B6BFF");
  wash.addColorStop(1, "#F59E2A");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, size, size);

  ctx.globalCompositeOperation = "screen";
  const stripe = ctx.createLinearGradient(0, size * 0.18, size, size * 0.72);
  stripe.addColorStop(0.28, "rgba(255,255,255,0)");
  stripe.addColorStop(0.48, "rgba(255,220,170,0.38)");
  stripe.addColorStop(0.52, "rgba(180,200,255,0.28)");
  stripe.addColorStop(0.72, "rgba(255,255,255,0)");
  ctx.fillStyle = stripe;
  ctx.fillRect(0, 0, size, size);

  ctx.globalCompositeOperation = "overlay";
  const cross = ctx.createLinearGradient(size, 0, 0, size);
  cross.addColorStop(0, "rgba(91,47,244,0.35)");
  cross.addColorStop(0.5, "rgba(18,8,40,0)");
  cross.addColorStop(1, "rgba(245,158,42,0.3)");
  ctx.fillStyle = cross;
  ctx.fillRect(0, 0, size, size);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = canvas.toDataURL("image/png");
  });
}

function sizing() {
  return {
    u_fit: ShaderFitOptions.cover,
    u_scale: 1.28,
    u_rotation: 0,
    u_originX: 0.5,
    u_originY: 0.5,
    u_offsetX: 0,
    u_offsetY: 0,
    u_worldWidth: 0,
    u_worldHeight: 0,
  };
}

function lens(image, extras = {}) {
  return {
    ...sizing(),
    u_image: image,
    u_spread: 0.22,
    u_bias: 0.35,
    u_angle: 18,
    u_perspective: 0.08,
    u_count: 28,
    u_dispersion: 1,
    u_dispersionShift: 0.45,
    u_dispersionColor: 0.08,
    u_focusCenter: 0,
    u_focusEdges: 0.12,
    u_swirl: 0.28,
    u_noise: 0.12,
    u_noiseFrequency: 0.32,
    u_noiseOffset: 0.2,
    u_lensBulge: 0.14,
    u_lensCircle: 0,
    u_grainMixer: 0.18,
    u_grainOverlay: 0.08,
    u_imageX: 0,
    u_imageY: 0,
    ...extras,
  };
}

export async function mountDockFoil() {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const card = document.querySelector(".dock-card");
  const host = document.querySelector(".dock-foil");
  if (!card || !host || !fine.matches || reduce.matches) return () => {};

  let image;
  try {
    image = await foilSheet();
  } catch {
    return () => {};
  }

  let mountRef;
  try {
    mountRef = new ShaderMount(host, lensDistortionFragmentShader, lens(image), undefined, 0);
  } catch {
    return () => {};
  }

  card.classList.add("has-shader");

  let x = 0.5;
  let y = 0.4;
  let tx = 0.5;
  let ty = 0.4;
  let hover = 0;
  let thover = 0;
  let last = 0;
  let raf = 0;

  const DAMP = 0.075;
  const EDGE = 0.22;

  function inset(t) {
    return EDGE + t * (1 - EDGE * 2);
  }

  function paint(now) {
    if (!last) last = now;
    const dt = Math.min(32, now - last) / 16.67;
    last = now;

    const k = 1 - (1 - DAMP) ** dt;
    x += (tx - x) * k;
    y += (ty - y) * k;
    hover += (thover - hover) * (1 - (1 - 0.08) ** dt);

    const px = inset(x);
    const py = inset(y);
    card.style.setProperty("--spot-x", `${(px * 100).toFixed(2)}%`);
    card.style.setProperty("--spot-y", `${(py * 100).toFixed(2)}%`);
    card.style.setProperty("--foil-ang", `${108 + px * 36}deg`);

    mountRef.setUniforms({
      u_spread: 0.16 + hover * 0.38,
      u_angle: 12 + px * 48,
      u_swirl: 0.18 + hover * 0.16,
      u_dispersionColor: 0.03 + px * 0.1,
      u_imageX: (px - 0.5) * 0.16,
      u_imageY: (py - 0.5) * 0.12,
      u_offsetX: (px - 0.5) * 0.05,
      u_offsetY: (py - 0.5) * 0.05,
      u_lensCircle: 0,
    });
    mountRef.setSpeed(0.12 + hover * 0.18);

    const moving =
      Math.abs(tx - x) > 0.0006 ||
      Math.abs(ty - y) > 0.0006 ||
      Math.abs(thover - hover) > 0.002;
    if (moving || hover > 0.01) {
      raf = requestAnimationFrame(paint);
    } else {
      raf = 0;
      last = 0;
    }
  }

  function kick() {
    if (!raf) raf = requestAnimationFrame(paint);
  }

  const onEnter = () => {
    thover = 1;
    kick();
  };
  const onMove = (event) => {
    const box = card.getBoundingClientRect();
    tx = Math.min(1, Math.max(0, (event.clientX - box.left) / (box.width || 1)));
    ty = Math.min(1, Math.max(0, (event.clientY - box.top) / (box.height || 1)));
    kick();
  };
  const onLeave = () => {
    thover = 0;
    tx = 0.5;
    ty = 0.4;
    kick();
  };

  card.addEventListener("pointerenter", onEnter);
  card.addEventListener("pointermove", onMove);
  card.addEventListener("pointerleave", onLeave);

  return () => {
    cancelAnimationFrame(raf);
    card.removeEventListener("pointerenter", onEnter);
    card.removeEventListener("pointermove", onMove);
    card.removeEventListener("pointerleave", onLeave);
    card.classList.remove("has-shader");
    try {
      mountRef?.dispose?.();
    } catch {
      /* ignore */
    }
    host.replaceChildren();
  };
}
