// POST /api/notify
// Sends the new-order notification email to the shop via Resend.
// Email-only order record for now — the D1 order backend (ROADMAP B.1)
// will take over as the source of truth.
//
// Env (set in the Pages dashboard; or `.dev.vars` for local dev):
//   RESEND_API_KEY  (secret) — https://resend.com/api-keys
//   RESEND_FROM     (var)    — verified sender, e.g. "Why Dough Cookies <orders@whydoughcookies.com>"
//   RESEND_TO       (var)    — recipient, e.g. "whydoughcookies@gmail.com"

const RESEND_API = "https://api.resend.com/emails";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("notify: RESEND_API_KEY not configured");
    return json({ error: "Notification service is not configured" }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { orderId, subject, text } = body || {};

  // Light validation — order ids look like "WD0809XX01".
  if (!orderId || typeof orderId !== "string" || !/^WD/i.test(orderId)) {
    return json({ error: "Missing or invalid order id" }, 400);
  }
  if (!subject || !text) {
    return json({ error: "Missing subject or body" }, 400);
  }

  const from = env.RESEND_FROM || "Why Dough Cookies <onboarding@resend.dev>";
  const to = (env.RESEND_TO || "whydoughcookies@gmail.com")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    console.error("notify: Resend error", res.status, JSON.stringify(data));
    return json(
      { error: "Email failed to send", detail: data?.message },
      res.status
    );
  }

  return json({ ok: true, id: data?.id });
}
