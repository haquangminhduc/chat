# Gemini Clone

SPA chat Gemini dùng ES Modules native và Vite tối giản. Giao diện giữ nguyên glassmorphism, aurora, particles, streaming, markdown, upload ảnh, voice input và lịch sử chat.

## Chạy local

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

Điền nhiều key trong `.env` bằng dấu phẩy:

```env
VITE_GEMINI_API_KEYS=AIzaKey1,AIzaKey2,AIzaKey3
VITE_GEMINI_DEFAULT_MODEL=gemini-3.6-flash
VITE_GEMINI_TEMPERATURE=0.7
```

Key sẽ được xoay khi API trả `401`, `403` hoặc `429`. Vì `VITE_*` được đưa vào bundle phía client, production an toàn nhất là chuyển `src/api/gemini.js` sang serverless proxy và giữ key ở biến môi trường server.

## Deploy

- Vercel/Netlify/Cloudflare Pages: build command `npm run build`, output directory `dist`.
- Khai báo các biến `VITE_*` trong dashboard của nền tảng trước khi build.
- Không commit `.env`.

## GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` sẽ tự chạy `npm run build` và deploy thư mục `dist` sau mỗi lần push lên `main` hoặc `master`.

1. Vào **Settings > Pages** của repository.
2. Chọn **Source: GitHub Actions**.
3. Thêm secret `VITE_GEMINI_API_KEYS` trong **Settings > Secrets and variables > Actions**.
4. Push code và mở URL Pages sau khi workflow hoàn tất.
