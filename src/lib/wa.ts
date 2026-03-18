export async function sendWhatsApp(number: string, text: string): Promise<boolean> {
  try {
    const url = process.env.EVOLUTION_API_URL
    const instance = process.env.EVOLUTION_INSTANCE
    const apiKey = process.env.EVOLUTION_API_KEY
    if (!url || !instance || !apiKey) return false
    const res = await fetch(`${url}/message/sendText/${instance}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
      body: JSON.stringify({ number, text }),
    })
    return res.ok
  } catch (e) {
    console.error('[WA] Falha ao enviar mensagem:', e)
    return false
  }
}
