const env = import.meta.env;

export const config = {
  apiKeys: String(env.VITE_GEMINI_API_KEYS || '').split(',').map(key => key.trim()).filter(Boolean),
  defaultModel: 'gemini-3.6-flash',
  defaultTemperature: Number(env.VITE_GEMINI_TEMPERATURE || 0.7),
  apiBase: 'https://generativelanguage.googleapis.com/v1beta/models'
};
