const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function keys() {
  return String(process.env.GEMINI_API_KEYS || '').split(',').map(key => key.trim()).filter(Boolean);
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  const apiKeys = keys();
  if (!apiKeys.length) return response.status(500).json({ error: 'GEMINI_API_KEYS chưa được cấu hình trên server.' });
  const { model = 'gemini-3.6-flash', temperature = .7, system = '', contents = [] } = request.body || {};
  const body = { contents, generationConfig: { temperature: Number(temperature), maxOutputTokens: 8192 } };
  if (system.trim()) body.system_instruction = { parts: [{ text: system.trim() }] };
  let lastStatus = 500;
  for (let index = 0; index < apiKeys.length; index += 1) {
    const upstream = await fetch(`${API_BASE}/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKeys[index])}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (upstream.ok) {
      response.statusCode = 200;
      response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      response.setHeader('Cache-Control', 'no-cache, no-transform');
      response.setHeader('Connection', 'keep-alive');
      const reader = upstream.body.getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        response.write(Buffer.from(value));
      }
      return response.end();
    }
    lastStatus = upstream.status;
    if (![401, 403, 429].includes(upstream.status)) return response.status(upstream.status).send(await upstream.text());
  }
  return response.status(lastStatus).json({ error: 'Tất cả API key đã hết quota hoặc không hợp lệ.' });
}
