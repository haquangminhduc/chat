import { byId } from '../utils/dom.js';
import { toast } from './toast.js';
import { getPersonas } from '../state/personaStore.js';

const SLASH_COMMANDS = [
  {
    cmd: '/vongquay',
    icon: '🎡',
    title: '/vongquay',
    hint: 'Mở Vòng Quay May Mắn nhận thưởng',
    action: 'vongquay'
  },
  {
    cmd: '/ghepdoi',
    icon: '💘',
    title: '/ghepdoi',
    hint: 'Tơ Hồng Văn Phòng - Ghép đôi 2 nhân viên AI',
    action: 'ghepdoi'
  },
  {
    cmd: '/party',
    icon: '🍻',
    title: '/party',
    hint: 'Bật/Tắt chế độ Party say xỉn sau giờ làm',
    action: 'party'
  },
  {
    cmd: '/antrua',
    icon: '🍱',
    title: '/antrua',
    hint: 'Mở kèo bình chọn món ăn trưa cả phòng',
    template: 'Kèo ăn trưa hôm nay: Cơm tấm sườn bì vs Bún đậu mắm tôm vs Bún bò Huế vs Pizza. Cả phòng vote gấp xem trưa nay Sếp nên bao món gì ngon nhất!'
  },
  {
    cmd: '/trasua',
    icon: '🧋',
    title: '/trasua',
    hint: 'Kèo trà sữa chiều nay Sếp bao',
    template: 'Kèo trà sữa chiều nay: Phúc Long vs Gong Cha vs KOI Thé vs Trà sữa trân châu truyền thống. Cả phòng chọn món đi Sếp chốt đơn!'
  },
  {
    cmd: '/hop',
    icon: '📢',
    title: '/hop [chủ đề]',
    hint: 'Triệu tập cuộc họp khẩn cấp cả phòng',
    template: 'Cả phòng tập trung! Sếp triệu tập cuộc họp khẩn cấp về tiến độ công việc, ai có mặt điểm danh ngay!'
  },
  {
    cmd: '/phat-luong',
    icon: '💰',
    title: '/phat-luong',
    hint: 'Tổng kết lương tháng và mở Bảng Thi Đua',
    action: 'phat_luong'
  },
  {
    cmd: '/dovui',
    icon: '🎲',
    title: '/dovui',
    hint: 'Ra câu đố ngẫu nhiên có thưởng 200.000đ',
    action: 'dovui'
  },
  {
    cmd: '/drama',
    icon: '☕',
    title: '/drama',
    hint: 'Hóng drama văn phòng nóng hổi',
    template: 'Hôm nay công ty có drama gì mới không cả phòng? Khui ra Sếp nghe xem nào!'
  },
  {
    cmd: '/nap-quy',
    icon: '💼',
    title: '/nap-quy',
    hint: 'Nạp thêm 10.000.000đ vào Quỹ công ty',
    action: 'nap_quy'
  },
  {
    cmd: '/help',
    icon: '❓',
    title: '/help',
    hint: 'Xem phím tắt và mẹo sử dụng',
    action: 'help'
  }
];

export function initInputBar({ prompt, sendButton, uploadButton, imageInput, preview, previewImage, previewName, removeImage, micButton, composer, onSend, onCommand }) {
  let imagePart = null;
  let popover = null;
  let activeIndex = 0;
  let popoverMode = null; // 'mention' | 'slash' | null
  let currentItems = [];
  let currentMatch = null;

  // Create popover element
  popover = document.createElement('div');
  popover.className = 'mention-popover';
  popover.style.display = 'none';
  composer.style.position = 'relative';
  composer.appendChild(popover);

  function getCleanMentionName(name) {
    const match = name.match(/\((.*?)\)/);
    if (match && match[1]) return match[1].trim();
    return name.trim();
  }

  function hidePopover() {
    popover.style.display = 'none';
    popoverMode = null;
    currentItems = [];
    currentMatch = null;
  }

  function insertMention(item) {
    if (!currentMatch) return;
    const beforeMatch = prompt.value.slice(0, currentMatch.index);
    const afterMatch = prompt.value.slice(currentMatch.index + currentMatch[0].length);
    const mentionTag = `@${item.mentionText} `;
    
    prompt.value = `${beforeMatch}${mentionTag}${afterMatch}`;
    const newCursorPos = beforeMatch.length + mentionTag.length;
    prompt.setSelectionRange(newCursorPos, newCursorPos);
    prompt.focus();
    hidePopover();
    resize();
  }

  function executeSlashCommand(cmdItem) {
    hidePopover();
    if (cmdItem.action) {
      if (onCommand) onCommand(cmdItem.action);
      prompt.value = '';
      resize();
      return;
    }
    if (cmdItem.template) {
      prompt.value = cmdItem.template;
      prompt.focus();
      resize();
    }
  }

  function checkTrigger() {
    const cursorPos = prompt.selectionStart;
    const textBeforeCursor = prompt.value.slice(0, cursorPos);

    // Check Slash Command trigger
    const slashMatch = textBeforeCursor.match(/^\/([a-zA-Z0-9_-]*)$/);
    if (slashMatch) {
      const query = slashMatch[1].toLowerCase();
      const filtered = SLASH_COMMANDS.filter(c => !query || c.cmd.toLowerCase().includes(query) || c.hint.toLowerCase().includes(query));
      if (filtered.length > 0) {
        popoverMode = 'slash';
        currentItems = filtered;
        currentMatch = slashMatch;
        activeIndex = Math.min(activeIndex, filtered.length - 1);
        if (activeIndex < 0) activeIndex = 0;
        renderSlashPopover();
        popover.style.display = 'flex';
        return;
      }
    }

    // Check Mention trigger
    const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9_\u00C0-\u1EF9\s]{0,20})$/);
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase().trim();
      const personas = getPersonas();
      const items = [];

      if (!query || 'cả phòng'.includes(query) || 'all'.includes(query) || 'tất cả'.includes(query)) {
        items.push({
          id: 'all',
          name: 'Cả phòng',
          avatar: '👥',
          mentionText: 'Cả phòng',
          hint: 'Tất cả nhân viên AI cùng trả lời'
        });
      }

      personas.forEach(p => {
        const cleanName = getCleanMentionName(p.name);
        if (!query || p.name.toLowerCase().includes(query) || cleanName.toLowerCase().includes(query)) {
          items.push({
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            mentionText: cleanName,
            hint: p.enabled !== false ? 'Đang bật' : 'Đang tắt (sẽ gọi dậy)'
          });
        }
      });

      if (items.length > 0) {
        popoverMode = 'mention';
        currentItems = items;
        currentMatch = mentionMatch;
        activeIndex = Math.min(activeIndex, items.length - 1);
        if (activeIndex < 0) activeIndex = 0;
        renderMentionPopover();
        popover.style.display = 'flex';
        return;
      }
    }

    hidePopover();
  }

  function renderMentionPopover() {
    popover.innerHTML = `
      <div class="mention-popover-title">Gõ @ để gọi đích danh:</div>
      ${currentItems.map((item, idx) => `
        <button type="button" class="mention-item ${idx === activeIndex ? 'selected' : ''}" data-idx="${idx}">
          <span class="mention-item-avatar">${item.avatar}</span>
          <div class="mention-item-info">
            <span class="mention-item-name">${item.name} (@${item.mentionText})</span>
            <span class="mention-item-hint">${item.hint}</span>
          </div>
        </button>
      `).join('')}
    `;

    bindPopoverClicks(insertMention);
  }

  function renderSlashPopover() {
    popover.innerHTML = `
      <div class="mention-popover-title">⚡ Lệnh điều hành văn phòng (/):</div>
      ${currentItems.map((item, idx) => `
        <button type="button" class="mention-item ${idx === activeIndex ? 'selected' : ''}" data-idx="${idx}">
          <span class="mention-item-avatar">${item.icon}</span>
          <div class="mention-item-info">
            <span class="mention-item-name">${item.title}</span>
            <span class="mention-item-hint">${item.hint}</span>
          </div>
        </button>
      `).join('')}
    `;

    bindPopoverClicks(executeSlashCommand);
  }

  function bindPopoverClicks(onSelect) {
    popover.querySelectorAll('.mention-item').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.dataset.idx);
        onSelect(currentItems[idx]);
      };
      btn.onmouseenter = () => {
        activeIndex = Number(btn.dataset.idx);
        popover.querySelectorAll('.mention-item').forEach((b, i) => {
          b.classList.toggle('selected', i === activeIndex);
        });
      };
    });
  }

  const resize = () => {
    prompt.style.height = 'auto';
    prompt.style.height = `${Math.min(prompt.scrollHeight, 200)}px`;
    byId('charCount').textContent = `${prompt.value.length.toLocaleString()} / 8.000`;
  };

  const submit = () => {
    hidePopover();
    const text = prompt.value.trim();
    if (text || imagePart) onSend(text, imagePart, clearImage);
  };

  sendButton.onclick = submit;

  prompt.oninput = () => {
    resize();
    checkTrigger();
  };

  prompt.onkeydown = event => {
    if (popover.style.display !== 'none' && currentItems.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        activeIndex = (activeIndex + 1) % currentItems.length;
        if (popoverMode === 'slash') renderSlashPopover();
        else renderMentionPopover();
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        activeIndex = (activeIndex - 1 + currentItems.length) % currentItems.length;
        if (popoverMode === 'slash') renderSlashPopover();
        else renderMentionPopover();
        return;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        if (popoverMode === 'slash') executeSlashCommand(currentItems[activeIndex]);
        else insertMention(currentItems[activeIndex]);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        hidePopover();
        return;
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  document.addEventListener('click', event => {
    if (!composer.contains(event.target)) {
      hidePopover();
    }
  });

  uploadButton.onclick = () => imageInput.click();
  imageInput.onchange = () => {
    const file = imageInput.files[0];
    if (!file) return;
    compressImage(file, result => {
      imagePart = { name: file.name, mime: 'image/jpeg', data: result.split(',')[1] };
      previewImage.src = result;
      previewName.textContent = `${file.name} · nén`;
      preview.classList.add('show');
    });
  };

  function compressImage(file, done) {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, 1280 / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        done(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    imagePart = null;
    imageInput.value = '';
    preview.classList.remove('show');
  }

  removeImage.onclick = clearImage;

  let recognition;
  micButton.onclick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return toast('Trình duyệt không hỗ trợ nhập giọng nói', 'error');
    if (recognition) {
      recognition.stop();
      recognition = null;
      return;
    }
    recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.interimResults = true;
    recognition.onresult = event => {
      prompt.value = [...event.results].map(result => result[0].transcript).join('');
      resize();
      checkTrigger();
    };
    recognition.onend = () => {
      recognition = null;
    };
    recognition.start();
    toast('Đang lắng nghe...');
  };

  return {
    setGenerating(value) {
      composer.classList.toggle('is-generating', value);
    },
    resize,
    getImage: () => imagePart
  };
}
