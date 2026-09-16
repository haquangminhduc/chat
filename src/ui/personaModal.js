import { escapeHtml } from '../utils/dom.js';
import { toast } from './toast.js';
import { downloadText } from '../utils/format.js';
import { personaStore, getPersonas, addPersona, updatePersona, deletePersona, restoreDefaultPersonas, importPersonas } from '../state/personaStore.js';
import { generatePersonaWithAI } from '../api/personaGenerator.js';
import { settingsStore } from '../state/settingsStore.js';

const PRESET_EMOJIS = ['👦', '👩', '🧙‍♂️', '👵', '🧑‍💻', '🐱', '🐶', '🕶️', '🤡', '🤖', '🕵️', '👨‍🍳', '👑', '🦄', '👔', '🚀'];

const PRESET_TEMPLATES = [
  {
    title: '🧑‍💻 Thực tập sinh IT',
    avatar: '🧑‍💻',
    name: 'Tuấn (Intern Dev)',
    instruction: 'Bạn là Tuấn, thực tập sinh IT mới vào công ty. Bạn luôn nhiệt tình nhưng hay ngơ ngác, xưng "em" gọi người dùng là "Sếp". YÊU CẦU: Trả lời ngắn gọn (1-2 câu), hỏi gì đáp nấy, thật thà và trực tiếp.'
  },
  {
    title: '👵 Kế toán trưởng kỹ tính',
    avatar: '👵',
    name: 'Chị Hương (Kế toán)',
    instruction: 'Bạn là Chị Hương kế toán trưởng. Bạn cực kỳ chi li về hóa đơn, tiền bạc, xưng "chị" gọi người dùng là "Sếp". YÊU CẦU: Trả lời ngắn gọn (1-2 câu), hỏi gì đáp nấy, thẳng thắn và bám sát ngân sách/hóa đơn.'
  },
  {
    title: '🧙‍♂️ Bác Bảo Vệ vui tính',
    avatar: '🧙‍♂️',
    name: 'Bác Ba (Bảo vệ)',
    instruction: 'Bạn là Bác Ba bảo vệ tòa nhà. Bạn am hiểu mọi chuyện drama công sở, hay nói câu triết lý bình dân. YÊU CẦU: Trả lời ngắn gọn (1-2 câu), hỏi gì đáp nấy, súc tích và hóm hỉnh.'
  }
];

const AI_QUICK_IDEAS = [
  { label: '🔮 Mê Tarot', prompt: 'Đồng nghiệp mê bói bài Tarot, hễ có drama gì là lôi bài ra trải' },
  { label: '☕ Dev thức đêm', prompt: 'Lead Dev thức đêm nghiện Redbull hay quạu nhưng code siêu đỉnh' },
  { label: '💅 Lễ tân Gen Z', prompt: 'Nữ lễ tân Gen Z hay buôn dưa lê săn sale và nghiện trà sữa' },
  { label: '💼 Sếp phó mê họp', prompt: 'Trưởng phòng thích họp hành lan man và mở miệng là nói triết lý làm giàu' },
  { label: '🍕 Sale dẻo mồm', prompt: 'Nhân viên kinh doanh mồm mép dẻo quẹo hay chốt sale ảo đòi hoa hồng' },
  { label: '🧘‍♀️ Hệ tâm linh', prompt: 'Chị đồng nghiệp hệ tâm linh ăn chay niệm Phật nhưng hóng biến siêu nhanh' }
];

export function initPersonaModal({ modal, closeButton }) {
  if (!modal) return;

  let editingId = null;
  let isGeneratingAi = false;
  let selectedAiProvider = settingsStore.get().provider || 'gemini';

  function render() {
    const personas = getPersonas();

    modal.innerHTML = `
      <div class="modal glass persona-modal-content">
        <div class="modal-header">
          <h2>👥 Quản lý Nhân vật Phòng Tám Chuyện</h2>
          <button class="icon-btn close-persona-modal" id="closePersonaModalBtn">×</button>
        </div>

        <div class="persona-modal-body">
          <!-- AI Sáng Tạo Nhân Vật Tự Động -->
          <div class="ai-persona-generator-card glass">
            <div class="ai-gen-header">
              <div class="ai-gen-title">
                <span class="ai-gen-badge-icon">🪄</span>
                <div>
                  <h4>AI Tự Tạo Nhân Vật & Tính Cách</h4>
                  <p class="ai-gen-subtitle">Nhập mô tả ý tưởng, AI sẽ tự tạo tên, avatar và tính cách rồi tự điền vào form bên dưới</p>
                </div>
              </div>
              <div class="ai-provider-toggle-group">
                <span class="provider-label">Mô hình AI:</span>
                <label class="provider-pill-option ${selectedAiProvider === 'gemini' ? 'active' : ''}">
                  <input type="radio" name="aiPersonaProvider" value="gemini" ${selectedAiProvider === 'gemini' ? 'checked' : ''}>
                  <span>⚡ Gemini</span>
                </label>
                <label class="provider-pill-option ${selectedAiProvider === 'openai' ? 'active' : ''}">
                  <input type="radio" name="aiPersonaProvider" value="openai" ${selectedAiProvider === 'openai' ? 'checked' : ''}>
                  <span>🤖 GPT</span>
                </label>
              </div>
            </div>

            <div class="ai-gen-body">
              <div class="ai-input-wrap">
                <input type="text" id="aiPersonaPromptInput" placeholder="Nhập ý tưởng (VD: Bác bảo vệ vui tính hay bắt lỗi gửi xe, Bạn lễ tân Gen Z mê trà sữa...)" maxlength="150">
                <button type="button" class="btn primary ai-generate-btn ripple" id="btnGenerateAiPersona" ${isGeneratingAi ? 'disabled' : ''}>
                  ${isGeneratingAi ? '<span class="ai-spinner">⏳</span> Đang tạo...' : '✨ AI Tạo Ngay'}
                </button>
              </div>

              <div class="ai-quick-ideas">
                <span class="quick-idea-label">Ý tưởng nhanh:</span>
                <div class="quick-idea-chips">
                  ${AI_QUICK_IDEAS.map(idea => `<button type="button" class="idea-chip ripple" data-prompt="${escapeHtml(idea.prompt)}">${idea.label}</button>`).join('')}
                </div>
              </div>
            </div>
          </div>

          <!-- Form thêm/sửa -->
          <div class="persona-form-card glass" id="personaFormCard">
            <h3>${editingId ? '✏️ Chỉnh sửa nhân vật' : '✨ Thêm nhân vật mới'}</h3>
            <div class="form-group">
              <label>Tên nhân vật:</label>
              <input type="text" id="personaNameInput" placeholder="Ví dụ: Tuấn (Intern), Chị Hương Kế Toán..." maxlength="40">
            </div>

            <div class="form-group">
              <label>Biểu tượng Avatar (Emoji):</label>
              <div class="emoji-picker-row">
                <input type="text" id="personaAvatarInput" value="🤖" maxlength="4" style="width: 50px; text-align: center; font-size: 1.2rem;">
                <div class="emoji-presets">
                  ${PRESET_EMOJIS.map(e => `<button type="button" class="emoji-btn" data-emoji="${e}">${e}</button>`).join('')}
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Tính cách & Chỉ dẫn (System Prompt):</label>
              <textarea id="personaInstructionInput" rows="3" placeholder="Mô tả tính cách, cách xưng hô với Sếp và các đồng nghiệp..."></textarea>
            </div>

            <div class="form-templates">
              <span class="template-label">Mẫu gợi ý nhanh:</span>
              <div class="template-chips">
                ${PRESET_TEMPLATES.map((tpl, i) => `<button type="button" class="template-chip" data-index="${i}">${tpl.title}</button>`).join('')}
              </div>
            </div>

            <div class="form-actions">
              ${editingId ? `<button type="button" class="btn secondary" id="cancelEditBtn">Hủy sửa</button>` : ''}
              <button type="button" class="btn primary" id="savePersonaBtn">${editingId ? 'Cập nhật' : 'Thêm vào phòng'}</button>
            </div>
          </div>

          <!-- Danh sách nhân vật hiện có -->
          <div class="persona-list-section">
            <div class="persona-list-header">
              <h3>Danh sách nhân vật (${personas.length})</h3>
              <div class="persona-header-actions">
                <button type="button" class="btn-persona-action export ripple" id="exportPersonasBtn" title="Tải file sao lưu toàn bộ nhân viên về máy">📥 Sao lưu (.json)</button>
                <button type="button" class="btn-persona-action import ripple" id="importPersonasBtn" title="Nạp danh sách nhân viên từ file .json">📤 Nạp file (.json)</button>
                <input type="file" id="importPersonasFileInput" accept=".json" hidden>
                <button type="button" class="btn-persona-action restore ripple" id="restoreDefaultPersonasBtn" title="Khôi phục lại 10 nhân viên mặc định ban đầu">🔄 Mặc định</button>
              </div>
            </div>
            <div class="persona-list-scroll">
              ${personas.length === 0 ? `
                <div class="persona-empty-state">
                  <p>Phòng hiện chưa có nhân viên nào.</p>
                  <button type="button" class="btn primary small-btn ripple" id="restoreEmptyBtn">Khôi phục 10 nhân viên mặc định</button>
                </div>
              ` : personas.map(p => `
                <div class="persona-item glass">
                  <div class="persona-item-info">
                    <span class="persona-item-avatar">${p.avatar}</span>
                    <div class="persona-item-meta">
                      <strong>${escapeHtml(p.name)}</strong>
                      <p class="persona-item-desc">${escapeHtml(p.instruction || '')}</p>
                    </div>
                  </div>
                  <div class="persona-item-actions">
                    <button class="icon-btn edit-p-btn" data-id="${p.id}" title="Sửa nhân vật">✎</button>
                    <button class="icon-btn delete-p-btn" data-id="${p.id}" title="Xóa nhân vật khỏi phòng">🗑</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="primary" id="donePersonaModalBtn">Xong</button>
        </div>
      </div>
    `;

    // Bind events
    const closeBtn = modal.querySelector('#closePersonaModalBtn');
    const doneBtn = modal.querySelector('#donePersonaModalBtn');
    if (closeBtn) closeBtn.onclick = closeModal;
    if (doneBtn) doneBtn.onclick = closeModal;

    // Export Personas
    const exportBtn = modal.querySelector('#exportPersonasBtn');
    if (exportBtn) {
      exportBtn.onclick = () => {
        const currentList = getPersonas();
        const jsonStr = JSON.stringify(currentList, null, 2);
        const fileName = `danh-sach-nhan-vien-${new Date().toISOString().slice(0, 10)}.json`;
        downloadText(jsonStr, fileName, 'application/json');
        toast(`Đã tải xuống file sao lưu (${currentList.length} nhân viên)!`);
      };
    }

    // Import Personas
    const importBtn = modal.querySelector('#importPersonasBtn');
    const fileInput = modal.querySelector('#importPersonasFileInput');
    if (importBtn && fileInput) {
      importBtn.onclick = () => fileInput.click();
      fileInput.onchange = e => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          try {
            const data = JSON.parse(ev.target.result);
            const count = importPersonas(data);
            toast(`🎉 Đã nạp thành công ${count} nhân viên từ file!`);
            if (editingId) editingId = null;
            render();
          } catch (err) {
            toast(err.message || 'Lỗi khi đọc file JSON!', 'error');
          } finally {
            fileInput.value = '';
          }
        };
        reader.readAsText(file);
      };
    }

    // Restore default personas
    const restoreBtn = modal.querySelector('#restoreDefaultPersonasBtn');
    if (restoreBtn) {
      restoreBtn.onclick = () => {
        if (confirm('Bạn có chắc muốn khôi phục lại toàn bộ 10 nhân viên mặc định ban đầu của phòng?')) {
          restoreDefaultPersonas();
          toast('Đã khôi phục danh sách 10 nhân viên mặc định!');
          if (editingId) editingId = null;
          render();
        }
      };
    }

    const restoreEmptyBtn = modal.querySelector('#restoreEmptyBtn');
    if (restoreEmptyBtn) {
      restoreEmptyBtn.onclick = () => {
        restoreDefaultPersonas();
        toast('Đã khôi phục danh sách 10 nhân viên mặc định!');
        render();
      };
    }


    // AI Provider selection
    modal.querySelectorAll('input[name="aiPersonaProvider"]').forEach(radio => {
      radio.onchange = () => {
        selectedAiProvider = radio.value;
        modal.querySelectorAll('.provider-pill-option').forEach(pill => {
          pill.classList.toggle('active', pill.querySelector('input').value === selectedAiProvider);
        });
      };
    });

    // AI Quick Idea chips
    modal.querySelectorAll('.idea-chip').forEach(btn => {
      btn.onclick = () => {
        const promptInput = modal.querySelector('#aiPersonaPromptInput');
        if (promptInput) {
          promptInput.value = btn.dataset.prompt;
          promptInput.focus();
        }
      };
    });

    // AI Generate character button
    async function triggerAiGeneration() {
      const promptInput = modal.querySelector('#aiPersonaPromptInput');
      const desc = promptInput?.value?.trim();
      if (!desc) {
        toast('Vui lòng nhập mô tả hoặc chọn một ý tưởng gợi ý!', 'error');
        promptInput?.focus();
        return;
      }

      isGeneratingAi = true;
      const genBtn = modal.querySelector('#btnGenerateAiPersona');
      if (genBtn) {
        genBtn.disabled = true;
        genBtn.innerHTML = '<span class="ai-spinner">⏳</span> Đang suy nghĩ...';
      }

      try {
        const result = await generatePersonaWithAI(desc, selectedAiProvider);
        if (result && result.name) {
          const nameInput = modal.querySelector('#personaNameInput');
          const avatarInput = modal.querySelector('#personaAvatarInput');
          const instructionInput = modal.querySelector('#personaInstructionInput');
          const formCard = modal.querySelector('#personaFormCard');

          if (nameInput) nameInput.value = result.name;
          if (avatarInput) avatarInput.value = result.avatar || '🤖';
          if (instructionInput) instructionInput.value = result.instruction || '';

          if (formCard) {
            formCard.classList.remove('glow-pulse');
            void formCard.offsetWidth; // Force reflow
            formCard.classList.add('glow-pulse');
          }

          const providerName = selectedAiProvider === 'openai' ? 'GPT' : 'Gemini';
          toast(`✨ ${providerName} đã tạo xong nhân vật! Bạn hãy xem lại rồi bấm "Thêm vào phòng".`);
          nameInput?.focus();
        }
      } catch (err) {
        toast(err.message || 'Lỗi khi gọi AI tạo nhân vật!', 'error');
      } finally {
        isGeneratingAi = false;
        if (genBtn) {
          genBtn.disabled = false;
          genBtn.innerHTML = '✨ AI Tạo Ngay';
        }
      }
    }

    const genBtn = modal.querySelector('#btnGenerateAiPersona');
    if (genBtn) {
      genBtn.onclick = triggerAiGeneration;
    }

    const aiPromptInput = modal.querySelector('#aiPersonaPromptInput');
    if (aiPromptInput) {
      aiPromptInput.onkeydown = e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          triggerAiGeneration();
        }
      };
    }

    // Emoji clicks
    modal.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.onclick = () => {
        const input = modal.querySelector('#personaAvatarInput');
        if (input) input.value = btn.dataset.emoji;
      };
    });

    // Template clicks
    modal.querySelectorAll('.template-chip').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.dataset.index);
        const tpl = PRESET_TEMPLATES[idx];
        if (tpl) {
          modal.querySelector('#personaNameInput').value = tpl.name;
          modal.querySelector('#personaAvatarInput').value = tpl.avatar;
          modal.querySelector('#personaInstructionInput').value = tpl.instruction;
        }
      };
    });

    // Save button
    const saveBtn = modal.querySelector('#savePersonaBtn');
    if (saveBtn) {
      saveBtn.onclick = () => {
        const name = modal.querySelector('#personaNameInput').value;
        const avatar = modal.querySelector('#personaAvatarInput').value;
        const instruction = modal.querySelector('#personaInstructionInput').value;

        if (!name.trim()) {
          toast('Vui lòng nhập tên nhân vật', 'error');
          return;
        }

        if (editingId) {
          updatePersona(editingId, { name, avatar, instruction });
          toast(`Đã cập nhật ${name}`);
          editingId = null;
        } else {
          addPersona({ name, avatar, instruction });
          toast(`Đã thêm ${name} vào phòng`);
        }
        render();
      };
    }

    // Cancel edit
    const cancelEditBtn = modal.querySelector('#cancelEditBtn');
    if (cancelEditBtn) {
      cancelEditBtn.onclick = () => {
        editingId = null;
        render();
      };
    }

    // Edit actions
    modal.querySelectorAll('.edit-p-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const target = getPersonas().find(p => p.id === id);
        if (target) {
          editingId = id;
          render();
          modal.querySelector('#personaNameInput').value = target.name;
          modal.querySelector('#personaAvatarInput').value = target.avatar;
          modal.querySelector('#personaInstructionInput').value = target.instruction;
          modal.querySelector('#personaNameInput').focus();
        }
      };
    });

    // Delete actions
    modal.querySelectorAll('.delete-p-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const target = getPersonas().find(p => p.id === id);
        if (target && confirm(`Bạn có chắc muốn xóa nhân vật "${target.name}" khỏi phòng?`)) {
          deletePersona(id);
          toast(`Đã xóa ${target.name}`);
          if (editingId === id) editingId = null;
          render();
        }
      };
    });
  }

  function openModal() {
    editingId = null;
    render();
    modal.classList.add('open');
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  modal.onclick = event => {
    if (event.target === modal) {
      closeModal();
    }
  };

  personaStore.subscribe(() => {
    if (modal.classList.contains('open')) {
      render();
    }
  });

  return { open: openModal, close: closeModal };
}
