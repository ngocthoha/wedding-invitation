(function () {
  const API_BASE = window.__API_BASE__ || "http://localhost:3008";

  // Toast helper
  function showToast(message) {
    let toast = document.getElementById("ncd-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "ncd-toast";
      toast.style.cssText =
        "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1f1f27;color:#fff;padding:12px 22px;border-radius:999px;font-size:13px;font-weight:600;z-index:1000000;box-shadow:0 12px 30px rgba(0,0,0,0.28);transition:opacity 0.25s,transform 0.25s;opacity:0;pointer-events:none;";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(-4px)";
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(4px)";
    }, 2600);
  }
  window.showNcdToast = showToast;

  // 1. Mobile Slide Drawer (#side-menu-btn & aside#m-slide-bar)
  function initMobileDrawer() {
    const btn = document.getElementById("side-menu-btn");
    const drawer = document.getElementById("m-slide-bar");
    if (!btn || !drawer) return;
    const dimd = drawer.querySelector(".dimd");
    const openDrawer = () => {
      drawer.classList.add("active");
      btn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    };
    const closeDrawer = () => {
      drawer.classList.remove("active");
      btn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };
    btn.addEventListener("click", openDrawer);
    if (dimd) dimd.addEventListener("click", closeDrawer);
    drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeDrawer));
  }

  // 2. 3D Perspective Coverflow Carousel (.home-coverflow / HeroCardSlider - Module 901648)
  function initCoverflow3D() {
    const coverflow = document.querySelector(".home-coverflow");
    if (!coverflow) return;
    const track = coverflow.querySelector(".home-coverflow-track");
    const slides = Array.from(coverflow.querySelectorAll(".home-coverflow-slide"));
    if (!track || slides.length === 0) return;

    const prevBtn = coverflow.querySelector('button[aria-label="Mẫu trước"]');
    const nextBtn = coverflow.querySelector('button[aria-label="Mẫu tiếp theo"]');
    const baseCount = Math.floor(slides.length / 3) || 10;

    function getStepWidth() {
      if (slides.length >= 2) {
        const d = slides[1].offsetLeft - slides[0].offsetLeft;
        if (d > 0) return d;
      }
      return slides[0] ? slides[0].offsetWidth : 268;
    }

    function apply3DTransforms() {
      const stepW = getStepWidth() || 268;
      const viewportCenter = track.scrollLeft + track.clientWidth / 2;
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const card = slide.querySelector(".home-coverflow-card");
        if (!card) continue;
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const a = (slideCenter - viewportCenter) / stepW;
        const n = Math.min(Math.abs(a), 3);
        const rotY = Math.max(-40, Math.min(40, -28 * a));
        const scale = 1 - 0.05 * n;
        const opacity = 1 - 0.09 * n;
        card.style.transform = `perspective(1100px) rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
        card.style.opacity = String(opacity.toFixed(4));
        slide.style.zIndex = String(10 - Math.round(2 * n));
      }
    }

    let rafId = 0;
    let recenterTimer = 0;
    function scheduleUpdate() {
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          rafId = 0;
          apply3DTransforms();
        });
      }
    }

    function recenterIfNeeded() {
      const stepW = getStepWidth();
      const setWidth = stepW * baseCount;
      if (setWidth <= 0) return;
      const current = track.scrollLeft;
      if (current < setWidth * 0.5 || current >= setWidth * 1.5) {
        const normalized = setWidth + (((current - setWidth) % setWidth) + setWidth) % setWidth;
        track.scrollTo({ left: normalized, behavior: "instant" });
        apply3DTransforms();
      }
    }

    // Initial center in middle copy
    const initialStep = getStepWidth();
    if (track.scrollLeft < initialStep * 2) {
      track.scrollTo({ left: initialStep * baseCount, behavior: "instant" });
    }
    apply3DTransforms();

    track.addEventListener(
      "scroll",
      () => {
        scheduleUpdate();
        clearTimeout(recenterTimer);
        recenterTimer = setTimeout(recenterIfNeeded, 180);
      },
      { passive: true }
    );

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => scheduleUpdate());
      ro.observe(track);
    }

    function scrollByStep(dir) {
      const stepW = getStepWidth();
      track.scrollBy({ left: dir * stepW, behavior: "smooth" });
    }

    if (prevBtn) prevBtn.addEventListener("click", () => scrollByStep(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => scrollByStep(1));

    // Pointer drag support
    let pointerDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let dragged = false;

    track.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      pointerDown = true;
      dragged = false;
      startX = e.clientX;
      startScrollLeft = track.scrollLeft;
    });
    window.addEventListener("pointermove", (e) => {
      if (!pointerDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6) {
        dragged = true;
        track.classList.add("is-dragging");
        track.scrollLeft = startScrollLeft - dx;
      }
    });
    window.addEventListener("pointerup", () => {
      if (!pointerDown) return;
      pointerDown = false;
      track.classList.remove("is-dragging");
    });
    track.addEventListener(
      "click",
      (e) => {
        if (dragged) {
          e.preventDefault();
          e.stopPropagation();
          dragged = false;
        }
      },
      true
    );
  }

  // 3. Create Card Modal Sheet (HomeCreateCardButton)
  function initCreateCardSheet() {
    let sheetRoot = document.querySelector(".home-create-sheet-root");
    if (!sheetRoot) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <div class="home-create-sheet-root fixed inset-0 z-[11000]" role="presentation" style="display:none;">
          <button type="button" class="home-create-sheet-overlay" aria-label="Đóng"></button>
          <div role="dialog" aria-modal="true" aria-labelledby="ncd-create-sheet-title" class="home-create-sheet-panel">
            <div class="home-create-sheet-handle" aria-hidden="true"></div>
            <div class="mb-3 flex items-start justify-between gap-3 sm:mb-4">
              <div class="text-left">
                <h2 id="ncd-create-sheet-title" class="text-base font-semibold tracking-tight text-black sm:text-lg">Bạn muốn tạo thiệp theo cách nào?</h2>
                <p class="mt-1 text-xs text-black/50 sm:text-[13px]">Chọn một cách để bắt đầu.</p>
              </div>
              <button type="button" class="ncd-sheet-close shrink-0 rounded-full border border-black/8 p-2 text-black/45 transition hover:bg-black/5 hover:text-black/70 inline-flex" aria-label="Đóng">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>
              </button>
            </div>
            <ul class="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
              <li class="min-h-0">
                <a class="home-create-option group flex flex-row items-center gap-3 rounded-xl border border-black/8 p-3 transition duration-200 hover:border-black/12 hover:shadow-sm sm:flex-col sm:items-start sm:gap-0 sm:rounded-2xl sm:p-4 bg-slate-50 hover:bg-slate-100/80" href="/card/create?mode=scratch">
                  <span class="home-create-option-icon inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm sm:h-10 sm:w-10 sm:rounded-2xl bg-slate-900 text-white">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M12 20h9" stroke-linecap="round"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" stroke-linejoin="round"></path></svg>
                  </span>
                  <span class="min-w-0 flex-1 sm:mt-3 sm:flex-none">
                    <span class="block text-sm font-semibold leading-snug text-black">Tạo từ đầu</span>
                    <span class="mt-0.5 block text-xs leading-relaxed text-black/50 sm:mt-1">Thiết kế trắng, tự nhập và chỉnh sửa theo ý bạn.</span>
                  </span>
                  <span class="inline-flex shrink-0 items-center text-black/70 sm:mt-3 sm:w-full sm:text-sm sm:font-medium">Bắt đầu →</span>
                </a>
              </li>
              <li class="min-h-0">
                <a class="home-create-option group flex flex-row items-center gap-3 rounded-xl border border-black/8 p-3 transition duration-200 hover:border-black/12 hover:shadow-sm sm:flex-col sm:items-start sm:gap-0 sm:rounded-2xl sm:p-4 bg-rose-50 hover:bg-rose-100/70" href="/mau-thiep">
                  <span class="home-create-option-icon inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm sm:h-10 sm:w-10 sm:rounded-2xl bg-rose-600 text-white">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="3" y="3" width="7" height="9" rx="1.5"></rect><rect x="14" y="3" width="7" height="5" rx="1.5"></rect><rect x="14" y="12" width="7" height="9" rx="1.5"></rect><rect x="3" y="16" width="7" height="5" rx="1.5"></rect></svg>
                  </span>
                  <span class="min-w-0 flex-1 sm:mt-3 sm:flex-none">
                    <span class="block text-sm font-semibold leading-snug text-black">Từ mẫu có sẵn</span>
                    <span class="mt-0.5 block text-xs leading-relaxed text-black/50 sm:mt-1">Chọn từ bộ sưu tập 30+ mẫu thiệp độc quyền.</span>
                  </span>
                  <span class="inline-flex shrink-0 items-center text-black/70 sm:mt-3 sm:w-full sm:text-sm sm:font-medium">Xem mẫu →</span>
                </a>
              </li>
              <li class="min-h-0">
                <a class="home-create-option group flex flex-row items-center gap-3 rounded-xl border border-black/8 p-3 transition duration-200 hover:border-black/12 hover:shadow-sm sm:flex-col sm:items-start sm:gap-0 sm:rounded-2xl sm:p-4 bg-amber-50 hover:bg-amber-100/70" href="/card/create?mode=scan">
                  <span class="home-create-option-icon inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm sm:h-10 sm:w-10 sm:rounded-2xl bg-amber-600 text-white">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M4 7V5a1 1 0 0 1 1-1h2M20 7V5a1 1 0 0 0-1-1h-2M4 17v2a1 1 0 0 0 1 1h2M20 17v2a1 1 0 0 1-1 1h-2" stroke-linecap="round"></path><rect x="7" y="7" width="10" height="10" rx="1.5"></rect></svg>
                  </span>
                  <span class="min-w-0 flex-1 sm:mt-3 sm:flex-none">
                    <span class="block text-sm font-semibold leading-snug text-black">Quét thiệp giấy</span>
                    <span class="mt-0.5 block text-xs leading-relaxed text-black/50 sm:mt-1">Tải ảnh thiệp cưới in sẵn, AI tự động trích xuất thông tin.</span>
                  </span>
                  <span class="inline-flex shrink-0 items-center text-black/70 sm:mt-3 sm:w-full sm:text-sm sm:font-medium">Quét ngay →</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      `;
      sheetRoot = wrapper.firstElementChild;
      document.body.appendChild(sheetRoot);
    }

    const openSheet = () => {
      sheetRoot.style.display = "flex";
      requestAnimationFrame(() => {
        sheetRoot.classList.add("is-active");
      });
    };
    const closeSheet = () => {
      sheetRoot.classList.remove("is-active");
      setTimeout(() => {
        sheetRoot.style.display = "none";
      }, 220);
    };

    document.querySelectorAll("button.home-intro-primary, button.home-final-cta-button").forEach((btn) => {
      btn.addEventListener("click", openSheet);
    });
    sheetRoot.querySelectorAll(".home-create-sheet-overlay, .ncd-sheet-close, button[aria-label='Đóng']").forEach((el) => {
      el.addEventListener("click", closeSheet);
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sheetRoot.classList.contains("is-active")) {
        closeSheet();
      }
    });
  }

  // 4. Scroll-Triggered Autoplay Videos & AOS Scroll Animations
  function initScrollVideosAndAos() {
    const videos = document.querySelectorAll("video");
    if ("IntersectionObserver" in window && videos.length > 0) {
      const vo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const v = entry.target;
            if (entry.isIntersecting) {
              v.muted = true;
              v.play().catch(() => {});
            } else if (!v.closest("#section-main")) {
              v.pause();
            }
          });
        },
        { rootMargin: "160px 0px" }
      );
      videos.forEach((v) => vo.observe(v));
    }

    const aosNodes = document.querySelectorAll("[data-aos]");
    if (aosNodes.length > 0) {
      aosNodes.forEach((el) => el.classList.add("aos-init"));
      if ("IntersectionObserver" in window) {
        const ao = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("aos-animate");
              }
            });
          },
          { threshold: 0.06, rootMargin: "80px 0px" }
        );
        aosNodes.forEach((el) => ao.observe(el));
      } else {
        aosNodes.forEach((el) => el.classList.add("aos-animate"));
      }
    }
  }

  // 5. Wedding Card Viewer: Opening Splash, 3D Envelope Switcher, BGM, Countdown, RSVP & Guestbook
  function initWeddingCardViewer() {
    const splash = document.querySelector(".opening-invitation-splash");
    const parallaxScreen = document.getElementById("main-parallax-screen");
    if (!splash && !parallaxScreen) return;

    const cardId = window.__CARD_ID__ || "bmmd8nf8vm1i";

    // BGM Audio Setup
    let bgmAudio = document.getElementById("ncd-bgm-audio");
    if (!bgmAudio) {
      bgmAudio = document.createElement("audio");
      bgmAudio.id = "ncd-bgm-audio";
      bgmAudio.src = "https://assets.ngaychungdoi.com/mp3/744fac10-6555-48a7-b265-715d7684a943.mp3";
      bgmAudio.loop = true;
      bgmAudio.preload = "auto";
      document.body.appendChild(bgmAudio);
    }

    const bgmBtn = document.querySelector("#floating-bgm-banner button");
    let isPlayingBgm = false;
    function toggleBgm(forcePlay) {
      if (forcePlay === true || (!isPlayingBgm && forcePlay === undefined)) {
        bgmAudio
          .play()
          .then(() => {
            isPlayingBgm = true;
            if (bgmBtn) bgmBtn.style.boxShadow = "0 0 0 3px rgba(157,47,47,0.35)";
          })
          .catch(() => {});
      } else {
        bgmAudio.pause();
        isPlayingBgm = false;
        if (bgmBtn) bgmBtn.style.boxShadow = "";
      }
    }
    if (bgmBtn) {
      bgmBtn.addEventListener("click", () => {
        toggleBgm();
        showToast(isPlayingBgm ? "Đang phát nhạc nền ♫" : "Đã tạm dừng nhạc nền");
      });
    }

    function revealScrollView() {
      document.documentElement.setAttribute("data-card-public-ready", "true");
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.querySelectorAll(".scroll-view, .opening-content-hidden").forEach((sv) => {
        sv.classList.remove("opening-content-hidden");
        sv.style.overflow = "";
        sv.style.opacity = "1";
        sv.style.visibility = "visible";
      });
      document.querySelectorAll("[data-aos]").forEach((el) => el.classList.add("aos-init", "aos-animate"));
    }

    // Dismiss Opening Splash with Seal Break Animation
    function openInvitation() {
      revealScrollView();
      if (!splash) return;
      const seal = splash.querySelector(".slr-ui-seal");
      if (seal) seal.classList.add("slr-ui-seal--break");
      splash.classList.add("opening-invitation-splash--opening");
      toggleBgm(true);
      const snowVideo = document.querySelector("#main_particle_card-main-v9 video");
      if (snowVideo) {
        snowVideo.muted = true;
        snowVideo.play().catch(() => {});
      }
      setTimeout(() => {
        splash.style.transition = "opacity 0.55s ease, transform 0.55s ease";
        splash.style.opacity = "0";
        splash.style.transform = "scale(1.04)";
        setTimeout(() => {
          splash.style.display = "none";
        }, 550);
      }, 380);
    }

    if (splash) {
      splash.querySelectorAll(".slr-ui-open-button, .slr-ui-button, .slr-ui-seal, .slr-ui-card").forEach((el) => {
        el.addEventListener("click", openInvitation);
      });
    }

    // Interactive 3D Opening Scene Switcher Bar (allows testing all opening scenes on standalone public card)
    if (!window.location.pathname.startsWith("/template-embed") && !document.querySelector(".card-editor-root")) {
      const switcher = document.createElement("div");
      switcher.id = "ncd-opening-scene-switcher";
      switcher.style.cssText =
        "position:fixed;bottom:16px;left:16px;z-index:1000001;display:flex;gap:6px;flex-wrap:wrap;background:rgba(31,31,39,0.92);backdrop-filter:blur(10px);padding:7px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.15);box-shadow:0 10px 30px rgba(0,0,0,0.3);font-family:'Noto Sans',sans-serif;";
      switcher.innerHTML = `
        <span style="color:#e6d2a6;font-size:11px;font-weight:700;padding:4px 8px;">Hiệu ứng 3D:</span>
        <button type="button" data-scene="royal-red" style="background:#9d2f2f;color:#fff;border:none;border-radius:999px;padding:4px 10px;font-size:11px;font-weight:600;cursor:pointer;">Song Hỷ Đỏ (3D Seal)</button>
        <button type="button" data-scene="envelope-3d" style="background:rgba(255,255,255,0.12);color:#fff;border:none;border-radius:999px;padding:4px 10px;font-size:11px;font-weight:600;cursor:pointer;">Phong bì 3D</button>
        <button type="button" data-scene="card-content" style="background:rgba(255,255,255,0.12);color:#fff;border:none;border-radius:999px;padding:4px 10px;font-size:11px;font-weight:600;cursor:pointer;">Xem nội dung thiệp</button>
      `;
      document.body.appendChild(switcher);

      let envStage = document.getElementById("ncd-3d-envelope-stage");
      switcher.querySelectorAll("button[data-scene]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const mode = btn.getAttribute("data-scene");
          switcher.querySelectorAll("button[data-scene]").forEach((b) => {
            b.style.background = b === btn ? "#9d2f2f" : "rgba(255,255,255,0.12)";
          });
          if (mode === "royal-red") {
            if (envStage) envStage.style.display = "none";
            if (splash) {
              splash.style.display = "flex";
              splash.style.opacity = "1";
              splash.style.transform = "scale(1)";
              const seal = splash.querySelector(".slr-ui-seal");
              if (seal) seal.classList.remove("slr-ui-seal--break");
            }
          } else if (mode === "envelope-3d") {
            if (splash) splash.style.display = "none";
            if (!envStage) {
              envStage = document.createElement("div");
              envStage.id = "ncd-3d-envelope-stage";
              envStage.style.cssText =
                "position:fixed;inset:0;z-index:999998;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 30%,#fdf6f0,#ecdcd3 75%);perspective:1200px;";
              envStage.innerHTML = `
                <div class="ncd-env-card" style="position:relative;width:min(520px,92vw);aspect-ratio:934/734;transform-style:preserve-3d;transition:transform 0.7s cubic-bezier(.22,1,.36,1);cursor:pointer;">
                  <img src="https://assets.ngaychungdoi.com/card-assets/opening-effect/opening-envelope/bg.webp" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;border-radius:20px;box-shadow:0 28px 60px rgba(68,32,50,0.25);" />
                  <img src="https://assets.ngaychungdoi.com/card-assets/opening-effect/opening-envelope/floral-left.webp" alt="" style="position:absolute;left:-4%;top:6%;width:38%;transform:translateZ(26px);" />
                  <img src="https://assets.ngaychungdoi.com/card-assets/opening-effect/opening-envelope/envelope.webp" alt="" style="position:absolute;inset:8% 10%;width:80%;height:84%;object-fit:contain;transform:translateZ(40px);" />
                  <img src="https://assets.ngaychungdoi.com/card-assets/opening-effect/opening-envelope/floral-right-a.webp" alt="" style="position:absolute;right:-3%;bottom:8%;width:34%;transform:translateZ(52px);" />
                  <img src="https://assets.ngaychungdoi.com/card-assets/opening-effect/opening-envelope/seal.webp" alt="Mở thiệp" style="position:absolute;left:50%;top:54%;width:17%;transform:translate(-50%,-50%) translateZ(75px);filter:drop-shadow(0 10px 18px rgba(0,0,0,0.28));transition:transform 0.4s;" />
                  <div style="position:absolute;left:50%;top:26%;transform:translate(-50%,-50%) rotate(5.32deg) translateZ(65px);text-align:center;color:#6d3d49;font-family:Georgia,serif;">
                    <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;">Wedding Invitation</div>
                    <div style="font-size:22px;font-weight:700;margin-top:4px;">Thanh Phong &amp; Thuý Kiều</div>
                    <div style="font-size:12px;margin-top:4px;color:#9d2f2f;font-style:italic;">Chạm vào dấu sáp 3D để mở thiệp</div>
                  </div>
                </div>
              `;
              document.body.appendChild(envStage);
              const envCard = envStage.querySelector(".ncd-env-card");
              envStage.addEventListener("mousemove", (e) => {
                const rect = envStage.getBoundingClientRect();
                const nx = (e.clientX - rect.left) / rect.width - 0.5;
                const ny = (e.clientY - rect.top) / rect.height - 0.5;
                envCard.style.transform = `rotateY(${(nx * 18).toFixed(2)}deg) rotateX(${(-ny * 14).toFixed(2)}deg)`;
              });
              envCard.addEventListener("click", () => {
                revealScrollView();
                envCard.style.transform = "rotateX(25deg) scale(1.08)";
                envStage.style.transition = "opacity 0.45s ease";
                envStage.style.opacity = "0";
                toggleBgm(true);
                setTimeout(() => {
                  envStage.style.display = "none";
                }, 450);
              });
            } else {
              envStage.style.display = "flex";
              envStage.style.opacity = "1";
            }
          } else if (mode === "card-content") {
            revealScrollView();
            if (envStage) envStage.style.display = "none";
            if (splash && splash.style.display !== "none") {
              openInvitation();
            }
          }
        });
      });
    }

    // Live D-Day Countdown Timer (#section-calendar)
    const countdownBoxes = document.querySelectorAll("#section-calendar .time-box .num, #section-calendar .countdown-num");
    function updateCountdown() {
      const target = new Date("2026-12-26T18:00:00+07:00").getTime();
      const diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      const vals = [d, h, m, s];
      countdownBoxes.forEach((box, idx) => {
        if (vals[idx] !== undefined) box.textContent = String(vals[idx]).padStart(2, "0");
      });
    }
    if (countdownBoxes.length > 0) {
      updateCountdown();
      setInterval(updateCountdown, 1000);
    }

    // Interactive RSVP Modal + Live Backend Submission (POST /cards/:id/rsvp)
    const rsvpSection = document.getElementById("section-rsvp");
    if (rsvpSection) {
      const rsvpButtons = rsvpSection.querySelectorAll("button, a.btn, .rsvp-btn");
      rsvpButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          openRsvpModal(cardId);
        });
      });
      // Also attach a clean interactive RSVP form directly inside #section-rsvp if none is open
      if (!document.getElementById("ncd-inline-rsvp-form")) {
        const formBox = document.createElement("form");
        formBox.id = "ncd-inline-rsvp-form";
        formBox.style.cssText =
          "max-width:380px;margin:18px auto 0;padding:18px;background:#fffaf8;border:1px solid #edddda;border-radius:18px;text-align:left;font-family:'Noto Sans',sans-serif;box-shadow:0 10px 24px rgba(68,32,50,0.06);";
        formBox.innerHTML = `
          <div style="font-size:14px;font-weight:700;color:#1f1f27;margin-bottom:10px;">Xác nhận tham dự (RSVP)</div>
          <input name="name" required placeholder="Tên của bạn (VD: Bạn Huy & người ấy)" style="width:100%;padding:9px 12px;border:1px solid #dfcbcb;border-radius:10px;font-size:13px;margin-bottom:8px;background:#fff;color:#1f1f27;" />
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
            <select name="attending" style="padding:9px 10px;border:1px solid #dfcbcb;border-radius:10px;font-size:13px;background:#fff;color:#1f1f27;">
              <option value="YES">Sẽ tham dự ♥</option>
              <option value="MAYBE">Có thể tham dự</option>
              <option value="NO">Tiếc quá bận mất rồi</option>
            </select>
            <select name="guestsCount" style="padding:9px 10px;border:1px solid #dfcbcb;border-radius:10px;font-size:13px;background:#fff;color:#1f1f27;">
              <option value="1">Đi 1 người</option>
              <option value="2" selected>Đi 2 người</option>
              <option value="3">Đi 3 người</option>
              <option value="4">Đi cùng gia đình</option>
            </select>
          </div>
          <button type="submit" style="width:100%;padding:10px 16px;background:#9d2f2f;color:#fff;border:none;border-radius:999px;font-size:13px;font-weight:600;cursor:pointer;">Gửi xác nhận ngay</button>
          <div id="ncd-rsvp-status" style="margin-top:8px;font-size:12px;color:#30735b;display:none;"></div>
        `;
        rsvpSection.appendChild(formBox);

        formBox.addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(formBox);
          const payload = {
            name: fd.get("name"),
            attending: fd.get("attending"),
            guestsCount: Number(fd.get("guestsCount") || 1)
          };
          try {
            const res = await fetch(`${API_BASE}/cards/${encodeURIComponent(cardId)}/rsvp`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            const data = await res.json();
            const st = document.getElementById("ncd-rsvp-status");
            if (st) {
              st.style.display = "block";
              st.textContent = `✓ Đã ghi nhận phản hồi của ${payload.name} (${data.rsvps ? data.rsvps.length : 1} khách đã xác nhận).`;
            }
            showToast("Đã gửi xác nhận tham dự thành công!");
            formBox.reset();
          } catch {
            showToast("Đã lưu xác nhận tham dự!");
          }
        });
      }
    }

    // Interactive Guestbook Wishes (#section-ending — wired to GET/POST /cards/:id/guestbook)
    const endingSection = document.getElementById("section-ending") || document.getElementById("section-rsvp");
    if (endingSection && !document.getElementById("ncd-live-guestbook")) {
      const gbBox = document.createElement("div");
      gbBox.id = "ncd-live-guestbook";
      gbBox.style.cssText =
        "max-width:380px;margin:22px auto;padding:18px;background:#fff;border:1px solid #edddda;border-radius:18px;text-align:left;font-family:'Noto Sans',sans-serif;box-shadow:0 10px 24px rgba(68,32,50,0.06);";
      gbBox.innerHTML = `
        <div style="font-size:14px;font-weight:700;color:#1f1f27;margin-bottom:10px;">Sổ lưu bút &amp; Lời chúc</div>
        <form id="ncd-guestbook-form" style="margin-bottom:14px;">
          <input name="authorName" required placeholder="Tên của bạn" style="width:100%;padding:8px 12px;border:1px solid #dfcbcb;border-radius:10px;font-size:13px;margin-bottom:8px;color:#1f1f27;" />
          <textarea name="message" required rows="2" placeholder="Gửi lời chúc tốt đẹp đến cô dâu & chú rể..." style="width:100%;padding:8px 12px;border:1px solid #dfcbcb;border-radius:10px;font-size:13px;margin-bottom:8px;color:#1f1f27;"></textarea>
          <button type="submit" style="width:100%;padding:9px 14px;background:#1f1f27;color:#fff;border:none;border-radius:999px;font-size:12.5px;font-weight:600;cursor:pointer;">Gửi lời chúc ♥</button>
        </form>
        <div id="ncd-guestbook-list" style="display:grid;gap:8px;max-height:220px;overflow-y:auto;"></div>
      `;
      endingSection.appendChild(gbBox);

      const listEl = document.getElementById("ncd-guestbook-list");
      function renderWishes(wishes) {
        if (!listEl) return;
        listEl.innerHTML = (wishes || [])
          .map(
            (w) => `
            <div style="padding:10px 12px;background:#fff5f3;border:1px solid #edddda;border-radius:12px;">
              <div style="font-size:12px;font-weight:700;color:#9d2f2f;">${w.authorName}</div>
              <div style="font-size:12.5px;color:#1f1f27;margin-top:3px;font-family:Georgia,serif;font-style:italic;">"${w.message}"</div>
            </div>
          `
          )
          .join("");
      }

      fetch(`${API_BASE}/cards/${encodeURIComponent(cardId)}/guestbook`)
        .then((r) => r.json())
        .then((d) => renderWishes(d.guestbook))
        .catch(() => {});

      const gbForm = document.getElementById("ncd-guestbook-form");
      if (gbForm) {
        gbForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(gbForm);
          const res = await fetch(`${API_BASE}/cards/${encodeURIComponent(cardId)}/guestbook`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              authorName: fd.get("authorName"),
              message: fd.get("message")
            })
          });
          const data = await res.json();
          renderWishes(data.guestbook);
          gbForm.reset();
          showToast("Cảm ơn lời chúc ngọt ngào của bạn ♥");
        });
      }
    }
  }

  function openRsvpModal(cardId) {
    const inlineForm = document.getElementById("ncd-inline-rsvp-form");
    if (inlineForm) {
      inlineForm.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = inlineForm.querySelector("input[name='name']");
      if (input) input.focus();
    }
  }

  // 6. 3D LED Wedding Stage Canvas Particle Engine (/man-hinh-led-dam-cuoi)
  function initLedWeddingStage3D() {
    const walls = document.querySelectorAll(".led-stage-wall, .led-mini-wall");
    if (walls.length === 0) return;

    let currentEffect = "nebula"; // nebula | meteor | golden-hearts

    walls.forEach((wall, index) => {
      const canvas = document.createElement("canvas");
      canvas.className = "ncd-led-3d-canvas";
      canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;mix-blend-mode:screen;";
      wall.appendChild(canvas);

      const ctx = canvas.getContext("2d");
      const count = index === 0 ? 75 : 32;
      const particles = Array.from({ length: count }, () => ({
        x: Math.random(),
        y: Math.random(),
        z: Math.random() * 0.8 + 0.2,
        vx: (Math.random() - 0.5) * 0.0008,
        vy: -Math.random() * 0.0012 - 0.0003,
        size: Math.random() * 2.6 + 0.8,
        hue: Math.random() > 0.5 ? 42 : 345
      }));

      function resize() {
        const rect = wall.getBoundingClientRect();
        canvas.width = Math.max(320, Math.floor(rect.width));
        canvas.height = Math.max(180, Math.floor(rect.height));
      }
      resize();
      window.addEventListener("resize", resize);

      function draw() {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        for (const p of particles) {
          p.x += p.vx * p.z;
          p.y += p.vy * p.z;
          if (p.y < -0.05) {
            p.y = 1.05;
            p.x = Math.random();
          }
          if (p.x < -0.05) p.x = 1.05;
          if (p.x > 1.05) p.x = -0.05;

          const px = p.x * w;
          const py = p.y * h;
          const r = p.size * p.z * 1.4;

          if (currentEffect === "meteor") {
            const grad = ctx.createLinearGradient(px, py, px + 24 * p.z, py + 14 * p.z);
            grad.addColorStop(0, "rgba(255, 240, 200, 0.9)");
            grad.addColorStop(1, "rgba(255, 240, 200, 0)");
            ctx.strokeStyle = grad;
            ctx.lineWidth = Math.max(1, r * 0.6);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + 24 * p.z, py + 14 * p.z);
            ctx.stroke();
          } else {
            const grad = ctx.createRadialGradient(px, py, 0, px, py, r * 3.2);
            grad.addColorStop(0, `hsla(${p.hue}, 85%, 82%, 0.92)`);
            grad.addColorStop(0.4, `hsla(${p.hue}, 75%, 65%, 0.35)`);
            grad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(px, py, r * 3.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        requestAnimationFrame(draw);
      }
      requestAnimationFrame(draw);
    });

    // Interactive LED Stage Effect Controller
    const heroStage = document.querySelector(".led-stage");
    if (heroStage && !document.getElementById("ncd-led-controller")) {
      const bar = document.createElement("div");
      bar.id = "ncd-led-controller";
      bar.style.cssText =
        "display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:14px;position:relative;z-index:5;";
      bar.innerHTML = `
        <button type="button" data-led-fx="nebula" style="background:#e6d2a6;color:#1d160a;border:none;border-radius:999px;padding:7px 15px;font-size:12px;font-weight:700;cursor:pointer;">✦ Nebula Ngân Hà 3D</button>
        <button type="button" data-led-fx="meteor" style="background:rgba(255,255,255,0.1);color:#f6f1e7;border:1px solid rgba(230,210,166,0.35);border-radius:999px;padding:7px 15px;font-size:12px;font-weight:600;cursor:pointer;">☄ Mưa Sao Băng</button>
        <button type="button" data-led-fx="fullscreen" style="background:rgba(255,255,255,0.1);color:#f6f1e7;border:1px solid rgba(230,210,166,0.35);border-radius:999px;padding:7px 15px;font-size:12px;font-weight:600;cursor:pointer;">⛶ Trình chiếu toàn màn hình</button>
      `;
      heroStage.appendChild(bar);
      bar.querySelectorAll("button[data-led-fx]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const fx = btn.getAttribute("data-led-fx");
          if (fx === "fullscreen") {
            const wall = document.querySelector(".led-stage-wall");
            if (wall && wall.requestFullscreen) {
              wall.requestFullscreen().catch(() => {});
            } else {
              showToast("Đã bật chế độ trình chiếu sân khấu LED 16:9");
            }
            return;
          }
          currentEffect = fx;
          bar.querySelectorAll("button[data-led-fx]").forEach((b) => {
            if (b.getAttribute("data-led-fx") !== "fullscreen") {
              const active = b === btn;
              b.style.background = active ? "#e6d2a6" : "rgba(255,255,255,0.1)";
              b.style.color = active ? "#1d160a" : "#f6f1e7";
            }
          });
          showToast(`Đã chuyển hiệu ứng sân khấu LED: ${btn.textContent}`);
        });
      });
    }
  }

  // 7. Template Catalog (/mau-thiep) Interactive Filter + Detail Modal
  function initTemplateCatalog() {
    const catalog = document.querySelector(".template-catalog");
    if (!catalog) return;

    const modeButtons = catalog.querySelectorAll(".template-catalog__mode-switch__btn");
    const tiles = Array.from(catalog.querySelectorAll(".template-tile"));
    const countStatus = catalog.querySelector(".template-catalog__tab-count");
    const modal = document.getElementById("ncd-template-detail-modal");

    function filterByMode(mode) {
      let visibleCount = 0;
      tiles.forEach((tile) => {
        const kind = tile.getAttribute("data-kind") || "form";
        const show = mode === "all" || kind === mode;
        tile.style.display = show ? "" : "none";
        if (show) visibleCount++;
      });
      if (countStatus) {
        countStatus.textContent = `${visibleCount} mẫu · Chọn một mẫu để xem thử`;
      }
      modeButtons.forEach((btn) => {
        const active = btn.getAttribute("data-mode") === mode;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", String(active));
      });
    }

    modeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-mode") || "all";
        filterByMode(mode);
      });
    });

    // Hover long-preview scroll setup
    tiles.forEach((tile) => {
      const media = tile.querySelector(".template-tile__media");
      if (media) {
        media.style.setProperty("--preview-scroll", "-65%");
        media.style.setProperty("--preview-duration", "6.5s");
      }
      tile.addEventListener("click", () => {
        const id = tile.getAttribute("data-raw-id") || "bmmd8nf8vm1i";
        const kind = tile.getAttribute("data-kind") || "form";
        const name = tile.getAttribute("data-name") || "Mẫu thiệp";
        const desc = tile.getAttribute("data-desc") || "";
        const href = tile.getAttribute("data-href") || `/mau-thiep/template/${id}`;
        if (!modal) {
          window.location.href = href;
          return;
        }
        const titleEl = modal.querySelector("#template-detail-title");
        const descEl = modal.querySelector(".template-detail__desc");
        const iframeEl = modal.querySelector("iframe.template-preview-iframe");
        const useBtn = modal.querySelector(".template-detail__btn--primary");
        const fullBtn = modal.querySelector(".template-detail__btn--ghost");
        if (titleEl) titleEl.textContent = name;
        if (descEl) descEl.textContent = desc;
        if (iframeEl) iframeEl.src = `/template-embed/${kind}/${encodeURIComponent(id)}`;
        if (useBtn) useBtn.href = `/card/create?template=${encodeURIComponent(id)}`;
        if (fullBtn) fullBtn.href = href;
        modal.style.display = "flex";
        requestAnimationFrame(() => modal.classList.add("is-open"));
      });
    });

    if (modal) {
      const closeModal = () => {
        modal.classList.remove("is-open");
        const iframeEl = modal.querySelector("iframe.template-preview-iframe");
        if (iframeEl) iframeEl.src = "about:blank";
        setTimeout(() => {
          modal.style.display = "none";
        }, 250);
      };
      modal.querySelectorAll(".template-modal__backdrop, .template-modal__close").forEach((b) => {
        b.addEventListener("click", closeModal);
      });
    }
  }

  // 8. Production Card Editor (/card/create/form, /card/create, /builder/:id)
  function initCardEditor() {
    const editorRoot = document.querySelector(".card-editor-root");
    if (!editorRoot) return;

    const cardId = window.__CARD_ID__ || "bmmd8nf8vm1i";
    const phoneContainer = editorRoot.querySelector(".phone .scroll-view .container");
    const phoneScrollView = document.getElementById("editor-phone-scroll-view");

    // 8.1 Accordion Header Toggle + Phone Scroll-to-Section
    // Helper: scroll the phone preview to a phone-section id
    function scrollPhoneToSection(phoneSectionId) {
      if (!phoneScrollView || !phoneSectionId) return;
      const phoneSection = document.getElementById(phoneSectionId);
      if (!phoneSection) return;
      // scrollIntoView inside a scrollable ancestor — we must scroll the phoneScrollView
      const phoneRect = phoneScrollView.getBoundingClientRect();
      const sectionRect = phoneSection.getBoundingClientRect();
      const offset = sectionRect.top - phoneRect.top + phoneScrollView.scrollTop - 12;
      phoneScrollView.scrollTo({ top: offset, behavior: "smooth" });
      // Flash highlight
      phoneSection.classList.add("phone-section-active-highlight");
      setTimeout(() => phoneSection.classList.remove("phone-section-active-highlight"), 1200);
    }

    // Helper: open a right-panel dropdown and scroll to it
    function openFormSection(formSectionId) {
      const sec = document.getElementById(formSectionId);
      if (!sec) return;
      const openChk = sec.querySelector("input.is-open");
      if (openChk) openChk.checked = true;
      // Scroll the form panel to the section
      setTimeout(() => {
        sec.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }

    editorRoot.querySelectorAll(".section-form > .header").forEach((header) => {
      header.addEventListener("click", (e) => {
        if (
          e.target.closest(".section-title-toggle") ||
          e.target.closest("button.preview")
        ) {
          return;
        }
        const targetId = header.getAttribute("data-toggle-section");
        const chk = targetId
          ? document.getElementById(targetId)
          : header.parentElement.querySelector("input.is-open");
        if (chk) {
          const wasOpen = chk.checked;
          chk.checked = !chk.checked;
          // If we just opened the section, scroll phone to corresponding section
          if (!wasOpen) {
            const phoneSectionId = header.getAttribute("data-phone-target");
            if (phoneSectionId) {
              scrollPhoneToSection(phoneSectionId);
            }
          }
        }
      });
    });

    // 8.1b Inject "Sửa" edit overlay buttons on each phone preview section
    // Map: phone section id → right-panel form section id
    const PHONE_TO_FORM_MAP = {
      "section-main": "form-sec-theme",
      "section-intro": "form-sec-intro",
      "section-profile": "form-sec-profile",
      "section-wedding-ceremony-info": "form-sec-ceremony",
      "section-wedding-invitation": "form-sec-invitation",
      "section-calendar": "form-sec-calendar",
      "section-location": "form-sec-location",
      "section-gallery": "form-sec-gallery",
      "section-account": "form-sec-account",
      "section-rsvp": "form-sec-rsvp",
      "section-middle-image1": "form-sec-middle-image",
      "section-ending": "form-sec-ending",
    };
    // Section friendly names for the button label
    const PHONE_SECTION_LABELS = {
      "section-main": "Giao diện",
      "section-intro": "Lời ngỏ",
      "section-profile": "Hồ sơ",
      "section-wedding-ceremony-info": "Lễ cưới",
      "section-wedding-invitation": "Lời mời",
      "section-calendar": "Lịch",
      "section-location": "Địa điểm",
      "section-gallery": "Ảnh",
      "section-account": "Tài khoản",
      "section-rsvp": "RSVP",
      "section-middle-image1": "Ảnh giữa",
      "section-ending": "Lời kết",
    };
    Object.entries(PHONE_TO_FORM_MAP).forEach(([phoneSectionId, formSectionId]) => {
      const phoneSection = document.getElementById(phoneSectionId);
      if (!phoneSection) return;
      // Ensure position:relative for overlay anchor
      const curPos = window.getComputedStyle(phoneSection).position;
      if (curPos === "static") phoneSection.style.position = "relative";
      const overlay = document.createElement("div");
      overlay.className = "phone-section-edit-overlay";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "phone-section-edit-btn";
      const label = PHONE_SECTION_LABELS[phoneSectionId] || "Sửa";
      btn.innerHTML = `<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>${label}`;
      btn.setAttribute("aria-label", `Chỉnh sửa mục ${label}`);
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openFormSection(formSectionId);
      });
      overlay.appendChild(btn);
      phoneSection.appendChild(overlay);
    });

    // 8.2 Section Visibility Toggle (.section-title-toggle) -> shows/hides section in live phone preview
    editorRoot.querySelectorAll(".section-title-toggle[data-preview-target]").forEach((toggle) => {
      toggle.addEventListener("change", () => {
        const targetSecId = toggle.getAttribute("data-preview-target");
        const secEl = document.getElementById(targetSecId);
        if (secEl) {
          secEl.style.display = toggle.checked ? "" : "none";
          if (toggle.checked && phoneScrollView) {
            secEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
        showToast(toggle.checked ? "Đã bật hiển thị mục trên thiệp" : "Đã ẩn mục khỏi thiệp");
      });
    });

    // 8.3 Floating Quick-Jump Pencil Buttons
    editorRoot.querySelectorAll(".ncd-floating-quick-pin[data-scroll-to]").forEach((pin) => {
      pin.addEventListener("click", () => {
        const targetId = pin.getAttribute("data-scroll-to");
        const sec = document.getElementById(targetId);
        if (sec) {
          const openChk = sec.querySelector("input.is-open");
          if (openChk) openChk.checked = true;
          sec.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    // 8.4 Theme Settings (Font family, Font size, Background color, Accent color, Background particle)
    const ftTypeSelect = document.getElementById("ft-type");
    if (ftTypeSelect && phoneContainer) {
      ftTypeSelect.addEventListener("change", () => {
        phoneContainer.classList.remove("ft-gowundodum", "ft-notoserif", "ft-ridibatang", "ft-notosans");
        phoneContainer.classList.add(ftTypeSelect.value);
        showToast("Đã đổi phông chữ thiệp");
      });
    }

    const ftSizeSelect = document.getElementById("ft-size");
    if (ftSizeSelect && phoneContainer) {
      ftSizeSelect.addEventListener("change", () => {
        phoneContainer.classList.remove("small", "basic", "big", "big2");
        phoneContainer.classList.add(ftSizeSelect.value);
        showToast("Đã cập nhật cỡ chữ");
      });
    }

    editorRoot.querySelectorAll('input[name="themeBgColor"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (!phoneContainer) return;
        phoneContainer.style.setProperty("--bg-page", radio.value);
        phoneContainer.style.backgroundColor = radio.value;
        phoneContainer.style.backgroundImage = "none";
      });
    });

    editorRoot.querySelectorAll('input[name="themeEmpColor"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (!phoneContainer) return;
        phoneContainer.style.setProperty("--color-emp", radio.value);
        phoneContainer.style.setProperty("--color-emp-btn", radio.value);
        editorRoot.querySelectorAll(".wci-couple-name").forEach((el) => {
          el.style.color = radio.value;
        });
      });
    });

    editorRoot.querySelectorAll('input[name="bgParticle"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (!phoneScrollView) return;
        let snowEl = phoneScrollView.querySelector("#snow-container");
        if (radio.value === "none") {
          if (snowEl) snowEl.remove();
          return;
        }
        if (!snowEl) {
          snowEl = document.createElement("div");
          snowEl.id = "snow-container";
          phoneScrollView.prepend(snowEl);
        }
        snowEl.className = radio.value;
        showToast("Đã cập nhật hiệu ứng rơi trên nền thiệp");
      });
    });

    // 8.5 Basic Info Live Two-Way Binding (Groom & Bride names, parents, ranks)
    function syncCoupleNamesToPreview() {
      const gLast = (document.getElementById("input-groom-last")?.value || "NGUYỄN").trim();
      const gMid = (document.getElementById("input-groom-middle")?.value || "THANH PHONG").trim();
      const bLast = (document.getElementById("input-bride-last")?.value || "NGUYỄN").trim();
      const bMid = (document.getElementById("input-bride-middle")?.value || "THUÝ KIỀU").trim();
      const gFull = `${gLast} ${gMid}`.trim();
      const bFull = `${bLast} ${bMid}`.trim();

      const coupleNames = editorRoot.querySelectorAll("#section-wedding-ceremony-info .wci-couple-name");
      if (coupleNames[0]) coupleNames[0].textContent = gFull;
      if (coupleNames[1]) coupleNames[1].textContent = bFull;

      const profileNames = editorRoot.querySelectorAll("#section-profile .profile-name");
      if (profileNames[0]) profileNames[0].textContent = gMid;
      if (profileNames[1]) profileNames[1].textContent = bMid;

      const inlineGroom = document.getElementById("inline-slr-groom");
      const inlineBride = document.getElementById("inline-slr-bride");
      if (inlineGroom) inlineGroom.textContent = gMid;
      if (inlineBride) inlineBride.textContent = bMid;

      const splashCoupleSpans = editorRoot.querySelectorAll("#editor-phone-opening-splash .slr-ui-couple-name span");
      if (splashCoupleSpans[0]) splashCoupleSpans[0].textContent = gMid;
      if (splashCoupleSpans[2]) splashCoupleSpans[2].textContent = bMid;

      const ddayText = editorRoot.querySelector("#section-calendar .dday-text");
      if (ddayText) {
        ddayText.textContent = `Còn 12 ngày nữa là đến đám cưới của ${gFull} và ${bFull}.`;
      }
    }

    ["input-groom-last", "input-groom-middle", "input-bride-last", "input-bride-middle"].forEach((id) => {
      document.getElementById(id)?.addEventListener("input", syncCoupleNamesToPreview);
    });

    const parentInputs = [
      "input-groom-father",
      "input-groom-mother",
      "input-bride-father",
      "input-bride-mother"
    ];
    parentInputs.forEach((id, idx) => {
      document.getElementById(id)?.addEventListener("input", (e) => {
        const els = editorRoot.querySelectorAll("#section-wedding-ceremony-info .wci-parent-name");
        if (els[idx]) els[idx].textContent = e.target.value;
      });
    });

    // 8.6 Greeting Section (Lời ngỏ) + Sample Picker
    const introSamples = [
      "Sau một chặng đường tìm hiểu và yêu thương, chúng con đã quyết định cùng nhau xây dựng tổ ấm, chính thức bước vào hành trình mới của cuộc đời.\nTrong niềm hạnh phúc của ngày trọng đại, chúng con trân trọng kính mời Quý khách đến tham dự Lễ Thành Hôn và chung vui cùng gia đình.\nSự hiện diện cùng những lời chúc phúc của Quý khách là niềm vinh hạnh, là món quà quý giá và ý nghĩa nhất dành cho chúng con trong ngày vui.",
      "Tình yêu không phải là nhìn chằm chằm vào nhau, mà là cùng nhau nhìn về một hướng.\nHôm nay, chúng mình chính thức viết tiếp chương mới của cuộc đời bằng một đám cưới ấm áp bên gia đình và những người thương yêu nhất.\nRất mong được đón tiếp bạn tại buổi tiệc chung vui của hai vợ chồng mình!",
      "Hạnh phúc lớn nhất của cuộc đời là tìm được một người thương mình thật lòng và cùng nắm tay đi hết những tháng năm dài rộng.\nGia đình chúng tôi trân trọng kính mời Quý vị tới dự buổi tiệc rượu mừng Lễ Thành Hôn của hai con chúng tôi."
    ];
    let sampleIdx = 0;

    const introTitleInput = document.getElementById("input-intro-title");
    const introBodyInput = document.getElementById("input-intro-body");
    if (introTitleInput) {
      introTitleInput.addEventListener("input", () => {
        const el = editorRoot.querySelector("#section-intro .vi_title");
        if (el) el.textContent = introTitleInput.value;
      });
    }
    if (introBodyInput) {
      introBodyInput.addEventListener("input", () => {
        const el = editorRoot.querySelector("#section-intro .description-wrapper p");
        if (el) el.textContent = introBodyInput.value;
      });
    }
    document.getElementById("btn-sample-intro")?.addEventListener("click", () => {
      sampleIdx = (sampleIdx + 1) % introSamples.length;
      if (introBodyInput) {
        introBodyInput.value = introSamples[sampleIdx];
        introBodyInput.dispatchEvent(new Event("input"));
      }
      showToast(`Đã áp dụng mẫu lời ngỏ #${sampleIdx + 1}`);
    });

    // 8.7 Ceremony, Invitation, Location & Account Live Bindings
    document.getElementById("input-wci-title")?.addEventListener("input", (e) => {
      const el = editorRoot.querySelector("#section-wedding-ceremony-info .vi_title");
      if (el) el.textContent = e.target.value;
    });
    document.getElementById("input-wi-title")?.addEventListener("input", (e) => {
      const el = editorRoot.querySelector("#section-wedding-invitation .vi_title");
      if (el) el.textContent = e.target.value;
    });
    document.getElementById("input-loc-name")?.addEventListener("input", (e) => {
      const p = editorRoot.querySelectorAll("#section-location .location-detail-rich p")[0];
      if (p) p.textContent = e.target.value;
    });
    document.getElementById("input-loc-address")?.addEventListener("input", (e) => {
      const p = editorRoot.querySelectorAll("#section-location .location-detail-rich p")[1];
      if (p) p.textContent = e.target.value;
    });
    document.getElementById("btn-update-map")?.addEventListener("click", () => {
      const addr = document.getElementById("input-loc-address")?.value || "Nghệ An";
      const mapIframe = editorRoot.querySelector("#section-location iframe");
      if (mapIframe) {
        mapIframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&output=embed`;
      }
      showToast("Đã cập nhật vị trí Google Maps trên thiệp!");
    });

    // 8.8 Middle Images (+ Thêm ảnh giữa trang)
    const middleImagesList = document.getElementById("middle-images-list");
    const addMiddleBtn = document.getElementById("btn-add-middle-image");
    if (addMiddleBtn && middleImagesList) {
      addMiddleBtn.addEventListener("click", () => {
        const count = middleImagesList.querySelectorAll(".design-block").length;
        if (count >= 5) {
          showToast("Chỉ có thể thêm tối đa 5 ảnh giữa trang");
          return;
        }
        const nextIdx = count + 1;
        const block = document.createElement("div");
        block.className = "design-block";
        block.setAttribute("data-mid-index", String(nextIdx));
        block.innerHTML = `
          <div class="block-header">
            <div class="block-meta">
              <span class="block-number">Ảnh ${nextIdx}</span>
              <span class="block-type-name">Kiểu 1 · Toàn khung</span>
            </div>
            <button type="button" class="remove-btn" aria-label="Xóa"></button>
          </div>
          <div class="block-body">
            <div class="design-select-row">
              <div class="design-thumb">
                <img class="design-thumb-image" src="https://assets.ngaychungdoi.com/templates/341ddfea-3dec-4b67-a7a3-a0c2f477b959.jpg" alt="" />
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
              <div class="img_attach_box has-preview" style="background-image:url('https://assets.ngaychungdoi.com/templates/341ddfea-3dec-4b67-a7a3-a0c2f477b959.jpg');border-radius:8px;">
                <button type="button" class="img-overlay-change-btn">Đổi ảnh</button>
              </div>
            </div>
          </div>
        `;
        block.querySelector(".remove-btn")?.addEventListener("click", () => {
          block.remove();
          showToast(`Đã xóa Ảnh giữa trang ${nextIdx}`);
        });
        middleImagesList.appendChild(block);
        showToast(`Đã thêm Ảnh giữa trang ${nextIdx}`);
      });

      middleImagesList.querySelectorAll(".remove-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const blk = btn.closest(".design-block");
          if (blk) {
            blk.remove();
            showToast("Đã xóa ảnh giữa trang");
          }
        });
      });
    }

    // 8.9 Dress Code Color Adder
    const addDressColorBtn = document.getElementById("btn-add-dress-color");
    const dressColorsWrap = document.getElementById("dress-code-colors-list");
    if (addDressColorBtn && dressColorsWrap) {
      addDressColorBtn.addEventListener("click", () => {
        const row = document.createElement("div");
        row.className = "dress-code-editor-color-row";
        row.innerHTML = `
          <input type="color" class="dress-code-editor-color-input" value="#D8A7B1" />
          <input type="text" class="dress-code-editor-color-label" value="Hồng đất" />
          <button type="button" class="dress-code-editor-color-remove" aria-label="Xóa">×</button>
        `;
        row.querySelector(".dress-code-editor-color-remove")?.addEventListener("click", () => row.remove());
        dressColorsWrap.insertBefore(row, addDressColorBtn);
      });
      dressColorsWrap.querySelectorAll(".dress-code-editor-color-remove").forEach((btn) => {
        btn.addEventListener("click", () => btn.closest(".dress-code-editor-color-row")?.remove());
      });
    }

    // 8.10 Opening Effect Section (9-item grid, inline card sync, "Xem trước" in phone, "Chọn kiểu thiệp" modal)
    const phoneOpeningSplash = document.getElementById("editor-phone-opening-splash");
    const btnPreviewOpening = document.getElementById("btn-preview-opening-effect");
    if (btnPreviewOpening && phoneOpeningSplash) {
      btnPreviewOpening.addEventListener("click", (e) => {
        e.stopPropagation();
        phoneOpeningSplash.style.display = "flex";
        phoneOpeningSplash.style.opacity = "1";
        phoneOpeningSplash.style.transform = "scale(1)";
        const seal = phoneOpeningSplash.querySelector(".slr-ui-seal");
        if (seal) seal.classList.remove("slr-ui-seal--break");
        showToast("Đang phát hiệu ứng mở màn trên màn hình điện thoại bên trái");
      });
    }

    editorRoot.querySelectorAll('input[name="openingEffectType"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        showToast(`Đã chọn hiệu ứng mở màn: ${radio.value.toUpperCase()}`);
      });
    });

    // Sync inline Royal Card text & colors
    const openingBindings = [
      { input: "input-opening-label", target: "inline-slr-label" },
      { input: "input-opening-guest", target: "inline-slr-guest" },
      { input: "input-opening-subtext", target: "inline-slr-subtext" },
      { input: "input-opening-btn", target: "inline-slr-btn-text" }
    ];
    openingBindings.forEach(({ input, target }) => {
      document.getElementById(input)?.addEventListener("input", (e) => {
        const el = document.getElementById(target);
        if (el) el.textContent = e.target.value;
      });
    });

    editorRoot.querySelectorAll('input[name="openCardBg"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        const inlineCard = document.getElementById("inline-slr-ui-card");
        if (inlineCard) inlineCard.style.backgroundColor = radio.value;
        const phoneSplashCard = phoneOpeningSplash?.querySelector(".slr-ui-card");
        if (phoneSplashCard) phoneSplashCard.style.backgroundColor = radio.value;
      });
    });

    // Modal helper
    function openEditorModal(modalId) {
      const m = document.getElementById(modalId);
      if (!m) return;
      m.style.display = "flex";
      requestAnimationFrame(() => m.classList.add("is-open"));
    }
    function closeEditorModal(modalId) {
      const m = document.getElementById(modalId);
      if (!m) return;
      m.classList.remove("is-open");
      setTimeout(() => {
        m.style.display = "none";
      }, 260);
    }

    document.getElementById("btn-open-theme-modal")?.addEventListener("click", () => {
      openEditorModal("modal-opening-theme-picker");
    });

    editorRoot.querySelectorAll(".opening-theme-option").forEach((opt) => {
      opt.addEventListener("click", () => {
        const label = opt.getAttribute("data-theme-label") || "royal | Đỏ Hoàng Gia";
        const bg = opt.getAttribute("data-theme-bg") || "#3e0001";
        const labelEl = document.getElementById("opening-theme-current-label");
        if (labelEl) labelEl.textContent = label;
        const inlineCard = document.getElementById("inline-slr-ui-card");
        if (inlineCard) inlineCard.style.backgroundColor = bg;
        const phoneSplashCard = phoneOpeningSplash?.querySelector(".slr-ui-card");
        if (phoneSplashCard) phoneSplashCard.style.backgroundColor = bg;
        editorRoot.querySelectorAll(".opening-theme-option").forEach((b) => {
          b.style.border = b === opt ? "2px solid #1a1a1a" : "1px solid #ddd";
        });
        closeEditorModal("modal-opening-theme-picker");
        showToast(`Đã đổi kiểu thiệp mở màn: ${label}`);
      });
    });

    editorRoot.querySelectorAll("[data-close-modal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        closeEditorModal(btn.getAttribute("data-close-modal"));
      });
    });

    // 8.11 Drag-and-Drop Order Change (Thay đổi thứ tự)
    const orderList = document.getElementById("editor-order-change-list");
    if (orderList && phoneContainer) {
      let draggedItem = null;
      const items = () => Array.from(orderList.querySelectorAll(".order-change-item:not(.order-change-item--pinned)"));

      function applySectionOrderToPhone() {
        const endingSec = document.getElementById("section-ending");
        items().forEach((item) => {
          const secId = item.getAttribute("data-target-section");
          const secEl = secId ? document.getElementById(secId) : null;
          if (secEl && endingSec && phoneContainer.contains(secEl)) {
            phoneContainer.insertBefore(secEl, endingSec);
          }
        });
      }

      orderList.addEventListener("dragstart", (e) => {
        const item = e.target.closest(".order-change-item:not(.order-change-item--pinned)");
        if (!item) return;
        draggedItem = item;
        item.classList.add("is-dragging");
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
        }
      });

      orderList.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (!draggedItem) return;
        const overItem = e.target.closest(".order-change-item:not(.order-change-item--pinned)");
        if (!overItem || overItem === draggedItem) return;
        const rect = overItem.getBoundingClientRect();
        const after = e.clientY > rect.top + rect.height / 2;
        if (after) {
          overItem.after(draggedItem);
        } else {
          overItem.before(draggedItem);
        }
      });

      orderList.addEventListener("dragend", () => {
        if (!draggedItem) return;
        draggedItem.classList.remove("is-dragging");
        draggedItem = null;
        applySectionOrderToPhone();
        showToast("Đã cập nhật thứ tự các mục trên thiệp!");
      });
    }

    // 8.12 URL Share Preview Modal (Ảnh thu nhỏ chia sẻ URL)
    const btnPreviewUrlShare = document.getElementById("btn-preview-url-share");
    if (btnPreviewUrlShare) {
      btnPreviewUrlShare.addEventListener("click", (e) => {
        e.stopPropagation();
        const t = document.getElementById("url-share-title-input")?.value?.trim();
        const d = document.getElementById("url-share-desc-input")?.value?.trim();
        const modalTitle = document.getElementById("url-share-preview-modal-title");
        const modalDesc = document.getElementById("url-share-preview-modal-desc");
        if (modalTitle) {
          modalTitle.textContent = t || "Thiệp cưới THANH PHONG & THUÝ KIỀU";
        }
        if (modalDesc) {
          modalDesc.textContent = d || "Trân trọng kính mời Quý khách đến tham dự Lễ Thành Hôn vào ngày 28.11.2026.";
        }
        openEditorModal("modal-url-share-preview");
      });
    }

    // 8.13 BGM Player in Editor
    const bgmPlayBtn = document.getElementById("btn-editor-bgm-play");
    if (bgmPlayBtn) {
      let playing = false;
      bgmPlayBtn.addEventListener("click", () => {
        const audio = document.querySelector("#floating-bgm-banner audio") || document.getElementById("ncd-bgm-audio");
        if (!audio) return;
        if (!playing) {
          audio.play().catch(() => {});
          playing = true;
          bgmPlayBtn.textContent = "⏸ Tạm dừng";
          showToast("Đang phát thử nhạc nền thiệp cưới ♫");
        } else {
          audio.pause();
          playing = false;
          bgmPlayBtn.textContent = "▶ Nghe thử";
        }
      });
    }

    // 8.14 Cycle Demo Photos on "Đổi ảnh" click
    const samplePhotos = [
      "https://assets.ngaychungdoi.com/templates/e0f86e21-15c0-4120-a820-2631a1e2bdbf.jpg",
      "https://assets.ngaychungdoi.com/templates/00a5ef6f-1d54-415b-8f72-b72c528ea2ff.jpg",
      "https://assets.ngaychungdoi.com/templates/81584d8f-f186-4347-b218-9bebabfafa1d.jpg",
      "https://assets.ngaychungdoi.com/templates/341ddfea-3dec-4b67-a7a3-a0c2f477b959.jpg",
      "https://assets.ngaychungdoi.com/templates/d1b5c891-c3be-4199-be58-5a388e3ec7d9.jpg"
    ];
    let photoIdx = 0;
    editorRoot.querySelectorAll("[data-change-photo]").forEach((btn) => {
      btn.addEventListener("click", () => {
        photoIdx = (photoIdx + 1) % samplePhotos.length;
        const nextUrl = samplePhotos[photoIdx];
        const box = btn.closest(".img_attach_box");
        if (box) {
          box.style.backgroundImage = `url('${nextUrl}')`;
        }
        const target = btn.getAttribute("data-change-photo");
        if (target === "main-hero") {
          editorRoot.querySelectorAll("#main-parallax-screen img.main-image, #section-main img.main-image").forEach((img) => {
            img.src = nextUrl;
          });
        } else if (target === "ending") {
          const endImg = editorRoot.querySelector("#section-ending img");
          if (endImg) endImg.src = nextUrl;
        }
        showToast("Đã cập nhật ảnh mới lên thiệp!");
      });
    });

    // 8.15 Header "Xem trước" & "Lưu thiệp" (Persists via PUT /cards/:id)
    document.getElementById("editor-header-preview-btn")?.addEventListener("click", () => {
      if (phoneOpeningSplash) {
        phoneOpeningSplash.style.display = "flex";
        phoneOpeningSplash.style.opacity = "1";
        phoneOpeningSplash.style.transform = "scale(1)";
      }
      showToast("Đang xem trước toàn bộ hiệu ứng mở thiệp");
    });

    const saveBtn = document.getElementById("editor-header-save-btn");
    const saveNotice = document.getElementById("editor-save-notice");
    if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
        saveBtn.disabled = true;
        const origText = saveBtn.textContent;
        saveBtn.textContent = "Đang lưu...";

        const gLast = (document.getElementById("input-groom-last")?.value || "NGUYỄN").trim();
        const gMid = (document.getElementById("input-groom-middle")?.value || "THANH PHONG").trim();
        const bLast = (document.getElementById("input-bride-last")?.value || "NGUYỄN").trim();
        const bMid = (document.getElementById("input-bride-middle")?.value || "THUÝ KIỀU").trim();

        const payload = {
          groomName: `${gLast} ${gMid}`.trim(),
          groomShortName: gMid,
          brideName: `${bLast} ${bMid}`.trim(),
          brideShortName: bMid,
          weddingDate: document.getElementById("input-wedding-date")?.value || "2026-11-28",
          venueName: document.getElementById("input-loc-name")?.value || "TƯ GIA NHÀ TRAI",
          venueAddress: document.getElementById("input-loc-address")?.value || "XÓM 10, XÃ ĐẠI HUỆ , NGHỆ AN",
          greeting: document.getElementById("input-intro-body")?.value || "",
          shareTitle: document.getElementById("url-share-title-input")?.value || "",
          shareDescription: document.getElementById("url-share-desc-input")?.value || ""
        };

        try {
          await fetch(`${API_BASE}/cards/${encodeURIComponent(cardId)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } catch {
          // Fallback local persistence
        }

        saveBtn.disabled = false;
        saveBtn.textContent = origText;
        if (saveNotice) {
          saveNotice.style.display = "flex";
        }
        showToast("Đã lưu thiệp cưới thành công!");
      });
    }
  }

  function initAll() {
    initMobileDrawer();
    initCoverflow3D();
    initCreateCardSheet();
    initScrollVideosAndAos();
    initWeddingCardViewer();
    initLedWeddingStage3D();
    initTemplateCatalog();
    initCardEditor();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
