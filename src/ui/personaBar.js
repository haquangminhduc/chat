import { escapeHtml } from '../utils/dom.js';
import { toast } from './toast.js';
import { personaStore, togglePersona, getPersonas } from '../state/personaStore.js';
import { activeChat, chatStore } from '../state/chatStore.js';

export function initPersonaBar({ container, onOpenModal }) {
  if (!container) return;

  function render() {
    const chat = activeChat();
    const isTamChuyen = chat?.mode === 'tam_chuyen';

    if (!isTamChuyen) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'flex';
    const personas = getPersonas();

    container.innerHTML = `
      <div class="persona-bar-header">
        <span class="persona-bar-title">👥 Thành viên phòng:</span>
      </div>
      <div class="persona-badges-list">
        ${personas.map(persona => {
          const isEnabled = persona.enabled !== false;
          return `
            <button class="persona-badge ripple ${isEnabled ? 'active' : 'muted'}" data-id="${persona.id}" title="${isEnabled ? 'Đang tham gia (Bấm để Tắt)' : 'Đang im lặng (Bấm để Bật)'}">
              <span class="persona-avatar-icon">${persona.avatar}</span>
              <span class="persona-name-text">${escapeHtml(persona.name)}</span>
              <span class="persona-status-indicator">${isEnabled ? '●' : '○'}</span>
            </button>
          `;
        }).join('')}
        <button class="persona-add-btn ripple" id="openPersonaModalBtn" title="Quản lý / Thêm nhân vật AI">
          <span>＋ Quản lý AI</span>
        </button>
      </div>
    `;

    // Event listeners
    container.querySelectorAll('.persona-badge').forEach(badge => {
      badge.onclick = () => {
        const id = badge.dataset.id;
        togglePersona(id);
        const updated = getPersonas().find(p => p.id === id);
        if (updated) {
          toast(updated.enabled !== false ? `Đã bật ${updated.name}` : `Đã tắt ${updated.name} (im lặng)`);
        }
      };
    });

    const addBtn = container.querySelector('#openPersonaModalBtn');
    if (addBtn) {
      addBtn.onclick = onOpenModal;
    }
  }

  personaStore.subscribe(render);
  chatStore.subscribe(render);

  render();

  return { render };
}
