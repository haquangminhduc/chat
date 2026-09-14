import { initRipple } from '../effects/ripple.js';

const funPrompts = [
  ['☕', 'Hóng drama', 'Cập nhật tin tức văn phòng', 'Hôm nay công ty có drama gì mới không hai đứa?'],
  ['💰', 'Xin tăng lương', 'Thử tài thuyết phục của Sếp', 'Tháng này team mình làm việc thế nào, có xứng đáng được tăng lương không?'],
  ['🍕', 'Kèo ăn trưa', 'Gợi ý món ngon hôm nay', 'Trưa nay Sếp tính bao cả phòng đi ăn, ai có đề xuất gì ngon không?'],
  ['🚀', 'Gánh dự án', 'Tìm nhân tố xuất sắc', 'Dự án mới khách hàng hối gấp quá, ai tự tin đứng ra gánh kèo này?']
];

export function renderWelcome(container, onPrompt) {
  container.innerHTML = `
    <div class="welcome">
      <div class="hero-mark">🗣️</div>
      <h1><span class="gradient-text">Chào mừng Sếp đến với Phòng Tám Chuyện!</span></h1>
      <p>Không gian văn phòng AI ảo hài hước & đầy bất ngờ. Gửi một chủ đề để các nhân viên cùng vào đối đáp nhé!</p>
      <div class="prompt-grid">
        ${funPrompts.map(([icon, title, desc, prompt]) => `
          <button class="prompt-card ripple" data-prompt="${prompt}">
            <div class="prompt-icon">${icon}</div>
            <strong>${title}</strong>
            <span>${desc}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('.prompt-card').forEach(button => {
    button.onclick = () => onPrompt(button.dataset.prompt);
  });

  initRipple(container);
}
