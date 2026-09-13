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
import { createChatArea } from './ui/chatArea.js';

const keyManager = new KeyManager();
let controller = null;
const sidebar = byId('sidebar');

function copyText(text) { navigator.clipboard?.writeText(text).then(() => toast('Đã copy vào clipboard')).catch(() => toast('Không thể copy', 'error')); }
function speak(text) { if (!('speechSynthesis' in window)) return toast('Trình duyệt không hỗ trợ đọc văn bản', 'error'); speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(text)); }
function closeMobile() { if (innerWidth < 768) sidebar.classList.remove('open'); }

const chatArea = createChatArea({
  container: byId('chat'),
  onPrompt: text => { byId('prompt').value = text; inputBar.resize(); byId('prompt').focus(); },
  actions: { copy: copyText, speak, toast, regenerate: index => regenerate(index) }
});

async function send(text, image, clearImage) {
  if (!text || controller) return;
  if (!keyManager.size) { openKeyModal(); return; }
  const chat = ensureChat();
  const hasMessages = chat.messages.length > 0;
  const userMessage = { role: 'user', content: text, time: Date.now() };
  if (image) userMessage.parts = [{ inline_data: { mime_type: image.mime, data: image.data } }];
  chatStore.set(state => ({ ...state, chats: state.chats.map(item => item.id === chat.id ? { ...item, title: hasMessages ? item.title : `${text.slice(0, 42)}${text.length > 42 ? '…' : ''}`, messages: [...item.messages, userMessage, { role: 'assistant', content: '', streaming: true, time: Date.now() }] } : item) }));
  byId('prompt').value = ''; clearImage(); inputBar.resize(); inputBar.setGenerating(true); controller = new AbortController();
  let streamedText = '';
  try {
    const current = activeChat();
    const contents = current.messages.filter(message => message.content || message.parts).map(message => ({ role: message.role === 'assistant' ? 'model' : 'user', parts: message.parts || [{ text: message.content }] }));
    await streamGenerate({ ...settingsStore.get(), contents, keyManager, signal: controller.signal, onText: textChunk => { streamedText += textChunk; chatArea.updateStreamingText(streamedText); } });
  } catch (error) { if (error.name !== 'AbortError') { const message = error.message || 'Không thể kết nối Duck AI'; streamedText = `Duck AI: ${message}`; toast(message, 'error'); } }
  finally { updateActiveChat(chatItem => ({ ...chatItem, messages: chatItem.messages.map((message, index) => index === chatItem.messages.length - 1 ? { ...message, content: streamedText || 'Duck AI chưa trả về nội dung.', streaming: false } : message) })); controller = null; inputBar.setGenerating(false); chatArea.render(); }
}

function stop() { controller?.abort(); toast('Đã dừng tạo câu trả lời'); }
function regenerate(index) { const chat = activeChat(); const previous = chat?.messages[index - 1]; if (!previous) return; updateActiveChat(item => ({ ...item, messages: item.messages.slice(0, index - 1) })); byId('prompt').value = previous.content; inputBar.resize(); send(previous.content, null, () => {}); }
function exportChat() { const chat = activeChat(); if (!chat) return toast('Chưa có cuộc trò chuyện', 'error'); const markdown = chat.messages.map(message => `## ${message.role === 'user' ? 'Bạn' : 'Duck AI'}\n\n${message.content}`).join('\n\n'); downloadText(markdown, `${chat.title.replace(/[^\w-]+/g, '_') || 'duck-ai-chat'}.md`, 'text/markdown'); toast('Đã xuất cuộc trò chuyện'); }
function openKeyModal() { byId('keyModal').classList.add('open'); }

const inputBar = initInputBar({ prompt: byId('prompt'), sendButton: byId('sendBtn'), stopButton: byId('stopBtn'), uploadButton: byId('uploadBtn'), imageInput: byId('imageInput'), preview: byId('uploadPreview'), previewImage: byId('previewImage'), previewName: byId('previewName'), removeImage: byId('removeImage'), micButton: byId('micBtn'), composer: byId('composer'), onSend: send, onStop: stop });
initSidebar({ list: byId('conversationList'), search: byId('searchConversations'), newButton: byId('newChat'), toggleButton: byId('toggleSidebar'), mobileButton: byId('mobileMenu'), sidebar, onNew: () => { createChat(); closeMobile(); }, onSelect: id => { chatStore.set(state => ({ ...state, activeId: id })); closeMobile(); }, onDelete: chat => { if (!confirm('Xóa cuộc trò chuyện này?')) return; chatStore.set(state => ({ ...state, activeId: state.activeId === chat.id ? (state.chats.find(item => item.id !== chat.id)?.id || null) : state.activeId, chats: state.chats.filter(item => item.id !== chat.id) })); }, onRename: chat => { const title = prompt('Tên cuộc trò chuyện:', chat.title); if (title?.trim()) chatStore.set(state => ({ ...state, chats: state.chats.map(item => item.id === chat.id ? { ...item, title: title.trim() } : item) })); }, onPin: chat => chatStore.set(state => ({ ...state, chats: state.chats.map(item => item.id === chat.id ? { ...item, pinned: !item.pinned } : item) })) });
initThemeToggle({ settingsStore, button: byId('themeToggle') });
initSettingsModal({ modal: byId('keyModal'), closeButton: byId('closeModal'), status: byId('keyStatus'), keyManager });
byId('settingsToggle').onclick = () => byId('settings').classList.toggle('open');
byId('exportBtn').onclick = exportChat;
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
if (!chatStore.get().chats.length) createChat();
if (!keyManager.size) setTimeout(openKeyModal, 400);
