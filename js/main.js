document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  updateCurrentYear();
  primeGalleryPlaceholders();
  setupInstagramEmbed();
  initLetterGlitchBackground();
});

function initNavigation() {
  const navToggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");

  if (!navToggle || !menu) return;

  navToggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function updateCurrentYear() {
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

function primeGalleryPlaceholders() {
  document.querySelectorAll(".gallery-slot").forEach((slot, index) => {
    const canvas = slot.querySelector(".gallery-slot__canvas");
    if (!canvas) return;

    const inlineBackground = canvas.style.backgroundImage;
    const hasCustomBackground =
      inlineBackground && inlineBackground !== "none";

    if (hasCustomBackground) {
      canvas.dataset.status = "";
      return;
    }

    canvas.dataset.status = "Add image URL";
    canvas.addEventListener("click", () => {
      alert(
        `Gallery slot ${index + 1}: replace this placeholder by setting a background image.\n\nExample:\n1. Open index.html\n2. Find the <figure> with slot ${index + 1}\n3. Add style="background-image: url('https://example.com/your-image.jpg');" to the .gallery-slot__canvas div`
      );
    });
  });
}

function setupInstagramEmbed() {
  const feedContainer = document.getElementById("instagram-feed");
  const refreshButton = document.querySelector("[data-refresh-feed]");
  const statusEl = document.getElementById("feed-status");

  if (!feedContainer) return;

  const processEmbeds = () => {
    const hasEmbed = feedContainer.querySelector(".instagram-media");

    if (!hasEmbed) {
      updateFeedStatus(statusEl, "Add an Instagram embed blockquote inside #instagram-feed.");
      return;
    }

    updateFeedStatus(statusEl, "Refreshing Instagram embed…");

    ensureInstagramSDK()
      .then(() => {
        if (window.instgrm?.Embeds?.process) {
          window.instgrm.Embeds.process();
          updateFeedStatus(statusEl, "Instagram embed updated.");
        } else {
          updateFeedStatus(statusEl, "Instagram embed script loaded without a processor.");
        }
      })
      .catch((error) => {
        console.error(error);
        updateFeedStatus(statusEl, "Unable to load the Instagram embed script.");
      });
  };

  processEmbeds();

  if (refreshButton) {
    refreshButton.addEventListener("click", processEmbeds);
  }
}

let instagramSDKPromise;

function ensureInstagramSDK() {
  if (window.instgrm?.Embeds?.process) {
    return Promise.resolve();
  }

  if (instagramSDKPromise) {
    return instagramSDKPromise;
  }

  instagramSDKPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById("instagram-embed-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => {
          instagramSDKPromise = null;
          reject(new Error("Instagram embed script failed to load."));
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "instagram-embed-script";
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      instagramSDKPromise = null;
      reject(new Error("Instagram embed script failed to load."));
    };
    document.body.appendChild(script);
  });

  return instagramSDKPromise;
}

function updateFeedStatus(el, message) {
  if (el) {
    el.textContent = message;
  }
}

function initLetterGlitchBackground() {
  const container = document.querySelector(".hero-background");
  if (!container) return;

  const options = {
    glitchColors: ["#2b4539", "#61dca3", "#61b3dc"],
    glitchSpeed: 50,
    centerVignette: false,
    outerVignette: true,
    smooth: true,
    characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789",
  };

  const state = {
    canvas: document.createElement("canvas"),
    context: null,
    letters: [],
    grid: { columns: 0, rows: 0 },
    animationFrameId: null,
    lastGlitchTime: performance.now(),
    resizeTimeoutId: null,
    width: 0,
    height: 0,
  };

  state.canvas.className = "hero-background__canvas";
  container.innerHTML = "";
  container.appendChild(state.canvas);

  const scrim = document.createElement("div");
  scrim.className = "hero-background__scrim";
  container.appendChild(scrim);

  if (options.outerVignette) {
    const outerVignette = document.createElement("div");
    outerVignette.className = "hero-background__outer-vignette";
    container.appendChild(outerVignette);
  }

  if (options.centerVignette) {
    const centerVignette = document.createElement("div");
    centerVignette.className = "hero-background__center-vignette";
    container.appendChild(centerVignette);
  }

  const context = state.canvas.getContext("2d");
  if (!context) return;
  state.context = context;

  const palette = options.glitchColors
    .map((color) => hexToRgb(color))
    .filter(Boolean);
  const characters = Array.from(options.characters);
  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;
  const smoothStep = 0.05;

  function hexToRgb(hex) {
    if (typeof hex !== "string") return null;
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    if (!result) return null;
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }

  function rgbToString({ r, g, b }) {
    return `rgb(${r}, ${g}, ${b})`;
  }

  function parseColorToRgb(color) {
    if (!color) return null;
    if (color.startsWith("#")) {
      return hexToRgb(color);
    }
    const match = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i.exec(color);
    if (!match) return null;
    return {
      r: Number(match[1]),
      g: Number(match[2]),
      b: Number(match[3]),
    };
  }

  function interpolateColor(start, end, factor) {
    return {
      r: Math.round(start.r + (end.r - start.r) * factor),
      g: Math.round(start.g + (end.g - start.g) * factor),
      b: Math.round(start.b + (end.b - start.b) * factor),
    };
  }

  function getRandomChar() {
    return characters[Math.floor(Math.random() * characters.length)];
  }

  function getRandomColor() {
    if (!palette.length) {
      return { r: 255, g: 255, b: 255 };
    }
    return palette[Math.floor(Math.random() * palette.length)];
  }

  function calculateGrid(width, height) {
    return {
      columns: Math.ceil(width / charWidth),
      rows: Math.ceil(height / charHeight),
    };
  }

  function initializeLetters(columns, rows) {
    state.grid = { columns, rows };
    const total = columns * rows;
    state.letters = Array.from({ length: total }, () => {
      const baseColor = getRandomColor();
      const colorString = rgbToString(baseColor);
      return {
        char: getRandomChar(),
        color: colorString,
        startColor: baseColor,
        targetColor: baseColor,
        colorProgress: 1,
      };
    });
  }

  function drawLetters() {
    if (!state.context || !state.letters.length) return;
    const ctx = state.context;
    ctx.clearRect(0, 0, state.width, state.height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";
    ctx.save();
    ctx.globalAlpha = 0.65;

    const { columns } = state.grid;
    state.letters.forEach((letter, index) => {
      const x = (index % columns) * charWidth;
      const y = Math.floor(index / columns) * charHeight;
      ctx.fillStyle = letter.color;
      ctx.fillText(letter.char, x, y);
    });
    ctx.restore();
  }

  function updateLetters() {
    if (!state.letters.length) return false;
    const total = state.letters.length;
    const updates = Math.max(1, Math.floor(total * 0.05));
    let updated = false;

    for (let i = 0; i < updates; i += 1) {
      const index = Math.floor(Math.random() * total);
      const letter = state.letters[index];
      if (!letter) continue;

      letter.char = getRandomChar();
      const target = getRandomColor();

      if (options.smooth) {
        letter.startColor = parseColorToRgb(letter.color) || target;
        letter.targetColor = target;
        letter.colorProgress = 0;
      } else {
        letter.color = rgbToString(target);
        letter.startColor = target;
        letter.targetColor = target;
        letter.colorProgress = 1;
      }

      updated = true;
    }

    return updated;
  }

  function handleSmoothTransitions() {
    if (!options.smooth) return false;

    let needsRedraw = false;
    state.letters.forEach((letter) => {
      if (letter.colorProgress < 1) {
        const start = letter.startColor;
        const end = letter.targetColor;
        if (!start || !end) {
          letter.colorProgress = 1;
          return;
        }

        letter.colorProgress = Math.min(1, letter.colorProgress + smoothStep);
        const interpolated = interpolateColor(start, end, letter.colorProgress);
        letter.color = rgbToString(interpolated);
        needsRedraw = true;
      }
    });

    return needsRedraw;
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    state.width = width;
    state.height = height;
    state.canvas.width = Math.round(width * dpr);
    state.canvas.height = Math.round(height * dpr);
    state.canvas.style.width = `${width}px`;
    state.canvas.style.height = `${height}px`;

    state.context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { columns, rows } = calculateGrid(width, height);
    initializeLetters(columns, rows);
    drawLetters();
  }

  function onResize() {
    clearTimeout(state.resizeTimeoutId);
    state.resizeTimeoutId = window.setTimeout(() => {
      resizeCanvas();
    }, 100);
  }

  function animate(timestamp) {
    let shouldRedraw = false;

    if (timestamp - state.lastGlitchTime >= options.glitchSpeed) {
      if (updateLetters()) {
        shouldRedraw = true;
      }
      state.lastGlitchTime = timestamp;
    }

    if (handleSmoothTransitions()) {
      shouldRedraw = true;
    }

    if (shouldRedraw) {
      drawLetters();
    }

    state.animationFrameId = window.requestAnimationFrame(animate);
  }

  resizeCanvas();
  state.animationFrameId = window.requestAnimationFrame(animate);
  window.addEventListener("resize", onResize);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.animationFrameId) {
      window.cancelAnimationFrame(state.animationFrameId);
      state.animationFrameId = null;
    } else if (!document.hidden && !state.animationFrameId) {
      state.lastGlitchTime = performance.now();
      state.animationFrameId = window.requestAnimationFrame(animate);
    }
  });
}
