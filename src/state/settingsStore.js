import { config } from '../config.js';
import { readStorage, writeStorage } from '../utils/storage.js';
import { createStore } from './store.js';

const saved = readStorage('settings', {});
export const settingsStore = createStore({ theme: saved.theme || 'dark', model: saved.model || config.defaultModel, temperature: saved.temperature ?? config.defaultTemperature, system: saved.system || '' });
settingsStore.subscribe(state => writeStorage('settings', state));
