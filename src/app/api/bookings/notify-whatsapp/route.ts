import { NextRequest, NextResponse } from 'next/server'

const N8N_WEBHOOK = process.env.N8N_WEBHOOK_URL;

export async function POST(req: NextRequest) {
  if (!N8N_WEBHOOK) {
    console.error("[notify-whatsapp] N8N_WEBHOOK_URL is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  try {
    const payload = await req.json();

    const res = await fetch(N8N_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `n8n status ${res.status}` }, { status: res.status });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notify-whatsapp]", err);
    return NextResponse.json({ error: "Falha ao contactar webhook" }, { status: 500 });
  }
}
