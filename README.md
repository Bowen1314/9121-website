# Falcon Force 9121 Website

Static site for the FIRST Tech Challenge robotics team Falcon Force 9121.

## Getting Started

1. Open `index.html` in a browser to preview the site locally.
2. Deploy all files in this folder (`index.html`, `css/`, `js/`) to your preferred static host (GitHub Pages, Netlify, Vercel, etc.).

## Instagram Embed

- Replace the `data-instgrm-permalink` attribute inside `#instagram-feed` (in `index.html`) with any profile or post URL generated from Instagram's official embed tool.
- Need a full embed snippet? Paste it inside the feed container—`js/main.js` will call `window.instgrm.Embeds.process()` whenever the page loads or you press the Refresh button.
- The script auto-loads `https://www.instagram.com/embed.js` on demand; no API tokens or backend required.

## Media Gallery Slots

Each gallery slot inside the "Media Hub" section is a placeholder:

```html
<figure class="gallery-slot">
  <div class="gallery-slot__canvas"></div>
  <figcaption>Custom image slot 1</figcaption>
</figure>
```

Add a background image either inline:

```html
<div class="gallery-slot__canvas" style="background-image: url('https://example.com/robot.jpg');"></div>
```

or via a reusable CSS class in `css/style.css`.

## Map Embed

The contact section contains a Google Maps iframe with a placeholder API key:

```html
src="https://www.google.com/maps/embed/v1/place?key=AIzaSyD-PLACEHOLDER-KEY&q=7410+Monticello+Rd+Columbia+SC+29203"
```

Replace `AIzaSyD-PLACEHOLDER-KEY` with your own Google Maps Embed API key for live map rendering.

## Customizing Colors & Fonts

Theme colors are defined as CSS variables at the top of `css/style.css`. Update `--color-primary` and `--color-secondary` to tweak the palette. Google Fonts are imported in `index.html` (Orbitron for titles, Inter for body text).

## Suggested Enhancements

- Add team member bios or a season blog using additional sections.
- Replace the YouTube `iframe` with a specific showcase playlist or highlight reel.
- Connect a form provider (e.g., Formspree) to capture contact submissions.
