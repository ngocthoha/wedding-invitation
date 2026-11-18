const fs = require("fs");
const path = require("path");

const sampleCardBodyHtml = fs.readFileSync(
  path.join(__dirname, "templates", "sample-card-body.html"),
  "utf8"
);

// Extract the inner .phone HTML from sample-card-body.html for the live left-column phone preview
function extractLivePhoneHtml() {
  const startToken = '<div class="phone">';
  const endToken = '<div class="template-preview-create">';
  const startIdx = sampleCardBodyHtml.indexOf(startToken);
  const endIdx = sampleCardBodyHtml.indexOf(endToken);
  if (startIdx === -1 || endIdx === -1) {
    return '<div class="phone"><div class="scroll-view no-aos"></div></div>';
  }
  let rawPhone = sampleCardBodyHtml.slice(startIdx, endIdx);
  // Remove the trailing </div></div> that closed .drawer-clip and .wrap.show (keeping .phone's closing </div>)
  rawPhone = rawPhone.replace(/<\/div><\/div>\s*$/, "");
  // Make scroll-view immediately visible & scrollable inside the editor phone preview
  rawPhone = rawPhone
    .replace('class="scroll-view opening-content-hidden scroll-view--public" style="overflow: hidden;"', 'class="scroll-view no-aos" id="editor-phone-scroll-view"')
    .replace('class="opening-animation-splash opening-invitation-splash"', 'class="opening-animation-splash opening-invitation-splash" id="editor-phone-opening-splash" style="display:none;position:absolute;inset:0;z-index:1002;"')
    .replace('style="position: fixed; inset: 0px; z-index: 999999;', 'style="position: absolute; inset: 0px; z-index: 1002;');
  return rawPhone;
}

const SLIDING_DOOR_SVG_PREVIEW =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 280"><rect width="90" height="280" fill="#2A4A3C"/><rect x="90" width="90" height="280" fill="#1E352B"/><line x1="90" y1="0" x2="90" y2="280" stroke="#D9C4A0" stroke-width="1.5" stroke-opacity="0.45"/><circle cx="90" cy="140" r="24" fill="#D9C4A0"/><text x="90" y="147" text-anchor="middle" font-size="20" fill="#1E352B" font-family="serif">囍</text></svg>`
  );

function renderCardEditorPage({ templateId = "bmmd8nf8vm1i", cardData = {}, apiBase = "http://localhost:3008" }) {
  const livePhoneHtml = extractLivePhoneHtml();

  return `<!DOCTYPE html>
<html lang="vi" class="card-create-rem-html basic" data-card-public-ready="true">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Chỉnh sửa thiệp cưới — ${cardData.groomName || "THANH PHONG"} &amp; ${cardData.brideName || "THUÝ KIỀU"} | Ngày Chung Đôi</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400..700;1,400..700&family=EB+Garamond:ital,wght@0,400..700;1,400..700&family=Gowun+Dodum&family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400..700;1,400..700&family=Noto+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/ngaychungdoi-all.css" />
  <style>
    html.card-create-rem-html { --font-size: 9px; --f-size: 0rem; font-size: 10px; }
    body { margin: 0; font-family: 'Noto Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #eee; color: #1f1f27; }
    .card-editor-root .section-form .is-open:checked ~ .form-list {
      max-height: 6000px !important;
      opacity: 1;
      padding: 20px 28px 26px;
    }
    .card-editor-root .preview-component .phone {
      box-shadow: 0 14px 38px rgba(0, 0, 0, 0.12);
      border-radius: 18px;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .card-editor-root .type-wrap.opening-effect-type-wrap {
      display: grid !important;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 10px;
    }
    .card-editor-root .type-wrap.opening-effect-type-wrap .frm_item {
      width: 100% !important;
    }
    .card-editor-root .type-wrap.opening-effect-type-wrap .frm_item label {
      aspect-ratio: 100 / 154;
      background: #f6f6f7;
    }
    .card-editor-root .type-wrap.opening-effect-type-wrap .frm_item label img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .card-editor-root .opening-invitation-preview--inline {
      background: linear-gradient(to right bottom, rgb(26, 5, 5), rgb(45, 0, 2), rgb(62, 0, 1));
      box-shadow: 0 8px 20px rgba(62, 0, 1, 0.22);
      padding: 10px !important;
      width: 150px !important;
      flex: 0 0 150px !important;
      aspect-ratio: 63 / 102;
    }
    .card-editor-root .img-overlay-change-btn {
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.68);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 500;
      line-height: 1.3;
      white-space: nowrap;
      cursor: pointer;
      z-index: 3;
    }
    .card-editor-root .ql-toolbar-mock {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      background: #fff;
      border: 1px solid #e2e2e5;
      border-bottom: 1px solid #eee;
      border-radius: 8px 8px 0 0;
      font-size: 13px;
      color: #333;
    }
    .card-editor-root .ql-toolbar-mock button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px 5px;
      border-radius: 4px;
      font-size: 13px;
      color: #333;
    }
    .card-editor-root .ql-toolbar-mock button:hover {
      background: #f0f0f2;
    }
    .card-editor-root .ql-editor-textarea {
      border-radius: 0 0 8px 8px !important;
      border: 1px solid #e2e2e5 !important;
      border-top: none !important;
      background: #fff !important;
      min-height: 92px !important;
    }
    .ncd-floating-quick-pins {
      position: fixed;
      right: 18px;
      top: 110px;
      bottom: 32px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      z-index: 1050;
      pointer-events: none;
    }
    .ncd-floating-quick-pin {
      pointer-events: auto;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #141418;
      color: #fff;
      border: 2px solid rgba(255,255,255,0.85);
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.18s ease, background 0.18s ease;
    }
    .ncd-floating-quick-pin:hover {
      transform: scale(1.1);
      background: #9d2f2f;
    }
    .ncd-floating-quick-pin svg {
      width: 15px;
      height: 15px;
    }
    [data-aos] {
      opacity: 1 !important;
      transform: none !important;
    }
    /* Phone section edit overlay buttons */
    .phone-section-edit-overlay {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 20;
      pointer-events: auto;
    }
    .phone-section-edit-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 9px;
      background: rgba(26, 26, 26, 0.80);
      color: #fff;
      border: 1.5px solid rgba(255,255,255,0.55);
      border-radius: 20px;
      font-size: 10px;
      font-weight: 600;
      font-family: 'Noto Sans', sans-serif;
      cursor: pointer;
      white-space: nowrap;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      transition: background 0.15s, transform 0.12s;
      letter-spacing: 0.01em;
      line-height: 1.3;
      box-shadow: 0 2px 8px rgba(0,0,0,0.22);
    }
    .phone-section-edit-btn:hover {
      background: rgba(157, 47, 47, 0.92);
      transform: scale(1.06);
    }
    /* Highlight active phone section when linked */
    .phone-section-active-highlight {
      outline: 2px solid rgba(135, 54, 54, 0.55) !important;
      outline-offset: 2px;
      border-radius: 3px;
    }
    /* Phone sections need position:relative for overlay to anchor */
    #editor-phone-scroll-view .card-preview-section-root {
      position: relative;
    }
  </style>
</head>
<body>
  <div class="card-editor-root">
    <div class="page">
      <!-- Fixed Top Header -->
      <header class="card-editor-header">
        <div class="inner">
          <h1>
            <a href="/" title="Về trang chủ Ngày Chung Đôi" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:#1a1a1a;">
              <img src="/assets/logo/v2/ngay-chung-doi-original-logo.webp" alt="Ngày Chung Đôi" style="height:34px;width:auto;" />
            </a>
          </h1>
          <div class="tool">
            <button type="button" class="prev" id="editor-header-preview-btn">Xem trước</button>
            <button type="button" class="save" id="editor-header-save-btn">Lưu thiệp</button>
          </div>
        </div>
      </header>

      <div class="card-editor-body">
        <!-- Save confirmation banner -->
        <div class="card-save-notice" id="editor-save-notice" style="display:none;">
          <span>✓ Đã lưu toàn bộ thay đổi của thiệp cưới!</span>
          <a href="/mau-thiep/template/${templateId}" target="_blank" id="editor-save-notice-link">Mở xem thiệp thực tế ↗</a>
          <span class="card-save-notice__meta" id="editor-save-notice-meta">Đã đồng bộ với máy chủ</span>
        </div>

        <main>
          <div class="inner" id="editor-main-scroll-container">
            <!-- Left Sticky Column: Live Interactive Mobile Card Preview (390px) -->
            <div class="wrap edit">
              <div class="preview-component" id="editor-preview-component">
                ${livePhoneHtml}
              </div>
            </div>

            <!-- Right Column: 23 Production Collapsible Form Sections (600px) -->
            <div class="edit-form-list" id="editor-form-list">

              <!-- 1. Giao diện -->
              <div class="section-form" data-section-key="theme" id="form-sec-theme">
                <input type="checkbox" class="is-open" id="open-sec-theme" checked hidden />
                <div class="header" data-toggle-section="open-sec-theme" data-phone-target="section-main">
                  <div class="title">
                    <span>Giao diện</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item theme-template-setting">
                    <label>Mẫu thiệp</label>
                    <div class="wrap">
                      <button type="button" class="theme-template-change-card" id="btn-change-template-card" style="width:100%;display:flex;align-items:center;gap:12px;padding:10px 12px;background:#fafafa;border:1px solid #e5e5e8;border-radius:10px;cursor:pointer;text-align:left;">
                        <img src="https://assets.ngaychungdoi.com/templates/e0f86e21-15c0-4120-a820-2631a1e2bdbf.jpg" alt="Mẫu Đỏ 2" style="width:44px;height:60px;object-fit:cover;border-radius:6px;flex-shrink:0;" />
                        <div style="flex:1;min-width:0;">
                          <div style="font-size:13px;font-weight:600;color:#1a1a1a;">Mẫu Đỏ 2 (Song Hỷ Hoàng Gia)</div>
                          <div style="font-size:12px;color:#777;margin-top:2px;">Nhấn để chuyển sang mẫu thiệp khác</div>
                        </div>
                      </button>
                    </div>
                  </li>
                  <li class="list-item">
                    <label>Phông chữ</label>
                    <div class="wrap font-select-wrap">
                      <select id="ft-type" aria-label="Chọn phông chữ">
                        <option value="ft-gowundodum" selected>Gowun Dodum (Mặc định)</option>
                        <option value="ft-notoserif">Noto Serif (Cổ điển)</option>
                        <option value="ft-ridibatang">Ridi Batang (Trang trọng)</option>
                        <option value="ft-notosans">Noto Sans (Hiện đại)</option>
                      </select>
                      <select id="ft-size" aria-label="Cỡ chữ">
                        <option value="small">Cỡ chữ: Nhỏ</option>
                        <option value="basic" selected>Cỡ chữ: Vừa</option>
                        <option value="big">Cỡ chữ: Lớn</option>
                        <option value="big2">Cỡ chữ: Rất lớn</option>
                      </select>
                    </div>
                  </li>
                  <li class="list-item row--top3">
                    <label>Màu nền</label>
                    <div class="wrap theme-background-setting__wrap" style="flex-direction:column;align-items:flex-start;gap:10px;">
                      <div class="radio-group">
                        <div class="radio-item">
                          <input type="radio" name="themeBgMode" id="bg-mode-image" value="image" checked hidden />
                          <label for="bg-mode-image">Hoa văn nền</label>
                        </div>
                        <div class="radio-item">
                          <input type="radio" name="themeBgMode" id="bg-mode-solid" value="solid" hidden />
                          <label for="bg-mode-solid">Màu đơn sắc</label>
                        </div>
                      </div>
                      <div class="radio-group theme-background-colors" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                        <div class="radio-item">
                          <input type="radio" name="themeBgColor" id="bg-col-1" value="#FAFAFA" checked hidden />
                          <label for="bg-col-1" class="color-label" title="Trắng kem"><span class="dot" style="background:#FAFAFA;"></span></label>
                        </div>
                        <div class="radio-item">
                          <input type="radio" name="themeBgColor" id="bg-col-2" value="#FFF8F2" hidden />
                          <label for="bg-col-2" class="color-label" title="Kem ấm"><span class="dot" style="background:#FFF8F2;"></span></label>
                        </div>
                        <div class="radio-item">
                          <input type="radio" name="themeBgColor" id="bg-col-3" value="#FDF2F2" hidden />
                          <label for="bg-col-3" class="color-label" title="Hồng phấn"><span class="dot" style="background:#FDF2F2;"></span></label>
                        </div>
                        <div class="radio-item">
                          <input type="radio" name="themeBgColor" id="bg-col-4" value="#F4EFE6" hidden />
                          <label for="bg-col-4" class="color-label" title="Vàng lụa"><span class="dot" style="background:#F4EFE6;"></span></label>
                        </div>
                        <div class="radio-item">
                          <input type="radio" name="themeBgColor" id="bg-col-5" value="#3E0001" hidden />
                          <label for="bg-col-5" class="color-label" title="Đỏ rượu"><span class="dot" style="background:#3E0001;"></span></label>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li class="list-item">
                    <label>Màu nhấn</label>
                    <div class="wrap">
                      <div class="radio-group theme-page-text-colors" style="display:flex;align-items:center;gap:6px;">
                        <div class="radio-item">
                          <input type="radio" name="themeEmpColor" id="emp-col-1" value="#873636" checked hidden />
                          <label for="emp-col-1" class="color-label"><span class="dot" style="background:#873636;"></span></label>
                        </div>
                        <div class="radio-item">
                          <input type="radio" name="themeEmpColor" id="emp-col-2" value="#1a1a1a" hidden />
                          <label for="emp-col-2" class="color-label"><span class="dot" style="background:#1a1a1a;"></span></label>
                        </div>
                        <div class="radio-item">
                          <input type="radio" name="themeEmpColor" id="emp-col-3" value="#964b00" hidden />
                          <label for="emp-col-3" class="color-label"><span class="dot" style="background:#964b00;"></span></label>
                        </div>
                        <div class="radio-item">
                          <input type="radio" name="themeEmpColor" id="emp-col-4" value="#c88a7b" hidden />
                          <label for="emp-col-4" class="color-label"><span class="dot" style="background:#c88a7b;"></span></label>
                        </div>
                        <div class="radio-item">
                          <input type="radio" name="themeEmpColor" id="emp-col-5" value="#5b7053" hidden />
                          <label for="emp-col-5" class="color-label"><span class="dot" style="background:#5b7053;"></span></label>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li class="list-item">
                    <label>Hiệu ứng nền</label>
                    <div class="wrap">
                      <div class="radio-group">
                        <div class="radio-item"><input type="radio" name="bgParticle" id="bgp-none" value="none" checked hidden /><label for="bgp-none">Không</label></div>
                        <div class="radio-item"><input type="radio" name="bgParticle" id="bgp-cherry" value="cherry-bg" hidden /><label for="bgp-cherry">Hoa anh đào</label></div>
                        <div class="radio-item"><input type="radio" name="bgParticle" id="bgp-snow" value="snow-bg" hidden /><label for="bgp-snow">Tuyết</label></div>
                        <div class="radio-item"><input type="radio" name="bgParticle" id="bgp-leaf" value="leaf-bg" hidden /><label for="bgp-leaf">Lá</label></div>
                        <div class="radio-item"><input type="radio" name="bgParticle" id="bgp-forsythia" value="forsythia-bg" hidden /><label for="bgp-forsythia">Hoa vàng</label></div>
                        <div class="radio-item"><input type="radio" name="bgParticle" id="bgp-gypsophila" value="gypsophila-bg" hidden /><label for="bgp-gypsophila">Hoa baby</label></div>
                      </div>
                    </div>
                  </li>
                  <li class="list-item">
                    <label>Tự động cuộn</label>
                    <div class="wrap">
                      <div class="radio-group">
                        <div class="radio-item"><input type="radio" name="autoScrollSpeed" id="as-off" value="0" checked hidden /><label for="as-off">Tắt</label></div>
                        <div class="radio-item"><input type="radio" name="autoScrollSpeed" id="as-slow" value="1" hidden /><label for="as-slow">Chậm</label></div>
                        <div class="radio-item"><input type="radio" name="autoScrollSpeed" id="as-mid" value="2" hidden /><label for="as-mid">Vừa</label></div>
                        <div class="radio-item"><input type="radio" name="autoScrollSpeed" id="as-fast" value="3" hidden /><label for="as-fast">Nhanh</label></div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- 2. Thông tin cơ bản -->
              <div class="section-form" data-section-key="basic" id="form-sec-basic">
                <input type="checkbox" class="is-open" id="open-sec-basic" checked hidden />
                <div class="header" data-toggle-section="open-sec-basic" data-phone-target="section-main">
                  <div class="title">
                    <span>Thông tin cơ bản</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item" style="grid-template-columns:1fr;">
                    <div class="basic-info-block">
                      <div class="person-group">
                        <div class="person-title">Chú rể</div>
                        <div class="person-row">
                          <input type="text" id="input-groom-last" placeholder="Họ" value="NGUYỄN" />
                          <input type="text" id="input-groom-middle" placeholder="Tên đệm &amp; Tên" value="THANH PHONG" />
                          <select id="input-groom-rank" aria-label="Thứ bậc chú rể">
                            <option value="TRƯỞNG NAM" selected>Trưởng nam</option>
                            <option value="THỨ NAM">Thứ nam</option>
                            <option value="ÚT NAM">Út nam</option>
                            <option value="QUÝ NAM">Quý nam</option>
                          </select>
                        </div>
                        <div class="parent-row">
                          <label>Ông</label>
                          <input type="text" id="input-groom-father" placeholder="Họ tên bố chú rể" value="NGUYỄN THANH TÂM" />
                          <input type="text" placeholder="SĐT" value="0912345678" />
                          <label class="deceased"><input type="checkbox" /> Đã mất</label>
                        </div>
                        <div class="parent-row">
                          <label>Bà</label>
                          <input type="text" id="input-groom-mother" placeholder="Họ tên mẹ chú rể" value="TRỊNH THỊ LÝ" />
                          <input type="text" placeholder="SĐT" value="0912345679" />
                          <label class="deceased"><input type="checkbox" /> Đã mất</label>
                        </div>
                      </div>

                      <div class="divide-line"></div>

                      <div class="person-group">
                        <div class="person-title">Cô dâu</div>
                        <div class="person-row">
                          <input type="text" id="input-bride-last" placeholder="Họ" value="NGUYỄN" />
                          <input type="text" id="input-bride-middle" placeholder="Tên đệm &amp; Tên" value="THUÝ KIỀU" />
                          <select id="input-bride-rank" aria-label="Thứ bậc cô dâu">
                            <option value="TRƯỞNG NỮ">Trưởng nữ</option>
                            <option value="THỨ NỮ">Thứ nữ</option>
                            <option value="ÚT NỮ" selected>Út nữ</option>
                            <option value="QUÝ NỮ">Quý nữ</option>
                          </select>
                        </div>
                        <div class="parent-row">
                          <label>Ông</label>
                          <input type="text" id="input-bride-father" placeholder="Họ tên bố cô dâu" value="NGUYỄN VĂN MINH" />
                          <input type="text" placeholder="SĐT" value="0987654321" />
                          <label class="deceased"><input type="checkbox" /> Đã mất</label>
                        </div>
                        <div class="parent-row">
                          <label>Bà</label>
                          <input type="text" id="input-bride-mother" placeholder="Họ tên mẹ cô dâu" value="LÊ THỊ HẢI YẾN" />
                          <input type="text" placeholder="SĐT" value="0987654322" />
                          <label class="deceased"><input type="checkbox" /> Đã mất</label>
                        </div>
                      </div>

                      <div class="divide-line"></div>

                      <div class="option-row">
                        <span>Thứ tự tên</span>
                        <div style="display:flex;gap:16px;">
                          <label><input type="radio" name="coupleOrder" value="groom-first" checked /> Chú rể trước</label>
                          <label><input type="radio" name="coupleOrder" value="bride-first" /> Cô dâu trước</label>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- 3. Màn hình chính -->
              <div class="section-form" data-section-key="main" id="form-sec-main">
                <input type="checkbox" class="is-open" id="open-sec-main" checked hidden />
                <div class="header" data-toggle-section="open-sec-main" data-phone-target="section-main">
                  <div class="title">
                    <span>Màn hình chính</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item" style="grid-template-columns:1fr;">
                    <div class="type-container" style="width:100%;">
                      <div class="type-preview">
                        <div class="img-wrap" style="background-image:url('https://assets.ngaychungdoi.com/templates/e0f86e21-15c0-4120-a820-2631a1e2bdbf.jpg');"></div>
                        <button type="button" class="select-design-btn">Kiểu 9 · Đổi thiết kế</button>
                      </div>
                    </div>
                  </li>
                  <li class="list-item row--top3">
                    <label>Ảnh</label>
                    <div class="wrap">
                      <div class="img-uploader">
                        <div class="img_attach_box has-preview" id="main-hero-photo-box" style="background-image:url('https://assets.ngaychungdoi.com/templates/e0f86e21-15c0-4120-a820-2631a1e2bdbf.jpg');border-radius:8px;">
                          <button type="button" class="img-overlay-change-btn" data-change-photo="main-hero">Đổi ảnh</button>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li class="list-item">
                    <label>Màu chữ</label>
                    <div class="wrap">
                      <div class="radio-group" style="display:flex;gap:6px;">
                        <div class="radio-item"><input type="radio" name="mainTxtColor" id="mtc-white" value="#FFFFFF" checked hidden /><label for="mtc-white" class="color-label"><span class="dot" style="background:#FFFFFF;"></span></label></div>
                        <div class="radio-item"><input type="radio" name="mainTxtColor" id="mtc-gold" value="#F7E600" hidden /><label for="mtc-gold" class="color-label"><span class="dot" style="background:#F7E600;"></span></label></div>
                        <div class="radio-item"><input type="radio" name="mainTxtColor" id="mtc-black" value="#1A1A1A" hidden /><label for="mtc-black" class="color-label"><span class="dot" style="background:#1A1A1A;"></span></label></div>
                        <div class="radio-item"><input type="radio" name="mainTxtColor" id="mtc-red" value="#873636" hidden /><label for="mtc-red" class="color-label"><span class="dot" style="background:#873636;"></span></label></div>
                      </div>
                    </div>
                  </li>
                  <li class="list-item">
                    <label>Hiệu ứng</label>
                    <div class="wrap">
                      <div class="radio-group">
                        <div class="radio-item"><input type="radio" name="mainParticle" id="mp-none" value="none" hidden /><label for="mp-none">Không</label></div>
                        <div class="radio-item"><input type="radio" name="mainParticle" id="mp-snow" value="snow" checked hidden /><label for="mp-snow">Tuyết rơi</label></div>
                        <div class="radio-item"><input type="radio" name="mainParticle" id="mp-petal" value="petal" hidden /><label for="mp-petal">Cánh hoa</label></div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- 4. Lời ngỏ -->
              <div class="section-form" data-section-key="intro" id="form-sec-intro">
                <input type="checkbox" class="is-open" id="open-sec-intro" checked hidden />
                <div class="header" data-toggle-section="open-sec-intro" data-phone-target="section-intro">
                  <div class="title">
                    <input type="checkbox" class="section-title-toggle" data-preview-target="section-intro" checked />
                    <span>Lời ngỏ</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item">
                    <label>Tiêu đề</label>
                    <div class="wrap">
                      <input type="text" id="input-intro-title" value="Thư Mời" />
                    </div>
                  </li>
                  <li class="list-item row--top3">
                    <label>Nội dung</label>
                    <div class="wrap description-wrapper">
                      <button type="button" class="sample-btn" id="btn-sample-intro">Chọn mẫu lời ngỏ</button>
                      <div class="editor-wrap">
                        <div class="ql-toolbar-mock">
                          <button type="button" title="In đậm"><b>B</b></button>
                          <button type="button" title="In nghiêng"><i>I</i></button>
                          <button type="button" title="Gạch chân"><u>U</u></button>
                          <button type="button" title="Gạch ngang"><s>S</s></button>
                          <button type="button" title="Căn giữa">☰</button>
                        </div>
                        <textarea id="input-intro-body" class="ql-editor-textarea" rows="5">Sau một chặng đường tìm hiểu và yêu thương, chúng con đã quyết định cùng nhau xây dựng tổ ấm, chính thức bước vào hành trình mới của cuộc đời.
Trong niềm hạnh phúc của ngày trọng đại, chúng con trân trọng kính mời Quý khách đến tham dự Lễ Thành Hôn và chung vui cùng gia đình.
Sự hiện diện cùng những lời chúc phúc của Quý khách là niềm vinh hạnh, là món quà quý giá và ý nghĩa nhất dành cho chúng con trong ngày vui.</textarea>
                      </div>
                    </div>
                  </li>
                  <li class="list-item row--top3">
                    <label>Ảnh</label>
                    <div class="wrap">
                      <div class="img-uploader">
                        <div class="img_attach_box" style="border-radius:8px;">
                          <span class="filebtn plus"></span>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li class="list-item">
                    <label>Khoảng cách</label>
                    <div class="wrap">
                      <div class="radio-group">
                        <div class="radio-item"><input type="radio" name="introPad" id="ip-def" checked hidden /><label for="ip-def">Mặc định</label></div>
                        <div class="radio-item"><input type="radio" name="introPad" id="ip-cus" hidden /><label for="ip-cus">Tùy chỉnh</label></div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- 5. Hồ sơ cô dâu chú rể -->
              <div class="section-form" data-section-key="profile" id="form-sec-profile">
                <input type="checkbox" class="is-open" id="open-sec-profile" checked hidden />
                <div class="header" data-toggle-section="open-sec-profile" data-phone-target="section-profile">
                  <div class="title">
                    <input type="checkbox" class="section-title-toggle" data-preview-target="section-profile" checked />
                    <span>Hồ sơ cô dâu chú rể</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item">
                    <label>Tiêu đề</label>
                    <div class="wrap">
                      <input type="text" id="input-profile-title" value="Giới thiệu hai bên" />
                    </div>
                  </li>
                  <li class="list-item">
                    <label>Kiểu hiển thị</label>
                    <div class="wrap">
                      <div class="radio-group">
                        <div class="radio-item"><input type="radio" name="profileType" id="pt-basic" checked hidden /><label for="pt-basic">Cơ bản</label></div>
                        <div class="radio-item"><input type="radio" name="profileType" id="pt-card" hidden /><label for="pt-card">Thẻ</label></div>
                      </div>
                    </div>
                  </li>
                  <li class="list-item row--top3">
                    <label>Chú rể</label>
                    <div class="wrap person-fields">
                      <input type="text" value="THANH PHONG" id="input-profile-groom-name" />
                      <textarea rows="2" placeholder="Giới thiệu ngắn về chú rể...">Chàng trai ấm áp, chân thành và luôn dành trọn yêu thương cho gia đình.</textarea>
                      <div class="img-uploader">
                        <div class="img_attach_box has-preview" style="background-image:url('https://assets.ngaychungdoi.com/templates/f26ecf59-fbc0-43d3-b364-f9c48dab4e30.jpg');border-radius:8px;">
                          <button type="button" class="img-overlay-change-btn" data-change-photo="groom-profile">Đổi ảnh</button>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li class="list-item row--top3">
                    <label>Cô dâu</label>
                    <div class="wrap person-fields">
                      <input type="text" value="THUÝ KIỀU" id="input-profile-bride-name" />
                      <textarea rows="2" placeholder="Giới thiệu ngắn về cô dâu...">Cô gái dịu dàng, tinh tế, người giữ lửa hạnh phúc cho tổ ấm nhỏ.</textarea>
                      <div class="img-uploader">
                        <div class="img_attach_box has-preview" style="background-image:url('https://assets.ngaychungdoi.com/templates/576ee3a3-3db2-44a8-9643-81dac4698f79.jpg');border-radius:8px;">
                          <button type="button" class="img-overlay-change-btn" data-change-photo="bride-profile">Đổi ảnh</button>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- 6. Thông tin lễ cưới -->
              <div class="section-form" data-section-key="ceremony" id="form-sec-ceremony">
                <input type="checkbox" class="is-open" id="open-sec-ceremony" checked hidden />
                <div class="header" data-toggle-section="open-sec-ceremony" data-phone-target="section-wedding-ceremony-info">
                  <div class="title">
                    <input type="checkbox" class="section-title-toggle" data-preview-target="section-wedding-ceremony-info" checked />
                    <span>Thông tin lễ cưới</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item">
                    <label>Tiêu đề</label>
                    <div class="wrap"><input type="text" id="input-wci-title" value="THÔNG TIN LỄ CƯỚI" /></div>
                  </li>
                  <li class="list-item">
                    <label>Dòng báo tin</label>
                    <div class="wrap"><input type="text" id="input-wci-line1" value="TRÂN TRỌNG BÁO TIN" /></div>
                  </li>
                  <li class="list-item">
                    <label>Dòng phụ</label>
                    <div class="wrap"><input type="text" id="input-wci-line2" value="LỄ THÀNH HÔN CỦA CON CHÚNG TÔI" /></div>
                  </li>
                  <li class="list-item">
                    <label>Địa chỉ trai</label>
                    <div class="wrap"><input type="text" id="input-wci-addr-groom" value="Xóm 10 (Xuân Hồ mới) Xã Đại Huệ- Nghệ An" /></div>
                  </li>
                  <li class="list-item">
                    <label>Địa chỉ gái</label>
                    <div class="wrap"><input type="text" id="input-wci-addr-bride" value="Xóm 10 (Xuân Hồ mới) Xã Đại Huệ- Nghệ An" /></div>
                  </li>
                </ul>
              </div>

              <!-- 7. Thư mời lễ cưới -->
              <div class="section-form" data-section-key="invitation" id="form-sec-invitation">
                <input type="checkbox" class="is-open" id="open-sec-invitation" checked hidden />
                <div class="header" data-toggle-section="open-sec-invitation" data-phone-target="section-wedding-invitation">
                  <div class="title">
                    <input type="checkbox" class="section-title-toggle" data-preview-target="section-wedding-invitation" checked />
                    <span>Thư mời lễ cưới</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item">
                    <label>Tiêu đề</label>
                    <div class="wrap"><input type="text" id="input-wi-title" value="TRÂN TRỌNG KÍNH MỜI" /></div>
                  </li>
                  <li class="list-item">
                    <label>Lời mời tiệc</label>
                    <div class="wrap"><input type="text" id="input-wi-party-title" value="ĐẾN DỰ BỮA CƠM THÂN MẬT CHUNG VUI CÙNG GIA ĐÌNH CHÚNG TÔI" /></div>
                  </li>
                  <li class="list-item">
                    <label>Giờ tiệc</label>
                    <div class="wrap"><input type="text" id="input-wi-party-time" value="10:30" /></div>
                  </li>
                  <li class="list-item">
                    <label>Lễ cưới</label>
                    <div class="wrap"><input type="text" id="input-wi-ceremony-title" value="LỄ THÀNH HÔN" /></div>
                  </li>
                  <li class="list-item">
                    <label>Giờ lễ</label>
                    <div class="wrap"><input type="text" id="input-wi-ceremony-time" value="12:30" /></div>
                  </li>
                  <li class="list-item">
                    <label>Ngày âm lịch</label>
                    <div class="wrap"><input type="text" id="input-wi-lunar" value="Tức ngày 10 tháng 10 năm Bính Ngọ" /></div>
                  </li>
                </ul>
              </div>

              <!-- 8. Lịch tháng - Đếm ngày -->
              <div class="section-form" data-section-key="calendar" id="form-sec-calendar">
                <input type="checkbox" class="is-open" id="open-sec-calendar" checked hidden />
                <div class="header" data-toggle-section="open-sec-calendar" data-phone-target="section-calendar">
                  <div class="title">
                    <input type="checkbox" class="section-title-toggle" data-preview-target="section-calendar" checked />
                    <span>Lịch tháng - Đếm ngày</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item">
                    <label>Ngày giờ</label>
                    <div class="wrap wedding-time-wrap">
                      <input type="date" id="input-wedding-date" value="2026-11-28" />
                      <select id="input-wedding-hour" aria-label="Giờ cưới">
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:30 AM" selected>10:30 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="05:30 PM">05:30 PM</option>
                        <option value="06:00 PM">06:00 PM</option>
                      </select>
                    </div>
                  </li>
                  <li class="list-item row--top3">
                    <label>Hiển thị</label>
                    <div class="wrap col-wrap" style="align-items:flex-start;">
                      <div class="check-wrap">
                        <input type="checkbox" id="chk-show-cal" checked />
                        <label for="chk-show-cal">Hiển thị lịch tháng</label>
                      </div>
                      <div class="check-wrap">
                        <input type="checkbox" id="chk-show-dday" checked />
                        <label for="chk-show-dday">Hiển thị bộ đếm ngược ngày cưới (D-Day)</label>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- 9. Địa điểm - Phương tiện -->
              <div class="section-form" data-section-key="location" id="form-sec-location">
                <input type="checkbox" class="is-open" id="open-sec-location" checked hidden />
                <div class="header" data-toggle-section="open-sec-location" data-phone-target="section-location">
                  <div class="title">
                    <input type="checkbox" class="section-title-toggle" data-preview-target="section-location" checked />
                    <span>Địa điểm - Phương tiện</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item">
                    <label>Tiêu đề</label>
                    <div class="wrap"><input type="text" id="input-loc-title" value="Địa điểm" /></div>
                  </li>
                  <li class="list-item">
                    <label>Nơi tổ chức</label>
                    <div class="wrap"><input type="text" id="input-loc-name" value="TƯ GIA NHÀ TRAI" /></div>
                  </li>
                  <li class="list-item row--top3">
                    <label>Địa chỉ</label>
                    <div class="wrap location-address-field">
                      <div class="search-location-wrap search-location-wrap--address-only">
                        <input type="text" id="input-loc-address" value="XÓM 10, XÃ ĐẠI HUỆ , NGHỆ AN" />
                        <button type="button" class="search-btn" id="btn-update-map">Cập nhật</button>
                      </div>
                      <p class="location-address-hint">Bản đồ Google Maps trên thiệp sẽ tự động định vị theo địa chỉ này.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- 10. Thư viện ảnh -->
              <div class="section-form" data-section-key="gallery" id="form-sec-gallery">
                <input type="checkbox" class="is-open" id="open-sec-gallery" checked hidden />
                <div class="header" data-toggle-section="open-sec-gallery" data-phone-target="section-gallery">
                  <div class="title">
                    <input type="checkbox" class="section-title-toggle" data-preview-target="section-gallery" checked />
                    <span>Thư viện ảnh</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item">
                    <label>Tiêu đề</label>
                    <div class="wrap"><input type="text" id="input-gallery-title" value="Album cưới" /></div>
                  </li>
                  <li class="list-item">
                    <label>Kiểu hiển thị</label>
                    <div class="wrap">
                      <div class="radio-group">
                        <div class="radio-item"><input type="radio" name="galleryStyle" id="gs-swipe" hidden /><label for="gs-swipe">Trượt (Swipe)</label></div>
                        <div class="radio-item"><input type="radio" name="galleryStyle" id="gs-grid" hidden /><label for="gs-grid">Lưới (Grid)</label></div>
                        <div class="radio-item"><input type="radio" name="galleryStyle" id="gs-album" checked hidden /><label for="gs-album">Album</label></div>
                      </div>
                    </div>
                  </li>
                  <li class="list-item row--top3">
                    <label>Danh sách ảnh</label>
                    <div class="wrap">
                      <ul class="img-container" id="editor-gallery-grid">
                        <li class="img-item">
                          <div class="img_attach_box gallery-preview-box has-preview" style="border-radius:8px;">
                            <img class="gallery-preview-img" src="https://assets.ngaychungdoi.com/templates/341ddfea-3dec-4b67-a7a3-a0c2f477b959.jpg" alt="" />
                          </div>
                        </li>
                        <li class="img-item">
                          <div class="img_attach_box gallery-preview-box has-preview" style="border-radius:8px;">
                            <img class="gallery-preview-img" src="https://assets.ngaychungdoi.com/templates/00a5ef6f-1d54-415b-8f72-b72c528ea2ff.jpg" alt="" />
                          </div>
                        </li>
                        <li class="img-item">
                          <div class="img_attach_box gallery-preview-box has-preview" style="border-radius:8px;">
                            <img class="gallery-preview-img" src="https://assets.ngaychungdoi.com/templates/81584d8f-f186-4347-b218-9bebabfafa1d.jpg" alt="" />
                          </div>
                        </li>
                        <li class="img-item">
                          <div class="img_attach_box gallery-preview-box has-preview" style="border-radius:8px;">
                            <img class="gallery-preview-img" src="https://assets.ngaychungdoi.com/templates/f26ecf59-fbc0-43d3-b364-f9c48dab4e30.jpg" alt="" />
                          </div>
                        </li>
                        <li class="img-item">
                          <div class="img_attach_box gallery-preview-box has-preview" style="border-radius:8px;">
                            <img class="gallery-preview-img" src="https://assets.ngaychungdoi.com/templates/5015d5e0-2324-479d-a47d-927707d86499.jpg" alt="" />
                          </div>
                        </li>
                        <li class="img-item img-item--add" id="btn-add-gallery-photo">
                          <label class="img_attach_box gallery-add-box" style="border-radius:8px;">
                            <span class="filebtn plus"></span>
                          </label>
                        </li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- 11. Video -->
              <div class="section-form" data-section-key="video" id="form-sec-video">
                <input type="checkbox" class="is-open" id="open-sec-video" checked hidden />
                <div class="header" data-toggle-section="open-sec-video">
                  <div class="title">
                    <input type="checkbox" class="section-title-toggle" />
                    <span>Video</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item">
                    <label>Tiêu đề</label>
                    <div class="wrap"><input type="text" value="Video kỷ niệm" /></div>
                  </li>
                  <li class="list-item">
                    <label>Đường dẫn</label>
                    <div class="wrap"><input type="url" placeholder="Dán link YouTube hoặc Vimeo (VD: https://youtu.be/...)" /></div>
                  </li>
                </ul>
              </div>

              <!-- 12. Phỏng vấn -->
              <div class="section-form" data-section-key="interview" id="form-sec-interview">
                <input type="checkbox" class="is-open" id="open-sec-interview" checked hidden />
                <div class="header" data-toggle-section="open-sec-interview">
                  <div class="title">
                    <input type="checkbox" class="section-title-toggle" />
                    <span>Phỏng vấn</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item">
                    <label>Tiêu đề</label>
                    <div class="wrap"><input type="text" value="Câu chuyện của chúng mình" /></div>
                  </li>
                  <li class="list-item" style="grid-template-columns:1fr;">
                    <ul class="interview-list-form" id="interview-qa-list">
                      <li>
                        <div class="field-container">
                          <div class="wrap single">
                            <input type="text" value="Ấn tượng đầu tiên về đối phương là gì?" />
                            <button type="button" class="close" aria-label="Xóa"></button>
                          </div>
                          <div class="wrap">
                            <textarea rows="2">Nụ cười rạng rỡ và sự ấm áp ngay từ lần đầu gặp gỡ.</textarea>
                          </div>
                        </div>
                      </li>
                    </ul>
                    <div class="interview-tools">
                      <button type="button" id="btn-add-interview-qa">+ Thêm câu hỏi</button>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- 13. Lịch trình ngày cưới -->
              <div class="section-form" data-section-key="timeline" id="form-sec-timeline">
                <input type="checkbox" class="is-open" id="open-sec-timeline" checked hidden />
                <div class="header" data-toggle-section="open-sec-timeline">
                  <div class="title">
                    <input type="checkbox" class="section-title-toggle" />
                    <span>Lịch trình ngày cưới</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item">
                    <label>Tiêu đề</label>
                    <div class="wrap"><input type="text" value="Lịch trình hôn lễ" /></div>
                  </li>
                  <li class="list-item">
                    <label>Mốc 1</label>
                    <div class="wrap"><input type="text" value="10:30 — Đón khách &amp; Chụp hình lưu niệm" /></div>
                  </li>
                  <li class="list-item">
                    <label>Mốc 2</label>
                    <div class="wrap"><input type="text" value="12:30 — Cử hành Lễ Thành Hôn" /></div>
                  </li>
                </ul>
              </div>

              <!-- 14. Trang phục (Dress code) -->
              <div class="section-form" data-section-key="dresscode" id="form-sec-dresscode">
                <input type="checkbox" class="is-open" id="open-sec-dresscode" checked hidden />
                <div class="header" data-toggle-section="open-sec-dresscode">
                  <div class="title">
                    <input type="checkbox" class="section-title-toggle" />
                    <span>Trang phục (Dress code)</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item">
                    <label>Tiêu đề</label>
                    <div class="wrap"><input type="text" value="Dress Code" /></div>
                  </li>
                  <li class="list-item dress-code-editor-colors">
                    <label>Bảng màu</label>
                    <div class="wrap dress-code-editor-colors-wrap" id="dress-code-colors-list">
                      <div class="dress-code-editor-color-row">
                        <input type="color" class="dress-code-editor-color-input" value="#8B9A7E" />
                        <input type="text" class="dress-code-editor-color-label" value="Xanh olive" />
                        <button type="button" class="dress-code-editor-color-remove" aria-label="Xóa">×</button>
                      </div>
                      <div class="dress-code-editor-color-row">
                        <input type="color" class="dress-code-editor-color-input" value="#F5F0E8" />
                        <input type="text" class="dress-code-editor-color-label" value="Kem" />
                        <button type="button" class="dress-code-editor-color-remove" aria-label="Xóa">×</button>
                      </div>
                      <div class="dress-code-editor-color-row">
                        <input type="color" class="dress-code-editor-color-input" value="#C4A484" />
                        <input type="text" class="dress-code-editor-color-label" value="Nâu nhạt" />
                        <button type="button" class="dress-code-editor-color-remove" aria-label="Xóa">×</button>
                      </div>
                      <button type="button" class="dress-code-editor-color-add" id="btn-add-dress-color">+ Thêm màu</button>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- 15. Mừng cưới -->
              <div class="section-form" data-section-key="account" id="form-sec-account">
                <input type="checkbox" class="is-open" id="open-sec-account" checked hidden />
                <div class="header" data-toggle-section="open-sec-account" data-phone-target="section-account">
                  <div class="title">
                    <input type="checkbox" class="section-title-toggle" data-preview-target="section-account" checked />
                    <span>Mừng cưới</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item">
                    <label>Tiêu đề</label>
                    <div class="wrap"><input type="text" id="input-acc-title" value="Gửi gắm yêu thương" /></div>
                  </li>
                  <li class="list-item row--top3">
                    <label>Lời nhắn</label>
                    <div class="wrap">
                      <textarea id="input-acc-desc" rows="2">Xin gửi kèm số tài khoản dành cho quý khách không thể đến dự trực tiếp. Rất mong quý khách thông cảm và hiểu cho.</textarea>
                    </div>
                  </li>
                  <li class="list-item" style="grid-template-columns:1fr;">
                    <ul class="group-list">
                      <li class="group">
                        <div class="head">
                          <div class="t"><span>Nhà trai</span></div>
                        </div>
                        <ul class="account-list">
                          <li class="account">
                            <div class="row">
                              <span class="label">Ngân hàng</span>
                              <div class="wrap account-info">
                                <input type="text" id="input-acc-bank" value="Techcombank" />
                                <input type="text" id="input-acc-number" value="1234567890" />
                              </div>
                            </div>
                            <div class="row">
                              <span class="label">Chủ TK</span>
                              <div class="wrap"><input type="text" id="input-acc-holder" value="NGUYEN THANH PHONG" /></div>
                            </div>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>

              <!-- 16. Sổ lưu bút -->
              <div class="section-form" data-section-key="guestbook" id="form-sec-guestbook">
                <input type="checkbox" class="is-open" id="open-sec-guestbook" checked hidden />
                <div class="header" data-toggle-section="open-sec-guestbook">
                  <div class="title">
                    <input type="checkbox" class="section-title-toggle" checked />
                    <span>Sổ lưu bút</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item">
                    <label>Tiêu đề</label>
                    <div class="wrap"><input type="text" value="Sổ lưu bút" /></div>
                  </li>
                  <li class="list-item">
                    <label>Hiển thị</label>
                    <div class="wrap">
                      <div class="radio-group">
                        <div class="radio-item"><input type="radio" name="gbMode" id="gb-pub" checked hidden /><label for="gb-pub">Công khai</label></div>
                        <div class="radio-item"><input type="radio" name="gbMode" id="gb- floating" hidden /><label for="gb- floating">Bình luận bay trực tiếp</label></div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- 17. Xác nhận tham dự -->
              <div class="section-form" data-section-key="rsvp" id="form-sec-rsvp">
                <input type="checkbox" class="is-open" id="open-sec-rsvp" checked hidden />
                <div class="header" data-toggle-section="open-sec-rsvp" data-phone-target="section-rsvp">
                  <div class="title">
                    <input type="checkbox" class="section-title-toggle" data-preview-target="section-rsvp" checked />
                    <span>Xác nhận tham dự</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item">
                    <label>Tiêu đề</label>
                    <div class="wrap"><input type="text" id="input-rsvp-title" value="Xác nhận tham dự" /></div>
                  </li>
                  <li class="list-item">
                    <label>Tên nút</label>
                    <div class="wrap"><input type="text" id="input-rsvp-btn" value="Gửi xác nhận" /></div>
                  </li>
                </ul>
              </div>

              <!-- 18. Nhạc nền -->
              <div class="section-form" data-section-key="bgm" id="form-sec-bgm">
                <input type="checkbox" class="is-open" id="open-sec-bgm" checked hidden />
                <div class="header" data-toggle-section="open-sec-bgm">
                  <div class="title">
                    <input type="checkbox" class="section-title-toggle" checked />
                    <span>Nhạc nền</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item bgm-player-item">
                    <div class="wrap">
                      <div class="bgm-player" id="editor-bgm-player" style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:12px 14px;background:#f8f8fa;border:1px solid #e6e6eb;border-radius:12px;gap:12px;">
                        <div class="bgm-player-body" style="flex:1;min-width:0;">
                          <div class="bgm-player-title" id="editor-bgm-title" style="font-size:14px;font-weight:600;color:#1a1a1a;">Giai Điệu Ngày Chung Đôi (Piano Lãng Mạn)</div>
                          <div class="bgm-player-meta" style="font-size:12px;color:#777;margin-top:2px;">Nhạc nền mặc định · Tự động phát khi mở thiệp</div>
                        </div>
                        <div class="bgm-player-actions" style="display:flex;align-items:center;gap:8px;">
                          <button type="button" class="bgm-player-play" id="btn-editor-bgm-play" style="padding:7px 14px;border-radius:999px;border:1px solid #1a1a1a;background:#fff;font-size:12px;font-weight:600;cursor:pointer;">▶ Nghe thử</button>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- 19. Ảnh giữa trang (Matches screenshot media_1794745186262_1c7a3cb9.png top) -->
              <div class="section-form" data-section-key="middle-image" id="form-sec-middle-image">
                <input type="checkbox" class="is-open" id="open-sec-middle-image" checked hidden />
                <div class="header" data-toggle-section="open-sec-middle-image" data-phone-target="section-middle-image1">
                  <div class="title">
                    <input type="checkbox" class="section-title-toggle" data-preview-target="section-middle-image1" checked />
                    <span>Ảnh giữa trang</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item" style="grid-template-columns:1fr;">
                    <div class="designs-list" id="middle-images-list" style="width:100%;">
                      <!-- Ảnh giữa trang 1 -->
                      <div class="design-block" data-mid-index="1">
                        <div class="block-header">
                          <div class="block-meta">
                            <span class="block-number">Ảnh 1</span>
                            <span class="block-type-name">Kiểu 1 · Toàn khung</span>
                          </div>
                          <button type="button" class="remove-btn" aria-label="Xóa ảnh giữa trang 1"></button>
                        </div>
                        <div class="block-body">
                          <div class="design-select-row">
                            <div class="design-thumb">
                              <img class="design-thumb-image" src="https://assets.ngaychungdoi.com/templates/00a5ef6f-1d54-415b-8f72-b72c528ea2ff.jpg" alt="" />
                            </div>
                            <button type="button" class="select-design-btn">
                              <span class="btn-left">
                                <span class="btn-label">Kiểu thiết kế</span>
                                <span class="btn-value">Kiểu 1</span>
                              </span>
                              <span class="chevron">▾</span>
                            </button>
                          </div>
                          <div class="img-uploader">
                            <div class="img_attach_box has-preview" id="mid-photo-box-1" style="background-image:url('https://assets.ngaychungdoi.com/templates/00a5ef6f-1d54-415b-8f72-b72c528ea2ff.jpg');border-radius:8px;">
                              <button type="button" class="img-overlay-change-btn" data-change-photo="middle-1">Đổi ảnh</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Ảnh giữa trang 2 -->
                      <div class="design-block" data-mid-index="2">
                        <div class="block-header">
                          <div class="block-meta">
                            <span class="block-number">Ảnh 2</span>
                            <span class="block-type-name">Kiểu 3 · Khung vòm LOVE</span>
                          </div>
                          <button type="button" class="remove-btn" aria-label="Xóa ảnh giữa trang 2"></button>
                        </div>
                        <div class="block-body">
                          <div class="design-select-row">
                            <div class="design-thumb">
                              <img class="design-thumb-image" src="https://assets.ngaychungdoi.com/templates/81584d8f-f186-4347-b218-9bebabfafa1d.jpg" alt="" />
                            </div>
                            <button type="button" class="select-design-btn">
                              <span class="btn-left">
                                <span class="btn-label">Kiểu thiết kế</span>
                                <span class="btn-value">Kiểu 3</span>
                              </span>
                              <span class="chevron">▾</span>
                            </button>
                          </div>
                          <div class="img-uploader">
                            <div class="img_attach_box has-preview" id="mid-photo-box-2" style="background-image:url('https://assets.ngaychungdoi.com/templates/81584d8f-f186-4347-b218-9bebabfafa1d.jpg');border-radius:8px;">
                              <button type="button" class="img-overlay-change-btn" data-change-photo="middle-2">Đổi ảnh</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="btn-wrap" style="margin-top:8px;">
                      <button type="button" class="add-middle-image-form" id="btn-add-middle-image">
                        <span>+ Thêm ảnh giữa trang</span>
                      </button>
                    </div>

                    <div class="info">
                      <div class="wrap">
                        <img src="https://assets.ngaychungdoi.com/src/img/ic_info.svg" alt="" />
                        <span>Nếu cần chèn ảnh vào giữa thiệp, hãy tải ảnh lên.</span>
                      </div>
                      <div class="wrap">
                        <img src="https://assets.ngaychungdoi.com/src/img/ic_info.svg" alt="" />
                        <span>Có thể thay đổi vị trí trong mục "Thay đổi thứ tự".</span>
                      </div>
                      <div class="wrap">
                        <img src="https://assets.ngaychungdoi.com/src/img/ic_info.svg" alt="" />
                        <span>Có thể thêm tối đa 5 ảnh.</span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- 20. Hiệu ứng mở màn (Exact match to screenshot media_1794745186262_1c7a3cb9.png) -->
              <div class="section-form" data-section-key="opening" id="form-sec-opening">
                <input type="checkbox" class="is-open" id="open-sec-opening" checked hidden />
                <div class="header" data-toggle-section="open-sec-opening">
                  <div class="title">
                    <input type="checkbox" class="section-title-toggle" id="toggle-opening-enabled" checked />
                    <span>Hiệu ứng mở màn</span>
                  </div>
                  <div class="icon">
                    <button type="button" class="preview" id="btn-preview-opening-effect">Xem trước</button>
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <!-- 9-item Opening Effect Grid -->
                  <li class="list-item" style="grid-template-columns:1fr;">
                    <div class="type-wrap opening-effect-type-wrap" id="opening-effect-grid">
                      <div class="frm_item">
                        <input type="radio" name="openingEffectType" id="oe-v1" value="v1" class="inf_chk" />
                        <label for="oe-v1">
                          <img src="https://assets.ngaychungdoi.com/src/bodymovin/preview_v1.png" alt="Hiệu ứng 1" />
                          <span class="bder"></span>
                        </label>
                      </div>
                      <div class="frm_item">
                        <input type="radio" name="openingEffectType" id="oe-v2" value="v2" class="inf_chk" />
                        <label for="oe-v2">
                          <img src="https://assets.ngaychungdoi.com/src/bodymovin/preview_v2.png" alt="Hiệu ứng 2" />
                          <span class="bder"></span>
                        </label>
                      </div>
                      <div class="frm_item">
                        <input type="radio" name="openingEffectType" id="oe-v3" value="v3" class="inf_chk" />
                        <label for="oe-v3">
                          <img src="https://assets.ngaychungdoi.com/src/bodymovin/preview-v3.jpg" alt="Hiệu ứng 3" />
                          <span class="bder"></span>
                        </label>
                      </div>
                      <div class="frm_item">
                        <input type="radio" name="openingEffectType" id="oe-v4" value="v4" class="inf_chk" />
                        <label for="oe-v4">
                          <img src="https://assets.ngaychungdoi.com/src/bodymovin/preview-v4.webp" alt="Phong bì 3D" />
                          <span class="bder"></span>
                        </label>
                      </div>
                      <div class="frm_item">
                        <input type="radio" name="openingEffectType" id="oe-v5" value="v5" class="inf_chk" checked />
                        <label for="oe-v5">
                          <img src="https://assets.ngaychungdoi.com/src/bodymovin/preview-v5.webp" alt="Thiệp Hoàng Gia" />
                          <span class="bder"></span>
                        </label>
                      </div>
                      <div class="frm_item">
                        <input type="radio" name="openingEffectType" id="oe-invitation-card" value="invitation-card" class="inf_chk" />
                        <label for="oe-invitation-card">
                          <img src="https://assets.ngaychungdoi.com/assets/opening-effects/preview/invitation-card.webp" alt="Thiệp cổ điển" />
                          <span class="bder"></span>
                        </label>
                      </div>
                      <div class="frm_item">
                        <input type="radio" name="openingEffectType" id="oe-curtain" value="curtain" class="inf_chk" />
                        <label for="oe-curtain">
                          <img src="https://assets.ngaychungdoi.com/assets/opening-effects/preview/curtain-reveal-blue.jpg" alt="Màn rèm" />
                          <span class="bder"></span>
                        </label>
                      </div>
                      <div class="frm_item">
                        <input type="radio" name="openingEffectType" id="oe-sliding-door" value="sliding-door" class="inf_chk" />
                        <label for="oe-sliding-door">
                          <img src="${SLIDING_DOOR_SVG_PREVIEW}" alt="Cánh cửa Song Hỷ" />
                          <span class="bder"></span>
                        </label>
                      </div>
                      <div class="frm_item">
                        <input type="radio" name="openingEffectType" id="oe-animated-image" value="animated-image" class="inf_chk" />
                        <label for="oe-animated-image">
                          <img src="https://assets.ngaychungdoi.com/assets/opening-effects/preview/animated-image-1.jpg" alt="Hoạt họa" />
                          <span class="bder"></span>
                        </label>
                      </div>
                    </div>
                  </li>

                  <!-- Kiểu thiệp row -->
                  <li class="list-item opening-invitation-theme-row">
                    <label>Kiểu thiệp</label>
                    <div class="wrap">
                      <div class="opening-invitation-theme-wrap">
                        <div class="opening-invitation-preview opening-invitation-preview--inline" id="inline-royal-card-preview">
                          <div class="opening-invitation-inline-preview-slot">
                            <div class="opening-invitation-inline-preview-slot-inner" style="width:130px;height:212px;">
                              <div class="opening-invitation-inline-preview-content" style="transform:scale(0.419);transform-origin:top left;width:310px;pointer-events:none;">
                                <div class="slr-ui-frame" data-slr-theme="royal-red" style="--slr-font-display:'Fz Qellia',serif;--slr-card-glow-rgb:225,188,124;--slr-open-button-shadow-rgb:225,188,124;--slr-guest-badge-bg:rgba(225,188,124,0.08);--slr-text-color:#e1bc7c;--slr-open-button-bg:#e1bc7c;--slr-open-button-text-color:#3e0001;">
                                  <div class="slr-ui-seal">
                                    <svg class="slr-ui-seal-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
                                  </div>
                                  <div class="slr-ui-card-shadow">
                                    <div class="slr-ui-card" id="inline-slr-ui-card" style="background-color:rgb(62, 0, 1);">
                                      <img alt="" aria-hidden="true" class="slr-ui-art slr-ui-royal-flower-top" src="https://assets.ngaychungdoi.com/card-assets/opening-effect/opening-cards/themes/royal-red/flower.webp" />
                                      <img alt="" aria-hidden="true" class="slr-ui-art slr-ui-royal-flower-bottom" src="https://assets.ngaychungdoi.com/card-assets/opening-effect/opening-cards/themes/royal-red/flower.webp" />
                                      <div class="slr-ui-text-wrap">
                                        <h1 class="slr-ui-couple-name">
                                          <span id="inline-slr-groom">THANH PHONG</span>
                                          <span class="slr-ui-couple-and">&amp;</span>
                                          <span id="inline-slr-bride">THUÝ KIỀU</span>
                                        </h1>
                                        <div class="slr-ui-divider">
                                          <div class="slr-ui-divider-line slr-ui-divider-line--left"></div>
                                          <span>❦</span>
                                          <div class="slr-ui-divider-line slr-ui-divider-line--right"></div>
                                        </div>
                                        <div class="slr-ui-date"><span id="inline-slr-date">Thứ 7, 28 tháng 11, 2026, 10:30 AM</span></div>
                                        <div class="slr-ui-invitation">
                                          <p class="slr-ui-invitation-label"><span id="inline-slr-label">TRÂN TRỌNG KÍNH MỜI</span></p>
                                          <div class="slr-ui-guest-badge"><h2 id="inline-slr-guest">Bạn &amp; người thương</h2></div>
                                          <p class="slr-ui-invitation-text"><span class="slr-ui-invitation-text-content" id="inline-slr-subtext">đến dự buổi tiệc chung vui cùng gia đình</span></p>
                                        </div>
                                        <button type="button" class="slr-ui-open-button"><span id="inline-slr-btn-text">Mở thiệp</span></button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="opening-invitation-theme-actions">
                          <span class="opening-invitation-theme-current" id="opening-theme-current-label">royal | Đỏ Hoàng Gia</span>
                          <button type="button" class="opening-invitation-select-theme-btn" id="btn-open-theme-modal">Chọn kiểu thiệp</button>
                        </div>
                      </div>
                    </div>
                  </li>

                  <!-- Collapsible: Nội dung hiển thị -->
                  <li class="list-item opening-invitation-content-item" style="grid-template-columns:1fr;">
                    <details class="opening-invitation-content-collapse">
                      <summary class="opening-invitation-content-collapse-summary">
                        <span class="opening-invitation-content-collapse-title">Nội dung hiển thị</span>
                        <span class="opening-invitation-content-collapse-right">
                          <span class="opening-invitation-content-collapse-hint">Bấm để mở</span>
                          <svg class="opening-invitation-content-collapse-icon" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
                        </span>
                      </summary>
                      <div class="opening-invitation-content-list">
                        <div class="opening-invitation-content-row">
                          <label>Lời mời</label>
                          <div class="wrap"><input type="text" id="input-opening-label" value="TRÂN TRỌNG KÍNH MỜI" /></div>
                        </div>
                        <div class="opening-invitation-content-row">
                          <label>Khách mời</label>
                          <div class="wrap"><input type="text" id="input-opening-guest" value="Bạn &amp; người thương" /></div>
                        </div>
                        <div class="opening-invitation-content-row">
                          <label>Dòng phụ</label>
                          <div class="wrap"><input type="text" id="input-opening-subtext" value="đến dự buổi tiệc chung vui cùng gia đình" /></div>
                        </div>
                        <div class="opening-invitation-content-row">
                          <label>Nút mở</label>
                          <div class="wrap"><input type="text" id="input-opening-btn" value="Mở thiệp" /></div>
                        </div>
                      </div>
                    </details>
                  </li>

                  <!-- Collapsible: Màu sắc -->
                  <li class="list-item opening-invitation-colors-item" style="grid-template-columns:1fr;">
                    <details class="opening-invitation-color-collapse">
                      <summary class="opening-invitation-color-collapse-summary">
                        <span class="opening-invitation-color-collapse-title">Màu sắc</span>
                        <span class="opening-invitation-color-collapse-right">
                          <span class="opening-invitation-color-collapse-hint">Bấm để mở</span>
                          <svg class="opening-invitation-color-collapse-icon" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
                        </span>
                      </summary>
                      <div class="opening-invitation-color-list">
                        <div class="opening-invitation-color-row">
                          <span class="opening-invitation-color-row-label">Màu nền thiệp</span>
                          <div class="opening-invitation-color-row-controls">
                            <div class="radio-group" style="display:flex;gap:8px;">
                              <div class="radio-item"><input type="radio" name="openCardBg" id="ocb-red" value="#3e0001" checked hidden /><label for="ocb-red" class="color-label"><span class="dot" style="background:#3e0001;"></span></label></div>
                              <div class="radio-item"><input type="radio" name="openCardBg" id="ocb-emerald" value="#1e352b" hidden /><label for="ocb-emerald" class="color-label"><span class="dot" style="background:#1e352b;"></span></label></div>
                              <div class="radio-item"><input type="radio" name="openCardBg" id="ocb-navy" value="#16243b" hidden /><label for="ocb-navy" class="color-label"><span class="dot" style="background:#16243b;"></span></label></div>
                              <div class="radio-item"><input type="radio" name="openCardBg" id="ocb-cream" value="#fdf6ec" hidden /><label for="ocb-cream" class="color-label"><span class="dot" style="background:#fdf6ec;"></span></label></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </details>
                  </li>

                  <li class="list-item" style="grid-template-columns:1fr;">
                    <p style="margin:2px 0 0;font-size:11px;color:#777;line-height:1.5;">
                      * Khi truy cập qua đường dẫn người nhận riêng, tên khách sẽ tự động hiển thị trên màn hình mở.
                    </p>
                  </li>
                </ul>
              </div>

              <!-- 21. Ảnh và lời kết (Exact match to screenshot media_1794745186262_1c7a3cb9.png) -->
              <div class="section-form" data-section-key="ending" id="form-sec-ending">
                <input type="checkbox" class="is-open" id="open-sec-ending" checked hidden />
                <div class="header" data-toggle-section="open-sec-ending" data-phone-target="section-ending">
                  <div class="title">
                    <input type="checkbox" class="section-title-toggle" data-preview-target="section-ending" checked />
                    <span>Ảnh và lời kết <span class="accent-text">Khuyên dùng 👍</span></span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item row--top3">
                    <label>Ảnh</label>
                    <div class="wrap">
                      <div class="img-uploader">
                        <div class="img_attach_box has-preview" id="ending-photo-box" style="background-image:url('https://assets.ngaychungdoi.com/templates/d1b5c891-c3be-4199-be58-5a388e3ec7d9.jpg');border-radius:8px;">
                          <button type="button" class="main-image-upload-clear" aria-label="Xóa ảnh">×</button>
                          <button type="button" class="img-overlay-change-btn" data-change-photo="ending">Đổi ảnh</button>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li class="list-item">
                    <label>Kiểu hiển thị</label>
                    <div class="wrap">
                      <div class="radio-group">
                        <div class="radio-item"><input type="radio" name="endingDisplayType" id="edt-basic" value="basic" checked hidden /><label for="edt-basic">Cơ bản</label></div>
                        <div class="radio-item"><input type="radio" name="endingDisplayType" id="edt-scroll" value="scroll" hidden /><label for="edt-scroll">Hiệu ứng cuộn</label></div>
                        <div class="radio-item"><input type="radio" name="endingDisplayType" id="edt-card" value="card" hidden /><label for="edt-card">Thẻ nổi</label></div>
                      </div>
                    </div>
                  </li>
                  <li class="list-item">
                    <label>Hiệu ứng</label>
                    <div class="wrap">
                      <div class="radio-group">
                        <div class="radio-item"><input type="radio" name="endingEffect" id="ee-none" value="none" checked hidden /><label for="ee-none">Không</label></div>
                        <div class="radio-item"><input type="radio" name="endingEffect" id="ee-mist" value="mist" hidden /><label for="ee-mist">Sương mù</label></div>
                        <div class="radio-item"><input type="radio" name="endingEffect" id="ee-wave" value="wave" hidden /><label for="ee-wave">Sóng</label></div>
                        <div class="radio-item"><input type="radio" name="endingEffect" id="ee-paper" value="paper" hidden /><label for="ee-paper">Giấy</label></div>
                      </div>
                    </div>
                  </li>
                  <li class="list-item">
                    <label>Tỷ lệ ảnh</label>
                    <div class="wrap">
                      <div class="radio-group">
                        <div class="radio-item"><input type="radio" name="endingRatio" id="er-fixed" value="fixed" hidden /><label for="er-fixed">Cố định</label></div>
                        <div class="radio-item"><input type="radio" name="endingRatio" id="er-auto" value="auto" checked hidden /><label for="er-auto">Tự điều chỉnh chiều cao theo ảnh</label></div>
                      </div>
                    </div>
                  </li>
                  <li class="list-item row--top3">
                    <label>Nội dung<br />lời nhắn</label>
                    <div class="wrap">
                      <div class="editor-wrap">
                        <div class="ql-toolbar-mock">
                          <button type="button"><b>B</b></button>
                          <button type="button"><i>I</i></button>
                          <button type="button"><u>U</u></button>
                          <button type="button"><s>S</s></button>
                          <button type="button">☰</button>
                          <button type="button"><u>A</u></button>
                          <button type="button">⌫</button>
                          <button type="button"><i>I</i><sub>x</sub></button>
                        </div>
                        <textarea id="input-ending-message" class="ql-editor-textarea" placeholder="Nhập lời cảm ơn / lời nhắn cuối thiệp..."></textarea>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- 22. Thay đổi thứ tự (Exact match to screenshot media_1794745186262_1c7a3cb9.png) -->
              <div class="section-form" data-section-key="order" id="form-sec-order">
                <input type="checkbox" class="is-open" id="open-sec-order" checked hidden />
                <div class="header" data-toggle-section="open-sec-order">
                  <div class="title">
                    <span>Thay đổi thứ tự</span>
                  </div>
                  <div class="icon">
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item" style="grid-template-columns:1fr;">
                    <div class="order-change-section order-change-list" id="editor-order-change-list" style="width:100%;">
                      <div class="order-change-item order-change-item--pinned">
                        <span class="order-change-item__label">Màn hình chính</span>
                        <span class="order-change-item__pin-badge">Cố định</span>
                      </div>
                      <div class="order-change-item" draggable="true" data-target-section="section-intro">Lời ngỏ</div>
                      <div class="order-change-item" draggable="true" data-target-section="section-wedding-ceremony-info">Thông tin lễ cưới</div>
                      <div class="order-change-item" draggable="true" data-target-section="section-profile">Hồ sơ cô dâu chú rể</div>
                      <div class="order-change-item" draggable="true" data-target-section="section-wedding-invitation">Thư mời lễ cưới</div>
                      <div class="order-change-item" draggable="true" data-target-section="section-middle-image1">Ảnh giữa trang 1</div>
                      <div class="order-change-item" draggable="true" data-target-section="section-calendar">Lịch tháng - Đếm ngày</div>
                      <div class="order-change-item" draggable="true" data-target-section="section-middle-image2">Ảnh giữa trang 2</div>
                      <div class="order-change-item" draggable="true" data-target-section="section-location">Địa điểm - Phương tiện</div>
                      <div class="order-change-item" draggable="true" data-target-section="section-account">Mừng cưới</div>
                      <div class="order-change-item" draggable="true" data-target-section="section-gallery">Thư viện ảnh</div>
                      <div class="order-change-item" draggable="true" data-target-section="section-rsvp">Xác nhận tham dự</div>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- 23. Ảnh thu nhỏ chia sẻ URL (Exact match to screenshot media_1794745186262_1c7a3cb9.png) -->
              <div class="section-form" data-section-key="url-share" id="form-sec-url-share">
                <input type="checkbox" class="is-open" id="open-sec-url-share" checked hidden />
                <div class="header" data-toggle-section="open-sec-url-share">
                  <div class="title">
                    <span>Ảnh thu nhỏ chia sẻ URL</span>
                  </div>
                  <div class="icon">
                    <button type="button" class="preview" id="btn-preview-url-share">Xem trước</button>
                    <img src="https://assets.ngaychungdoi.com/src/img/arr-down.svg" alt="" width="16" height="16" />
                  </div>
                </div>
                <ul class="form-list">
                  <li class="list-item row--top3">
                    <label>Ảnh</label>
                    <div class="wrap">
                      <div class="img-uploader">
                        <div class="img_attach_box" id="url-share-thumb-box" style="border-radius:4px;">
                          <span class="filebtn plus"></span>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li class="list-item">
                    <label>Tiêu đề</label>
                    <div class="wrap">
                      <input type="text" id="url-share-title-input" placeholder="Tiêu đề khi chia sẻ link" />
                    </div>
                  </li>
                  <li class="list-item row--top3">
                    <label>Nội dung</label>
                    <div class="wrap">
                      <textarea id="url-share-desc-input" placeholder="Mô tả khi chia sẻ link"></textarea>
                    </div>
                  </li>
                  <li class="list-item" style="grid-template-columns:1fr;">
                    <div class="info url-share-cache-info">
                      <div class="title">Đã đổi ảnh/tiêu đề mà lúc gửi vẫn hiện nội dung cũ?</div>
                      <div>Facebook, Zalo, iMessage và nhiều ứng dụng không tải lại địa chỉ mỗi lần gửi: lần đầu ai đó dán link, máy chủ của họ chụp ảnh và chữ rồi giữ bản đó (bộ nhớ đệm) khá lâu.</div>
                      <div style="margin-top:4px;">Trên Facebook, bạn có thể làm mới luôn bằng <a href="https://developers.facebook.com/tools/debug/" target="_blank" rel="noopener noreferrer">Trình gỡ lỗi chia sẻ</a>: dán link thiệp, bấm <strong>Gỡ lỗi</strong>, rồi bấm <strong>Thu thập lại</strong>.</div>
                      <div style="margin-top:4px;">Zalo không có nút xóa bộ nhớ đệm giống vậy. Mẹo hay dùng: thêm đoạn ngắn ở cuối địa chỉ khi gửi (ví dụ <code>?v=2</code>) để ứng dụng coi như đường dẫn mới và tải lại ảnh, tiêu đề.</div>
                    </div>
                    <div class="info no-expand">
                      <div class="wrap">
                        <img src="https://assets.ngaychungdoi.com/src/img/ic_info.svg" alt="" />
                        <span>Có thể để trống — hệ thống tự chọn ảnh/chữ hợp lý và cập nhật khi bạn thay đổi.</span>
                      </div>
                      <div class="wrap">
                        <img src="https://assets.ngaychungdoi.com/src/img/ic_info.svg" alt="" />
                        <span>Ảnh chia sẻ URL có thể cắt theo tỷ lệ <span style="color:#ff8a00;font-weight:600;">1:2</span>, <span style="color:#ff8a00;font-weight:600;">1:1</span> hoặc <span style="color:#ff8a00;font-weight:600;">4:3</span>.</span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </main>
      </div>

      <!-- Floating Quick-Jump Pencil Buttons on Right Edge -->
      <div class="ncd-floating-quick-pins" aria-label="Phím tắt chuyển nhanh mục chỉnh sửa">
        <button type="button" class="ncd-floating-quick-pin" data-scroll-to="form-sec-theme" title="Giao diện &amp; Phông chữ">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </button>
        <button type="button" class="ncd-floating-quick-pin" data-scroll-to="form-sec-basic" title="Thông tin cơ bản">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </button>
        <button type="button" class="ncd-floating-quick-pin" data-scroll-to="form-sec-opening" title="Hiệu ứng mở màn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </button>
        <button type="button" class="ncd-floating-quick-pin" data-scroll-to="form-sec-ending" title="Ảnh và lời kết">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </button>
        <button type="button" class="ncd-floating-quick-pin" data-scroll-to="form-sec-order" title="Thay đổi thứ tự &amp; Chia sẻ URL">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </button>
      </div>

      <!-- Modal 1: Chọn kiểu thiệp mở màn (Opening Invitation Theme Picker) -->
      <div class="intro-sample-modal editor-modal-animated" id="modal-opening-theme-picker" style="display:none;">
        <div class="bg" data-close-modal="modal-opening-theme-picker"></div>
        <div class="inner" style="max-width:440px;padding:18px;">
          <div class="popup-head">
            <div class="title">Chọn kiểu thiệp mở màn</div>
            <div class="description">Chọn phong cách thiệp 3D xuất hiện khi khách mời mở thiệp</div>
          </div>
          <div class="content" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:8px 4px;">
            <button type="button" class="opening-theme-option" data-theme-id="royal-red" data-theme-label="royal | Đỏ Hoàng Gia" data-theme-bg="#3e0001" style="padding:12px;border:2px solid #1a1a1a;border-radius:12px;background:#fff;cursor:pointer;text-align:left;">
              <div style="height:64px;border-radius:8px;background:linear-gradient(135deg,#2d0002,#5c080a);display:flex;align-items:center;justify-content:center;color:#e1bc7c;font-weight:700;font-size:18px;">囍</div>
              <div style="font-size:13px;font-weight:600;margin-top:8px;color:#1a1a1a;">royal | Đỏ Hoàng Gia</div>
              <div style="font-size:11px;color:#777;">Sắc đỏ truyền thống &amp; nhũ vàng</div>
            </button>
            <button type="button" class="opening-theme-option" data-theme-id="royal-emerald" data-theme-label="emerald | Xanh Ngọc Lục Bảo" data-theme-bg="#1e352b" style="padding:12px;border:1px solid #ddd;border-radius:12px;background:#fff;cursor:pointer;text-align:left;">
              <div style="height:64px;border-radius:8px;background:linear-gradient(135deg,#13261d,#2a4a3c);display:flex;align-items:center;justify-content:center;color:#e1bc7c;font-weight:700;font-size:18px;">囍</div>
              <div style="font-size:13px;font-weight:600;margin-top:8px;color:#1a1a1a;">emerald | Xanh Ngọc</div>
              <div style="font-size:11px;color:#777;">Thanh lịch &amp; sang trọng</div>
            </button>
            <button type="button" class="opening-theme-option" data-theme-id="royal-navy" data-theme-label="midnight | Xanh Hoàng Gia" data-theme-bg="#16243b" style="padding:12px;border:1px solid #ddd;border-radius:12px;background:#fff;cursor:pointer;text-align:left;">
              <div style="height:64px;border-radius:8px;background:linear-gradient(135deg,#0f1829,#223759);display:flex;align-items:center;justify-content:center;color:#e1bc7c;font-weight:700;font-size:18px;">❦</div>
              <div style="font-size:13px;font-weight:600;margin-top:8px;color:#1a1a1a;">midnight | Xanh Đêm</div>
              <div style="font-size:11px;color:#777;">Hiện đại Châu Âu</div>
            </button>
            <button type="button" class="opening-theme-option" data-theme-id="envelope-3d" data-theme-label="envelope | Phong Bì Sáp 3D" data-theme-bg="#6d3d49" style="padding:12px;border:1px solid #ddd;border-radius:12px;background:#fff;cursor:pointer;text-align:left;">
              <div style="height:64px;border-radius:8px;background:linear-gradient(135deg,#f8ece4,#dfC5b8);display:flex;align-items:center;justify-content:center;color:#6d3d49;font-weight:700;font-size:18px;">✉</div>
              <div style="font-size:13px;font-weight:600;margin-top:8px;color:#1a1a1a;">envelope | Phong Bì 3D</div>
              <div style="font-size:11px;color:#777;">Phong bì hoa &amp; dấu sáp nổi</div>
            </button>
          </div>
          <div style="display:flex;justify-content:center;margin-top:8px;">
            <button type="button" data-close-modal="modal-opening-theme-picker" style="padding:9px 28px;border-radius:999px;border:1px solid #1a1a1a;background:#1a1a1a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;">Đóng</button>
          </div>
        </div>
      </div>

      <!-- Modal 2: Xem trước chia sẻ URL (URL Share Preview Modal) -->
      <div class="intro-sample-modal url-share-preview-modal editor-modal-animated" id="modal-url-share-preview" style="display:none;">
        <div class="bg" data-close-modal="modal-url-share-preview"></div>
        <div class="inner" style="padding:18px;">
          <div class="popup-head">
            <div class="title">Xem trước khi chia sẻ link</div>
          </div>
          <div class="content">
            <div class="url-share-preview-scene">
              <div class="url-share-preview-scene__platform">ZALO / FACEBOOK MESSENGER</div>
              <div class="url-share-preview-card">
                <div class="url-share-preview-card__thumbnail-wrap">
                  <img class="url-share-preview-card__thumbnail-img" src="https://assets.ngaychungdoi.com/templates/e0f86e21-15c0-4120-a820-2631a1e2bdbf.jpg" alt="" style="max-height:200px;object-fit:cover;" />
                </div>
                <div class="url-share-preview-card__contents">
                  <div class="url-share-preview-card__domain">NGAYCHUNGDOI.COM</div>
                  <div class="url-share-preview-card__title" id="url-share-preview-modal-title">Thiệp cưới THANH PHONG &amp; THUÝ KIỀU</div>
                  <div class="url-share-preview-card__description" id="url-share-preview-modal-desc">Trân trọng kính mời Quý khách đến tham dự Lễ Thành Hôn vào ngày 28.11.2026.</div>
                </div>
              </div>
              <div class="url-share-preview-bubble__link">https://ngaychungdoi.com/w/thanh-phong-thuy-kieu</div>
              <p class="url-share-preview-scene__note">Giao diện mô phỏng thẻ chia sẻ trên mạng xã hội</p>
            </div>
          </div>
          <div class="popup-footer" style="display:flex;justify-content:center;padding-top:8px;">
            <button type="button" class="close-btn" data-close-modal="modal-url-share-preview" style="padding:9px 28px;border-radius:999px;border:1px solid #1a1a1a;background:#1a1a1a;color:#fff;font-size:13px;font-weight:600;">Đóng</button>
          </div>
        </div>
      </div>

    </div>
  </div>
  <script>
    window.__API_BASE__ = "${apiBase}";
    window.__CARD_ID__ = "${templateId}";
  </script>
  <script src="/app-client.js"></script>
</body>
</html>`;
}

module.exports = { renderCardEditorPage };
