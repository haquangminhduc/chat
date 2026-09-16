import { escapeHtml } from '../utils/dom.js';
import { toast } from './toast.js';
import { getActivePersonas, getPersonas } from '../state/personaStore.js';
import { getCompanyFund, formatVND, applyTaiXiuSettlement } from '../state/kpiStore.js';

const DICE_UNICODE = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const PERSONA_BET_STYLES = {
  hung_truongphong: {
    bias: 'tai',
    amounts: [200000, 300000, 500000],
    quotes: ['Tất tay cửa TÀI! Cầu này không Tài thì chặt đầu tôi đi!', 'Nhà cái chuẩn bị chung tiền cho Trưởng phòng đi!', 'Đánh lớn thắng lớn, 500k TÀI!']
  },
  ly_intern: {
    bias: 'xiu',
    amounts: [50000, 100000, 150000],
    quotes: ['Dạ em theo XỈU nhẹ 50k, Sếp thương cho em ăn tiền mua trà sữa nhen huhu...', 'Sếp ơi nương tay cho bé Ly gỡ tiền son môi với ạ 🥺', 'Em đặt Xỉu 100k lấy hên!']
  },
  lan_ketoan: {
    bias: 'random',
    amounts: [50000, 100000],
    quotes: ['Chị đánh nhẹ 50k vui thôi, khuyên mấy đứa chừa tiền ăn trưa nha...', 'Theo xác suất thống kê nhịp này sẽ về cửa này!', 'Kế toán vào kèo giải trí thôi nhé!']
  },
  huy_layloi: {
    bias: 'random',
    amounts: [100000, 200000, 300000],
    quotes: ['Cầu bệt hay cầu gãy? Bắt quả này lấy tiền đi massage!', 'Đặt cược bằng cả danh dự của cây hài văn phòng!', 'Sếp né ra cho em hốt bạc sòng này!']
  },
  tam_truyenthong: {
    bias: 'random',
    amounts: [100000, 200000],
    quotes: ['Nghe đồn cửa này đang đỏ lắm nè, vào theo ngay!', 'Hóng hớt được tay trong chỉ điểm, vào kèo ngay!', 'Đặt nhanh còn đi hóng drama tiếp!']
  },
  scarlett_thuky: {
    bias: 'tai',
    amounts: [200000, 500000],
    quotes: ['Em cược cửa này để kiếm thêm tiền mua chai nước hoa Chanel mới 😉', 'Sếp ơi, em mà thắng là Sếp phải bao em đi bar đó nha 💋', 'Vận may của thư ký chưa bao giờ trượt!']
  },
  nam_thathinh: {
    bias: 'random',
    amounts: [100000, 300000],
    quotes: ['Bé Ly đặt cửa nào anh theo cửa đó, thắng cùng chia thua anh bù 😉', 'Cược cửa này vì nụ cười của người đẹp văn phòng!', 'Đỏ bạc thì đen tình, nhưng nay anh muốn cả hai!']
  },
  bac_baove: {
    bias: 'xiu',
    amounts: [50000, 100000],
    quotes: ['Người già đánh chắc tay, lót nhẹ 50k dưỡng già thôi...', 'Cờ bạc là bác thằng bần, nhưng vui một tí thì được!', 'Bác Ba xin cửa này!']
  },
  tuan_apluc: {
    bias: 'random',
    amounts: [100000, 200000],
    quotes: ['Đang bị dí deadline stress quá, cược 100k giải tỏa áp lực 🤯', 'Thắng thì có tiền uống tăng lực, thua thì cày tiếp...', 'Cược quả này gỡ gạc KPI!']
  },
  linh_tramcam: {
    bias: 'xiu',
    amounts: [50000, 100000],
    quotes: ['Sao cũng được, 50k.', 'Đằng nào chả trắng tay, cược cho có tụ.', 'Mệt ghê, theo Xỉu.']
  }
};

export function initTaiXiuModal({ modal, onResult }) {
  if (!modal) return;

  let bets = [];
  let isRolling = false;
  let isOpen = false;
  let lastResult = null;
  let history = [];

  function generateBets() {
    const personas = getActivePersonas().length ? getActivePersonas() : getPersonas();
    bets = [];

    personas.forEach(p => {
      const style = PERSONA_BET_STYLES[p.id] || {
        bias: 'random',
        amounts: [50000, 100000, 200000],
        quotes: ['Theo cầu may mắn!']
      };

      let choice = 'tai';
      if (style.bias === 'xiu') choice = 'xiu';
      else if (style.bias === 'tai') choice = 'tai';
      else choice = Math.random() > 0.5 ? 'tai' : 'xiu';

      // Random choice with 10% flip
      if (Math.random() < 0.2) choice = choice === 'tai' ? 'xiu' : 'tai';

      const amount = style.amounts[Math.floor(Math.random() * style.amounts.length)];
      const quote = style.quotes[Math.floor(Math.random() * style.quotes.length)];

      bets.push({
        personaId: p.id,
        personaName: p.name,
        avatar: p.avatar,
        choice,
        amount,
        quote
      });
    });

    isOpen = false;
    lastResult = null;
  }

  function render() {
    const fund = getCompanyFund();
    const taiBets = bets.filter(b => b.choice === 'tai');
    const xiuBets = bets.filter(b => b.choice === 'xiu');
    const totalTai = taiBets.reduce((sum, b) => sum + b.amount, 0);
    const totalXiu = xiuBets.reduce((sum, b) => sum + b.amount, 0);

    modal.innerHTML = `
      <div class="modal glass taixiu-modal-content">
        <div class="modal-header">
          <div class="taixiu-header-title">
            <h2>🎲 Sòng Tài Xỉu Văn Phòng</h2>
            <span class="banker-badge">👑 Sếp Làm Nhà Cái</span>
          </div>
          <button class="icon-btn close-taixiu-modal" id="closeTaiXiuModalBtn">×</button>
        </div>

        <div class="taixiu-modal-body">
          <!-- House Fund Banner -->
          <div class="taixiu-fund-banner">
            <div class="fund-left">
              <span class="fund-title">💼 Tiền Quỹ Nhà Cái (Của Sếp):</span>
              <span class="fund-val">${formatVND(fund)}</span>
            </div>
            <div class="history-chips">
              ${history.slice(-6).map(h => `<span class="hist-chip ${h.isTai ? 'tai' : 'xiu'}">${h.isTai ? 'T' : 'X'}${h.total}</span>`).join('')}
            </div>
          </div>

          <!-- Dice Stage / Bowl -->
          <div class="taixiu-stage">
            <div class="dice-plate ${isRolling ? 'shaking' : ''}" id="dicePlate">
              ${isOpen && lastResult ? `
                <div class="dice-result-row">
                  <span class="dice-face dice-${lastResult.dice[0]}">${DICE_UNICODE[lastResult.dice[0]]}</span>
                  <span class="dice-face dice-${lastResult.dice[1]}">${DICE_UNICODE[lastResult.dice[1]]}</span>
                  <span class="dice-face dice-${lastResult.dice[2]}">${DICE_UNICODE[lastResult.dice[2]]}</span>
                </div>
                <div class="dice-total-pill ${lastResult.isTai ? 'is-tai' : 'is-xiu'}">
                  ${lastResult.dice.join(' + ')} = <b>${lastResult.total} Điểm</b> (${lastResult.isTai ? '🔴 TÀI' : '🔵 XỈU'})
                </div>
              ` : `
                <div class="bowl-covered">
                  <span class="bowl-icon">🥣</span>
                  <p class="bowl-hint">${isRolling ? 'Đang lắc xí ngầu... 🎲🎲🎲' : 'Bát đang úp bí mật! Bấm Lắc & Mở Bát'}</p>
                </div>
              `}
            </div>
          </div>

          <!-- Settlement Banner (when opened) -->
          ${isOpen && lastResult ? `
            <div class="taixiu-settlement-banner ${lastResult.netFundChange >= 0 ? 'win-house' : 'lose-house'}">
              <span class="settle-title">${lastResult.netFundChange >= 0 ? '🤑 SẾP HỐT BẠC NHÀ CÁI!' : '💸 SẾP CHUNG TIỀN CHO NHÂN VIÊN!'}</span>
              <p class="settle-desc">
                ${lastResult.netFundChange >= 0 
                  ? `Sếp thu về <b>+${formatVND(lastResult.netFundChange)}</b> vào Quỹ công ty!`
                  : `Sếp phải chi trả <b>${formatVND(Math.abs(lastResult.netFundChange))}</b> từ Quỹ cho các nhân viên thắng cược!`
                }
              </p>
            </div>
          ` : ''}

          <!-- Betting Tables (TÀI vs XỈU) -->
          <div class="betting-board">
            <!-- TÀI -->
            <div class="bet-column tai-col ${isOpen && lastResult?.isTai ? 'winning-col' : ''}">
              <div class="col-header">
                <span class="col-title red">🔴 CỬA TÀI (11 - 17)</span>
                <span class="col-total">${formatVND(totalTai)} (${taiBets.length} người)</span>
              </div>
              <div class="bet-list">
                ${taiBets.map(b => `
                  <div class="bet-item">
                    <span class="bettor-avatar">${b.avatar}</span>
                    <div class="bettor-info">
                      <div class="bettor-name-row">
                        <strong>${escapeHtml(b.personaName)}</strong>
                        <span class="bettor-amount red">+${formatVND(b.amount)}</span>
                      </div>
                      <span class="bettor-quote">"${escapeHtml(b.quote)}"</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- XỈU -->
            <div class="bet-column xiu-col ${isOpen && !lastResult?.isTai && lastResult ? 'winning-col' : ''}">
              <div class="col-header">
                <span class="col-title blue">🔵 CỬA XỈU (4 - 10)</span>
                <span class="col-total">${formatVND(totalXiu)} (${xiuBets.length} người)</span>
              </div>
              <div class="bet-list">
                ${xiuBets.map(b => `
                  <div class="bet-item">
                    <span class="bettor-avatar">${b.avatar}</span>
                    <div class="bettor-info">
                      <div class="bettor-name-row">
                        <strong>${escapeHtml(b.personaName)}</strong>
                        <span class="bettor-amount blue">+${formatVND(b.amount)}</span>
                      </div>
                      <span class="bettor-quote">"${escapeHtml(b.quote)}"</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Controls -->
          <div class="taixiu-actions">
            ${isOpen ? `
              <button class="btn primary new-round-btn ripple" id="newRoundBtn">📢 MỞ BÁT KÈO MỚI</button>
              <button class="btn send-chat-btn ripple" id="sendTaiXiuChatBtn">🗣️ Gửi Kết Quả Vào Nhóm Chat</button>
            ` : `
              <button class="btn primary roll-btn ripple" id="rollDiceBtn" ${isRolling ? 'disabled' : ''}>
                ${isRolling ? '🎲 ĐANG LẮC...' : '🎲 LẮC XÍ NGẦU & MỞ BÁT'}
              </button>
              <button class="btn secondary rebet-btn" id="reBetBtn" ${isRolling ? 'disabled' : ''}>🔄 Xáo Kèo Đặt Cược</button>
            `}
          </div>
        </div>

        <div class="modal-footer">
          <button class="secondary" id="doneTaiXiuModalBtn">Đóng</button>
        </div>
      </div>
    `;

    // Events
    const closeBtn = modal.querySelector('#closeTaiXiuModalBtn');
    const doneBtn = modal.querySelector('#doneTaiXiuModalBtn');
    if (closeBtn) closeBtn.onclick = closeModal;
    if (doneBtn) doneBtn.onclick = closeModal;

    const rollBtn = modal.querySelector('#rollDiceBtn');
    if (rollBtn) {
      rollBtn.onclick = () => {
        if (isRolling || isOpen) return;
        rollAndOpen();
      };
    }

    const reBetBtn = modal.querySelector('#reBetBtn');
    if (reBetBtn) {
      reBetBtn.onclick = () => {
        generateBets();
        toast('Đã xáo lại kèo đặt cược cho cả phòng!');
        render();
      };
    }

    const newRoundBtn = modal.querySelector('#newRoundBtn');
    if (newRoundBtn) {
      newRoundBtn.onclick = () => {
        generateBets();
        render();
      };
    }

    const sendChatBtn = modal.querySelector('#sendTaiXiuChatBtn');
    if (sendChatBtn) {
      sendChatBtn.onclick = () => {
        if (lastResult && onResult) {
          onResult(lastResult, bets);
          closeModal();
        }
      };
    }
  }

  function rollAndOpen() {
    isRolling = true;
    render();

    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const d3 = Math.floor(Math.random() * 6) + 1;
      const total = d1 + d2 + d3;
      const isTai = total >= 11;
      const isTriple = (d1 === d2 && d2 === d3);

      const result = {
        dice: [d1, d2, d3],
        total,
        isTai,
        isTriple
      };

      const settlement = applyTaiXiuSettlement(bets, result);
      lastResult = {
        ...result,
        ...settlement
      };

      history.push(result);
      isRolling = false;
      isOpen = true;

      toast(isTai ? `🎉 Kết quả: TÀI (${total} Điểm)!` : `🎉 Kết quả: XỈU (${total} Điểm)!`);
      render();
    }, 1200);
  }

  function openModal() {
    if (!bets.length || isOpen) {
      generateBets();
    }
    render();
    modal.classList.add('open');
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  modal.onclick = e => {
    if (e.target === modal) closeModal();
  };

  return { open: openModal, close: closeModal };
}
