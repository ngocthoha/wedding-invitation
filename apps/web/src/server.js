const http = require("http");
const fs = require("fs");
const path = require("path");
const { ALL_TEMPLATES, SAMPLE_CARD_BMMD8NF8VM1I } = require("../../api/src/seed-data");
const {
  handleApiRequest,
  ensureSupabaseHydrated,
  findCard,
  enrichCard,
  getDb
} = require("../../api/src/index");
const { renderCardEditorPage } = require("./card-editor-view");

const PORT = Number(process.env.PORT || 3000);
const API_BASE = process.env.API_BASE || (process.env.VERCEL ? "/api" : "http://localhost:3008");
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const TEMPLATES_DIR = path.join(__dirname, "templates");

const homeBodyHtml = fs.readFileSync(path.join(TEMPLATES_DIR, "home-body.html"), "utf8");
const sampleCardBodyHtml = fs.readFileSync(path.join(TEMPLATES_DIR, "sample-card-body.html"), "utf8");
const ledStageBodyHtml = fs.readFileSync(path.join(TEMPLATES_DIR, "led-stage-body.html"), "utf8");

// Extract header and footer from homeBodyHtml for reuse on inner pages
const headerMatch = homeBodyHtml.match(/<div class="body-class hidden-plus-tab home-fixed-header">[\s\S]*?<\/aside><\/div>/);
const sharedHeaderHtml = headerMatch ? headerMatch[0] : "";
const footerMatch = homeBodyHtml.match(/<div class="body-class mt-auto"><footer[\s\S]*?<\/footer><\/div>/);
const sharedFooterHtml = footerMatch ? footerMatch[0] : "";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg"
};

function renderDocument({ title, description, bodyHtml, extraHead = "", extraScript = "" }) {
  return `<!DOCTYPE html>
<html lang="vi" data-card-public-ready="true">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description || "Tạo thiệp cưới online miễn phí, sang trọng & tinh tế cùng Ngày Chung Đôi."}" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400..700;1,400..700&family=EB+Garamond:ital,wght@0,400..700;1,400..700&family=Gowun+Dodum&family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400..700;1,400..700&family=Noto+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/ngaychungdoi-all.css" />
  <style>
    body { font-family: 'Noto Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    .template-tile__media img { transition: transform var(--preview-duration, 6s) ease-in-out; }
    .template-tile:hover .template-tile__media img.template-tile__long-preview { transform: translateY(var(--preview-scroll, -55%)); }
    [data-aos] { opacity: 1 !important; transform: none !important; transition: opacity 0.55s ease, transform 0.55s ease; }
  </style>
  ${extraHead}
</head>
${bodyHtml}
<script>window.__API_BASE__ = "${API_BASE}";${extraScript}</script>
<script src="/app-client.js"></script>
</html>`;
}

function renderCatalogPage(templates, activeMode = "all") {
  const filtered =
    activeMode === "form"
      ? templates.filter((t) => t.kind === "form")
      : activeMode === "canvas"
      ? templates.filter((t) => t.kind === "canvas")
      : templates;

  const tilesHtml = templates
    .map((t) => {
      const show = activeMode === "all" || t.kind === activeMode;
      const tagsHtml = (t.tags || [])
        .slice(0, 3)
        .map((tag) => `<span class="template-tile__hover-tag">${tag}</span>`)
        .join("");
      return `
        <button
          type="button"
          class="template-tile"
          data-raw-id="${t.rawId}"
          data-kind="${t.kind}"
          data-name="${t.name}"
          data-desc="${t.description || ""}"
          data-href="${t.href}"
          aria-label="Xem chi tiết mẫu ${t.name}"
          style="${show ? "" : "display:none;"}"
        >
          <div class="template-tile__media">
            ${t.kind === "form" ? `<span class="template-tile__badge">Biểu mẫu</span>` : `<span class="template-tile__badge">Tự do</span>`}
            <picture>
              <img
                alt="Mẫu thiệp cưới online ${t.name}"
                loading="lazy"
                class="template-tile__long-preview"
                decoding="async"
                src="${t.thumbnail}"
              />
            </picture>
            <div class="template-tile__hover" aria-hidden="true">
              <p class="template-tile__hover-title">${t.name}</p>
              <div class="template-tile__hover-tags">${tagsHtml}</div>
            </div>
          </div>
        </button>
      `;
    })
    .join("");

  const body = `<body>
    <div class="site-font flex min-h-screen flex-col bg-[#f7f7f9] text-[#1f1f27]">
      ${sharedHeaderHtml}
      <main class="home-fixed-main flex-1 bg-transparent">
        <section class="template-catalog" aria-labelledby="catalog-title">
          <div class="template-catalog__inner" style="max-width:1240px;margin:0 auto;padding:40px 20px 72px;">
            <header class="template-catalog__header" style="text-align:center;max-width:680px;margin:0 auto 32px;">
              <p class="home-section-kicker" style="margin-bottom:10px;">KHO MẪU THIỆP ĐỘC QUYỀN</p>
              <h1 id="catalog-title" style="font-size:clamp(28px,3.2vw,40px);font-weight:700;letter-spacing:-1px;line-height:1.22;color:#1f1f27;">
                Mẫu thiệp cưới online miễn phí
              </h1>
              <p style="margin-top:12px;font-size:15px;color:#625960;line-height:1.7;">
                Chọn từ bộ sưu tập mẫu điền nhanh tiện lợi hoặc mẫu Canvas thiết kế tự do. Đầy đủ hiệu ứng mở thiệp 3D, nhạc nền, Google Maps, xác nhận tham dự và sổ lưu bút.
              </p>
            </header>

            <div class="template-catalog__tabs-wrap">
              <div class="template-catalog__mode-switch" role="group" aria-label="Lọc loại mẫu thiệp" style="display:flex;justify-content:center;gap:8px;margin-bottom:16px;">
                <button type="button" data-mode="all" aria-label="Tất cả mẫu" aria-pressed="${activeMode === "all"}" class="template-catalog__mode-switch__btn${activeMode === "all" ? " is-active" : ""}">Tất cả mẫu</button>
                <button type="button" data-mode="form" aria-label="Điền thông tin nhanh" aria-pressed="${activeMode === "form"}" class="template-catalog__mode-switch__btn${activeMode === "form" ? " is-active" : ""}">
                  <span class="template-catalog__mode-label--full">Điền thông tin nhanh</span>
                </button>
                <button type="button" data-mode="canvas" aria-label="Thiết kế tự do" aria-pressed="${activeMode === "canvas"}" class="template-catalog__mode-switch__btn${activeMode === "canvas" ? " is-active" : ""}">Thiết kế tự do</button>
              </div>
              <p class="template-catalog__tab-count" role="status" style="text-align:center;font-size:13px;color:#75646d;margin-bottom:24px;">
                ${filtered.length} mẫu · Chọn một mẫu để xem thử
              </p>
              <div class="template-catalog__grid">
                ${tilesHtml}
              </div>
            </div>
          </div>
        </section>

        <!-- Live Preview Modal -->
        <div id="ncd-template-detail-modal" class="template-modal template-modal--animated" role="presentation" style="display:none;">
          <button type="button" class="template-modal__backdrop" aria-label="Đóng"></button>
          <div class="template-modal__panel template-modal__panel--live-preview" role="dialog" aria-modal="true" aria-labelledby="template-detail-title">
            <span class="template-modal__handle" aria-hidden="true"></span>
            <button type="button" class="template-modal__close" aria-label="Đóng">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6Z"></path></svg>
            </button>
            <div class="template-detail">
              <div class="template-detail__preview">
                <div class="template-detail__preview-frame">
                  <iframe src="about:blank" title="Xem trước thiệp" class="template-preview-iframe" style="width:100%;height:100%;border:0;"></iframe>
                </div>
              </div>
              <div class="template-detail__info">
                <h2 class="template-detail__title" id="template-detail-title">Mẫu Đỏ 2</h2>
                <p class="template-detail__desc">Sắc đỏ truyền thống kết hợp hiệu ứng mở thiệp Song Hỷ rực rỡ và sang trọng.</p>
                <div class="template-detail__features">
                  <h3>Tính năng</h3>
                  <ul>
                    <li><span class="template-detail__feature-icon template-detail__feature-icon--pink"></span><span>Tùy chỉnh nội dung &amp; Hiệu ứng 3D</span></li>
                    <li><span class="template-detail__feature-icon template-detail__feature-icon--blue"></span><span>Bản đồ Google Maps</span></li>
                    <li><span class="template-detail__feature-icon template-detail__feature-icon--green"></span><span>Xác nhận tham dự (RSVP)</span></li>
                    <li><span class="template-detail__feature-icon template-detail__feature-icon--coral"></span><span>Sổ lưu bút &amp; Lời chúc</span></li>
                    <li><span class="template-detail__feature-icon template-detail__feature-icon--amber"></span><span>Mừng cưới QR ngân hàng</span></li>
                  </ul>
                </div>
                <div class="template-detail__actions">
                  <a class="template-detail__btn template-detail__btn--primary" href="/card/create?template=bmmd8nf8vm1i">Dùng mẫu</a>
                  <a class="template-detail__btn template-detail__btn--ghost" href="/mau-thiep/template/bmmd8nf8vm1i">Xem đầy đủ ↗</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      ${sharedFooterHtml}
    </div>
  </body>`;

  return renderDocument({
    title: "Mẫu thiệp cưới online miễn phí | Ngày Chung Đôi",
    description: "Kho mẫu thiệp cưới online miễn phí, sang trọng & tinh tế.",
    bodyHtml: body
  });
}

function renderCardPage(cardData, guestSlug) {
  let body = sampleCardBodyHtml;
  const groom = cardData?.groomName || "THANH PHONG";
  const bride = cardData?.brideName || "THUÝ KIỀU";
  if (groom !== "THANH PHONG") {
    body = body.replace(/THANH PHONG/g, groom).replace(/Thanh Phong/g, cardData.groomShortName || groom);
  }
  if (bride !== "THUÝ KIỀU") {
    body = body.replace(/THUÝ KIỀU/g, bride).replace(/Thuý Kiều/g, cardData.brideShortName || bride);
  }
  if (guestSlug || cardData?.guestInvite) {
    const salutation = cardData?.guestInvite?.salutation || `Bạn ${guestSlug} ♥`;
    const guestBanner = `
      <div id="ncd-guest-personal-banner" style="position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:1000000;background:rgba(157,47,47,0.95);color:#fffaf3;padding:8px 20px;border-radius:999px;font-size:13px;font-weight:600;box-shadow:0 10px 25px rgba(0,0,0,0.25);border:1px solid rgba(243,223,178,0.45);">
        Thân mời: <strong style="font-family:Georgia,serif;font-style:italic;color:#f3dfb2;">${salutation}</strong>
      </div>
    `;
    body = body.replace("<body", "<body") + guestBanner;
  }

  return renderDocument({
    title: `${groom} & ${bride} | Thiệp cưới online Ngày Chung Đôi`,
    description: `Trân trọng kính mời Quý khách đến dự lễ thành hôn của ${groom} & ${bride}.`,
    bodyHtml: body,
    extraScript: `window.__CARD_ID__ = ${JSON.stringify(cardData?.id || "bmmd8nf8vm1i")};`
  });
}

function renderCreateCardPage(templateId = "bmmd8nf8vm1i", mode = "template") {
  const tpl = ALL_TEMPLATES.find((t) => t.rawId === templateId) || ALL_TEMPLATES[4];
  const body = `<body>
    <div class="site-font flex min-h-screen flex-col bg-[#f7f7f9] text-[#1f1f27]">
      ${sharedHeaderHtml}
      <main class="home-fixed-main flex-1">
        <div style="max-width:1120px;margin:0 auto;padding:36px 20px 72px;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,0.9fr);gap:32px;align-items:start;">
          <section style="background:#fff;border:1px solid #edddda;border-radius:28px;padding:32px;box-shadow:0 18px 40px rgba(68,32,50,0.06);">
            <span class="home-intro-kicker">TRÌNH TẠO THIỆP CƯỚI ONLINE • ${mode === "scan" ? "QUÉT THIỆP AI" : mode === "scratch" ? "TẠO TỪ ĐẦU" : "TỪ MẪU CÓ SẴN"}</span>
            <h1 style="font-size:28px;font-weight:700;letter-spacing:-0.8px;margin:14px 0 8px;color:#1f1f27;">
              Thiết kế thiệp cưới của hai bạn
            </h1>
            <p style="font-size:14px;color:#625960;margin-bottom:24px;">
              Điền thông tin lễ cưới bên dưới. Thiệp sẽ được khởi tạo ngay lập tức với đầy đủ hiệu ứng mở thiệp 3D, nhạc nền, RSVP và Sổ lưu bút.
            </p>
            <form id="ncd-create-card-form" style="display:grid;gap:16px;">
              <input type="hidden" name="templateId" value="${tpl.rawId}" />
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div>
                  <label style="display:block;font-size:12.5px;font-weight:600;margin-bottom:6px;">Tên Chú Rể *</label>
                  <input name="groomName" required value="Minh Quân" style="width:100%;padding:11px 14px;border:1px solid #dfcbcb;border-radius:12px;font-size:14px;" />
                </div>
                <div>
                  <label style="display:block;font-size:12.5px;font-weight:600;margin-bottom:6px;">Tên Cô Dâu *</label>
                  <input name="brideName" required value="Thanh Hà" style="width:100%;padding:11px 14px;border:1px solid #dfcbcb;border-radius:12px;font-size:14px;" />
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div>
                  <label style="display:block;font-size:12.5px;font-weight:600;margin-bottom:6px;">Ngày tổ chức hôn lễ</label>
                  <input type="date" name="weddingDate" value="2026-04-26" style="width:100%;padding:11px 14px;border:1px solid #dfcbcb;border-radius:12px;font-size:14px;" />
                </div>
                <div>
                  <label style="display:block;font-size:12.5px;font-weight:600;margin-bottom:6px;">Giờ đón khách</label>
                  <input type="time" name="weddingTime" value="18:00" style="width:100%;padding:11px 14px;border:1px solid #dfcbcb;border-radius:12px;font-size:14px;" />
                </div>
              </div>
              <div>
                <label style="display:block;font-size:12.5px;font-weight:600;margin-bottom:6px;">Địa điểm tổ chức</label>
                <input name="venueName" value="Trung tâm Hội nghị & Tiệc cưới White Palace" style="width:100%;padding:11px 14px;border:1px solid #dfcbcb;border-radius:12px;font-size:14px;" />
              </div>
              <div>
                <label style="display:block;font-size:12.5px;font-weight:600;margin-bottom:6px;">Địa chỉ chi tiết</label>
                <input name="venueAddress" value="194 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP. Hồ Chí Minh" style="width:100%;padding:11px 14px;border:1px solid #dfcbcb;border-radius:12px;font-size:14px;" />
              </div>
              <div>
                <label style="display:block;font-size:12.5px;font-weight:600;margin-bottom:6px;">Hiệu ứng mở thiệp 3D</label>
                <select name="openingType" style="width:100%;padding:11px 14px;border:1px solid #dfcbcb;border-radius:12px;font-size:14px;background:#fff;">
                  <option value="royal-red">Song Hỷ Hoàng Gia Đỏ (3D Wax Seal Break)</option>
                  <option value="envelope-classic">Phong bì 3D Cổ Điển (Opening Envelope)</option>
                  <option value="envelope-blush">Phong bì 3D Hồng Phấn (Blush Floral)</option>
                  <option value="curtain">Màn Rèm Đôi Mở Cảnh (Double Curtain)</option>
                </select>
              </div>
              <div style="display:flex;gap:12px;margin-top:8px;">
                <button type="submit" class="home-intro-primary" style="flex:1;justify-content:center;border:none;cursor:pointer;">
                  Tạo &amp; Xuất bản thiệp ngay →
                </button>
                <a href="/mau-thiep/template/${tpl.rawId}" class="home-intro-secondary" style="padding:12px 18px;border:1px solid #dfcbcb;border-radius:999px;">
                  Xem thử mẫu
                </a>
              </div>
            </form>
          </section>

          <aside style="background:#fff5f3;border:1px solid #edddda;border-radius:28px;padding:24px;text-align:center;">
            <p style="font-size:12px;font-weight:700;letter-spacing:0.1em;color:#9d2f2f;text-transform:uppercase;margin-bottom:12px;">
              Mẫu đang chọn: ${tpl.name}
            </p>
            <div style="border-radius:20px;overflow:hidden;border:1px solid #ecdde2;background:#fff;height:520px;box-shadow:0 18px 36px rgba(68,32,50,0.12);">
              <iframe src="/template-embed/${tpl.kind}/${tpl.rawId}" title="Preview" style="width:100%;height:100%;border:0;"></iframe>
            </div>
          </aside>
        </div>
      </main>
      ${sharedFooterHtml}
    </div>
    <script>
      document.getElementById("ncd-create-card-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const body = Object.fromEntries(fd.entries());
        const res = await fetch("${API_BASE}/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.card?.slug) {
          window.location.href = "/w/" + data.card.slug;
        }
      });
    </script>
  </body>`;

  return renderDocument({
    title: "Tạo thiệp cưới online | Ngày Chung Đôi",
    bodyHtml: body
  });
}

function renderMyDashboardPage(cards) {
  const cardsListHtml = (cards || [])
    .map(
      (c) => `
      <div style="background:#fff;border:1px solid #edddda;border-radius:22px;padding:22px;display:grid;grid-template-columns:110px 1fr auto;gap:20px;align-items:center;box-shadow:0 10px 24px rgba(68,32,50,0.05);">
        <img src="${c.heroPhotoUrl}" alt="${c.title}" style="width:110px;height:155px;object-fit:cover;border-radius:14px;border:1px solid #ecdde2;" />
        <div>
          <span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;background:#eaf5ee;color:#30735b;margin-bottom:6px;">ĐÃ XUẤT BẢN</span>
          <h2 style="font-size:19px;font-weight:700;color:#1f1f27;">${c.title}</h2>
          <p style="font-size:13px;color:#625960;margin-top:4px;">Ngày cưới: ${c.weddingDate} · ${c.venueName}</p>
          <p style="font-size:12.5px;color:#9d2f2f;margin-top:6px;">
            Link thiệp: <a href="/w/${c.slug}" style="text-decoration:underline;font-weight:600;">/w/${c.slug}</a>
            &nbsp;·&nbsp; Link khách mời mẫu: <a href="/${c.slug}/for/ban-huy" style="text-decoration:underline;font-weight:600;">/${c.slug}/for/ban-huy</a>
          </p>
          <div style="display:flex;gap:16px;margin-top:12px;font-size:12.5px;color:#1f1f27;font-weight:600;">
            <span>✓ ${c.stats?.rsvpCount || 3} phản hồi RSVP (${c.stats?.attendingCount || 5} khách tham dự)</span>
            <span>♥ ${c.stats?.wishCount || 5} lời chúc lưu bút</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <a href="/w/${c.slug}" class="home-intro-primary" style="padding:9px 18px;font-size:13px;text-align:center;">Xem thiệp</a>
          <a href="/card/create/form?template=${c.templateId || "bmmd8nf8vm1i"}" style="padding:9px 18px;font-size:13px;border:1px solid #dfcbcb;border-radius:999px;text-align:center;color:#1f1f27;font-weight:600;">Chỉnh sửa</a>
        </div>
      </div>
    `
    )
    .join("");

  const body = `<body>
    <div class="site-font flex min-h-screen flex-col bg-[#f7f7f9] text-[#1f1f27]">
      ${sharedHeaderHtml}
      <main class="home-fixed-main flex-1">
        <div style="max-width:1080px;margin:0 auto;padding:40px 20px 72px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;flex-wrap:wrap;gap:16px;">
            <div>
              <p class="home-section-kicker">QUẢN LÝ THIỆP CƯỚI &amp; KHÁCH MỜI</p>
              <h1 style="font-size:30px;font-weight:700;letter-spacing:-0.8px;margin-top:6px;">Thiệp của tôi</h1>
            </div>
            <a href="/card/create" class="home-intro-primary">+ Tạo thiệp mới miễn phí</a>
          </div>
          <div style="display:grid;gap:18px;">
            ${cardsListHtml}
          </div>
        </div>
      </main>
      ${sharedFooterHtml}
    </div>
  </body>`;

  return renderDocument({
    title: "Thiệp của tôi | Ngày Chung Đôi",
    bodyHtml: body
  });
}

function renderAuthPage(mode = "login") {
  const isLogin = mode === "login";
  const body = `<body>
    <div class="site-font flex min-h-screen flex-col bg-[#f7f7f9] text-[#1f1f27]">
      ${sharedHeaderHtml}
      <main class="home-fixed-main flex-1" style="display:flex;align-items:center;justify-content:center;padding:48px 20px;">
        <div style="width:100%;max-width:440px;background:#fff;border:1px solid #edddda;border-radius:28px;padding:36px 32px;box-shadow:0 20px 44px rgba(68,32,50,0.07);">
          <p class="home-section-kicker" style="text-align:center;">NGÀY CHUNG ĐÔI</p>
          <h1 style="font-size:26px;font-weight:700;text-align:center;margin:10px 0 8px;">
            ${isLogin ? "Đăng nhập tài khoản" : "Đăng ký tài khoản miễn phí"}
          </h1>
          <p style="font-size:13.5px;color:#625960;text-align:center;margin-bottom:24px;">
            Quản lý thiệp cưới, danh sách khách mời và lời chúc lưu bút.
          </p>
          <form id="ncd-auth-form" style="display:grid;gap:14px;">
            ${
              !isLogin
                ? `<div>
                    <label style="display:block;font-size:12.5px;font-weight:600;margin-bottom:6px;">Họ và tên</label>
                    <input name="name" required placeholder="Thanh Phong & Thuý Kiều" style="width:100%;padding:11px 14px;border:1px solid #dfcbcb;border-radius:12px;font-size:14px;" />
                  </div>`
                : ""
            }
            <div>
              <label style="display:block;font-size:12.5px;font-weight:600;margin-bottom:6px;">Email</label>
              <input type="email" name="email" required value="demo@ngaychungdoi.com" style="width:100%;padding:11px 14px;border:1px solid #dfcbcb;border-radius:12px;font-size:14px;" />
            </div>
            <div>
              <label style="display:block;font-size:12.5px;font-weight:600;margin-bottom:6px;">Mật khẩu</label>
              <input type="password" name="password" required value="demo123" style="width:100%;padding:11px 14px;border:1px solid #dfcbcb;border-radius:12px;font-size:14px;" />
            </div>
            <button type="submit" class="home-intro-primary" style="width:100%;justify-content:center;border:none;cursor:pointer;margin-top:6px;">
              ${isLogin ? "Đăng nhập" : "Tạo tài khoản"}
            </button>
          </form>
          <p style="text-align:center;font-size:13px;color:#625960;margin-top:20px;">
            ${
              isLogin
                ? `Chưa có tài khoản? <a href="/register" style="color:#9d2f2f;font-weight:600;">Đăng ký ngay</a>`
                : `Đã có tài khoản? <a href="/login" style="color:#9d2f2f;font-weight:600;">Đăng nhập</a>`
            }
          </p>
        </div>
      </main>
      ${sharedFooterHtml}
    </div>
    <script>
      document.getElementById("ncd-auth-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const endpoint = ${isLogin ? '"/auth/login"' : '"/auth/signup"'};
        await fetch("${API_BASE}" + endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(fd.entries()))
        });
        window.location.href = "/my/card";
      });
    </script>
  </body>`;

  return renderDocument({
    title: `${isLogin ? "Đăng nhập" : "Đăng ký"} | Ngày Chung Đôi`,
    bodyHtml: body
  });
}

async function resolveLocalApiData(urlPath, fallback) {
  try {
    await ensureSupabaseHydrated();
    const db = getDb();
    const u = new URL(urlPath, "http://localhost");
    if (u.pathname === "/files/templates") {
      return { templates: db.templates || ALL_TEMPLATES };
    }
    if (u.pathname.startsWith("/files/templates/")) {
      const id = decodeURIComponent(u.pathname.replace("/files/templates/", "")).replace(/^(form:|canvas:)/, "");
      const guestSlug = u.searchParams.get("guest");
      return { card: enrichCard(findCard(id), guestSlug) };
    }
    if (u.pathname === "/cards/mine" || u.pathname === "/cards") {
      return { cards: (db.cards || []).map((c) => enrichCard(c)) };
    }
    return fallback;
  } catch {
    return fallback;
  }
}

async function fetchBackendJson(urlPath, fallback) {
  if (API_BASE.startsWith("/")) {
    return resolveLocalApiData(urlPath, fallback);
  }
  try {
    const res = await fetch(`${API_BASE}${urlPath}`);
    if (!res.ok) return resolveLocalApiData(urlPath, fallback);
    return await res.json();
  } catch {
    return resolveLocalApiData(urlPath, fallback);
  }
}

async function handleWebRequest(req, res) {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  // 0. Delegate /api/* directly to Backend REST API handler
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return handleApiRequest(req, res);
  }

  // 1. Static assets from apps/web/public
  const cleanStaticPath = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "");
  const candidateFile = path.join(PUBLIC_DIR, cleanStaticPath);
  if (pathname !== "/" && fs.existsSync(candidateFile) && fs.statSync(candidateFile).isFile()) {
    const ext = path.extname(candidateFile).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=3600"
    });
    return fs.createReadStream(candidateFile).pipe(res);
  }

  if (pathname === "/favicon.svg" || pathname === "/favicon.ico") {
    res.writeHead(200, { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" });
    return res.end(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#9d2f2f"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="34" fill="#f3dfb2">囍</text></svg>`);
  }

  if (pathname.startsWith("/_next/static/") || pathname.startsWith("/assets/")) {
    res.writeHead(302, {
      Location: `https://ngaychungdoi.com${pathname}`,
      "Cache-Control": "public, max-age=86400"
    });
    return res.end();
  }

  // 2. Homepage (/)
  if (pathname === "/") {
    const html = renderDocument({
      title: "Tạo Thiệp Cưới Online Miễn Phí - Mẫu Đẹp, Sang Trọng | Ngày Chung Đôi",
      description: "Tạo thiệp cưới online miễn phí với bộ sưu tập mẫu thiệp sang trọng, hiệu ứng mở thiệp 3D, nhạc nền, xác nhận tham dự RSVP và sổ lưu bút.",
      bodyHtml: `<body>${homeBodyHtml}</body>`
    });
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(html);
  }

  // 3. Template Catalog (/mau-thiep)
  if (pathname === "/mau-thiep") {
    const mode = parsedUrl.searchParams.get("type") || "all";
    const apiData = await fetchBackendJson("/files/templates", { templates: ALL_TEMPLATES });
    const html = renderCatalogPage(apiData.templates || ALL_TEMPLATES, mode);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(html);
  }

  // 4. Sample Template / Live Wedding Card Viewer
  const tplMatch = pathname.match(/^\/mau-thiep\/(?:canvas-)?template\/([^/]+)$/);
  const embedMatch = pathname.match(/^\/template-embed\/([^/]+)\/([^/]+)$/);
  const wMatch = pathname.match(/^\/w\/([^/]+)$/);
  const guestMatch = pathname.match(/^\/([^/]+)\/for\/([^/]+)$/);

  if (tplMatch || embedMatch || wMatch || guestMatch) {
    const rawId = decodeURIComponent(
      tplMatch ? tplMatch[1] : embedMatch ? embedMatch[2] : wMatch ? wMatch[1] : guestMatch[1]
    );
    const guestSlug = guestMatch ? decodeURIComponent(guestMatch[2]) : parsedUrl.searchParams.get("guest");
    const apiData = await fetchBackendJson(
      `/files/templates/${encodeURIComponent(rawId)}${guestSlug ? `?guest=${encodeURIComponent(guestSlug)}` : ""}`,
      { card: SAMPLE_CARD_BMMD8NF8VM1I }
    );
    const html = renderCardPage(apiData.card || SAMPLE_CARD_BMMD8NF8VM1I, guestSlug);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(html);
  }

  // 5. 3D LED Wedding Stage (/man-hinh-led-dam-cuoi)
  if (pathname === "/man-hinh-led-dam-cuoi") {
    const html = renderDocument({
      title: "Màn Hình LED Đám Cưới Online - Phông Nền Sân Khấu 3D | Ngày Chung Đôi",
      description: "Biến màn hình sân khấu tiệc cưới thành không gian nghệ thuật 3D với hiệu ứng ánh sáng, ngân hà và tên cô dâu chú rể.",
      bodyHtml: ledStageBodyHtml
    });
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(html);
  }

  // 6. Card Creator / Editor (/card/create/form, /card/create, /card/create/canvas, /create-card, /builder/:id)
  const builderMatch = pathname.match(/^\/builder\/([^/]+)$/);
  if (
    pathname === "/card/create/form" ||
    pathname === "/card/create" ||
    pathname === "/card/create/canvas" ||
    pathname === "/create-card" ||
    builderMatch
  ) {
    const tplId =
      (builderMatch ? decodeURIComponent(builderMatch[1]) : null) ||
      parsedUrl.searchParams.get("template") ||
      parsedUrl.searchParams.get("id") ||
      "bmmd8nf8vm1i";
    const apiData = await fetchBackendJson(`/files/templates/${encodeURIComponent(tplId)}`, {
      card: SAMPLE_CARD_BMMD8NF8VM1I
    });
    const html = renderCardEditorPage({
      templateId: tplId,
      cardData: apiData.card || SAMPLE_CARD_BMMD8NF8VM1I,
      apiBase: API_BASE
    });
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(html);
  }

  // 7. My Cards Dashboard (/my, /my/card, /my/overview)
  if (pathname === "/my" || pathname.startsWith("/my/")) {
    const apiData = await fetchBackendJson("/cards/mine", { cards: [SAMPLE_CARD_BMMD8NF8VM1I] });
    const html = renderMyDashboardPage(apiData.cards);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(html);
  }

  // 8. Login & Register (/login, /register)
  if (pathname === "/login" || pathname === "/register") {
    const html = renderAuthPage(pathname === "/login" ? "login" : "register");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(html);
  }

  // 9. FAQ, Support, Full Service, Video Dam Ngo fallback pages
  const html = renderDocument({
    title: "Ngày Chung Đôi — Thiệp cưới online miễn phí",
    bodyHtml: `<body>${homeBodyHtml}</body>`
  });
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  return res.end(html);
}

const server = http.createServer(handleWebRequest);

if (require.main === module && !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`[ngaychungdoi-web] Frontend Server listening on http://localhost:${PORT}`);
  });
}

module.exports = {
  server,
  handleWebRequest
};
