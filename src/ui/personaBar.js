import { escapeHtml } from '../utils/dom.js';
import { toast } from './toast.js';
import { personaStore, togglePersona, getPersonas, getActivePersonas } from '../state/personaStore.js';
import { readStorage, writeStorage } from '../utils/storage.js';

export function initPersonaBar({ container, onOpenModal }) {
  if (!container) return;

  let isCollapsed = readStorage('persona_bar_collapsed', false);

  function render() {
    container.style.display = 'flex';
    const personas = getPersonas();
    const activePersonas = getActivePersonas();
    const activeCount = activePersonas.length;
    const totalCount = personas.length;

    container.className = `persona-bar ${isCollapsed ? 'is-collapsed' : 'is-expanded'}`;

    container.innerHTML = `
      <div class="persona-bar-header">
        <button class="persona-collapse-toggle ripple" id="togglePersonaCollapseBtn" title="${isCollapsed ? 'Nhấn để mở rộng danh sách thành viên' : 'Nhấn để thu gọn danh sách thành viên'}">
          <span class="persona-bar-title">👥 Thành viên (${activeCount}/${totalCount})</span>
          <span class="persona-collapse-pill">${isCollapsed ? '▼ Mở rộng' : '▲ Thu gọn'}</span>
        </button>
        ${isCollapsed ? `
          <button class="persona-add-btn compact ripple" id="openPersonaModalBtnCompact" title="Quản lý / Thêm nhân vật AI">
            <span>＋ Quản lý AI</span>
          </button>
        ` : ''}
      </div>
      <div class="persona-badges-list ${isCollapsed ? 'hidden' : ''}">
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

    // Toggle collapse event
    const collapseToggleBtn = container.querySelector('#togglePersonaCollapseBtn');
    if (collapseToggleBtn) {
      collapseToggleBtn.onclick = () => {
        isCollapsed = !isCollapsed;
        writeStorage('persona_bar_collapsed', isCollapsed);
        render();
      };
    }

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

    const compactAddBtn = container.querySelector('#openPersonaModalBtnCompact');
    if (compactAddBtn) {
      compactAddBtn.onclick = onOpenModal;
    }
  }

  personaStore.subscribe(render);
  render();

  return { render };
}

