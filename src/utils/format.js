export function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
export function timeLabel(value = Date.now()) { return new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }); }
export function downloadText(text, filename, type = 'text/plain') { const url = URL.createObjectURL(new Blob([text], { type })); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); }
