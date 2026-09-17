// @ts-nocheck
/**
 * Crystal X — transmissive glass on a transparent canvas.
 *
 * MeshPhysicalMaterial transmission needs an opaque backdrop in its
 * own pass (three.js otherwise clears that buffer to milky white).
 * That pass is offscreen against black. The visible canvas clears
 * to alpha 0 with no scene.background; only the lit crystal is
 * composited. mix-blend lighten in CSS drops leftover dark pixels.
 */
const HOST_SEL = '.crystal-x';

const CONFIG = {
  targetSize: 4.0,
  depthRatio: 0.07,
  heroDepthRatio: 0.04,
  chamferRatio: 0.008,
  facetAmount: 0.34,
  facetFrequency: 3.2,
  ior: 1.9,
  dispersion: 1.4,
  transmission: 1.0,
  thickness: 2.1,
  roughness: 0.19,
  envIntensity: 1.6,
  backdropColor: '#5B2FF4',
  baseTiltDeg: [-11, 20, 12],
  fov: 28,
  framing: 0.53,
  tiltAmount: 0.085,
  tiltSpeed: 0.42,
  floatAmount: 0.05,
  floatSpeed: 0.62,
};

const MARK =
  '<svg viewBox="0 0 564 566" xmlns="http://www.w3.org/2000/svg"><path d="M0.541974 421.673L0.541969 520.004C0.542034 544.715 20.5762 564.746 45.2802 564.746L142.2 564.746C166.518 564.746 186.28 545.352 186.922 521.184L186.937 520.03L187.004 421.651C187.004 396.35 207.524 375.847 232.827 375.847L328.246 375.847C353.582 375.847 374.069 396.367 374.069 421.673L374.069 520.004C374.069 544.715 394.104 564.746 418.841 564.747L518.303 564.747C543.007 564.747 563.042 544.715 563.042 520.004L563.042 421.673C563.042 396.966 543.007 376.932 518.303 376.932L418.841 376.932C393.505 376.932 372.985 356.415 372.985 331.105L372.985 233.482C372.985 208.172 393.505 187.652 418.841 187.652L518.303 187.652C543.007 187.652 563.042 167.621 563.042 142.91L563.042 46.3168C563.042 22.1155 543.816 2.37399 519.773 1.59709L518.625 1.57463L419.131 0.867597C394.298 0.690445 374.07 20.7724 374.069 45.6088L374.069 142.91C374.069 168.219 353.582 188.737 328.246 188.737L232.729 188.737C208.025 188.737 187.991 208.771 187.991 233.482L187.991 331.105C187.991 356.415 167.471 376.932 142.167 376.932L45.2803 376.932C20.5763 376.932 0.542107 396.966 0.541974 421.673Z"/><path d="M0.639646 45.2842L0.639642 142.907C0.639641 167.618 20.6739 187.649 45.4111 187.649L142.166 187.649C166.871 187.649 186.906 167.618 186.906 142.907L186.906 45.2842C186.906 20.5733 166.871 0.542024 142.166 0.542023L45.4111 0.542019C20.674 0.542119 0.639736 20.5736 0.639646 45.2842Z"/></svg>';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const compact = window.matchMedia('(max-width: 768px)');
const coarse = window.matchMedia('(pointer: coarse)');

function saveDataOn() {
  return Boolean(navigator.connection && navigator.connection.saveData);
}

function pixelCap(isHero) {
  const dpr = window.devicePixelRatio || 1;
  if (reduce.matches || saveDataOn() || coarse.matches || compact.matches) {
    return Math.min(dpr, 1);
  }
  return Math.min(dpr, isHero ? 1.1 : 1.25);
}

function toneFactory(THREE, backdrop) {
  return function tone(factor, mixWhite = 0, alpha = null) {
    const c = backdrop.clone().lerp(new THREE.Color(0xffffff), mixWhite).multiplyScalar(factor);
    const style = c.getStyle();
    if (alpha === null) return style;
    return style.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  };
}

function buildEnvironmentTexture(THREE, tone) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const base = ctx.createLinearGradient(0, 0, 0, 512);
  base.addColorStop(0, tone(0.3));
  base.addColorStop(0.42, tone(0.72));
  base.addColorStop(0.55, tone(0.95, 0.12));
  base.addColorStop(1, tone(0.14));
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 1024, 512);

  ctx.globalCompositeOperation = 'lighter';
  const blobs = [
    [170, 120, 200, 'rgba(255,255,255,1)'],
    [500, 70, 150, tone(1.5, 0.55, 0.9)],
    [770, 200, 210, tone(1.3, 0.3, 0.8)],
    [330, 380, 180, tone(1.4, 0.45, 0.65)],
    [950, 330, 150, tone(1.2, 0.2, 0.7)],
    [640, 450, 130, 'rgba(255,255,255,0.42)'],
  ];
  blobs.forEach(([x, y, r, color]) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  });

  [
    [150, 26],
    [300, 14],
  ].forEach(([y, h]) => {
    const strip = ctx.createLinearGradient(0, y - h, 0, y + h);
    strip.addColorStop(0, 'rgba(255,255,255,0)');
    strip.addColorStop(0.5, 'rgba(255,255,255,0.55)');
    strip.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = strip;
    ctx.fillRect(0, y - h, 1024, h * 2);
  });

  ctx.globalCompositeOperation = 'source-over';
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  let t = lengthSq === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

export async function mountCrystal(host) {
  const THREE = await import('three');
  const { SVGLoader } = await import('three/examples/jsm/loaders/SVGLoader.js');
  const isHero = host.classList.contains('is-hero');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CONFIG.fov, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(pixelCap(isHero));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const ink = new THREE.Color(0x000000);
  const glassTarget = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.UnsignedByteType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    samples: Math.min(4, renderer.capabilities.maxSamples || 0),
  });
  const blitCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const blitMaterial = new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: glassTarget.texture } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      varying vec2 vUv;
      void main() {
        vec4 c = texture2D(tDiffuse, vUv);
        float luma = max(c.r, max(c.g, c.b));
        float alpha = smoothstep(0.04, 0.16, luma);
        gl_FragColor = vec4(c.rgb, alpha);
      }
    `,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  const blitScene = new THREE.Scene();
  blitScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blitMaterial));

  const backdrop = new THREE.Color(CONFIG.backdropColor);
  const tone = toneFactory(THREE, backdrop);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = buildEnvironmentTexture(THREE, tone);
  scene.environment = pmrem.fromEquirectangular(envTexture).texture;
  envTexture.dispose();
  pmrem.dispose();

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(5, 6, 8);
  scene.add(keyLight);

  const cyanLight = new THREE.PointLight(0x4deeff, 14, 24);
  cyanLight.position.set(-5, 2, 5);
  scene.add(cyanLight);

  const purpleLight = new THREE.PointLight(0x9b6cff, 10, 24);
  purpleLight.position.set(5, -4, 4);
  scene.add(purpleLight);

  const svgData = new SVGLoader().parse(MARK);
  const shapes = [];
  svgData.paths.forEach((path) => {
    SVGLoader.createShapes(path).forEach((shape) => shapes.push(shape));
  });

  const bounds = new THREE.Box2();
  const contours = [];
  shapes.forEach((shape) => {
    const extracted = shape.extractPoints(12);
    [extracted.shape, ...extracted.holes].forEach((ring) => {
      contours.push(ring);
      ring.forEach((point) => bounds.expandByPoint(point));
    });
  });

  const size = bounds.getSize(new THREE.Vector2());
  const maxDim = Math.max(size.x, size.y);
  const depth = maxDim * (isHero ? CONFIG.heroDepthRatio : CONFIG.depthRatio);
  const chamfer = maxDim * CONFIG.chamferRatio;
  const scaleFactor = CONFIG.targetSize / maxDim;

  function distanceToOutline(px, py) {
    let min = Infinity;
    for (const ring of contours) {
      for (let i = 0; i < ring.length; i++) {
        const a = ring[i];
        const b = ring[(i + 1) % ring.length];
        const d = distanceToSegment(px, py, a.x, a.y, b.x, b.y);
        if (d < min) min = d;
      }
    }
    return min;
  }

  function facetCaps(geometry) {
    if (CONFIG.facetAmount <= 0) return;
    geometry.computeBoundingBox();
    const zMin = geometry.boundingBox.min.z;
    const zMax = geometry.boundingBox.max.z;
    const position = geometry.attributes.position;
    const eps = chamfer * 0.05;
    const amplitude = depth * CONFIG.facetAmount;
    const falloff = maxDim * 0.07;
    const f = (CONFIG.facetFrequency * Math.PI * 2) / maxDim;

    for (let i = 0; i < position.count; i++) {
      const z = position.getZ(i);
      const onBack = Math.abs(z - zMin) < eps;
      const onFront = Math.abs(z - zMax) < eps;
      if (!onBack && !onFront) continue;
      const x = position.getX(i);
      const y = position.getY(i);
      let w = Math.min(1, distanceToOutline(x, y) / falloff);
      w = w * w * (3 - 2 * w);
      const noise =
        (Math.sin(x * f) * Math.cos(y * f * 0.82) + 0.55 * Math.sin((x + y) * f * 0.6 + 1.7)) / 1.55;
      position.setZ(i, z + (onFront ? 1 : -1) * noise * amplitude * w);
    }
    position.needsUpdate = true;
  }

  const center = new THREE.Vector3();
  const geometries = shapes.map((shape) => {
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: chamfer,
      bevelSize: chamfer,
      bevelOffset: 0,
      bevelSegments: 1,
      curveSegments: 12,
      steps: 1,
    });
    facetCaps(geometry);
    geometry.scale(scaleFactor, scaleFactor, scaleFactor);
    geometry.rotateX(Math.PI);
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    return geometry;
  });

  const union = new THREE.Box3();
  geometries.forEach((geometry) => union.union(geometry.boundingBox));
  union.getCenter(center);
  geometries.forEach((geometry) => geometry.translate(-center.x, -center.y, -center.z));

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: CONFIG.roughness,
    transmission: CONFIG.transmission,
    transparent: true,
    opacity: 1,
    ior: CONFIG.ior,
    dispersion: CONFIG.dispersion,
    thickness: CONFIG.thickness,
    attenuationColor: backdrop.clone().lerp(new THREE.Color(0xffffff), 0.55),
    attenuationDistance: 14,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    iridescence: 0.35,
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [120, 520],
    envMapIntensity: CONFIG.envIntensity,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  const crystal = new THREE.Group();
  geometries.forEach((geometry) => crystal.add(new THREE.Mesh(geometry, glass)));
  scene.add(crystal);

  const DEG = Math.PI / 180;
  const baseX = CONFIG.baseTiltDeg[0] * DEG;
  const baseY = CONFIG.baseTiltDeg[1] * DEG;
  const baseZ = CONFIG.baseTiltDeg[2] * DEG;
  crystal.rotation.set(baseX, baseY, baseZ);

  function frameCamera() {
    const height = CONFIG.targetSize / CONFIG.framing;
    camera.position.z = height / (2 * Math.tan((camera.fov * Math.PI) / 360));
    camera.updateProjectionMatrix();
  }

  let sizedW = 0;
  let sizedH = 0;
  let sizedPr = 0;

  function sizeToHost() {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    const pr = renderer.getPixelRatio();
    if (width === sizedW && height === sizedH && pr === sizedPr) return false;
    sizedW = width;
    sizedH = height;
    sizedPr = pr;
    camera.aspect = width / height;
    renderer.setSize(width, height, false);
    glassTarget.setSize(Math.max(1, Math.floor(width * pr)), Math.max(1, Math.floor(height * pr)));
    blitMaterial.uniforms.tDiffuse.value = glassTarget.texture;
    frameCamera();
    return true;
  }

  sizeToHost();

  const clock = new THREE.Clock();
  const tilt = CONFIG.tiltAmount * (compact.matches ? 0.7 : 1);
  const bob = CONFIG.floatAmount * (compact.matches ? 0.7 : 1);
  let raf = 0;
  let onScreen = false;

  function shouldRun() {
    return onScreen && !document.hidden && !reduce.matches;
  }

  function markRaf(on) {
    host.dataset.crystalRaf = on ? '1' : '0';
  }

  function paint() {
    scene.background = ink;
    renderer.setRenderTarget(glassTarget);
    renderer.setClearColor(ink, 1);
    renderer.render(scene, camera);

    scene.background = null;
    renderer.setRenderTarget(null);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.render(blitScene, blitCamera);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
  }

  function tick() {
    if (!shouldRun()) {
      raf = 0;
      markRaf(false);
      return;
    }
    raf = requestAnimationFrame(tick);
    markRaf(true);
    const elapsed = clock.getElapsedTime();
    const s = CONFIG.tiltSpeed;
    crystal.position.y = Math.sin(elapsed * CONFIG.floatSpeed) * bob;
    crystal.rotation.y =
      baseY + (Math.sin(elapsed * s) * 0.84 + Math.sin(elapsed * s * 0.41) * 0.16) * tilt;
    paint();
  }

  function play() {
    if (reduce.matches) {
      paint();
      markRaf(false);
      return;
    }
    if (!shouldRun() || raf) return;
    raf = requestAnimationFrame(tick);
    markRaf(true);
  }

  function pause() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    renderer.setAnimationLoop(null);
    markRaf(false);
  }

  function syncLoop() {
    if (shouldRun()) play();
    else pause();
  }

  const ro = new ResizeObserver(() => {
    const changed = sizeToHost();
    if (changed && (reduce.matches || !shouldRun())) paint();
  });
  ro.observe(host);

  const vis = new IntersectionObserver(
    (entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting);
      syncLoop();
    },
    { rootMargin: '80px' }
  );
  vis.observe(host);

  document.addEventListener('visibilitychange', syncLoop);

  paint();
  markRaf(false);
}

