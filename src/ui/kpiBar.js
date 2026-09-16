import { kpiStore, getCompanyFund, formatVND } from '../state/kpiStore.js';
import { isPartyMode, settingsStore } from '../state/settingsStore.js';
import { byId } from '../utils/dom.js';

const QUIZ_PROMPTS = [
  'Đố cả phòng câu hỏi có thưởng 200k: Con gì đập thì sống, không đập thì chết?',
  'Đố cả phòng nhận thưởng 200k: Cái gì bạn không mượn mà phải trả?',
  'Câu đố thưởng nóng 200k: Con gì mang được cả miếng gỗ lớn nhưng không mang nổi một hòn sỏi nhỏ?',
  'Câu hỏi tranh tài thưởng 200k: Bỏ ngoài nướng trong, ăn ngoài bỏ trong là món gì?'
];

const LUNCH_PROMPTS = [
  'Kèo ăn trưa hôm nay: Cơm tấm sườn bì vs Bún đậu mắm tôm vs Bún bò Huế vs Pizza. Cả phòng vote gấp xem trưa nay Sếp nên bao món gì ngon nhất!',
  'Kèo trà sữa chiều nay: Phúc Long vs Gong Cha vs KOI Thé vs Trà sữa trân châu truyền thống. Cả phòng chọn món đi Sếp chốt đơn!',
  'Trưa nay Sếp bao cả phòng đi ăn liên hoan! Mỗi đứa đề xuất 1 quán ngon chuẩn vị xem nào?'
];

export function initKpiBar({ container, onOpenKpiModal, onOpenWheelModal, onOpenMatchModal, onOpenTaiXiuModal, onToggleParty }) {
  if (!container) return;

  function render() {
    const fund = getCompanyFund();
    const partyActive = isPartyMode();

    container.innerHTML = `
      <div class="kpi-bar-fund-chip" id="kpiOpenBtn" title="Xem chi tiết quỹ và bảng thi đua">
        <span class="kpi-fund-icon">💼</span>
        <span class="kpi-fund-text">Quỹ: <b>${formatVND(fund)}</b></span>
      </div>
      <div class="kpi-bar-actions">
        <button class="kpi-bar-btn ripple taixiu-btn" id="kpiTaiXiuBtn" title="Sếp Mở Sòng Tài Xỉu Văn Phòng (Làm Nhà Cái)">
          <span>🎲 Tài Xỉu</span>
        </button>
        <button class="kpi-bar-btn ripple" id="kpiLeaderboardBtn" title="Xem Bảng Xếp Hạng Thi Đua">
          <span>🏆 Bảng Thi Đua</span>
        </button>
        <button class="kpi-bar-btn ripple wheel-btn" id="kpiWheelBtn" title="Mở Vòng Quay May Mắn">
          <span>🎡 Vòng Quay</span>
        </button>
        <button class="kpi-bar-btn ripple match-btn" id="kpiMatchBtn" title="Mở Tơ Hồng Ghép Đôi AI">
          <span>💘 Ghép Đôi</span>
        </button>
        <button class="kpi-bar-btn ripple party-btn ${partyActive ? 'active' : ''}" id="kpiPartyBtn" title="Bật/Tắt Chế Độ Party Say Xỉn Sau Giờ Làm">
          <span>${partyActive ? '🍻 Party: BẬT' : '🍻 Party'}</span>
        </button>
        <button class="kpi-bar-btn ripple lunch-btn" id="kpiLunchBtn" title="Mở Kèo Ăn Trưa & Trà Sữa">
          <span>🧋 Kèo Ăn Trưa</span>
        </button>
        <button class="kpi-bar-btn ripple quiz-btn" id="kpiQuizBtn" title="Ra câu đố có thưởng cho nhân viên">
          <span>🎲 Đố vui 200k</span>
        </button>
      </div>
    `;

    const openBtn = container.querySelector('#kpiOpenBtn');
    const leaderboardBtn = container.querySelector('#kpiLeaderboardBtn');
    if (openBtn) openBtn.onclick = onOpenKpiModal;
    if (leaderboardBtn) leaderboardBtn.onclick = onOpenKpiModal;

    const taiXiuBtn = container.querySelector('#kpiTaiXiuBtn');
    if (taiXiuBtn && onOpenTaiXiuModal) {
      taiXiuBtn.onclick = onOpenTaiXiuModal;
    }

    const wheelBtn = container.querySelector('#kpiWheelBtn');
    if (wheelBtn && onOpenWheelModal) {
      wheelBtn.onclick = onOpenWheelModal;
    }

    const matchBtn = container.querySelector('#kpiMatchBtn');
    if (matchBtn && onOpenMatchModal) {
      matchBtn.onclick = onOpenMatchModal;
    }


    const partyBtn = container.querySelector('#kpiPartyBtn');
    if (partyBtn && onToggleParty) {
      partyBtn.onclick = onToggleParty;
    }

    const lunchBtn = container.querySelector('#kpiLunchBtn');
    if (lunchBtn) {
      lunchBtn.onclick = () => {
        const randomLunch = LUNCH_PROMPTS[Math.floor(Math.random() * LUNCH_PROMPTS.length)];
        const promptInput = byId('prompt');
        if (promptInput) {
          promptInput.value = randomLunch;
          promptInput.focus();
          promptInput.dispatchEvent(new Event('input'));
        }
      };
    }

    const quizBtn = container.querySelector('#kpiQuizBtn');
    if (quizBtn) {
      quizBtn.onclick = () => {
        const randomQuiz = QUIZ_PROMPTS[Math.floor(Math.random() * QUIZ_PROMPTS.length)];
        const promptInput = byId('prompt');
        if (promptInput) {
          promptInput.value = randomQuiz;
          promptInput.focus();
          promptInput.dispatchEvent(new Event('input'));
        }
      };
    }
  }

  kpiStore.subscribe(render);
  settingsStore.subscribe(render);
  render();

  return { render };
}

