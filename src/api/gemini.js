import { config } from '../config.js';
import { apiError, isRotatableStatus } from './errors.js';

export async function streamGenerate({ model, temperature, system, contents, keyManager, signal, onText }) {
  if (import.meta.env.VITE_GEMINI_PROXY_URL) return streamThroughProxy({ model, temperature, system, contents, signal, onText });
  if (!keyManager.size) throw new Error('Chưa cấu hình VITE_GEMINI_API_KEYS trong file .env.');
  const body = { contents, generationConfig: { temperature: Number(temperature), maxOutputTokens: 8192 } };
  if (system?.trim()) body.system_instruction = { parts: [{ text: system.trim() }] };
  let lastError;
  const maxAttempts = Math.max(keyManager.size * 2, 3);
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const url = `${config.apiBase}/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(keyManager.current())}`;
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal });
      if (!response.ok) {
        const raw = await response.text();
        const error = new Error(apiError(response.status, raw));
        error.status = response.status;
        if (isRotatableStatus(response.status)) {
          keyManager.rotate();
          lastError = error;
          // Chờ 800ms - 1.5s trước khi thử lại key khác hoặc retry
          await new Promise(resolve => setTimeout(resolve, Math.min(1000 + attempt * 500, 3000)));
          continue;
        }
        throw error;
      }
      if (!response.body) throw new Error('Trình duyệt không hỗ trợ streaming.');
      await readSse(response.body, signal, onText);
      keyManager.reset();
      return;
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      lastError = error;
      if (attempt < maxAttempts - 1) {
        keyManager.rotate();
        await new Promise(resolve => setTimeout(resolve, 800));
        continue;
      }
    }
  }
  throw lastError || new Error('Không thể kết nối Gemini.');
}


async function streamThroughProxy({ model, temperature, system, contents, signal, onText }) {
  const response = await fetch(import.meta.env.VITE_GEMINI_PROXY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model, temperature, system, contents }), signal });
  if (!response.ok) throw new Error(apiError(response.status, await response.text()));
  if (!response.body) throw new Error('Proxy không hỗ trợ streaming.');
  await readSse(response.body, signal, onText);
}

async function readSse(body, signal, onText) {
  const reader = body.getReader(); const decoder = new TextDecoder(); let buffer = '';
  while (true) {
    const { value, done } = await reader.read(); if (done) break;
    buffer += decoder.decode(value, { stream: true }); const lines = buffer.split(/\r?\n/); buffer = lines.pop() || '';
    for (const line of lines) { if (!line.startsWith('data:')) continue; const raw = line.slice(5).trim(); if (!raw || raw === '[DONE]') continue; try { const json = JSON.parse(raw); const text = json.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('') || ''; if (text) onText(text); } catch { /* bỏ qua frame chưa hoàn chỉnh */ } }
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
  }
}
