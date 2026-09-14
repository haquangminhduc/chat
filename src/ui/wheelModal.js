import { escapeHtml } from '../utils/dom.js';
import { toast } from './toast.js';
import { getActivePersonas, getPersonas } from '../state/personaStore.js';
import { applyWheelResult } from '../state/kpiStore.js';

const WHEEL_SLICES = [
  { label: 'Thưởng 500k 🎁', amount: 500000, kpi: 25, color: '#10b981', textColor: '#ffffff' },
  { label: 'Bao trà sữa 🧋', amount: -150000, kpi: 10, color: '#f59e0b', textColor: '#ffffff' },
  { label: 'Vé đi trễ 🎟️', amount: 0, kpi: 15, color: '#6366f1', textColor: '#ffffff' },
  { label: 'Bị phạt 100k 💸', amount: -100000, kpi: -5, color: '#ef4444', textColor: '#ffffff' },
  { label: 'Độc đắc 1 Tr 💰', amount: 1000000, kpi: 50, color: '#ec4899', textColor: '#ffffff' },
  { label: 'Bao cà phê ☕', amount: 100000, kpi: 5, color: '#8b5cf6', textColor: '#ffffff' },
  { label: 'Quét phòng 🧹', amount: -50000, kpi: -2, color: '#475569', textColor: '#ffffff' },
  { label: '+20 Điểm KPI 🌟', amount: 0, kpi: 20, color: '#06b6d4', textColor: '#ffffff' }
];

export function initWheelModal({ modal, onResult }) {
  if (!modal) return;

  let isSpinning = false;
  let currentAngle = 0;

  function render() {
    const personas = getActivePersonas().length ? getActivePersonas() : getPersonas();

    modal.innerHTML = `
      <div class="modal glass wheel-modal-content">
        <div class="modal-header">
          <h2>🎡 Vòng Quay May Mắn Văn Phòng</h2>
          <button class="icon-btn close-wheel-modal" id="closeWheelModalBtn">×</button>
        </div>

        <div class="wheel-modal-body">
          <div class="wheel-select-row">
            <label>Chọn nhân viên nhận lượt quay:</label>
            <select id="wheelStaffSelect">
              ${personas.map(p => `<option value="${p.id}">${p.avatar} ${escapeHtml(p.name)}</option>`).join('')}
            </select>
          </div>

          <div class="wheel-stage">
            <div class="wheel-pointer">▼</div>
            <canvas id="wheelCanvas" width="300" height="300"></canvas>
          </div>

          <div class="wheel-result-banner" id="wheelResultBanner" style="display: none;"></div>

          <div class="wheel-actions">
            <button class="btn primary spin-btn ripple" id="spinWheelBtn">🎡 QUAY NGAY</button>
          </div>
        </div>

        <div class="modal-footer">
          <button class="secondary" id="doneWheelModalBtn">Đóng</button>
        </div>
      </div>
    `;

    const closeBtn = modal.querySelector('#closeWheelModalBtn');
    const doneBtn = modal.querySelector('#doneWheelModalBtn');
    if (closeBtn) closeBtn.onclick = closeModal;
    if (doneBtn) doneBtn.onclick = closeModal;

    const canvas = modal.querySelector('#wheelCanvas');
    if (canvas) {
      drawWheel(canvas, currentAngle);
    }

    const spinBtn = modal.querySelector('#spinWheelBtn');
    if (spinBtn) {
      spinBtn.onclick = () => {
        if (isSpinning) return;
        const staffSelect = modal.querySelector('#wheelStaffSelect');
        const staffId = staffSelect?.value;
        const targetStaff = personas.find(p => p.id === staffId) || personas[0];
        if (!targetStaff) {
          toast('Vui lòng chọn nhân viên quay thưởng!', 'error');
          return;
        }
        startSpin(canvas, targetStaff);
      };
    }
  }

  function drawWheel(canvas, angle) {
    const ctx = canvas.getContext('2d');
    const numSlices = WHEEL_SLICES.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = centerX - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    for (let i = 0; i < numSlices; i++) {
      const slice = WHEEL_SLICES[i];
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff33';
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = slice.textColor;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(slice.label, radius - 15, 4);
      ctx.restore();
    }

    // Center pin circle
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e1b4b';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#a855f7';
    ctx.stroke();

    ctx.restore();
  }

  function startSpin(canvas, persona) {
    isSpinning = true;
    const spinBtn = modal.querySelector('#spinWheelBtn');
    const banner = modal.querySelector('#wheelResultBanner');
    if (spinBtn) spinBtn.disabled = true;
    if (banner) banner.style.display = 'none';

    const numSlices = WHEEL_SLICES.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    // Pick random target slice
    const targetIndex = Math.floor(Math.random() * numSlices);
    const targetSlice = WHEEL_SLICES[targetIndex];

    // Pointer is at Top (3 * PI / 2)
    const targetAngleOnWheel = targetIndex * sliceAngle + sliceAngle / 2;
    const totalSpins = 5 + Math.random() * 3;
    const finalAngle = (1.5 * Math.PI) - targetAngleOnWheel + (totalSpins * 2 * Math.PI);

    const startAngle = currentAngle % (2 * Math.PI);
    const deltaAngle = finalAngle - startAngle;
    const duration = 4000;
    const startTime = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);

      currentAngle = startAngle + deltaAngle * eased;
      drawWheel(canvas, currentAngle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isSpinning = false;
        if (spinBtn) spinBtn.disabled = false;
        applyWheelResult(persona.id, targetSlice);

        if (banner) {
          banner.innerHTML = `🎉 <strong>${escapeHtml(persona.name)}</strong> đã quay trúng: <span class="prize-highlight">${targetSlice.label}</span>!`;
          banner.style.display = 'block';
        }
        toast(`🎡 ${persona.name} trúng: ${targetSlice.label}!`);

        if (onResult) {
          onResult(persona, targetSlice);
        }
      }
    }

    requestAnimationFrame(animate);
  }

  function openModal() {
    render();
    modal.classList.add('open');
  }

  function closeModal() {
    if (isSpinning) return;
    modal.classList.remove('open');
  }

  modal.onclick = event => {
    if (event.target === modal) closeModal();
  };

  return { open: openModal, close: closeModal };
}
