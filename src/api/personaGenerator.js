import { config } from '../config.js';
import { KeyManager } from './keyManager.js';
import { streamGenerate } from './gemini.js';
import { streamGenerateOpenAI } from './openai.js';
import { settingsStore } from '../state/settingsStore.js';

const keyManager = new KeyManager();

/**
 * Trích xuất JSON từ chuỗi phản hồi của AI
 */
function extractJsonFromText(rawText) {
  if (!rawText) return null;
  
  // 1. Thử parse trực tiếp
  try {
    return JSON.parse(rawText.trim());
  } catch {
    // Tiếp tục thử regex
  }

  // 2. Tìm khối markdown ```json ... ``` hoặc ``` ... ```
  const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // Tiếp tục
    }
  }

  // 3. Tìm vùng mở đầu bằng { và kết thúc bằng }
  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      const jsonCandidate = rawText.slice(firstBrace, lastBrace + 1);
      return JSON.parse(jsonCandidate);
    } catch {
      // Tiếp tục
    }
  }

  return null;
}

/**
 * Gọi AI sinh nhân vật tự động
 * @param {string} userDescription - Mô tả hoặc ý tưởng về nhân vật
 * @param {string} selectedProvider - 'gemini' | 'openai' | 'auto'
 */
export async function generatePersonaWithAI(userDescription, selectedProvider = 'auto') {
  if (!userDescription || !userDescription.trim()) {
    throw new Error('Vui lòng nhập mô tả hoặc ý tưởng nhân vật');
  }

  const currentSettings = settingsStore.get();
  const provider = (selectedProvider === 'gemini' || selectedProvider === 'openai')
    ? selectedProvider
    : (currentSettings.provider || 'gemini');

  const systemInstruction = `Bạn là chuyên gia sáng tạo nhân vật (Character Designer) cho một ứng dụng trò chuyện văn phòng công sở vui nhộn tên là "Phòng Tám Chuyện AI".
Nhiệm vụ của bạn: Dựa vào ý tưởng / đặc điểm mà người dùng cung cấp, hãy tạo ra một nhân vật văn phòng hoàn chỉnh, sinh động, mang cá tính rõ nét, hài hước và rất "đời".

Quy tắc bắt buộc:
1. "name": Tên nhân vật kèm chức danh/vai trò trong ngoặc đơn. Ví dụ: "Tuấn (Intern Dev)", "Chị Hương (Kế Toán)", "Bác Ba (Bảo Vệ)", "Linh (Lễ Tân Gen Z)", "Quân (Lead DevOps thức đêm)"...
2. "avatar": CHỈ 1 emoji duy nhất đại diện xuất sắc cho nhân vật (Ví dụ: 🧑‍💻, 👵, 🧙‍♂️, 💅, ☕, 🤡, 🦄, 👔, 🕵️...).
3. "instruction": System prompt chi tiết hướng dẫn AI nhập vai nhân vật này:
   - Bạn là [Tên], [Chức danh].
   - Miêu tả rõ tính cách, tật xấu vui nhộn, thái độ làm việc, thói quen ăn nói.
   - Cách xưng hô: Xưng "em" / "chị" / "anh" / "chú" / "tôi" và luôn gọi người dùng là "Sếp".
   - Câu chốt bắt buộc: "YÊU CẦU: Trả lời ngắn gọn (1-2 câu), hỏi gì đáp nấy, đúng chất cá tính riêng."

Bạn PHẢI trả về KẾT QUẢ DUY NHẤT dưới dạng chuỗi JSON thuần túy (không kèm lời chào hay giải thích gì thêm), có định dạng:
{
  "name": "...",
  "avatar": "...",
  "instruction": "..."
}`;

  const promptText = `Hãy tạo nhân vật văn phòng dựa trên mô tả sau:\n"${userDescription.trim()}"`;

  let fullOutput = '';
  const abortController = new AbortController();

  if (provider === 'openai') {
    const apiKey = currentSettings.openaiApiKey?.trim();
    if (!apiKey) {
      throw new Error('Chưa có API Key cho GPT / APIGiaRe. Vui lòng vào Cài đặt (⚙️) để nhập Key.');
    }

    const messages = [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: promptText }
    ];

    await streamGenerateOpenAI({
      baseUrl: currentSettings.openaiBaseUrl,
      apiKey: apiKey,
      model: currentSettings.openaiModel || 'gpt-4.1-mini',
      temperature: 0.8,
      messages,
      signal: abortController.signal,
      onText: chunk => { fullOutput += chunk; }
    });
  } else {
    // Gemini
    const geminiKey = currentSettings.geminiApiKey?.trim();
    if (geminiKey) {
      keyManager.keys = geminiKey.split(',').map(k => k.trim()).filter(Boolean);
    }

    if (!keyManager.size && !config.proxyUrl && !import.meta.env.VITE_GEMINI_PROXY_URL) {
      throw new Error('Chưa có Gemini API Key. Vui lòng vào Cài đặt (⚙️) để nhập Key hoặc chọn GPT.');
    }

    const contents = [
      { role: 'user', parts: [{ text: promptText }] }
    ];

    await streamGenerate({
      model: currentSettings.model || config.defaultModel,
      temperature: 0.8,
      system: systemInstruction,
      contents,
      keyManager,
      signal: abortController.signal,
      onText: chunk => { fullOutput += chunk; }
    });
  }

  const parsed = extractJsonFromText(fullOutput);
  if (!parsed || !parsed.name || !parsed.instruction) {
    // Fallback nếu không parse được JSON chuẩn
    return {
      name: userDescription.slice(0, 30),
      avatar: '🤖',
      instruction: fullOutput.trim() || `Bạn là nhân vật ${userDescription}. Hãy đối đáp với Sếp thật tự nhiên và ngắn gọn (1-2 câu).`
    };
  }

  return {
    name: String(parsed.name).trim(),
    avatar: String(parsed.avatar || '🤖').trim().slice(0, 4),
    instruction: String(parsed.instruction).trim()
  };
}
