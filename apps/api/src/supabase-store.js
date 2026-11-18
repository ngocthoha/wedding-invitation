/**
 * Zero-dependency Supabase PostgREST persistence adapter for NgayChungDoi.com API.
 * Connects to project `wedding-invitation` (rwudhtiqamsdietodurx) when network is available,
 * and falls back cleanly to local `apps/api/data/db.json` when running offline or in sandbox tests.
 */

const DEFAULT_SUPABASE_URL = "https://rwudhtiqamsdietodurx.supabase.co";
const DEFAULT_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dWRodGlxYW1zZGlldG9kdXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwMDc4ODUsImV4cCI6MjExMDU4Mzg4NX0.mczIDV79ucybojXnrEfEkM1ceK2OY18Q7SQBAdtw9f0";

const SUPABASE_URL = (process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  DEFAULT_SUPABASE_KEY;

function getHeaders(extra = {}) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    ...extra
  };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function loadStateFromSupabase() {
  if (process.env.DISABLE_SUPABASE === "1") return null;
  try {
    const res = await fetchWithTimeout(
      `${SUPABASE_URL}/rest/v1/app_state?id=eq.main&select=data`,
      { headers: getHeaders() },
      2500
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (Array.isArray(rows) && rows[0] && rows[0].data && Array.isArray(rows[0].data.cards)) {
      return rows[0].data;
    }
    return null;
  } catch {
    return null;
  }
}

async function syncStateToSupabase(db) {
  if (process.env.DISABLE_SUPABASE === "1") return false;
  try {
    const upsertHeaders = getHeaders({ Prefer: "resolution=merge-duplicates,return=minimal" });

    const statePromise = fetchWithTimeout(
      `${SUPABASE_URL}/rest/v1/app_state?on_conflict=id`,
      {
        method: "POST",
        headers: upsertHeaders,
        body: JSON.stringify([{ id: "main", data: db, updated_at: new Date().toISOString() }])
      },
      3000
    );

    const cardRows = (db.cards || []).map((c) => ({
      id: c.id,
      slug: c.slug || c.id,
      template_id: c.templateId || "bmmd8nf8vm1i",
      title: c.title || "",
      groom_name: c.groomName || "",
      bride_name: c.brideName || "",
      wedding_date: c.weddingDate || "",
      status: c.status || "PUBLISHED",
      data: c,
      updated_at: new Date().toISOString()
    }));

    const rsvpRows = (db.rsvps || []).map((r) => ({
      id: r.id,
      card_id: r.cardId || "bmmd8nf8vm1i",
      name: r.name || "Khách mời",
      phone: r.phone || "",
      attending: r.attending || "YES",
      guests_count: Number(r.guestsCount || 1),
      message: r.message || "",
      data: r
    }));

    const wishRows = (db.guestbook || []).map((w) => ({
      id: w.id,
      card_id: w.cardId || "bmmd8nf8vm1i",
      author_name: w.authorName || "Bạn thân",
      relationship: w.relationship || "Khách mời",
      message: w.message || "",
      data: w
    }));

    const guestRows = (db.guests || []).map((g) => ({
      id: g.id,
      card_id: g.cardId || "bmmd8nf8vm1i",
      guest_slug: g.guestSlug || g.id,
      guest_name: g.guestName || "Khách quý",
      attendance_status: g.attendanceStatus || "PENDING",
      data: g
    }));

    await Promise.allSettled([
      statePromise,
      cardRows.length
        ? fetchWithTimeout(`${SUPABASE_URL}/rest/v1/cards?on_conflict=id`, {
            method: "POST",
            headers: upsertHeaders,
            body: JSON.stringify(cardRows)
          })
        : Promise.resolve(),
      rsvpRows.length
        ? fetchWithTimeout(`${SUPABASE_URL}/rest/v1/rsvps?on_conflict=id`, {
            method: "POST",
            headers: upsertHeaders,
            body: JSON.stringify(rsvpRows)
          })
        : Promise.resolve(),
      wishRows.length
        ? fetchWithTimeout(`${SUPABASE_URL}/rest/v1/guestbook?on_conflict=id`, {
            method: "POST",
            headers: upsertHeaders,
            body: JSON.stringify(wishRows)
          })
        : Promise.resolve(),
      guestRows.length
        ? fetchWithTimeout(`${SUPABASE_URL}/rest/v1/guests?on_conflict=id`, {
            method: "POST",
            headers: upsertHeaders,
            body: JSON.stringify(guestRows)
          })
        : Promise.resolve()
    ]);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  SUPABASE_URL,
  loadStateFromSupabase,
  syncStateToSupabase
};
