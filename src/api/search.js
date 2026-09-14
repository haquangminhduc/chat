const REALTIME_KEYWORDS = [
  'hôm nay', 'thời tiết', 'giá vàng', 'tin tức', 'thời sự', 'bóng đá', 'tỷ số',
  'chứng khoán', 'xăng dầu', 'sự kiện', 'mới nhất', 'vừa mới', 'ngày mai', 'tối nay'
];

export function needsWebSearch(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return REALTIME_KEYWORDS.some(keyword => lower.includes(keyword));
}

export async function fetchLiveWebContext(query) {
  if (!needsWebSearch(query)) return '';

  try {
    const cleanQuery = query.replace(/@[^\s]+/g, '').trim();
    // Use DuckDuckGo Instant Answer API for fast factual lookup
    const encoded = encodeURIComponent(cleanQuery);
    const response = await fetch(`https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`, {
      signal: AbortSignal.timeout(3000)
    });

    if (response.ok) {
      const data = await response.json();
      const abstract = data.AbstractText || data.Heading || '';
      const related = data.RelatedTopics?.slice(0, 2).map(t => t.Text).filter(Boolean).join('. ') || '';
      const facts = [abstract, related].filter(Boolean).join(' ');

      if (facts) {
        return `\n[DỮ LIỆU THỜI GIAN THỰC TỪ INTERNET]: ${facts}`;
      }
    }
  } catch {
    // Graceful fallback if offline or timeout
  }

  const todayStr = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return `\n[THỜI GIAN HIỆN TẠI]: Hôm nay là ${todayStr}.`;
}
