const env = import.meta.env;

export const config = {
  provider: env.VITE_AI_PROVIDER || 'openai', // 'openai' hoặc 'gemini'
  // Gemini settings
  apiKeys: String(env.VITE_GEMINI_API_KEYS || '').split(',').map(key => key.trim()).filter(Boolean),
  defaultModel: env.VITE_GEMINI_MODEL || 'gemini-2.0-flash',
  defaultTemperature: Number(env.VITE_GEMINI_TEMPERATURE || 0.7),
  proxyUrl: env.VITE_GEMINI_PROXY_URL || '',
  defaultSystem: 'Bạn là nhân viên văn phòng trong phòng tám chuyện, xưng em gọi người dùng là Sếp.',
  apiBase: 'https://generativelanguage.googleapis.com/v1beta/models',

  // OpenAI / APIGiaRe settings
  openaiBaseUrl: env.VITE_OPENAI_BASE_URL || 'https://api.apigiare.vn/v1',
  openaiModel: env.VITE_OPENAI_MODEL || 'gpt-4.1-mini',
  openaiApiKey: env.VITE_OPENAI_API_KEY || ''
};

