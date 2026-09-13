import { config } from '../config.js';
import { apiError, isRotatableStatus } from './errors.js';

export async function streamGenerate({ model, temperature, system, contents, keyManager, signal, onText }) {
  if (!keyManager.size) throw new Error('Chưa cấu hình VITE_GEMINI_API_KEYS trong file .env.');
  const body = { contents, generationConfig: { temperature: Number(temperature), maxOutputTokens: 8192 } };
  if (system?.trim()) body.system_instruction = { parts: [{ text: system.trim() }] };
  let lastError;
  for (let attempt = 0; attempt < Math.max(keyManager.size, 2); attempt += 1) {
    try {
      const url = `${config.apiBase}/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(keyManager.current())}`;
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal });
      if (!response.ok) { const raw = await response.text(); if (isRotatableStatus(response.status)) { keyManager.rotate(); lastError = new Error(apiError(response.status, raw)); continue; } throw new Error(apiError(response.status, raw)); }
      if (!response.body) throw new Error('Trình duyệt không hỗ trợ streaming.');
      await readSse(response.body, signal, onText);
      keyManager.reset();
      return;
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      lastError = error;
      if (attempt < 1) { await new Promise(resolve => setTimeout(resolve, 700)); continue; }
    }
  }
  throw lastError || new Error('Không thể kết nối Gemini.');
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
