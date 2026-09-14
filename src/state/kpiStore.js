import { readStorage, writeStorage } from '../utils/storage.js';
import { createStore } from './store.js';
import { getPersonas, getActivePersonas } from './personaStore.js';

const INITIAL_FUND = 20000000; // 20 triệu VNĐ

const defaultKpiState = {
  companyFund: INITIAL_FUND,
  totalSpent: 0,
  staffStats: {
    hung_truongphong: {
      baseSalary: 8000000,
      bonus: 0,
      kpiScore: 110,
      correctAnswers: 0,
      title: 'Trưởng phòng hách dịch'
    },
    ly_intern: {
      baseSalary: 3500000,
      bonus: 0,
      kpiScore: 85,
      correctAnswers: 0,
      title: 'Bé cưng thực tập'
    },
    lan_ketoan: {
      baseSalary: 6500000,
      bonus: 0,
      kpiScore: 120,
      correctAnswers: 0,
      title: 'Người mẹ tinh thần'
    },
    huy_layloi: {
      baseSalary: 5000000,
      bonus: 0,
      kpiScore: 95,
      correctAnswers: 0,
      title: 'Cây hài lầy lội'
    },
    tam_truyenthong: {
      baseSalary: 5000000,
      bonus: 0,
      kpiScore: 100,
      correctAnswers: 0,
      title: 'Chúa tể hóng hớt'
    },
    scarlett_thuky: {
      baseSalary: 7000000,
      bonus: 0,
      kpiScore: 105,
      correctAnswers: 0,
      title: 'Thư ký sang chảnh'
    },
    nam_thathinh: {
      baseSalary: 5000000,
      bonus: 0,
      kpiScore: 90,
      correctAnswers: 0,
      title: 'Chiến thần thả thính'
    },
    bac_baove: {
      baseSalary: 4500000,
      bonus: 0,
      kpiScore: 100,
      correctAnswers: 0,
      title: 'Bậc thầy triết lý'
    },
    tuan_apluc: {
      baseSalary: 5500000,
      bonus: 0,
      kpiScore: 105,
      correctAnswers: 0,
      title: 'Nạn nhân deadline'
    },
    linh_tramcam: {
      baseSalary: 5000000,
      bonus: 0,
      kpiScore: 90,
      correctAnswers: 0,
      title: 'Thánh phán cụt lủn'
    }
  }
};

const savedKpi = readStorage('kpi_data', null);

function initKpiState() {
  if (!savedKpi) return defaultKpiState;
  return {
    companyFund: savedKpi.companyFund ?? INITIAL_FUND,
    totalSpent: savedKpi.totalSpent ?? 0,
    staffStats: { ...defaultKpiState.staffStats, ...(savedKpi.staffStats || {}) }
  };
}

export const kpiStore = createStore(initKpiState());

kpiStore.subscribe(state => {
  writeStorage('kpi_data', state);
});

export function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

function calculateTitle(kpiScore, bonus) {
  if (kpiScore >= 160 || bonus >= 3000000) return '🏆 Chiến thần gánh team';
  if (kpiScore >= 130 || bonus >= 1500000) return '⭐ Nhân viên xuất sắc';
  if (kpiScore >= 100) return '👍 Nhân viên gương mẫu';
  if (kpiScore >= 70) return '⚠️ Cần cố gắng hơn';
  return '🚨 Nguy cơ trừ lương';
}

export function ensureStaffStat(personaId) {
  const state = kpiStore.get();
  if (!state.staffStats[personaId]) {
    kpiStore.set(s => ({
      ...s,
      staffStats: {
        ...s.staffStats,
        [personaId]: {
          baseSalary: 5000000,
          bonus: 0,
          kpiScore: 100,
          correctAnswers: 0,
          title: 'Nhân viên mới'
        }
      }
    }));
  }
}

export function getCompanyFund() {
  return kpiStore.get().companyFund;
}

export function getStaffStats() {
  const personas = getPersonas();
  const state = kpiStore.get();
  
  return personas.map(p => {
    const stat = state.staffStats[p.id] || {
      baseSalary: 5000000,
      bonus: 0,
      kpiScore: 100,
      correctAnswers: 0,
      title: 'Nhân viên mới'
    };
    return {
      persona: p,
      ...stat,
      totalIncome: (stat.baseSalary || 5000000) + (stat.bonus || 0)
    };
  }).sort((a, b) => (b.kpiScore + b.bonus / 10000) - (a.kpiScore + a.bonus / 10000));
}

export function rewardStaff(personaId, amount = 200000, reason = 'Thưởng thành tích') {
  ensureStaffStat(personaId);
  
  kpiStore.set(state => {
    const currentFund = state.companyFund;
    const actualReward = Math.min(currentFund, amount);
    const prev = state.staffStats[personaId] || { baseSalary: 5000000, bonus: 0, kpiScore: 100, correctAnswers: 0 };
    
    const newBonus = prev.bonus + actualReward;
    const newKpi = prev.kpiScore + Math.round(actualReward / 20000); // 200k = +10 điểm KPI
    const newAnswers = prev.correctAnswers + 1;
    
    return {
      ...state,
      companyFund: Math.max(0, currentFund - actualReward),
      totalSpent: state.totalSpent + actualReward,
      staffStats: {
        ...state.staffStats,
        [personaId]: {
          ...prev,
          bonus: newBonus,
          kpiScore: newKpi,
          correctAnswers: newAnswers,
          title: calculateTitle(newKpi, newBonus)
        }
      }
    };
  });
}

export function rewardAllStaff(amount = 500000, reason = 'Sếp thưởng cả phòng') {
  const active = getActivePersonas();
  if (!active.length) return 0;

  active.forEach(p => ensureStaffStat(p.id));

  kpiStore.set(state => {
    const totalNeeded = amount * active.length;
    const actualPerPerson = state.companyFund >= totalNeeded ? amount : Math.floor(state.companyFund / active.length);
    if (actualPerPerson <= 0) return state;

    const totalDeducted = actualPerPerson * active.length;
    const updatedStaff = { ...state.staffStats };

    active.forEach(p => {
      const prev = updatedStaff[p.id] || { baseSalary: 5000000, bonus: 0, kpiScore: 100, correctAnswers: 0 };
      const newBonus = prev.bonus + actualPerPerson;
      const newKpi = prev.kpiScore + Math.round(actualPerPerson / 20000);
      updatedStaff[p.id] = {
        ...prev,
        bonus: newBonus,
        kpiScore: newKpi,
        title: calculateTitle(newKpi, newBonus)
      };
    });

    return {
      ...state,
      companyFund: Math.max(0, state.companyFund - totalDeducted),
      totalSpent: state.totalSpent + totalDeducted,
      staffStats: updatedStaff
    };
  });

  return amount;
}

export function penalizeStaff(personaId, amount = 100000, reason = 'Phạt vi phạm') {
  ensureStaffStat(personaId);
  
  kpiStore.set(state => {
    const prev = state.staffStats[personaId] || { baseSalary: 5000000, bonus: 0, kpiScore: 100, correctAnswers: 0 };
    const newBonus = Math.max(-2000000, prev.bonus - amount);
    const newKpi = Math.max(0, prev.kpiScore - Math.round(amount / 20000));
    
    return {
      ...state,
      companyFund: state.companyFund + amount,
      staffStats: {
        ...state.staffStats,
        [personaId]: {
          ...prev,
          bonus: newBonus,
          kpiScore: newKpi,
          title: calculateTitle(newKpi, newBonus)
        }
      }
    };
  });
}

export function applyWheelResult(personaId, slice) {
  ensureStaffStat(personaId);
  
  kpiStore.set(state => {
    const prev = state.staffStats[personaId] || { baseSalary: 5000000, bonus: 0, kpiScore: 100, correctAnswers: 0 };
    const amount = slice.amount || 0;
    const kpiDelta = slice.kpi || 0;

    const newBonus = Math.max(-2000000, prev.bonus + amount);
    const newKpi = Math.max(0, prev.kpiScore + kpiDelta);
    const fundDelta = amount > 0 ? -Math.min(state.companyFund, amount) : -amount;

    return {
      ...state,
      companyFund: Math.max(0, state.companyFund + fundDelta),
      totalSpent: state.totalSpent + (amount > 0 ? amount : 0),
      staffStats: {
        ...state.staffStats,
        [personaId]: {
          ...prev,
          bonus: newBonus,
          kpiScore: newKpi,
          title: calculateTitle(newKpi, newBonus)
        }
      }
    };
  });
}

export function resetFund(amount = INITIAL_FUND) {
  kpiStore.set(state => ({
    ...state,
    companyFund: amount,
    totalSpent: 0
  }));
}
