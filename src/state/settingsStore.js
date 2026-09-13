import { config } from '../config.js';
import { readStorage, writeStorage } from '../utils/storage.js';
import { createStore } from './store.js';

const saved = readStorage('settings', {});
const model = saved.model === 'gemini-2.5-flash' ? config.defaultModel : (saved.model || config.defaultModel);
export const settingsStore = createStore({ theme: saved.theme || 'dark', model, temperature: saved.temperature ?? config.defaultTemperature, system: saved.system || '' });
settingsStore.subscribe(state => writeStorage('settings', state));
