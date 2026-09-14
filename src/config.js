const env = import.meta.env;

export const config = {
  apiKeys: String(env.VITE_GEMINI_API_KEYS || '').split(',').map(key => key.trim()).filter(Boolean),
  defaultModel: 'gemini-3.6-flash',
  defaultTemperature: Number(env.VITE_GEMINI_TEMPERATURE || 0.7),
  proxyUrl: env.VITE_GEMINI_PROXY_URL || '',
  defaultSystem: 'Bạn là nhân viên văn phòng trong phòng tám chuyện, xưng em gọi người dùng là Sếp.',
  apiBase: 'https://generativelanguage.googleapis.com/v1beta/models'
};
