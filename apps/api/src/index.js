const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const {
  HERO_SLIDES,
  ALL_TEMPLATES,
  SAMPLE_CARD_BMMD8NF8VM1I,
  INITIAL_GUESTS,
  INITIAL_RSVP,
  INITIAL_GUESTBOOK
} = require("./seed-data");
const {
  SUPABASE_URL,
  loadStateFromSupabase,
  syncStateToSupabase
} = require("./supabase-store");

const PORT = Number(process.env.PORT || 3008);
const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

function createInitialDb() {
  const secondCard = {
    ...SAMPLE_CARD_BMMD8NF8VM1I,
    id: "card-minh-quan-thanh-ha",
    templateId: "4defa652-7483-49d2-9e54-bce3536864e1",
    code: "Sample_12",
    slug: "minh-quan-thanh-ha",
    title: "Thiệp cưới MINH QUÂN & THANH HÀ",
    openingType: "envelope-classic",
    groomName: "MINH QUÂN",
    groomShortName: "Minh Quân",
    brideName: "THANH HÀ",
    brideShortName: "Thanh Hà",
    heroPhotoUrl: "https://assets.ngaychungdoi.com/templates/e29b1fb2-a6d4-4d68-a53b-492935ae95b1.webp"
  };

  return {
    users: [
      {
        id: "user-demo-1",
        email: "demo@ngaychungdoi.com",
        passwordHash: "demo123",
        name: "Thanh Phong & Thuý Kiều",
        role: "user",
        emailVerified: true,
        credits: 10,
        avatar: "/assets/mypage/round-profile.svg",
        createdAt: "2026-03-01T00:00:00.000Z"
      }
    ],
    templates: ALL_TEMPLATES,
    cards: [
      {
        ...SAMPLE_CARD_BMMD8NF8VM1I,
        userId: "user-demo-1",
        createdAt: "2026-03-01T08:00:00.000Z",
        updatedAt: "2026-03-14T10:00:00.000Z"
      },
      {
        ...secondCard,
        userId: "user-demo-1",
        createdAt: "2026-03-05T08:00:00.000Z",
        updatedAt: "2026-03-14T11:00:00.000Z"
      }
    ],
    guests: INITIAL_GUESTS,
    rsvps: INITIAL_RSVP,
    guestbook: INITIAL_GUESTBOOK,
    files: []
  };
}

function loadDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      const initial = createInitialDb();
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    return createInitialDb();
  }
}

let db = loadDb();
let lastSupabaseLoadAt = 0;

async function ensureSupabaseHydrated() {
  const now = Date.now();
  if (now - lastSupabaseLoadAt < 5000) return;
  lastSupabaseLoadAt = now;
  const remote = await loadStateFromSupabase();
  if (remote && Array.isArray(remote.cards)) {
    db = {
      ...db,
      ...remote,
      templates: Array.isArray(remote.templates) && remote.templates.length ? remote.templates : ALL_TEMPLATES
    };
  }
}

async function saveDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch {
    // Ignore read-only filesystem on Vercel Serverless
  }
  await syncStateToSupabase(db);
  lastSupabaseLoadAt = Date.now();
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

function findCard(idOrSlug) {
  const cleanId = decodeURIComponent(idOrSlug).replace(/^(form:|canvas:)/, "");
  let card = db.cards.find(
    (c) =>
      c.id === cleanId ||
      c.slug === cleanId ||
      c.templateId === cleanId
  );
  if (card) return card;

  const tpl = db.templates.find(
    (t) => t.rawId === cleanId || t.id === cleanId || t.id === `form:${cleanId}` || t.id === `canvas:${cleanId}`
  );
  if (tpl) {
    return {
      ...SAMPLE_CARD_BMMD8NF8VM1I,
      id: tpl.rawId,
      templateId: tpl.rawId,
      title: `Mẫu thiệp ${tpl.name}`,
      openingType: tpl.openingType || "royal-red",
      heroPhotoUrl: tpl.thumbnail
    };
  }
  return SAMPLE_CARD_BMMD8NF8VM1I;
}

function enrichCard(card, guestSlug) {
  const rsvps = db.rsvps.filter((r) => r.cardId === card.id || r.cardId === "bmmd8nf8vm1i");
  const guestbook = db.guestbook.filter((g) => g.cardId === card.id || g.cardId === "bmmd8nf8vm1i");
  const guests = db.guests.filter((g) => g.cardId === card.id || g.cardId === "bmmd8nf8vm1i");
  const guestInvite = guestSlug
    ? guests.find((g) => g.guestSlug === guestSlug || g.id === guestSlug) || {
        id: `guest-${guestSlug}`,
        cardId: card.id,
        guestSlug,
        guestName: guestSlug.replace(/-/g, " "),
        salutation: `Bạn ${guestSlug.replace(/-/g, " ")} ♥`,
        customMessage: "Tụi mình rất mong có bạn cùng nâng ly trong ngày vui."
      }
    : null;

  return {
    ...card,
    rsvps,
    guestbook,
    guests,
    guestInvite,
    stats: {
      rsvpCount: rsvps.length,
      attendingCount: rsvps.filter((r) => r.attending === "YES").reduce((acc, r) => acc + Number(r.guestsCount || 1), 0),
      wishCount: guestbook.length,
      guestInviteCount: guests.length
    }
  };
}

async function handleApiRequest(req, res) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    });
    return res.end();
  }

  await ensureSupabaseHydrated();

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname.replace(/^\/api(?=\/|$)/, "") || "/";
  const method = req.method;

  // Healthcheck
  if (method === "GET" && pathname === "/health") {
    return sendJson(res, 200, {
      ok: true,
      service: "ngaychungdoi-api",
      port: PORT,
      supabaseUrl: SUPABASE_URL
    });
  }

  // Auth Endpoints
  if (method === "POST" && pathname === "/auth/signup") {
    const body = await parseBody(req);
    const email = String(body.email || "").trim().toLowerCase();
    if (!email || !body.password) {
      return sendJson(res, 400, { message: "Vui lòng nhập đầy đủ email và mật khẩu." });
    }
    let existing = db.users.find((u) => u.email === email);
    if (existing) {
      return sendJson(res, 409, { message: "Email này đã được đăng ký." });
    }
    const newUser = {
      id: `user-${crypto.randomUUID().slice(0, 8)}`,
      email,
      passwordHash: String(body.password),
      name: body.name || email.split("@")[0],
      role: "user",
      emailVerified: true,
      credits: 5,
      avatar: "/assets/mypage/round-profile.svg",
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    await saveDb();
    return sendJson(res, 201, {
      user: newUser,
      accessToken: `mock-jwt-${newUser.id}`
    });
  }

  if (method === "POST" && pathname === "/auth/login") {
    const body = await parseBody(req);
    const email = String(body.email || "").trim().toLowerCase();
    let user = db.users.find((u) => u.email === email);
    if (!user) {
      user = db.users[0];
    }
    return sendJson(res, 200, {
      user,
      accessToken: `mock-jwt-${user.id}`
    });
  }

  if (method === "GET" && pathname === "/auth/me") {
    return sendJson(res, 200, { user: db.users[0] });
  }

  // Templates Catalog Endpoints
  if (method === "GET" && pathname === "/files/templates") {
    const typeFilter = parsedUrl.searchParams.get("type");
    const categoryFilter = parsedUrl.searchParams.get("category");
    let templates = db.templates;
    if (typeFilter === "form" || typeFilter === "canvas") {
      templates = templates.filter((t) => t.kind === typeFilter);
    }
    if (categoryFilter && categoryFilter !== "Tất cả") {
      templates = templates.filter((t) => t.category === categoryFilter);
    }
    return sendJson(res, 200, {
      templates,
      formTemplates: db.templates.filter((t) => t.kind === "form"),
      canvasTemplates: db.templates.filter((t) => t.kind === "canvas"),
      heroSlides: HERO_SLIDES
    });
  }

  if (method === "GET" && pathname.startsWith("/files/templates/")) {
    const id = pathname.replace("/files/templates/", "");
    const cleanId = decodeURIComponent(id).replace(/^(form:|canvas:)/, "");
    const template =
      db.templates.find((t) => t.rawId === cleanId || t.id === id) ||
      db.templates.find((t) => t.rawId === "bmmd8nf8vm1i");
    const cardData = enrichCard(findCard(cleanId), parsedUrl.searchParams.get("guest"));
    return sendJson(res, 200, { template, card: cardData });
  }

  // Card Eligibility & Creation
  if (method === "GET" && pathname === "/cards/create-eligibility") {
    return sendJson(res, 200, { eligible: true, freeQuotaRemaining: 5 });
  }

  if (method === "GET" && pathname === "/cards/launch-free-eligibility") {
    return sendJson(res, 200, { eligible: true, isFreeLaunchActive: true });
  }

  if (method === "GET" && (pathname === "/cards/mine" || pathname === "/cards")) {
    const enriched = db.cards.map((c) => enrichCard(c));
    return sendJson(res, 200, { cards: enriched });
  }

  if (method === "POST" && pathname === "/cards") {
    const body = await parseBody(req);
    const tplId = body.templateId || "bmmd8nf8vm1i";
    const baseCard = findCard(tplId);
    const groomShort = body.groomName || baseCard.groomShortName || "Minh Quân";
    const brideShort = body.brideName || baseCard.brideShortName || "Thanh Hà";
    const id = `card-${crypto.randomUUID().slice(0, 8)}`;
    const slug =
      body.slug ||
      `${groomShort}-${brideShort}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") + `-${id.slice(-4)}`;

    const newCard = {
      ...SAMPLE_CARD_BMMD8NF8VM1I,
      ...baseCard,
      id,
      userId: "user-demo-1",
      templateId: tplId,
      slug,
      title: body.title || `Thiệp cưới ${groomShort.toUpperCase()} & ${brideShort.toUpperCase()}`,
      groomName: groomShort.toUpperCase(),
      groomShortName: groomShort,
      brideName: brideShort.toUpperCase(),
      brideShortName: brideShort,
      weddingDate: body.weddingDate || SAMPLE_CARD_BMMD8NF8VM1I.weddingDate,
      weddingTime: body.weddingTime || SAMPLE_CARD_BMMD8NF8VM1I.weddingTime,
      venueName: body.venueName || SAMPLE_CARD_BMMD8NF8VM1I.venueName,
      venueAddress: body.venueAddress || SAMPLE_CARD_BMMD8NF8VM1I.venueAddress,
      openingType: body.openingType || baseCard.openingType || "royal-red",
      status: "PUBLISHED",
      isShared: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.cards.unshift(newCard);
    await saveDb();
    return sendJson(res, 201, { card: enrichCard(newCard) });
  }

  if (method === "GET" && pathname.startsWith("/cards/by-slug/")) {
    const slug = pathname.replace("/cards/by-slug/", "");
    const guestSlug = parsedUrl.searchParams.get("guest");
    const card = findCard(slug);
    return sendJson(res, 200, { card: enrichCard(card, guestSlug) });
  }

  // Card Sub-resources: RSVP, Guestbook, Guests, Invite Presets, Edit, Duplicate
  const cardMatch = pathname.match(/^\/cards\/([^/]+)(?:\/(.+))?$/);
  if (cardMatch) {
    const cardId = decodeURIComponent(cardMatch[1]);
    const subPath = cardMatch[2] || "";
    const card = findCard(cardId);

    if (method === "GET" && (subPath === "" || subPath === "edit")) {
      return sendJson(res, 200, {
        card: enrichCard(card, parsedUrl.searchParams.get("guest"))
      });
    }

    if ((method === "PUT" || method === "PATCH") && subPath === "") {
      const body = await parseBody(req);
      const idx = db.cards.findIndex((c) => c.id === card.id || c.slug === cardId);
      const updated = {
        ...card,
        ...body,
        updatedAt: new Date().toISOString()
      };
      if (idx >= 0) {
        db.cards[idx] = updated;
      } else {
        db.cards.push(updated);
      }
      await saveDb();
      return sendJson(res, 200, { card: enrichCard(updated) });
    }

    if (method === "PATCH" && subPath === "status") {
      const body = await parseBody(req);
      card.status = body.status || "PUBLISHED";
      await saveDb();
      return sendJson(res, 200, { card: enrichCard(card) });
    }

    if (method === "PATCH" && subPath === "slug") {
      const body = await parseBody(req);
      if (body.slug) card.slug = body.slug;
      await saveDb();
      return sendJson(res, 200, { card: enrichCard(card) });
    }

    if (method === "PATCH" && subPath === "share") {
      const body = await parseBody(req);
      card.isShared = body.isShared !== undefined ? Boolean(body.isShared) : true;
      await saveDb();
      return sendJson(res, 200, { card: enrichCard(card) });
    }

    if (method === "POST" && subPath === "duplicate") {
      const copy = {
        ...card,
        id: `card-${crypto.randomUUID().slice(0, 8)}`,
        slug: `${card.slug}-copy-${Date.now().toString(36).slice(-4)}`,
        title: `${card.title} (Bản sao)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.cards.unshift(copy);
      await saveDb();
      return sendJson(res, 201, { card: enrichCard(copy) });
    }

    if (method === "DELETE" && subPath === "") {
      db.cards = db.cards.filter((c) => c.id !== card.id && c.id !== cardId);
      await saveDb();
      return sendJson(res, 200, { deleted: true });
    }

    if (subPath === "invite-presets") {
      if (method === "GET") {
        return sendJson(res, 200, { presets: card.invitePresets || SAMPLE_CARD_BMMD8NF8VM1I.invitePresets });
      }
      if (method === "PUT") {
        const body = await parseBody(req);
        card.invitePresets = Array.isArray(body.presets) ? body.presets : card.invitePresets;
        await saveDb();
        return sendJson(res, 200, { presets: card.invitePresets });
      }
    }

    if (subPath === "guests" || subPath === "guests/import") {
      if (method === "GET") {
        const guests = db.guests.filter((g) => g.cardId === card.id || g.cardId === "bmmd8nf8vm1i");
        return sendJson(res, 200, { guests });
      }
      if (method === "POST") {
        const body = await parseBody(req);
        const items = Array.isArray(body.guests) ? body.guests : [body];
        const created = items.map((item) => {
          const guestName = String(item.guestName || item.name || "Khách quý").trim();
          const guestSlug =
            item.guestSlug ||
            guestName
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "");
          const entry = {
            id: `g-${crypto.randomUUID().slice(0, 8)}`,
            cardId: card.id,
            guestSlug,
            guestName,
            salutation: item.salutation || `${guestName} ♥`,
            customMessage:
              item.customMessage || "Tụi mình rất mong có bạn cùng nâng ly trong ngày vui.",
            attendanceStatus: item.attendanceStatus || "PENDING",
            guestCount: Number(item.guestCount || 1),
            side: item.side || "GROOM"
          };
          db.guests.unshift(entry);
          return entry;
        });
        await saveDb();
        return sendJson(res, 201, { guests: created, guest: created[0] });
      }
    }

    if (subPath === "rsvp") {
      if (method === "GET") {
        const rsvps = db.rsvps.filter((r) => r.cardId === card.id || r.cardId === "bmmd8nf8vm1i");
        return sendJson(res, 200, { rsvps });
      }
      if (method === "POST") {
        const body = await parseBody(req);
        const entry = {
          id: `rsvp-${crypto.randomUUID().slice(0, 8)}`,
          cardId: card.id,
          name: String(body.name || "Khách mời").trim(),
          phone: String(body.phone || "").trim(),
          attending: body.attending || "YES",
          guestsCount: Number(body.guestsCount || 1),
          side: body.side || "GROOM",
          message: String(body.message || "").trim(),
          createdAt: new Date().toISOString()
        };
        db.rsvps.unshift(entry);
        await saveDb();
        return sendJson(res, 201, { rsvp: entry, rsvps: db.rsvps.filter((r) => r.cardId === card.id || r.cardId === "bmmd8nf8vm1i") });
      }
    }

    if (subPath.startsWith("guestbook")) {
      if (method === "GET") {
        const wishes = db.guestbook.filter((g) => g.cardId === card.id || g.cardId === "bmmd8nf8vm1i");
        return sendJson(res, 200, { guestbook: wishes });
      }
      if (method === "POST") {
        const body = await parseBody(req);
        const entry = {
          id: `wish-${crypto.randomUUID().slice(0, 8)}`,
          cardId: card.id,
          authorName: String(body.authorName || body.name || "Bạn thân").trim(),
          relationship: String(body.relationship || "Khách mời").trim(),
          message: String(body.message || "Chúc hai bạn trăm năm hạnh phúc!").trim(),
          isApproved: true,
          createdAt: new Date().toISOString()
        };
        db.guestbook.unshift(entry);
        await saveDb();
        return sendJson(res, 201, {
          entry,
          guestbook: db.guestbook.filter((g) => g.cardId === card.id || g.cardId === "bmmd8nf8vm1i")
        });
      }
      if (method === "DELETE") {
        const entryId = subPath.replace("guestbook/", "");
        db.guestbook = db.guestbook.filter((g) => g.id !== entryId);
        await saveDb();
        return sendJson(res, 200, { deleted: true });
      }
    }
  }

  // Payment & Partner Endpoints
  if (method === "POST" && pathname === "/pay2s/create-thiep-payment-link") {
    const body = await parseBody(req);
    return sendJson(res, 200, {
      orderId: `ORD-${Date.now()}`,
      cardId: body.cardId || "bmmd8nf8vm1i",
      amount: 0,
      status: "PAID_FREE_LAUNCH",
      checkoutUrl: "/my/card?payment=success"
    });
  }

  if (method === "GET" && pathname === "/partner/stats") {
    return sendJson(res, 200, {
      credits: 10,
      activatedCards: db.cards.length,
      clientsCount: 4
    });
  }

  return sendJson(res, 404, { message: `Route not found: ${method} ${pathname}` });
}

const server = http.createServer(handleApiRequest);

if (require.main === module && !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`[ngaychungdoi-api] Backend REST API listening on http://localhost:${PORT}`);
  });
}

module.exports = {
  server,
  handleApiRequest,
  ensureSupabaseHydrated,
  findCard,
  enrichCard,
  getDb: () => db
};
