import { escapeHtml } from '../utils/dom.js';
import { toast } from './toast.js';
import { getActivePersonas, getPersonas } from '../state/personaStore.js';

const MATCH_TITLES = [
  'Định Mệnh Văn Phòng 🌟',
  'Oan Gia Ngõ Hẹp 💥',
  'Thanh Mai Trúc Mã 🌸',
  'Cặp Đôi Tăng Ca 10h Đêm 🌙',
  'Chiến Thần Thả Thính 🍯',
  'Trời Sinh Một Cặp 💖',
  'Cặp Đôi Trà Sữa 🧋',
  'Kỳ Phùng Địch Thủ Hóa Uyên Ương 🕊️'
];

const MATCH_SCENARIOS = [
  'Bị cả phòng bắt quả tang cùng order chung 1 ly trà sữa cắm 2 ống hút!',
  'Cùng nhau ở lại văn phòng tăng ca muộn đến 10h đêm và lén chia nhau gói mì tôm.',
  'Vừa liếc mắt nhìn nhau trong cuộc họp là cả hai cùng đỏ mặt ngượng ngùng.',
  'Lén nhường nhau suất ăn ngon nhất trong tiệc liên hoan công ty.',
  'Cãi nhau chí chóe cả ngày nhưng tan làm lại lén chờ nhau ở nhà xe!'
];

export function initMatchModal({ modal, onMatch }) {
  if (!modal) return;

  let currentResult = null;

  function render() {
    const personas = getActivePersonas().length >= 2 ? getActivePersonas() : getPersonas();
    const p1 = personas[0] || { id: 'male_ai', name: 'Nam AI', avatar: '👦' };
    const p2 = personas[1] || personas[0] || { id: 'female_ai', name: 'Nữ AI', avatar: '👩' };

    modal.innerHTML = `
      <div class="modal glass match-modal-content">
        <div class="modal-header">
          <h2>💘 Tơ Hồng Văn Phòng - Ghép Đôi</h2>
          <button class="icon-btn close-match-modal" id="closeMatchModalBtn">×</button>
        </div>

        <div class="match-modal-body">
          <p class="match-desc">Chọn 2 nhân viên AI để "đẩy thuyền" xem độ hợp duyên và kích hoạt màn đối đáp tỏ tình/trêu chọc cực ngọt!</p>
          
          <div class="match-pair-selectors">
            <div class="match-select-box">
              <label>Nhân vật 1:</label>
              <select id="matchStaff1">
                ${personas.map((p, idx) => `<option value="${p.id}" ${idx === 0 ? 'selected' : ''}>${p.avatar} ${escapeHtml(p.name)}</option>`).join('')}
              </select>
            </div>

            <div class="match-heart-divider">💘</div>

            <div class="match-select-box">
              <label>Nhân vật 2:</label>
              <select id="matchStaff2">
                ${personas.map((p, idx) => `<option value="${p.id}" ${idx === 1 || (personas.length === 1 && idx === 0) ? 'selected' : ''}>${p.avatar} ${escapeHtml(p.name)}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="match-actions-row">
            <button class="btn secondary ripple" id="matchRandomBtn">🎲 Ghép Ngẫu Nhiên</button>
            <button class="btn primary match-start-btn ripple" id="startMatchBtn">💘 TÍNH ĐỘ HỢP DUYÊN</button>
          </div>

          <div class="match-result-card glass" id="matchResultCard" style="display: none;">
            <div class="match-result-badge" id="matchScoreBadge">95% HỢP NHAU</div>
            <div class="match-gauge-bar">
              <div class="match-gauge-fill" id="matchGaugeFill" style="width: 0%;"></div>
            </div>
            <h3 class="match-couple-title" id="matchCoupleTitle">Định Mệnh Văn Phòng</h3>
            <p class="match-scenario-text" id="matchScenarioText">Đang tính toán duyên số...</p>
            
            <button class="btn primary send-match-chat-btn ripple" id="sendMatchChatBtn">
              💌 Thả Thuyền Vào Chat & Ép Tỏ Tình!
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button class="secondary" id="doneMatchModalBtn">Đóng</button>
        </div>
      </div>
    `;

    const closeBtn = modal.querySelector('#closeMatchModalBtn');
    const doneBtn = modal.querySelector('#doneMatchModalBtn');
    if (closeBtn) closeBtn.onclick = closeModal;
    if (doneBtn) doneBtn.onclick = closeModal;

    const select1 = modal.querySelector('#matchStaff1');
    const select2 = modal.querySelector('#matchStaff2');
    const randomBtn = modal.querySelector('#matchRandomBtn');
    const startBtn = modal.querySelector('#startMatchBtn');
    const sendChatBtn = modal.querySelector('#sendMatchChatBtn');

    if (randomBtn) {
      randomBtn.onclick = () => {
        if (personas.length < 2) {
          toast('Cần ít nhất 2 nhân vật để ghép đôi!', 'error');
          return;
        }
        const idx1 = Math.floor(Math.random() * personas.length);
        let idx2 = Math.floor(Math.random() * personas.length);
        while (idx2 === idx1 && personas.length > 1) {
          idx2 = Math.floor(Math.random() * personas.length);
        }
        if (select1) select1.value = personas[idx1].id;
        if (select2) select2.value = personas[idx2].id;
        calculateMatch(personas[idx1], personas[idx2]);
      };
    }

    if (startBtn) {
      startBtn.onclick = () => {
        const id1 = select1?.value;
        const id2 = select2?.value;
        if (id1 === id2) {
          toast('Hãy chọn 2 nhân vật khác nhau để đẩy thuyền nhé!', 'error');
          return;
        }
        const persona1 = personas.find(p => p.id === id1);
        const persona2 = personas.find(p => p.id === id2);
        if (persona1 && persona2) {
          calculateMatch(persona1, persona2);
        }
      };
    }

    if (sendChatBtn) {
      sendChatBtn.onclick = () => {
        if (!currentResult) return;
        closeModal();
        if (onMatch) {
          onMatch(currentResult.persona1, currentResult.persona2, currentResult);
        }
      };
    }
  }

  function calculateMatch(persona1, persona2) {
    const card = modal.querySelector('#matchResultCard');
    const scoreBadge = modal.querySelector('#matchScoreBadge');
    const gaugeFill = modal.querySelector('#matchGaugeFill');
    const titleEl = modal.querySelector('#matchCoupleTitle');
    const scenarioEl = modal.querySelector('#matchScenarioText');

    if (!card) return;

    // Generate score between 70% and 99%
    const score = Math.floor(Math.random() * 30) + 70;
    const title = MATCH_TITLES[Math.floor(Math.random() * MATCH_TITLES.length)];
    const scenario = MATCH_SCENARIOS[Math.floor(Math.random() * MATCH_SCENARIOS.length)];

    currentResult = {
      persona1,
      persona2,
      score,
      title,
      scenario
    };

    card.style.display = 'block';
    if (scoreBadge) scoreBadge.textContent = `${score}% HỢP NHAU 💖`;
    if (titleEl) titleEl.textContent = `${persona1.name} 💕 ${persona2.name}: "${title}"`;
    if (scenarioEl) scenarioEl.textContent = `Tình huống: ${scenario}`;

    // Animate gauge fill
    if (gaugeFill) {
      gaugeFill.style.width = '0%';
      setTimeout(() => {
        gaugeFill.style.width = `${score}%`;
      }, 50);
    }

    toast(`💘 Độ hợp duyên của ${persona1.name} & ${persona2.name}: ${score}%!`);
  }

  function openModal() {
    render();
    modal.classList.add('open');
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  modal.onclick = event => {
    if (event.target === modal) closeModal();
  };

  return { open: openModal, close: closeModal };
}
