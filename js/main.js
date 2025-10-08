document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  updateCurrentYear();
  primeGalleryPlaceholders();
  setupInstagramEmbed();
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
