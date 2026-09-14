import './styles/main.css';
import { config } from './config.js';
import { KeyManager } from './api/keyManager.js';
import { streamGenerate } from './api/gemini.js';
import { settingsStore } from './state/settingsStore.js';
import { activeChat, chatStore, createChat, ensureChat, updateActiveChat } from './state/chatStore.js';
import { byId } from './utils/dom.js';
import { downloadText } from './utils/format.js';
import { initAurora } from './effects/aurora.js';
import { initParticles } from './effects/particles.js';
import { initRipple } from './effects/ripple.js';
import { toast } from './ui/toast.js';
import { initThemeToggle } from './ui/themeToggle.js';
import { initSidebar } from './ui/sidebar.js';
import { initInputBar } from './ui/inputBar.js';
import { initSettingsModal } from './ui/settingsModal.js';
import { initPersonaModal } from './ui/personaModal.js';
import { initPersonaBar } from './ui/personaBar.js';
import { initKpiModal } from './ui/kpiModal.js';
import { initKpiBar } from './ui/kpiBar.js';
import { initWheelModal } from './ui/wheelModal.js';
import { initMatchModal } from './ui/matchModal.js';
import { getActivePersonas, getPersonas } from './state/personaStore.js';
import { kpiStore, formatVND, resetFund, getCompanyFund, rewardAllStaff } from './state/kpiStore.js';
import { isPartyMode, togglePartyMode } from './state/settingsStore.js';
import { speakImmediately, queueSpeech, isAutoSpeak, toggleAutoSpeak, stopSpeech } from './utils/voice.js';
import { fetchLiveWebContext } from './api/search.js';
import { createChatArea } from './ui/chatArea.js';

const keyManager = new KeyManager();
let controller = null;
const sidebar = byId('sidebar');

function copyText(text) { navigator.clipboard?.writeText(text).then(() => toast('Đã copy vào clipboard')).catch(() => toast('Không thể copy', 'error')); }
async function copyImage(image) { try { const blob = await fetch(`data:${image.mime};base64,${image.data}`).then(response => response.blob()); await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]); toast('Đã copy ảnh'); } catch { toast('Trình duyệt không cho phép copy ảnh', 'error'); } }
function closeMobile() { if (innerWidth < 768) sidebar.classList.remove('open'); }

function shuffleArray(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getCleanMentionName(name) {
  const match = name.match(/\((.*?)\)/);
  if (match && match[1]) return match[1].trim();
  return name.trim();
}

function detectBulkReward(text) {
  if (!text) return null;
  const targetPattern = /(cả\s*phòng|mọi\s*người|mọi\s*ng|mn|tất\s*cả|mỗi\s*người|mỗi\s*đứa|toàn\s*bộ\s*nhân\s*viên|cả\s*team|all\s*team)/i;
  if (!targetPattern.test(text)) return null;

  const amountMatch = /(?:nhận|được|thưởng|lấy|tặng|phát|cho|bao)\s+(?:nóng\s+)?(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngàn|tr|triệu|đ|vnd)?/i.exec(text)
    || /(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngàn|tr|triệu|đ|vnd)?\s+(?:cho|tặng|thưởng|phát|chia)/i.exec(text);

  if (amountMatch) {
    const rawNum = parseFloat(amountMatch[1].replace(',', '.'));
    const unit = (amountMatch[2] || 'k').toLowerCase();
    let amount = rawNum * 1000;
    if (unit.startsWith('tr') || unit.startsWith('triệu')) {
      amount = rawNum * 1000000;
    } else if (unit === 'đ' || unit === 'vnd') {
      if (rawNum >= 1000) amount = rawNum;
      else amount = rawNum * 1000;
    }
    return Math.round(amount);
  }
  return null;
}

function resolveMentionedPersonas(text, allPersonas, activePersonas) {
  if (!text) return shuffleArray(activePersonas);
  if (/@(cả phòng|all|tất cả|team|mọi người)/i.test(text)) {
    return shuffleArray(activePersonas.length ? activePersonas : allPersonas);
  }
  const matched = [];
  for (const p of allPersonas) {
    const cleanName = getCleanMentionName(p.name).toLowerCase();
    const fullName = p.name.toLowerCase();
    const regexClean = new RegExp(`@${cleanName.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}(\\b|\\s|$)`, 'i');
    const regexFull = new RegExp(`@${fullName.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}(\\b|\\s|$)`, 'i');
    if (regexClean.test(text) || regexFull.test(text)) {
      matched.push(p);
    }
  }
  return matched.length > 0 ? matched : shuffleArray(activePersonas);
}

const chatArea = createChatArea({
  container: byId('chat'),
  onPrompt: text => { byId('prompt').value = text; inputBar.resize(); byId('prompt').focus(); },
  actions: { 
    copy: copyText, 
    copyImage, 
    speak: (text, speakerKey) => speakImmediately(text, speakerKey), 
    toast, 
    regenerate: index => regenerate(index) 
  }
});

async function sendGroupChat(text, image, chat) {
  const hasMessages = chat.messages.length > 0;
  const userMessage = { role: 'user', speakerName: 'Sếp', avatar: '👔', content: text, time: Date.now() };
  if (image) userMessage.image = image;
  if (image) userMessage.parts = [{ inline_data: { mime_type: image.mime, data: image.data } }];

  updateActiveChat(item => ({
    ...item,
    title: hasMessages ? item.title : `${text.slice(0, 35)}${text.length > 35 ? '…' : ''}`,
    messages: [...item.messages, userMessage]
  }));
  chatArea.render();

  const allPersonas = getPersonas();
  const activePersonas = getActivePersonas();
  const targetPersonas = resolveMentionedPersonas(text, allPersonas, activePersonas);

  if (targetPersonas.length === 0) {
    toast('Tất cả nhân vật đang tắt hoặc không tìm thấy người được gọi!', 'error');
    return;
  }

  // Detect bulk reward (e.g. "cả phòng nhận 500k", "thưởng cả phòng 200k")
  const bulkRewardAmount = detectBulkReward(text);
  if (bulkRewardAmount && bulkRewardAmount > 0) {
    rewardAllStaff(bulkRewardAmount, 'Sếp thưởng nóng cả phòng');
    toast(`🎉 Đã cộng thưởng ${formatVND(bulkRewardAmount)} cho toàn thể nhân viên!`);
  }

  // Real-time web search grounding if applicable
  const liveWebContext = await fetchLiveWebContext(text);

  for (let pIdx = 0; pIdx < targetPersonas.length; pIdx++) {
    const persona = targetPersonas[pIdx];
    if (controller?.signal.aborted) break;

    updateActiveChat(item => ({
      ...item,
      messages: [
        ...item.messages,
        {
          role: 'assistant',
          speakerKey: persona.id,
          speakerClass: persona.speakerClass || 'custom-ai',
          speakerName: persona.name,
          avatar: persona.avatar,
          content: '',
          streaming: true,
          time: Date.now()
        }
      ]
    }));
    chatArea.render();

    let streamedText = '';
    try {
      const current = activeChat();
      const rawTurns = current.messages.slice(0, -1).filter(msg => msg.content || msg.parts).map(msg => {
        if (msg.role === 'user') {
          return { role: 'user', text: `[Sếp]: ${msg.content}` };
        }
        if (msg.speakerKey === persona.id) {
          return { role: 'model', text: msg.content };
        }
        return { role: 'user', text: `[${msg.speakerName || 'Đồng nghiệp'}]: ${msg.content}` };
      });

      const contents = [];
      for (const turn of rawTurns) {
        const last = contents[contents.length - 1];
        if (last && last.role === turn.role) {
          last.parts[0].text += `\n\n${turn.text}`;
        } else {
          contents.push({ role: turn.role, parts: [{ text: turn.text }] });
        }
      }

      const turnOrderHint = pIdx === 0 
        ? `Bạn là người phản hồi đầu tiên trong lượt này, hãy xung phong trả lời thật nhanh nhảu và giành điểm với Sếp!`
        : `Bạn là người nói tiếp theo, hãy đối đáp tự nhiên và tương tác/phản bác đồng nghiệp trước nếu cần. Bạn có thể tag @Tên đồng nghiệp để trêu chọc hoặc phản biện.`;

      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents[contents.length - 1].parts[0].text += `\n\n(LƯỢT NÓI: Bây giờ là lượt của "${persona.name}" đối đáp Sếp. ${turnOrderHint} Chỉ xuất DUY NHẤT lời thoại của chính bạn "${persona.name}", KHÔNG đóng vai hay viết lời thoại cho bất kỳ ai khác):`;
      }

      const stat = kpiStore.get().staffStats[persona.id] || { kpiScore: 100, bonus: 0, title: 'Nhân viên' };
      const kpiHint = `\n[HỒ SƠ THI ĐUA]: KPI: ${stat.kpiScore} điểm | Thưởng: ${stat.bonus}đ | Danh hiệu: "${stat.title}". Hãy tích cực tranh tài giành tiền thưởng từ Quỹ công ty của Sếp!`;
      const bulkHint = (bulkRewardAmount && bulkRewardAmount > 0)
        ? `\n[SỰ KIỆN NÓNG]: Sếp vừa thưởng nóng ${formatVND(bulkRewardAmount)} cho TOÀN BỘ NHÂN VIÊN trong phòng! Cả phòng vừa được nhận tiền thưởng. Hãy cảm ơn Sếp ríu rít, vui mừng reo hò hoặc rủ đồng nghiệp ăn mừng/uống trà sữa thật rôm rả!`
        : '';
      const partyHint = isPartyMode()
        ? `\n[CHẾ ĐỘ PARTY / HAPPY HOUR ĐANG BẬT]: Cả phòng đang trong tiệc quẩy liên hoan bia bọt sau giờ làm! Tất cả nhân viên hãy nói chuyện cởi mở, lầy lội, bớt giữ kẽ, dám trêu Sếp, rủ nhau "Zô 100% 🍻", hát hò karaoke hoặc bộc bạch chuyện thầm kín văn phòng!`
        : '';

      const roomRule = `\n\n[QUY TẮC BẮT BUỘC TRONG PHÒNG TÁM CHUYỆN]:\n1. Bạn LÀ "${persona.name}". Bạn CHỈ ĐƯỢC PHÉP TRẢ LỜI LỜI THOẠI CỦA CHÍNH BẠN.\n2. TUYỆT ĐỐI KHÔNG tự bịa, không giả lập và không viết lời thoại cho các nhân vật khác.\n3. Bạn CÓ THỂ tự nhiên nhắc tên hoặc tag @Tên đồng nghiệp khác trong phòng để cà khịa, đối đáp hoặc tranh luận nếu phù hợp.\n4. KHÔNG viết tiền tố tên "[${persona.name}]:" ở đầu câu, chỉ trả lời trực tiếp nội dung.\n5. Hỏi gì đáp nấy, súc tích và ngắn gọn (1 - 3 câu thoại), đúng trọng tâm câu hỏi của Sếp.${kpiHint}${bulkHint}${partyHint}${liveWebContext}`;

      await streamGenerate({
        ...settingsStore.get(),
        system: `${persona.instruction}${roomRule}`,
        contents,
        keyManager,
        signal: controller.signal,
        onText: textChunk => {
          streamedText += textChunk;
          chatArea.updateStreamingText(streamedText);
        }
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        const message = error.message || 'Lỗi kết nối';
        streamedText = `(${persona.name}): ${message}`;
        toast(message, 'error');
      }
    } finally {
      const cleaned = streamedText ? streamedText.replace(new RegExp(`^\\[?\\s*${persona.name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s*\\]?\\s*:\\s*`, 'i'), '') : '...';
      updateActiveChat(chatItem => ({
        ...chatItem,
        messages: chatItem.messages.map((msg, index) => index === chatItem.messages.length - 1 ? {
          ...msg,
          content: cleaned,
          streaming: false
        } : msg)
      }));
      chatArea.render();

      if (isAutoSpeak() && cleaned) {
        queueSpeech(cleaned, persona.id);
      }
    }
  }
}

async function send(text, image, clearImage) {
  if ((!text && !image) || controller) return;
  if (!keyManager.size && !config.proxyUrl) { openKeyModal(); return; }
  const chat = ensureChat();
  stopSpeech();

  byId('prompt').value = '';
  clearImage();
  inputBar.resize();
  inputBar.setGenerating(true);
  controller = new AbortController();

  try {
    await sendGroupChat(text, image, chat);
  } finally {
    controller = null;
    inputBar.setGenerating(false);
    chatArea.render();
  }
}

function regenerate(index) {
  const chat = activeChat();
  const previous = chat?.messages[index - 1];
  if (!previous) return;
  updateActiveChat(item => ({ ...item, messages: item.messages.slice(0, index - 1) }));
  byId('prompt').value = previous.content;
  inputBar.resize();
  send(previous.content, null, () => {});
}

function exportChat() {
  const chat = activeChat();
  if (!chat) return toast('Chưa có cuộc trò chuyện', 'error');
  const markdown = chat.messages.map(message => `## ${message.speakerName || (message.role === 'user' ? 'Sếp' : 'AI')}\n\n${message.content}`).join('\n\n');
  downloadText(markdown, `${chat.title.replace(/[^\w-]+/g, '_') || 'tam_chuyen_ai'}.md`, 'text/markdown');
  toast('Đã xuất cuộc trò chuyện');
}

function openKeyModal() { byId('keyModal').classList.add('open'); }

function handleCommand(action) {
  if (action === 'phat_luong') {
    kpiModal.open();
    toast('Đã mở Bảng Phát Lương & Thi Đua');
  } else if (action === 'vongquay') {
    wheelModal.open();
    toast('Đã mở Vòng Quay May Mắn 🎡');
  } else if (action === 'ghepdoi') {
    matchModal.open();
    toast('Đã mở Tơ Hồng Ghép Đôi 💘');
  } else if (action === 'party') {
    const active = togglePartyMode();
    toast(active ? '🍻 Đã BẬT Chế Độ Party (Happy Hour)!' : 'Đã TẮT Chế Độ Party');
  } else if (action === 'antrua') {
    const pInput = byId('prompt');
    if (pInput) {
      pInput.value = 'Kèo ăn trưa hôm nay: Cơm tấm sườn bì vs Bún đậu mắm tôm vs Bún bò Huế vs Pizza. Cả phòng vote gấp xem trưa nay Sếp nên bao món gì ngon nhất!';
      pInput.focus();
      inputBar.resize();
    }
  } else if (action === 'trasua') {
    const pInput = byId('prompt');
    if (pInput) {
      pInput.value = 'Kèo trà sữa chiều nay: Phúc Long vs Gong Cha vs KOI Thé vs Trà sữa trân châu truyền thống. Cả phòng chọn món đi Sếp chốt đơn!';
      pInput.focus();
      inputBar.resize();
    }
  } else if (action === 'dovui') {
    const randomQuiz = [
      'Đố cả phòng câu hỏi có thưởng 200k: Con gì đập thì sống, không đập thì chết?',
      'Đố cả phòng nhận thưởng 200k: Cái gì bạn không mượn mà phải trả?',
      'Câu đố thưởng nóng 200k: Con gì mang được cả miếng gỗ lớn nhưng không mang nổi một hòn sỏi nhỏ?',
      'Câu hỏi tranh tài thưởng 200k: Bỏ ngoài nướng trong, ăn ngoài bỏ trong là món gì?'
    ];
    const quiz = randomQuiz[Math.floor(Math.random() * randomQuiz.length)];
    const pInput = byId('prompt');
    if (pInput) {
      pInput.value = quiz;
      pInput.focus();
      inputBar.resize();
    }
  } else if (action === 'nap_quy') {
    resetFund(getCompanyFund() + 10000000);
    toast('Đã nạp thêm 10.000.000 ₫ vào Quỹ công ty!');
  } else if (action === 'help') {
    toast('Mẹo: Gõ @ để gọi tên, gõ / để mở lệnh nhanh, bật 🔊 để nghe tự động!');
  }
}

const inputBar = initInputBar({ 
  prompt: byId('prompt'), 
  sendButton: byId('sendBtn'), 
  uploadButton: byId('uploadBtn'), 
  imageInput: byId('imageInput'), 
  preview: byId('uploadPreview'), 
  previewImage: byId('previewImage'), 
  previewName: byId('previewName'), 
  removeImage: byId('removeImage'), 
  micButton: byId('micBtn'), 
  composer: byId('composer'), 
  onSend: send,
  onCommand: handleCommand
});

initSidebar({
  list: byId('conversationList'),
  search: byId('searchConversations'),
  newButton: byId('newChat'),
  toggleButton: byId('toggleSidebar'),
  mobileButton: byId('mobileMenu'),
  clearButton: byId('clearHistory'),
  backdrop: byId('sidebarBackdrop'),
  sidebar,
  onNew: () => { createChat(); closeMobile(); },
  onSelect: id => { chatStore.set(state => ({ ...state, activeId: id })); closeMobile(); },
  onDelete: chat => { if (!confirm('Xóa phòng trò chuyện này?')) return; chatStore.set(state => ({ ...state, activeId: state.activeId === chat.id ? (state.chats.find(item => item.id !== chat.id)?.id || null) : state.activeId, chats: state.chats.filter(item => item.id !== chat.id) })); },
  onRename: chat => { const title = prompt('Tên phòng trò chuyện:', chat.title); if (title?.trim()) chatStore.set(state => ({ ...state, chats: state.chats.map(item => item.id === chat.id ? { ...item, title: title.trim() } : item) })); },
  onPin: chat => chatStore.set(state => ({ ...state, chats: state.chats.map(item => item.id === chat.id ? { ...item, pinned: !item.pinned } : item) })),
  onClear: () => { if (!confirm('Xóa toàn bộ lịch sử trò chuyện?')) return; chatStore.set({ activeId: null, chats: [] }); createChat(); toast('Đã xóa toàn bộ lịch sử'); }
});

initThemeToggle({ settingsStore, button: byId('themeToggle') });
initSettingsModal({ modal: byId('keyModal'), closeButton: byId('closeModal'), status: byId('keyStatus'), keyManager, proxyUrl: config.proxyUrl });

async function triggerStaffReaction(personaId, actionType, amount) {
  if (controller) return;
  const persona = getPersonas().find(p => p.id === personaId);
  if (!persona) return;
  const chat = ensureChat();
  stopSpeech();

  const formattedAmount = formatVND(amount);
  const actionText = actionType === 'reward' 
    ? `[Sếp vừa thưởng nóng ${formattedAmount} cho ${persona.name}! 🎉]` 
    : `[Sếp vừa phạt ${formattedAmount} đối với ${persona.name}! ⚠️]`;

  const userMessage = { role: 'user', speakerName: 'Sếp', avatar: '👔', content: actionText, time: Date.now() };

  updateActiveChat(item => ({
    ...item,
    messages: [
      ...item.messages,
      userMessage,
      {
        role: 'assistant',
        speakerKey: persona.id,
        speakerClass: persona.speakerClass || 'custom-ai',
        speakerName: persona.name,
        avatar: persona.avatar,
        content: '',
        streaming: true,
        time: Date.now()
      }
    ]
  }));
  chatArea.render();
  chatArea.scrollToBottom();

  controller = new AbortController();
  inputBar.setGenerating(true);

  let streamedText = '';
  try {
    const current = activeChat();
    const rawTurns = current.messages.slice(0, -1).filter(msg => msg.content || msg.parts).map(msg => {
      if (msg.role === 'user') return { role: 'user', text: `[Sếp]: ${msg.content}` };
      if (msg.speakerKey === persona.id) return { role: 'model', text: msg.content };
      return { role: 'user', text: `[${msg.speakerName || 'Đồng nghiệp'}]: ${msg.content}` };
    });

    const contents = [];
    for (const turn of rawTurns) {
      const last = contents[contents.length - 1];
      if (last && last.role === turn.role) {
        last.parts[0].text += `\n\n${turn.text}`;
      } else {
        contents.push({ role: turn.role, parts: [{ text: turn.text }] });
      }
    }

    const situationPrompt = actionType === 'reward'
      ? `\n[TÌNH HUỐNG]: Sếp vừa thưởng nóng ${formattedAmount} cho bạn vì thành tích xuất sắc! Hãy phản hồi 1-2 câu cảm ơn Sếp thật nịnh nọt, xúc động, hào hứng hoặc hài hước theo đúng cá tính riêng của bạn. Tuyệt đối không thêm tiền tố tên.`
      : `\n[TÌNH HUỐNG]: Sếp vừa phạt bạn ${formattedAmount}! Hãy phản hồi 1-2 câu (xin lỗi, giải thích hài hước hoặc ăn vạ nịnh Sếp) theo đúng cá tính của bạn. Tuyệt đối không thêm tiền tố tên.`;

    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += `\n\n(LƯỢT NÓI CỦA "${persona.name}": Chỉ xuất DUY NHẤT lời thoại của chính bạn "${persona.name}"):`;
    }

    await streamGenerate({
      ...settingsStore.get(),
      system: `${persona.instruction}${situationPrompt}`,
      contents,
      keyManager,
      signal: controller.signal,
      onText: textChunk => {
        streamedText += textChunk;
        chatArea.updateStreamingText(streamedText);
      }
    });
  } catch (error) {
    if (error.name !== 'AbortError') {
      streamedText = actionType === 'reward' ? 'Dạ em cảm ơn Sếp nhiều lắm ạ!' : 'Dạ em xin lỗi Sếp, em sẽ cố gắng hơn ạ!';
    }
  } finally {
    controller = null;
    inputBar.setGenerating(false);
    const cleaned = streamedText ? streamedText.replace(new RegExp(`^\\[?\\s*${persona.name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s*\\]?\\s*:\\s*`, 'i'), '') : '...';
    updateActiveChat(chatItem => ({
      ...chatItem,
      messages: chatItem.messages.map((msg, index) => index === chatItem.messages.length - 1 ? {
        ...msg,
        content: cleaned,
        streaming: false
      } : msg)
    }));
    chatArea.render();
    chatArea.scrollToBottom();

    if (isAutoSpeak() && cleaned) {
      queueSpeech(cleaned, persona.id);
    }
  }
}

async function handleWheelResult(persona, slice) {
  if (controller) return;
  const chat = ensureChat();
  stopSpeech();

  const actionText = `[🎡 VÒNG QUAY MAY MẮN: ${persona.name} vừa quay trúng ô "${slice.label}"!]`;
  const userMessage = { role: 'user', speakerName: 'Phòng Tám Chuyện', avatar: '🎡', content: actionText, time: Date.now() };

  updateActiveChat(item => ({
    ...item,
    messages: [
      ...item.messages,
      userMessage,
      {
        role: 'assistant',
        speakerKey: persona.id,
        speakerClass: persona.speakerClass || 'custom-ai',
        speakerName: persona.name,
        avatar: persona.avatar,
        content: '',
        streaming: true,
        time: Date.now()
      }
    ]
  }));
  chatArea.render();
  chatArea.scrollToBottom();

  controller = new AbortController();
  inputBar.setGenerating(true);

  let streamedText = '';
  try {
    const current = activeChat();
    const rawTurns = current.messages.slice(0, -1).filter(msg => msg.content || msg.parts).map(msg => {
      if (msg.role === 'user') return { role: 'user', text: `[${msg.speakerName || 'Sếp'}]: ${msg.content}` };
      if (msg.speakerKey === persona.id) return { role: 'model', text: msg.content };
      return { role: 'user', text: `[${msg.speakerName || 'Đồng nghiệp'}]: ${msg.content}` };
    });

    const contents = [];
    for (const turn of rawTurns) {
      const last = contents[contents.length - 1];
      if (last && last.role === turn.role) {
        last.parts[0].text += `\n\n${turn.text}`;
      } else {
        contents.push({ role: turn.role, parts: [{ text: turn.text }] });
      }
    }

    const situationPrompt = `\n[TÌNH HUỐNG]: Bạn vừa quay trúng ô "${slice.label}" trên Vòng Quay May Mắn của công ty! Hãy phản hồi 1-2 câu cảm xúc thật tự nhiên (vui mừng hớn hở nếu trúng tiền/vé đi trễ/KPI, hoặc dở khóc dở cười/than thở lầy lội nếu bị phạt/quét phòng/bao trà sữa) theo đúng cá tính của bạn. Tuyệt đối không thêm tiền tố tên.`;

    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += `\n\n(LƯỢT NÓI CỦA "${persona.name}": Chỉ xuất DUY NHẤT lời thoại của chính bạn "${persona.name}"):`;
    }

    await streamGenerate({
      ...settingsStore.get(),
      system: `${persona.instruction}${situationPrompt}`,
      contents,
      keyManager,
      signal: controller.signal,
      onText: textChunk => {
        streamedText += textChunk;
        chatArea.updateStreamingText(streamedText);
      }
    });
  } catch (error) {
    if (error.name !== 'AbortError') {
      streamedText = `Dạ em quay trúng "${slice.label}", cảm ơn cả phòng ạ!`;
    }
  } finally {
    controller = null;
    inputBar.setGenerating(false);
    const cleaned = streamedText ? streamedText.replace(new RegExp(`^\\[?\\s*${persona.name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s*\\]?\\s*:\\s*`, 'i'), '') : '...';
    updateActiveChat(chatItem => ({
      ...chatItem,
      messages: chatItem.messages.map((msg, index) => index === chatItem.messages.length - 1 ? {
        ...msg,
        content: cleaned,
        streaming: false
      } : msg)
    }));
    chatArea.render();
    chatArea.scrollToBottom();

    if (isAutoSpeak() && cleaned) {
      queueSpeech(cleaned, persona.id);
    }
  }
}

async function handleMatchResult(persona1, persona2, matchData) {
  if (controller) return;
  const chat = ensureChat();
  stopSpeech();

  const actionText = `[💘 TƠ HỒNG VĂN PHÒNG: Đã đẩy thuyền ghép đôi thành công cho ${persona1.name} 💕 ${persona2.name}!\n- Độ hợp duyên: ${matchData.score}%\n- Danh hiệu: "${matchData.title}"\n- Tình huống: ${matchData.scenario}]`;
  const userMessage = { role: 'user', speakerName: 'Tơ Hồng', avatar: '💘', content: actionText, time: Date.now() };

  updateActiveChat(item => ({
    ...item,
    messages: [
      ...item.messages,
      userMessage
    ]
  }));
  chatArea.render();
  chatArea.scrollToBottom();

  const couple = [
    {
      p: persona1,
      target: persona2,
      prompt: `\n[TÌNH HUỐNG]: Sếp và Tơ Hồng Văn Phòng vừa ghép đôi đẩy thuyền bạn với ${persona2.name} (Độ hợp: ${matchData.score}%, Danh hiệu: "${matchData.title}"). Tình huống: ${matchData.scenario}. Hãy phản hồi 1-2 câu ngượng ngùng, chối đây đẩy hoặc mạnh dạn thả thính ${persona2.name} theo đúng tính cách của bạn. Tuyệt đối không thêm tiền tố tên.`
    },
    {
      p: persona2,
      target: persona1,
      prompt: `\n[TÌNH HUỐNG]: Bạn vừa nghe ${persona1.name} phản ứng về việc hai người được ghép đôi (Độ hợp: ${matchData.score}%, Danh hiệu: "${matchData.title}"). Hãy đối đáp lại 1-2 câu với ${persona1.name} thật ngọt ngào, ngại ngùng hoặc trêu chọc/cà khịa lại theo đúng tính cách của bạn. Tuyệt đối không thêm tiền tố tên.`
    }
  ];

  controller = new AbortController();
  inputBar.setGenerating(true);

  try {
    for (const turn of couple) {
      if (controller?.signal.aborted) break;

      updateActiveChat(item => ({
        ...item,
        messages: [
          ...item.messages,
          {
            role: 'assistant',
            speakerKey: turn.p.id,
            speakerClass: turn.p.speakerClass || 'custom-ai',
            speakerName: turn.p.name,
            avatar: turn.p.avatar,
            content: '',
            streaming: true,
            time: Date.now()
          }
        ]
      }));
      chatArea.render();

      let streamedText = '';
      try {
        const current = activeChat();
        const rawTurns = current.messages.slice(0, -1).filter(msg => msg.content || msg.parts).map(msg => {
          if (msg.role === 'user') return { role: 'user', text: `[${msg.speakerName || 'Sếp'}]: ${msg.content}` };
          if (msg.speakerKey === turn.p.id) return { role: 'model', text: msg.content };
          return { role: 'user', text: `[${msg.speakerName || 'Đồng nghiệp'}]: ${msg.content}` };
        });

        const contents = [];
        for (const t of rawTurns) {
          const last = contents[contents.length - 1];
          if (last && last.role === t.role) {
            last.parts[0].text += `\n\n${t.text}`;
          } else {
            contents.push({ role: t.role, parts: [{ text: t.text }] });
          }
        }

        if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
          contents[contents.length - 1].parts[0].text += `\n\n(LƯỢT NÓI CỦA "${turn.p.name}": Chỉ xuất DUY NHẤT lời thoại của chính bạn "${turn.p.name}"):`;
        }

        await streamGenerate({
          ...settingsStore.get(),
          system: `${turn.p.instruction}${turn.prompt}`,
          contents,
          keyManager,
          signal: controller.signal,
          onText: textChunk => {
            streamedText += textChunk;
            chatArea.updateStreamingText(streamedText);
          }
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          streamedText = `Dạ em xin phép không có ý kiến gì về việc ghép đôi này ạ!`;
        }
      } finally {
        const cleaned = streamedText ? streamedText.replace(new RegExp(`^\\[?\\s*${turn.p.name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s*\\]?\\s*:\\s*`, 'i'), '') : '...';
        updateActiveChat(chatItem => ({
          ...chatItem,
          messages: chatItem.messages.map((msg, index) => index === chatItem.messages.length - 1 ? {
            ...msg,
            content: cleaned,
            streaming: false
          } : msg)
        }));
        chatArea.render();
        chatArea.scrollToBottom();

        if (isAutoSpeak() && cleaned) {
          queueSpeech(cleaned, turn.p.id);
        }
      }
    }
  } finally {
    controller = null;
    inputBar.setGenerating(false);
  }
}

const personaModal = initPersonaModal({ modal: byId('personaModal') });
initPersonaBar({ container: byId('personaBar'), onOpenModal: () => personaModal.open() });

const wheelModal = initWheelModal({
  modal: byId('wheelModal'),
  onResult: handleWheelResult
});

const matchModal = initMatchModal({
  modal: byId('matchModal'),
  onMatch: handleMatchResult
});

const kpiModal = initKpiModal({
  modal: byId('kpiModal'),
  onReward: (personaId, amount) => triggerStaffReaction(personaId, 'reward', amount),
  onPenalize: (personaId, amount) => triggerStaffReaction(personaId, 'penalize', amount)
});

initKpiBar({ 
  container: byId('kpiBar'), 
  onOpenKpiModal: () => kpiModal.open(),
  onOpenWheelModal: () => wheelModal.open(),
  onOpenMatchModal: () => matchModal.open(),
  onToggleParty: () => {
    const active = togglePartyMode();
    toast(active ? '🍻 Đã BẬT Chế Độ Party (Happy Hour)!' : 'Đã TẮT Chế Độ Party');
  }
});

function syncPartyModeUI() {
  document.body.classList.toggle('party-mode-active', isPartyMode());
}
settingsStore.subscribe(syncPartyModeUI);
syncPartyModeUI();

const autoSpeakToggle = byId('autoSpeakToggle');
if (autoSpeakToggle) {
  autoSpeakToggle.onclick = () => {
    const active = toggleAutoSpeak();
    autoSpeakToggle.textContent = active ? '🔊' : '🔈';
    autoSpeakToggle.classList.toggle('active', active);
    toast(active ? 'Đã BẬT tự động đọc giọng nói (Auto-Speak)' : 'Đã TẮT tự động đọc');
  };
}

byId('settingsToggle').onclick = () => byId('settings').classList.toggle('open');
byId('exportBtn').onclick = exportChat;
byId('scrollBottom').onclick = () => chatArea.scrollToBottom();

const temperature = byId('temperature');
const tempValue = byId('tempValue');
temperature.value = settingsStore.get().temperature;
tempValue.value = settingsStore.get().temperature;
temperature.oninput = event => { tempValue.value = event.target.value; settingsStore.set(state => ({ ...state, temperature: event.target.value })); };
byId('systemInstruction').value = settingsStore.get().system;
byId('systemInstruction').onchange = event => settingsStore.set(state => ({ ...state, system: event.target.value }));
byId('helpBtn').onclick = () => toast('Ctrl+K tìm kiếm · @ gọi tên · / lệnh nhanh · Enter gửi');

document.addEventListener('keydown', event => {
  if (event.ctrlKey && event.key.toLowerCase() === 'k') { event.preventDefault(); byId('searchConversations').focus(); }
  if (event.ctrlKey && event.key.toLowerCase() === 'b') { event.preventDefault(); sidebar.classList.toggle('collapsed'); }
});

initAurora();
initParticles(byId('particles'));
initRipple();

if (!chatStore.get().chats.length) createChat();
if (!keyManager.size && !config.proxyUrl) setTimeout(openKeyModal, 400);
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));

