import { config } from '../config.js';
import { readStorage, writeStorage } from '../utils/storage.js';
import { createStore } from './store.js';

const saved = readStorage('settings', {});
const model = config.defaultModel;
export const settingsStore = createStore({ theme: saved.theme || 'dark', model, temperature: saved.temperature ?? config.defaultTemperature, system: saved.system || config.defaultSystem, mood: saved.mood || 'friendly' });
settingsStore.subscribe(state => writeStorage('settings', state));
