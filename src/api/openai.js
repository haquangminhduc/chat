export async function streamGenerateOpenAI({ baseUrl = 'https://api.apigiare.vn/v1', apiKey, model = 'gpt-4.1-mini', temperature = 0.7, messages, signal, onText }) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Chưa nhập API Key cho APIGiaRe / OpenAI. Vui lòng vào Cài đặt (⚙️) để nhập Key.');
  }

  // Clean baseUrl: ensure no trailing slash
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const url = `${cleanBase}/chat/completions`;

  const payload = {
    model: model.trim() || 'gpt-4.1-mini',
    messages,
    temperature: Number(temperature) || 0.7,
    stream: true
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify(payload),
    signal
  });

  if (!response.ok) {
    const raw = await response.text();
    let message = `Lỗi API (${response.status})`;
    try {
      const parsed = JSON.parse(raw);
      message = parsed.error?.message || parsed.message || message;
    } catch {
      message = raw || message;
    }
    if (response.status === 401) {
      throw new Error(`API Key không hợp lệ hoặc tài khoản hết số dư: ${message}`);
    }
    if (response.status === 429) {
      throw new Error(`Vượt quá giới hạn tần suất gọi: ${message}`);
    }
    throw new Error(message);
  }

  if (!response.body) {
    throw new Error('Trình duyệt không hỗ trợ streaming dữ liệu.');
  }

  await readOpenAISse(response.body, signal, onText);
}

async function readOpenAISse(body, signal, onText) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const dataStr = trimmed.slice(5).trim();
      if (!dataStr || dataStr === '[DONE]') continue;

      try {
        const json = JSON.parse(dataStr);
        const deltaContent = json.choices?.[0]?.delta?.content;
        if (deltaContent) {
          onText(deltaContent);
        }
      } catch {
        // Skip incomplete or unparseable frames
      }
    }

    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
  }
}
