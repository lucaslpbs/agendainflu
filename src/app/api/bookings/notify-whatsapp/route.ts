import { NextRequest, NextResponse } from 'next/server'

const N8N_WEBHOOK = "https://n8n.trafficsolutions.cloud/webhook/20051d11-811f-4be9-8c5b-9cfafdab9c61";

export async function POST(req: NextRequest) {
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
