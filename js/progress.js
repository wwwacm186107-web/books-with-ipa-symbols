/* Lightweight reading progress in localStorage: { storyId: {page, completed} } */
window.Progress = (function () {
  const KEY = "fableShelf.progress";
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const write = d => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* storage unavailable: ignore */ } };
  return {
    get: id => read()[id] || null,
    save(id, page) { const d = read(); d[id] = { page, completed: !!(d[id] && d[id].completed) }; write(d); },
    complete(id) { const d = read(); d[id] = { page: 0, completed: true }; write(d); }
  };
})();
