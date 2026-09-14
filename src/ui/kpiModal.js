import { escapeHtml } from '../utils/dom.js';
import { toast } from './toast.js';
import { kpiStore, getCompanyFund, getStaffStats, rewardStaff, penalizeStaff, resetFund, formatVND } from '../state/kpiStore.js';

export function initKpiModal({ modal, onReward, onPenalize }) {
  if (!modal) return;

  function render() {
    const fund = getCompanyFund();
    const staffList = getStaffStats();
    const rankBadges = ['🥇', '🥈', '🥉'];

    modal.innerHTML = `
      <div class="modal glass kpi-modal-content">
        <div class="modal-header">
          <h2>🏆 Bảng Thi Đua & Quỹ Công Ty</h2>
          <button class="icon-btn close-kpi-modal" id="closeKpiModalBtn">×</button>
        </div>

        <div class="kpi-modal-body">
          <!-- Card Quỹ Công Ty -->
          <div class="kpi-fund-card glass">
            <div class="fund-info">
              <span class="fund-label">💼 Số dư Quỹ Công Ty:</span>
              <strong class="fund-amount">${formatVND(fund)}</strong>
            </div>
            <div class="fund-actions">
              <button class="btn secondary small-btn" id="resetFundBtn" title="Bơm thêm ngân sách">＋ Nạp quỹ</button>
            </div>
          </div>

          <!-- Bảng xếp hạng thi đua -->
          <div class="kpi-leaderboard-section">
            <h3>Bảng Xếp Hạng Nhân Viên (${staffList.length})</h3>
            <div class="kpi-leaderboard-list">
              ${staffList.map((item, index) => {
                const rankBadge = rankBadges[index] || `#${index + 1}`;
                const isTop1 = index === 0;
                return `
                  <div class="kpi-staff-card glass ${isTop1 ? 'top1-card' : ''}">
                    <div class="staff-card-left">
                      <span class="rank-badge">${rankBadge}</span>
                      <span class="staff-avatar">${item.persona.avatar}</span>
                      <div class="staff-details">
                        <strong>${escapeHtml(item.persona.name)}</strong>
                        <span class="staff-title-tag">${item.title}</span>
                      </div>
                    </div>

                    <div class="staff-card-middle">
                      <div class="kpi-score-badge">
                        <span class="score-num">${item.kpiScore}</span>
                        <span class="score-label">KPI</span>
                      </div>
                      <div class="income-breakdown">
                        <span class="total-income">Tổng: <b>${formatVND(item.totalIncome)}</b></span>
                        <span class="bonus-income">Thưởng: <b class="${item.bonus >= 0 ? 'plus' : 'minus'}">${item.bonus >= 0 ? '+' : ''}${formatVND(item.bonus)}</b></span>
                      </div>
                    </div>

                    <div class="staff-card-actions">
                      <button class="btn-action reward-btn" data-id="${item.persona.id}" data-name="${escapeHtml(item.persona.name)}" title="Thưởng 200.000đ">🎁 +200k</button>
                      <button class="btn-action penalize-btn" data-id="${item.persona.id}" data-name="${escapeHtml(item.persona.name)}" title="Phạt 100.000đ">💸 -100k</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="primary" id="doneKpiModalBtn">Đóng</button>
        </div>
      </div>
    `;

    const closeBtn = modal.querySelector('#closeKpiModalBtn');
    const doneBtn = modal.querySelector('#doneKpiModalBtn');
    if (closeBtn) closeBtn.onclick = closeModal;
    if (doneBtn) doneBtn.onclick = closeModal;

    const resetBtn = modal.querySelector('#resetFundBtn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        const addAmount = 10000000;
        resetFund(getCompanyFund() + addAmount);
        toast(`Đã nạp thêm ${formatVND(addAmount)} vào Quỹ công ty!`);
        render();
      };
    }

    modal.querySelectorAll('.reward-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        rewardStaff(id, 200000, 'Sếp thưởng nóng');
        toast(`Đã thưởng nóng 200.000đ cho ${name}!`);
        render();
        if (onReward) onReward(id, 200000);
      };
    });

    modal.querySelectorAll('.penalize-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        penalizeStaff(id, 100000, 'Sếp phạt');
        toast(`Đã phạt 100.000đ đối với ${name}!`);
        render();
        if (onPenalize) onPenalize(id, 100000);
      };
    });
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

  kpiStore.subscribe(() => {
    if (modal.classList.contains('open')) render();
  });

  return { open: openModal, close: closeModal };
}
