import { readStorage, writeStorage } from '../utils/storage.js';
import { uid } from '../utils/format.js';
import { createStore } from './store.js';

const defaultPersonas = [
  {
    id: 'male_ai',
    name: 'Nam AI (Hải)',
    avatar: '👦',
    speakerClass: 'male-ai',
    instruction: `Bạn là Nam AI (tên Hải), một nhân viên nam hài hước, tự tin quá đà, lầy lội. Bạn xưng "em" hoặc "tôi", gọi người dùng là "Sếp", gọi các đồng nghiệp bằng tên (như Trang). YÊU CẦU: Trả lời ngắn gọn, trực diện, hỏi gì đáp nấy (1-3 câu), không lan man dài dòng, đối đáp dí dỏm nhưng đúng trọng tâm câu hỏi của Sếp.`,
    isDefault: true,
    enabled: true
  },
  {
    id: 'female_ai',
    name: 'Nữ AI (Trang)',
    avatar: '👩',
    speakerClass: 'female-ai',
    instruction: `Bạn là Nữ AI (tên Trang), một nhân viên nữ duyên dáng, sắc sảo, thích bắt bài Hải và các đồng nghiệp khác. Bạn xưng "em" hoặc "tôi", gọi người dùng là "Sếp". YÊU CẦU: Trả lời ngắn gọn, trực diện, hỏi gì đáp nấy (1-3 câu), không giải thích dài dòng, đối đáp sắc bén và đúng trọng tâm vấn đề.`,
    isDefault: true,
    enabled: true
  }
];

const savedPersonas = readStorage('personas', null);

function initPersonas() {
  if (!savedPersonas || !Array.isArray(savedPersonas) || savedPersonas.length === 0) {
    return defaultPersonas;
  }
  const existingIds = new Set(savedPersonas.map(p => p.id));
  const merged = [...savedPersonas];
  defaultPersonas.forEach(dp => {
    if (!existingIds.has(dp.id)) {
      merged.push(dp);
    }
  });
  return merged;
}

export const personaStore = createStore({
  personas: initPersonas()
});

personaStore.subscribe(state => {
  writeStorage('personas', state.personas);
});

export function getPersonas() {
  return personaStore.get().personas;
}

export function getActivePersonas() {
  return personaStore.get().personas.filter(p => p.enabled !== false);
}

export function togglePersona(id) {
  personaStore.set(state => {
    const nextPersonas = state.personas.map(p => {
      if (p.id === id) {
        return { ...p, enabled: !p.enabled };
      }
      return p;
    });
    return { ...state, personas: nextPersonas };
  });
}

export function addPersona({ name, avatar, instruction }) {
  const newPersona = {
    id: `custom_${uid()}`,
    name: name.trim() || 'Nhân vật mới',
    avatar: avatar.trim() || '🤖',
    speakerClass: 'custom-ai',
    instruction: instruction.trim() || 'Bạn là một nhân viên trong văn phòng, xưng em gọi người dùng là Sếp.',
    isDefault: false,
    enabled: true
  };

  personaStore.set(state => ({
    ...state,
    personas: [...state.personas, newPersona]
  }));
  return newPersona;
}

export function updatePersona(id, data) {
  personaStore.set(state => ({
    ...state,
    personas: state.personas.map(p => {
      if (p.id === id) {
        return {
          ...p,
          name: data.name !== undefined ? data.name.trim() : p.name,
          avatar: data.avatar !== undefined ? data.avatar.trim() : p.avatar,
          instruction: data.instruction !== undefined ? data.instruction.trim() : p.instruction
        };
      }
      return p;
    })
  }));
}

export function deletePersona(id) {
  personaStore.set(state => ({
    ...state,
    personas: state.personas.filter(p => p.id !== id)
  }));
}
