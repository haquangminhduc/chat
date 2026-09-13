import { byId } from '../utils/dom.js';
export function toast(message, type = 'success') { const element = document.createElement('div'); element.className = `toast ${type}`; element.textContent = message; byId('toastStack').append(element); setTimeout(() => element.remove(), 3600); }
