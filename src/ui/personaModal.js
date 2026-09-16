import { escapeHtml } from '../utils/dom.js';
import { toast } from './toast.js';
import { downloadText } from '../utils/format.js';
import { personaStore, getPersonas, addPersona, updatePersona, deletePersona, restoreDefaultPersonas, importPersonas } from '../state/personaStore.js';

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

export function initPersonaModal({ modal, closeButton }) {
  if (!modal) return;

  let editingId = null;

  function render() {
    const personas = getPersonas();

    modal.innerHTML = `
      <div class="modal glass persona-modal-content">
        <div class="modal-header">
          <h2>👥 Quản lý Nhân vật Phòng Tám Chuyện</h2>
          <button class="icon-btn close-persona-modal" id="closePersonaModalBtn">×</button>
        </div>

        <div class="persona-modal-body">
          <!-- Form thêm/sửa -->
          <div class="persona-form-card glass">
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
