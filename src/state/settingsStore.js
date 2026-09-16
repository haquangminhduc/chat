import { config } from '../config.js';
import { readStorage, writeStorage } from '../utils/storage.js';
import { createStore } from './store.js';

const saved = readStorage('settings', {});
export const settingsStore = createStore({
  theme: saved.theme || 'dark',
  provider: saved.provider || config.provider,
  model: saved.model || config.defaultModel,
  openaiModel: saved.openaiModel || config.openaiModel,
  openaiBaseUrl: saved.openaiBaseUrl || config.openaiBaseUrl,
  openaiApiKey: saved.openaiApiKey || config.openaiApiKey,
  geminiApiKey: saved.geminiApiKey || (config.apiKeys[0] || ''),
  temperature: saved.temperature ?? config.defaultTemperature,
  system: saved.system || config.defaultSystem,
  mood: saved.mood || 'friendly',
  partyMode: saved.partyMode ?? false
});
settingsStore.subscribe(state => writeStorage('settings', state));

export function isPartyMode() {
  return !!settingsStore.get().partyMode;
}

export function togglePartyMode() {
  let nextState = false;
  settingsStore.set(state => {
    nextState = !state.partyMode;
    return { ...state, partyMode: nextState };
  });
  return nextState;
}

