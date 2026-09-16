import { escapeHtml } from '../utils/dom.js';
import { toast } from './toast.js';
import { settingsStore } from '../state/settingsStore.js';
import { config } from '../config.js';

export function initSettingsModal({ modal }) {
  if (!modal) return;

  function render() {
    const settings = settingsStore.get();
    const provider = settings.provider || 'openai';
    const openaiApiKey = settings.openaiApiKey || '';
    const openaiModel = settings.openaiModel || 'gpt-4.1-mini';
    const openaiBaseUrl = settings.openaiBaseUrl || 'https://api.apigiare.vn/v1';
    const geminiApiKey = settings.geminiApiKey || (config.apiKeys.join(',') || '');
    const geminiModel = settings.model || 'gemini-2.0-flash';
    const temperature = settings.temperature ?? 0.7;

    modal.innerHTML = `
      <div class="modal glass settings-modal-content">
        <div class="modal-header">
          <h2>⚙️ Cài đặt Model AI & API</h2>
          <button class="icon-btn close-settings-modal" id="closeSettingsModalBtn">×</button>
        </div>

        <div class="settings-modal-body">
          <!-- Provider Selection -->
          <div class="settings-section">
            <label class="settings-label-title">Chọn Nhà Cung Cấp AI:</label>
            <div class="provider-cards">
              <label class="provider-card ${provider === 'openai' ? 'active' : ''}">
                <input type="radio" name="aiProviderOption" value="openai" ${provider === 'openai' ? 'checked' : ''}>
                <div class="provider-card-inner">
                  <div class="provider-card-header">
                    <span class="provider-name">🟣 APIGiaRe (OpenAI)</span>
                    <span class="provider-pill">Khuyên dùng ⭐</span>
                  </div>
                  <p class="provider-desc">Hỗ trợ <b>gpt-4.1-mini</b>, tốc độ cao, không báo bận, giá siêu rẻ.</p>
                </div>
              </label>

              <label class="provider-card ${provider === 'gemini' ? 'active' : ''}">
                <input type="radio" name="aiProviderOption" value="gemini" ${provider === 'gemini' ? 'checked' : ''}>
                <div class="provider-card-inner">
                  <div class="provider-card-header">
                    <span class="provider-name">🔵 Google Gemini</span>
                  </div>
                  <p class="provider-desc">Miễn phí từ Google AI Studio (gemini-2.0-flash / 1.5-flash).</p>
                </div>
              </label>
            </div>
          </div>

          <!-- APIGiaRe / OpenAI Panel -->
          <div class="provider-panel ${provider === 'openai' ? '' : 'hidden'}" id="panelOpenai">
            <div class="form-group">
              <label>API Key (từ apigiare.vn):</label>
              <div class="input-password-row">
                <input type="password" id="inputOpenAiApiKey" placeholder="Dán API Key (Bearer Token) tại đây..." value="${escapeHtml(openaiApiKey)}">
                <button type="button" class="icon-btn" id="toggleOpenAiKeyVis" title="Hiện/Ẩn Key">👁️</button>
              </div>
              <span class="form-hint">Lấy key tại nút màu cam <i>"Lấy API Key"</i> trên web apigiare.vn.</span>
            </div>

            <div class="form-group">
              <label>Model AI:</label>
              <input type="text" id="inputOpenAiModel" placeholder="gpt-4.1-mini" value="${escapeHtml(openaiModel)}">
              <div class="quick-chips">
                <button type="button" class="quick-chip ${openaiModel === 'gpt-4.1-mini' ? 'active' : ''}" data-model="gpt-4.1-mini">gpt-4.1-mini</button>
                <button type="button" class="quick-chip ${openaiModel === 'gpt-4o-mini' ? 'active' : ''}" data-model="gpt-4o-mini">gpt-4o-mini</button>
                <button type="button" class="quick-chip ${openaiModel === 'gpt-4o' ? 'active' : ''}" data-model="gpt-4o">gpt-4o</button>
                <button type="button" class="quick-chip ${openaiModel === 'claude-3-5-haiku' ? 'active' : ''}" data-model="claude-3-5-haiku">claude-3-5-haiku</button>
              </div>
            </div>

            <div class="form-group">
              <label>Cổng kết nối (Base URL):</label>
              <input type="text" id="inputOpenAiBaseUrl" placeholder="https://api.apigiare.vn/v1" value="${escapeHtml(openaiBaseUrl)}">
              <span class="form-hint">Mặc định: <code>https://api.apigiare.vn/v1</code></span>
            </div>
          </div>

          <!-- Google Gemini Panel -->
          <div class="provider-panel ${provider === 'gemini' ? '' : 'hidden'}" id="panelGemini">
            <div class="form-group">
              <label>Google Gemini API Keys (phân cách bằng dấu phẩy):</label>
              <div class="input-password-row">
                <input type="password" id="inputGeminiApiKey" placeholder="AIzaSy..." value="${escapeHtml(geminiApiKey)}">
                <button type="button" class="icon-btn" id="toggleGeminiKeyVis" title="Hiện/Ẩn Key">👁️</button>
              </div>
              <span class="form-hint">Lấy key miễn phí tại <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">Google AI Studio</a>.</span>
            </div>

            <div class="form-group">
              <label>Model Gemini:</label>
              <select id="selectGeminiModel">
                <option value="gemini-2.0-flash" ${geminiModel === 'gemini-2.0-flash' ? 'selected' : ''}>gemini-2.0-flash (Mới nhất, phản hồi nhanh)</option>
                <option value="gemini-1.5-flash" ${geminiModel === 'gemini-1.5-flash' ? 'selected' : ''}>gemini-1.5-flash (Chuẩn, ổn định)</option>
                <option value="gemini-1.5-pro" ${geminiModel === 'gemini-1.5-pro' ? 'selected' : ''}>gemini-1.5-pro (Thông minh hơn)</option>
              </select>
            </div>
          </div>

          <!-- Temperature -->
          <div class="form-group">
            <div class="form-label-row">
              <label>Độ sáng tạo (Temperature):</label>
              <span id="tempValueDisplay">${temperature}</span>
            </div>
            <input type="range" id="inputSettingsTemp" min="0" max="1.5" step="0.1" value="${temperature}">
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn secondary" id="cancelSettingsModalBtn">Đóng</button>
          <button type="button" class="btn primary ripple" id="saveSettingsModalBtn">💾 Lưu Cài Đặt</button>
        </div>
      </div>
    `;

    // Radio change
    modal.querySelectorAll('input[name="aiProviderOption"]').forEach(radio => {
      radio.onchange = () => {
        const val = radio.value;
        const panelOpenai = modal.querySelector('#panelOpenai');
        const panelGemini = modal.querySelector('#panelGemini');
        if (val === 'openai') {
          panelOpenai.classList.remove('hidden');
          panelGemini.classList.add('hidden');
        } else {
          panelOpenai.classList.add('hidden');
          panelGemini.classList.remove('hidden');
        }
        modal.querySelectorAll('.provider-card').forEach(card => {
          card.classList.toggle('active', card.querySelector('input').value === val);
        });
      };
    });

    // Quick chips
    modal.querySelectorAll('.quick-chip').forEach(chip => {
      chip.onclick = () => {
        const modelName = chip.dataset.model;
        modal.querySelector('#inputOpenAiModel').value = modelName;
        modal.querySelectorAll('.quick-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      };
    });

    // Toggle key visibility
    const toggleOpenAi = modal.querySelector('#toggleOpenAiKeyVis');
    if (toggleOpenAi) {
      toggleOpenAi.onclick = () => {
        const inp = modal.querySelector('#inputOpenAiApiKey');
        inp.type = inp.type === 'password' ? 'text' : 'password';
      };
    }
    const toggleGemini = modal.querySelector('#toggleGeminiKeyVis');
    if (toggleGemini) {
      toggleGemini.onclick = () => {
        const inp = modal.querySelector('#inputGeminiApiKey');
        inp.type = inp.type === 'password' ? 'text' : 'password';
      };
    }

    // Temperature slider
    const tempInput = modal.querySelector('#inputSettingsTemp');
    const tempDisplay = modal.querySelector('#tempValueDisplay');
    if (tempInput && tempDisplay) {
      tempInput.oninput = e => {
        tempDisplay.textContent = e.target.value;
      };
    }

    // Close buttons
    const closeBtn = modal.querySelector('#closeSettingsModalBtn');
    const cancelBtn = modal.querySelector('#cancelSettingsModalBtn');
    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;

    // Save button
    const saveBtn = modal.querySelector('#saveSettingsModalBtn');
    if (saveBtn) {
      saveBtn.onclick = () => {
        const selectedProvider = modal.querySelector('input[name="aiProviderOption"]:checked')?.value || 'openai';
        const newOpenAiKey = modal.querySelector('#inputOpenAiApiKey')?.value.trim() || '';
        const newOpenAiModel = modal.querySelector('#inputOpenAiModel')?.value.trim() || 'gpt-4.1-mini';
        const newOpenAiBaseUrl = modal.querySelector('#inputOpenAiBaseUrl')?.value.trim() || 'https://api.apigiare.vn/v1';
        const newGeminiKey = modal.querySelector('#inputGeminiApiKey')?.value.trim() || '';
        const newGeminiModel = modal.querySelector('#selectGeminiModel')?.value || 'gemini-2.0-flash';
        const newTemp = Number(modal.querySelector('#inputSettingsTemp')?.value || 0.7);

        settingsStore.set(state => ({
          ...state,
          provider: selectedProvider,
          openaiApiKey: newOpenAiKey,
          openaiModel: newOpenAiModel,
          openaiBaseUrl: newOpenAiBaseUrl,
          geminiApiKey: newGeminiKey,
          model: newGeminiModel,
          temperature: newTemp
        }));

        toast(selectedProvider === 'openai' ? `Đã lưu cài đặt APIGiaRe (${newOpenAiModel})!` : `Đã lưu cài đặt Gemini (${newGeminiModel})!`);
        closeModal();
      };
    }
  }

  function openModal() {
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

