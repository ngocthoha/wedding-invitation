import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SCRATCH_DESKTOP = "/Users/thoha/.gemini/antigravity/brain/0e984118-e5ea-498b-8c53-2d975cd0999d/scratch/extracted_desktop";
const SCRATCH_INITIAL = "/Users/thoha/.gemini/antigravity/brain/0e984118-e5ea-498b-8c53-2d975cd0999d/scratch/extracted";
const NET_BODIES = path.join(SCRATCH_DESKTOP, "network_bodies");

const PUBLIC_DIR = path.join(ROOT, "apps", "web", "public");
const CHUNKS_DIR = path.join(PUBLIC_DIR, "_next", "static", "chunks");
const MEDIA_DIR = path.join(PUBLIC_DIR, "_next", "static", "media");
const ASSETS_DIR = path.join(PUBLIC_DIR, "assets");
const LOGO_DIR = path.join(ASSETS_DIR, "logo", "v2");
const MYPAGE_DIR = path.join(ASSETS_DIR, "mypage");
const TEMPLATES_DIR = path.join(ROOT, "apps", "web", "src", "templates");

for (const d of [PUBLIC_DIR, CHUNKS_DIR, MEDIA_DIR, ASSETS_DIR, LOGO_DIR, MYPAGE_DIR, TEMPLATES_DIR]) {
  fs.mkdirSync(d, { recursive: true });
}

// 1. Copy all 45 CSS files to /_next/static/chunks/ AND rewrite relative ../media/ font URLs to https://ngaychungdoi.com/_next/static/media/
const cssFiles = fs.readdirSync(NET_BODIES).filter((f) => f.startsWith("stylesheet_") && f.endsWith(".css"));
let combinedCss = "";
for (const file of cssFiles) {
  const chunkName = file.replace(/^stylesheet_/, "");
  let css = fs.readFileSync(path.join(NET_BODIES, file), "utf8");
  css = css.replace(/url\(\.\.\/media\//g, "url(https://ngaychungdoi.com/_next/static/media/");
  fs.writeFileSync(path.join(CHUNKS_DIR, chunkName), css, "utf8");
  combinedCss += `\n/* === ${chunkName} === */\n` + css;
}
fs.writeFileSync(path.join(PUBLIC_DIR, "ngaychungdoi-all.css"), combinedCss, "utf8");
console.log(`Synced ${cssFiles.length} CSS stylesheets.`);

// 2. Copy captured WOFF2 fonts to /_next/static/media/
const fontFiles = fs.readdirSync(NET_BODIES).filter((f) => f.startsWith("font_") && f.endsWith(".woff2"));
for (const file of fontFiles) {
  const mediaName = file.replace(/^font_/, "");
  fs.copyFileSync(path.join(NET_BODIES, file), path.join(MEDIA_DIR, mediaName));
}
console.log(`Synced ${fontFiles.length} local WOFF2 font files.`);

// 3. Copy captured brand logos & SVG icons
const assetMap = [
  ["image_ngay-chung-doi-original-logo.webp", path.join(LOGO_DIR, "ngay-chung-doi-original-logo.webp")],
  ["image_menu.svg", path.join(ASSETS_DIR, "menu.svg")],
  ["image_fill-cs.svg", path.join(ASSETS_DIR, "fill-cs.svg")],
  ["image_i-main.svg", path.join(ASSETS_DIR, "i-main.svg")],
  ["image_i-gallery.svg", path.join(ASSETS_DIR, "i-gallery.svg")],
  ["image_i-url.svg", path.join(ASSETS_DIR, "i-url.svg")],
  ["image_i-rsvp.svg", path.join(ASSETS_DIR, "i-rsvp.svg")],
  ["other_favicon.svg", path.join(PUBLIC_DIR, "favicon.svg")]
];

for (const [srcName, destPath] of assetMap) {
  const srcPath = path.join(NET_BODIES, srcName);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
  }
}

// Create clean SVG fallbacks for additional icons referenced by MyPageHeader / cards
const svgFallbacks = {
  [path.join(ASSETS_DIR, "i-books.svg")]: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9d2f2f" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`,
  [path.join(ASSETS_DIR, "confetti.svg")]: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9d2f2f" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/></svg>`,
  [path.join(ASSETS_DIR, "draft-black.svg")]: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1f1f27" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h6"/></svg>`,
  [path.join(MYPAGE_DIR, "round-profile.svg")]: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#625960" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>`,
  [path.join(MYPAGE_DIR, "round-profile-black.svg")]: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1f1f27" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>`
};
for (const [target, content] of Object.entries(svgFallbacks)) {
  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, content, "utf8");
  }
}

// 4. Extract clean HTML templates from captured DOM snapshots
function extractCleanBody(rawHtmlPath) {
  const html = fs.readFileSync(rawHtmlPath, "utf8");
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1] : html;
  // Strip Next.js runtime <script> tags so we can attach our clean interactive hydration script
  body = body.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  return body;
}

fs.writeFileSync(
  path.join(TEMPLATES_DIR, "home-body.html"),
  extractCleanBody(path.join(SCRATCH_DESKTOP, "step_1_hero_settle.html")),
  "utf8"
);
fs.writeFileSync(
  path.join(TEMPLATES_DIR, "home-sheet-body.html"),
  extractCleanBody(path.join(SCRATCH_DESKTOP, "step_7_create_sheet_open.html")),
  "utf8"
);
fs.writeFileSync(
  path.join(TEMPLATES_DIR, "sample-card-body.html"),
  fs.readFileSync(path.join(SCRATCH_DESKTOP, "clean_step_10_goto_sample_template.html"), "utf8"),
  "utf8"
);
fs.writeFileSync(
  path.join(TEMPLATES_DIR, "led-stage-body.html"),
  fs.readFileSync(path.join(SCRATCH_DESKTOP, "clean_step_13_led_screen_settle.html"), "utf8"),
  "utf8"
);

console.log("Extracted clean HTML templates into apps/web/src/templates/.");
