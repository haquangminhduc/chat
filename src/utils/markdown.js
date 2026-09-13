export function renderMarkdown(value = '') {
  const html = window.marked?.parse(value) || value.replace(/</g, '&lt;');
  return window.DOMPurify?.sanitize(html) || html;
}

export function highlightCode(root) {
  root.querySelectorAll('pre code').forEach(code => { try { window.hljs?.highlightElement(code); } catch { /* highlight là enhancement */ } });
}
