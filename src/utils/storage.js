const prefix = 'gemini-clone:';

export function readStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(prefix + key)) ?? fallback; } catch { return fallback; }
}

export function writeStorage(key, value) {
  localStorage.setItem(prefix + key, JSON.stringify(value));
}
