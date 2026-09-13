export function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();
  return {
    get: () => state,
    set(updater) { state = typeof updater === 'function' ? updater(state) : { ...state, ...updater }; listeners.forEach(listener => listener(state)); },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
  };
}
