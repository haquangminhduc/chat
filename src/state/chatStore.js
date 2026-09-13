import { readStorage, writeStorage } from '../utils/storage.js';
import { uid } from '../utils/format.js';
import { createStore } from './store.js';

const saved = readStorage('chats', { activeId: null, chats: [] });
export const chatStore = createStore(saved);
chatStore.subscribe(state => writeStorage('chats', state));
export function activeChat() { const state = chatStore.get(); return state.chats.find(chat => chat.id === state.activeId); }
export function createChat() { const chat = { id: uid(), title: 'Cuộc trò chuyện mới', messages: [], created: Date.now(), pinned: false }; chatStore.set(state => ({ ...state, activeId: chat.id, chats: [chat, ...state.chats] })); return chat; }
export function ensureChat() { return activeChat() || createChat(); }
export function updateActiveChat(updater) { chatStore.set(state => ({ ...state, chats: state.chats.map(chat => chat.id === state.activeId ? updater(chat) : chat) })); }
