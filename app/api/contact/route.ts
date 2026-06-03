// POST /api/contact — sends contact form submissions to the site owner via Resend.
//
// FROM ADDRESS:
//   - While tinkrkit.dev is unverified in Resend → use "onboarding@resend.dev" (Resend test address)
//   - Once tinkrkit.dev is verified in Resend dashboard → change to "contact@tinkrkit.dev"
//
// TO ADDRESS: process.env.ADMIN_EMAIL (the site owner inbox)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  // ── 1. Check API key ──────────────────────────────────────────────────────────
  console.log("[contact] RESEND_API_KEY:", process.env.RESEND_API_KEY ? "key exists" : "key missing");
  console.log("[contact] ADMIN_EMAIL:", process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL : "not set");

  if (!process.env.RESEND_API_KEY) {
    console.error("[contact] Aborting — RESEND_API_KEY is not set");
    return NextResponse.json({ error: "Server misconfiguration: missing API key" }, { status: 500 });
  }

  // ── 2. Parse body ─────────────────────────────────────────────────────────────
  let body: { name?: string; email?: string; subject?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, subject, message } = body;
  console.log("[contact] Received submission from:", email, "| subject:", subject);

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  // ── 3. Send via Resend ────────────────────────────────────────────────────────
  const resend = new Resend(process.env.RESEND_API_KEY);

  const toAddress = "support@tinkrkit.dev";

  // Requires tinkrkit.dev to be verified in Resend dashboard.
  // If you see a "domain not verified" error, verify it at resend.com/domains first.
  const fromAddress = "TinkrKit <support@tinkrkit.dev>";

  console.log("[contact] Sending email → from:", fromAddress, "| to:", toAddress);

  try {
    const { data, error } = await resend.emails.send({
      from:    fromAddress,
      to:      toAddress,
      replyTo: `${name} <${email}>`,
      subject: `[tinkrkit.dev contact] ${subject}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
          <h2 style="margin:0 0 4px">New contact form submission</h2>
          <p style="color:#888;margin-top:0;font-size:13px">tinkrkit.dev/contact</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#666;width:80px"><strong>From</strong></td>
              <td style="padding:8px 0;font-size:14px">${name} &lt;${email}&gt;</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#666"><strong>Subject</strong></td>
              <td style="padding:8px 0;font-size:14px">${subject}</td>
            </tr>
          </table>
          <div style="background:#f5f5f5;border-left:3px solid #6366F1;padding:12px 16px;border-radius:4px">
            <p style="margin:0;white-space:pre-wrap;font-size:14px;color:#333">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
          </div>
          <p style="color:#aaa;font-size:12px;margin-top:20px">
            Reply directly to this email — it replies to ${email}
          </p>
        </div>
      `,
    });

    // ── 4. Log full Resend response ───────────────────────────────────────────
    if (error) {
      console.error("[contact] Resend error response (full):", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: "Failed to send email", detail: error },
        { status: 500 }
      );
    }

    console.log("[contact] Resend success. Email ID:", data?.id);
    return NextResponse.json({ ok: true, id: data?.id });

  } catch (thrown) {
    // Unexpected / network-level errors
    console.error("[contact] Unexpected error:", thrown);
    return NextResponse.json(
      { error: "Unexpected server error", detail: String(thrown) },
      { status: 500 }
    );
  }
}
