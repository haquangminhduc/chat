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
import { getActivePersonas } from './state/personaStore.js';
import { createChatArea } from './ui/chatArea.js';

const keyManager = new KeyManager();
let controller = null;
const sidebar = byId('sidebar');
const roomModeSelect = byId('roomModeSelect');

function copyText(text) { navigator.clipboard?.writeText(text).then(() => toast('Đã copy vào clipboard')).catch(() => toast('Không thể copy', 'error')); }
async function copyImage(image) { try { const blob = await fetch(`data:${image.mime};base64,${image.data}`).then(response => response.blob()); await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]); toast('Đã copy ảnh'); } catch { toast('Trình duyệt không cho phép copy ảnh', 'error'); } }
function speak(text) { if (!('speechSynthesis' in window)) return toast('Trình duyệt không hỗ trợ đọc văn bản', 'error'); speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(text)); }
function closeMobile() { if (innerWidth < 768) sidebar.classList.remove('open'); }

function syncRoomModeUI() {
  const chat = activeChat();
  if (chat && roomModeSelect) {
    roomModeSelect.value = chat.mode || 'standard';
  }
}
chatStore.subscribe(syncRoomModeUI);

if (roomModeSelect) {
  roomModeSelect.onchange = event => {
    const newMode = event.target.value;
    updateActiveChat(chat => ({ ...chat, mode: newMode }));
    toast(`Đã chuyển sang ${config.roomModes[newMode]?.label || 'chế độ trò chuyện'}`);
  };
}

const chatArea = createChatArea({
  container: byId('chat'),
  onPrompt: text => { byId('prompt').value = text; inputBar.resize(); byId('prompt').focus(); },
  actions: { copy: copyText, copyImage, speak, toast, regenerate: index => regenerate(index) }
});

async function sendStandard(text, image, chat, moodConfig) {
  const hasMessages = chat.messages.length > 0;
  const userMessage = { role: 'user', speakerName: 'Bạn', avatar: '♙', content: text, time: Date.now() };
  if (image) userMessage.image = image;
  if (image) userMessage.parts = [{ inline_data: { mime_type: image.mime, data: image.data } }];

  chatStore.set(state => ({
    ...state,
    chats: state.chats.map(item => item.id === chat.id ? {
      ...item,
      title: hasMessages ? item.title : `${text.slice(0, 42)}${text.length > 42 ? '…' : ''}`,
      messages: [...item.messages, userMessage, { role: 'assistant', speakerName: 'Duck AI', content: '', streaming: true, mood: settingsStore.get().mood, avatar: moodConfig.avatar, time: Date.now() }]
    } : item)
  }));

  let streamedText = '';
  let finalAvatar = moodConfig.avatar;
  try {
    const current = activeChat();
    const contents = current.messages.filter(message => message.content || message.parts).map(message => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: message.parts || [{ text: message.content }]
    }));
    await streamGenerate({
      ...settingsStore.get(),
      system: `${settingsStore.get().system}\n\nDuck Mood hiện tại là ${moodConfig.label}: ${moodConfig.instruction}`,
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
      const message = error.message || 'Không thể kết nối Duck AI';
      streamedText = `Duck AI: ${message}`;
      finalAvatar = '😵';
      toast(message, 'error');
    } else {
      finalAvatar = '😮';
    }
  } finally {
    updateActiveChat(chatItem => ({
      ...chatItem,
      messages: chatItem.messages.map((message, index) => index === chatItem.messages.length - 1 ? {
        ...message,
        content: streamedText || 'Duck AI chưa trả về nội dung.',
        avatar: finalAvatar,
        streaming: false
      } : message)
    }));
  }
}

async function sendTamChuyen(text, image, chat) {
  const hasMessages = chat.messages.length > 0;
  const userMessage = { role: 'user', speakerName: 'Sếp', avatar: '👔', content: text, time: Date.now() };
  if (image) userMessage.image = image;
  if (image) userMessage.parts = [{ inline_data: { mime_type: image.mime, data: image.data } }];

  updateActiveChat(item => ({
    ...item,
    title: hasMessages ? item.title : `[Tám chuyện] ${text.slice(0, 35)}${text.length > 35 ? '…' : ''}`,
    messages: [...item.messages, userMessage]
  }));
  chatArea.render();

  const activePersonas = getActivePersonas();
  if (activePersonas.length === 0) {
    toast('Tất cả nhân vật đang tắt. Hãy bật ít nhất 1 nhân vật trong phòng!', 'error');
    return;
  }

  for (const persona of activePersonas) {
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
      const contents = current.messages.slice(0, -1).filter(msg => msg.content || msg.parts).map(msg => {
        if (msg.role === 'user') {
          return { role: 'user', parts: [{ text: `[Sếp]: ${msg.content}` }] };
        }
        if (msg.speakerKey === persona.id) {
          return { role: 'model', parts: [{ text: msg.content }] };
        }
        return { role: 'user', parts: [{ text: `[${msg.speakerName || 'Đồng nghiệp'}]: ${msg.content}` }] };
      });

      await streamGenerate({
        ...settingsStore.get(),
        system: persona.instruction,
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
      updateActiveChat(chatItem => ({
        ...chatItem,
        messages: chatItem.messages.map((msg, index) => index === chatItem.messages.length - 1 ? {
          ...msg,
          content: streamedText || '...',
          streaming: false
        } : msg)
      }));
      chatArea.render();
    }
  }
}

async function send(text, image, clearImage) {
  if ((!text && !image) || controller) return;
  if (!keyManager.size && !config.proxyUrl) { openKeyModal(); return; }
  const chat = ensureChat();
  const mood = settingsStore.get().mood;
  const moodConfig = config.moods[mood] || config.moods.friendly;

  byId('prompt').value = '';
  clearImage();
  inputBar.resize();
  inputBar.setGenerating(true);
  controller = new AbortController();

  try {
    if (chat.mode === 'tam_chuyen') {
      await sendTamChuyen(text, image, chat);
    } else {
      await sendStandard(text, image, chat, moodConfig);
    }
  } finally {
    controller = null;
    inputBar.setGenerating(false);
    chatArea.render();
  }
}

function stop() { controller?.abort(); toast('Đã dừng tạo câu trả lời'); }
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
  const markdown = chat.messages.map(message => `## ${message.speakerName || (message.role === 'user' ? 'Sếp' : 'Duck AI')}\n\n${message.content}`).join('\n\n');
  downloadText(markdown, `${chat.title.replace(/[^\w-]+/g, '_') || 'duck-ai-chat'}.md`, 'text/markdown');
  toast('Đã xuất cuộc trò chuyện');
}

function openKeyModal() { byId('keyModal').classList.add('open'); }

const inputBar = initInputBar({ prompt: byId('prompt'), sendButton: byId('sendBtn'), uploadButton: byId('uploadBtn'), imageInput: byId('imageInput'), preview: byId('uploadPreview'), previewImage: byId('previewImage'), previewName: byId('previewName'), removeImage: byId('removeImage'), micButton: byId('micBtn'), composer: byId('composer'), onSend: send });
initSidebar({
  list: byId('conversationList'),
  search: byId('searchConversations'),
  newButton: byId('newChat'),
  toggleButton: byId('toggleSidebar'),
  mobileButton: byId('mobileMenu'),
  clearButton: byId('clearHistory'),
  backdrop: byId('sidebarBackdrop'),
  sidebar,
  onNew: () => { createChat(roomModeSelect?.value || 'standard'); closeMobile(); },
  onSelect: id => { chatStore.set(state => ({ ...state, activeId: id })); closeMobile(); },
  onDelete: chat => { if (!confirm('Xóa cuộc trò chuyện này?')) return; chatStore.set(state => ({ ...state, activeId: state.activeId === chat.id ? (state.chats.find(item => item.id !== chat.id)?.id || null) : state.activeId, chats: state.chats.filter(item => item.id !== chat.id) })); },
  onRename: chat => { const title = prompt('Tên cuộc trò chuyện:', chat.title); if (title?.trim()) chatStore.set(state => ({ ...state, chats: state.chats.map(item => item.id === chat.id ? { ...item, title: title.trim() } : item) })); },
  onPin: chat => chatStore.set(state => ({ ...state, chats: state.chats.map(item => item.id === chat.id ? { ...item, pinned: !item.pinned } : item) })),
  onClear: () => { if (!confirm('Xóa toàn bộ lịch sử trò chuyện?')) return; chatStore.set({ activeId: null, chats: [] }); createChat(roomModeSelect?.value || 'standard'); toast('Đã xóa toàn bộ lịch sử'); }
});

initThemeToggle({ settingsStore, button: byId('themeToggle') });
initSettingsModal({ modal: byId('keyModal'), closeButton: byId('closeModal'), status: byId('keyStatus'), keyManager, proxyUrl: config.proxyUrl });
const personaModal = initPersonaModal({ modal: byId('personaModal') });
initPersonaBar({ container: byId('personaBar'), onOpenModal: () => personaModal.open() });
byId('settingsToggle').onclick = () => byId('settings').classList.toggle('open');
byId('exportBtn').onclick = exportChat;
const moodSelect = byId('moodSelect');
moodSelect.value = settingsStore.get().mood;
moodSelect.onchange = event => { settingsStore.set(state => ({ ...state, mood: event.target.value })); toast(`Duck AI đang ở mood ${config.moods[event.target.value].label}`); };
byId('scrollBottom').onclick = () => chatArea.scrollToBottom();
const temperature = byId('temperature');
const tempValue = byId('tempValue');
temperature.value = settingsStore.get().temperature;
tempValue.value = settingsStore.get().temperature;
temperature.oninput = event => { tempValue.value = event.target.value; settingsStore.set(state => ({ ...state, temperature: event.target.value })); };
byId('systemInstruction').value = settingsStore.get().system;
byId('systemInstruction').onchange = event => settingsStore.set(state => ({ ...state, system: event.target.value }));
byId('helpBtn').onclick = () => toast('Ctrl+K tìm kiếm · Ctrl+B sidebar · Enter gửi · Shift+Enter xuống dòng');
document.addEventListener('keydown', event => { if (event.ctrlKey && event.key.toLowerCase() === 'k') { event.preventDefault(); byId('searchConversations').focus(); } if (event.ctrlKey && event.key.toLowerCase() === 'b') { event.preventDefault(); sidebar.classList.toggle('collapsed'); } });
initAurora(); initParticles(byId('particles')); initRipple();
if (!chatStore.get().chats.length) createChat(roomModeSelect?.value || 'standard');
if (!keyManager.size && !config.proxyUrl) setTimeout(openKeyModal, 400);
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
