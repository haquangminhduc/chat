export function apiError(status, raw = '') {
  if (status === 400) return 'Yêu cầu không hợp lệ. Kiểm tra model hoặc nội dung gửi.';
  if (status === 401 || status === 403) return 'API key không hợp lệ hoặc chưa được cấp quyền.';
  if (status === 429) return 'Đã vượt giới hạn yêu cầu (429). Đang chuyển sang API key tiếp theo...';
  if (status >= 500) return 'Máy chủ Gemini đang quá tải tạm thời (503).';
  try { return JSON.parse(raw).error?.message || `Lỗi API (${status})`; } catch { return `Lỗi API (${status})`; }
}
export const isRotatableStatus = status => status === 401 || status === 403 || status === 429 || (status >= 500 && status <= 504);

