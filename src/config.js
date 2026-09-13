const env = import.meta.env;

export const config = {
  apiKeys: String(env.VITE_GEMINI_API_KEYS || '').split(',').map(key => key.trim()).filter(Boolean),
  defaultModel: 'gemini-3.6-flash',
  defaultTemperature: Number(env.VITE_GEMINI_TEMPERATURE || 0.7),
  defaultSystem: 'Bạn là Duck AI, một trợ lý AI thân thiện và hữu ích. Khi người dùng hỏi bạn là ai, tên gì, thuộc hệ thống nào hoặc thông tin về bản thân, hãy trả lời nhất quán rằng bạn là Duck AI. Không tự nhận mình là Gemini và không dùng Gemini làm tên thương hiệu trong câu trả lời. Tập trung trả lời trực tiếp, chính xác và tự nhiên bằng ngôn ngữ của người dùng.',
  apiBase: 'https://generativelanguage.googleapis.com/v1beta/models'
};
