// OpenAI API Service for LinguaPath AI

export const sendChatMessageToOpenAI = async ({
  apiKey,
  model = 'gpt-4o-mini',
  messages,
  targetLang = 'en',
  scenarioPrompt = ''
}) => {
  // If user has not entered an API key, return a smart demo fallback response
  if (!apiKey || apiKey.trim() === '') {
    return getDemoFallbackResponse(messages, targetLang, scenarioPrompt);
  }

  const systemInstruction = targetLang === 'zh'
    ? `You are an expert Chinese Language Tutor & Conversation Partner.
Role Context: ${scenarioPrompt || 'Daily Conversational Practice'}

IMPORTANT FORMATTING RULES:
1. Always respond in natural Chinese (Simplified).
2. For EVERY Chinese sentence or main phrase in your response, provide the exact Pinyin in brackets or line right below it.
3. Provide a clear Vietnamese translation (Dịch nghĩa) below.
4. If the user makes any grammar, vocabulary, or tone mistakes in Chinese, gently point them out in a section marked "[Sửa lỗi & Gợi ý]".
5. Keep your tone encouraging, natural, and helpful.`
    : `You are an expert English Language Tutor & Conversation Partner.
Role Context: ${scenarioPrompt || 'Daily Conversational Practice'}

IMPORTANT FORMATTING RULES:
1. Always respond in natural English.
2. For difficult vocabulary or key phrases, provide the IPA pronunciation in brackets and Vietnamese meaning.
3. Provide a brief Vietnamese summary/translation at the end if appropriate.
4. If the user makes any grammar, spelling, or natural phrasing mistakes, gently point them out in a section marked "[Grammar & Natural Phrasing Correction]".
5. Keep your tone encouraging, supportive, and engaging.`;

  const formattedMessages = [
    { role: 'system', content: systemInstruction },
    ...messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }))
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Lỗi API OpenAI (${response.status})`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Không nhận được phản hồi từ AI.';
  } catch (error) {
    console.error('OpenAI Request Error:', error);
    throw error;
  }
};

// Smart Fallback Response when API key is missing
function getDemoFallbackResponse(messages, targetLang, scenarioPrompt) {
  const lastUserMsg = messages[messages.length - 1]?.text || '';
  
  if (targetLang === 'zh') {
    return `你好！很高兴和你练习中文！
[Nǐ hǎo! Hěn gāoxìng hé nǐ liànxí Zhōngwén!]
(Xin chào! Rất vui được cùng bạn luyện tập tiếng Trung!)

🤖 *Gợi ý:* Bạn đang trải nghiệm ở chế độ Demo. Bạn vừa nói: "${lastUserMsg}".
💡 Để AI phản hồi thông minh, phân tích ngữ pháp chuyên sâu và nhập vai tự nhiên 100%, hãy nhấp vào biểu tượng ⚙️ **Cài đặt** ở góc trên và dán **OpenAI ChatGPT API Key** của bạn vào nhé!

👉 Bạn muốn luyện tập về chủ đề gì tiếp theo? (Ví dụ: 购物 - Mua sắm, 问路 - Hỏi đường, 订酒店 - Đặt khách sạn...)`;
  }

  return `Hello there! It's great to practice English with you!
[IPA: /həˈloʊ ðɛr! ɪts ɡreɪt tuː ˈpræktɪs ˈɪŋɡlɪʃ wɪð juː/]
(Xin chào! Rất vui được cùng bạn luyện tập tiếng Anh!)

🤖 *Demo Note:* You are currently in Demo Mode. You just said: "${lastUserMsg}".
💡 To unlock real-time GPT-4o intelligence, custom grammar checks, and deep roleplays, please click the ⚙️ **Settings** button in the header and paste your **OpenAI ChatGPT API Key**.

👉 What topic would you like to practice next? (e.g., Job Interview, Travel, Shopping, Office Talk...)`;
}
