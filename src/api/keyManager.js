import { config } from '../config.js';

export class KeyManager {
  constructor(keys = config.apiKeys) { this.keys = [...new Set(keys)]; this.index = 0; this.failed = new Set(); }
  get size() { return this.keys.length; }
  current() { return this.keys[this.index] || ''; }
  rotate() { if (!this.keys.length) return ''; this.failed.add(this.index); const next = this.keys.findIndex((_, index) => !this.failed.has(index)); this.index = next === -1 ? (this.index + 1) % this.keys.length : next; if (next === -1) this.failed.clear(); return this.current(); }
  reset() { this.failed.clear(); }
}
