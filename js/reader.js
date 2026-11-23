/* Two-page reader. Left and right pages are both generated from the same story data. */
window.Reader = (function () {
  const $ = id => document.getElementById(id);
  const P = window.Phonetics, T = window.Pronunciation, PR = window.Progress;
  let story, page = 0, onExit = () => {};

  function open(s, start, exitCb) {
    story = s; page = Math.min(start || 0, s.pages.length - 1); onExit = exitCb;
    $("r-title").textContent = s.title;
    $("spread").classList.remove("show-right"); setTab(true);
    render();
  }

  function setTab(right) {
    $("spread").classList.toggle("show-right", right);
    $("tab-text").setAttribute("aria-selected", String(!right));
    $("tab-sounds").setAttribute("aria-selected", String(right));
  }

  function render() {
    T.stop();
    const pg = story.pages[page];
    const flags = pg.sentences.map(x => /^¶/.test(x));
    const parsed = pg.sentences.map(x => P.parseSentence(x.replace(/^¶\s*/, "")));
    const left = $("pg-left"), right = $("pg-right");
    const plain = ws => ws.map(w => w.text).join(" ");
    if (pg.kind === "title") {
      left.replaceChildren(h("div", { class: "title-page" }, [
        h("h3", { class: "tp-title", text: plain(parsed[0]) }),
        h("p", { class: "tp-author", text: parsed[1] ? plain(parsed[1]) : story.author })]));
    } else {
      const paras = [];
      parsed.forEach((ws, i) => { if (i === 0 || flags[i]) paras.push([]); paras[paras.length - 1].push(plain(ws)); });
      left.replaceChildren(
        h("div", { class: "story-text" }, paras.map(t => h("p", { text: t.join(" ") }))),
        h("p", { class: "pnum", text: "Page " + (page + 1) }));
    }
    right.replaceChildren(...parsed.map(ws => sentenceBlock(ws)),
      h("p", { class: "pnum", text: pg.kind === "title" ? "" : "Pronunciation · page " + (page + 1) }));
    $("r-ind").textContent = "Page " + (page + 1) + " of " + story.pages.length;
    $("r-prev").disabled = page === 0;
    $("r-next").textContent = page === story.pages.length - 1 ? "Finish" : "Next page";
    $("spread").classList.remove("flip"); void $("spread").offsetWidth; $("spread").classList.add("flip");
    PR.save(story.id, page);
  }

  function sentenceBlock(ws) {
    const wordEls = ws.map(w => {
      const b = h("button", { class: "word", type: "button", "aria-label": w.speak + ", play pronunciation" }, [
        h("span", { class: "ipa" }, [h("span", { class: "sl", text: "/" }), ...w.ipa.map(u =>
          h("span", { class: u.category ? "cat-" + u.category : "stress",
            title: u.category ? window.PHONETIC_CATEGORIES[u.category].label : "Stress mark", text: u.symbol })),
          h("span", { class: "sl", text: "/" })]),
        h("span", { class: "wt", text: w.text })]);
      b.addEventListener("click", () => T.speakWord(w.speak, b));
      return b;
    });
    const wrap = h("div", { class: "sentence" });
    const play = h("button", { class: "play", type: "button", "aria-label": "Listen to this sentence", text: "▶ Listen" });
    play.addEventListener("click", () => T.speakSentence(ws.map(w => w.speak), wrap, wordEls));
    wrap.append(play, h("div", { class: "words" }, wordEls));
    return wrap;
  }

  function go(d) {
    const n = page + d;
    if (n >= story.pages.length) { PR.complete(story.id); T.stop(); onExit(); return; }
    if (n < 0) return;
    page = n; render();
  }

  function init() {
    $("r-prev").addEventListener("click", () => go(-1));
    $("r-next").addEventListener("click", () => go(1));
    $("r-back").addEventListener("click", () => { T.stop(); onExit(); });
    $("r-stop").addEventListener("click", T.stop);
    $("tab-text").addEventListener("click", () => setTab(false));
    $("tab-sounds").addEventListener("click", () => setTab(true));
    T.setNotifier(m => { $("r-msg").textContent = m; });
    document.addEventListener("keydown", e => {
      if ($("reader").hidden || e.target.closest("details,input")) return;
      if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1);
    });
    const lg = $("r-legend");
    Object.entries(window.PHONETIC_CATEGORIES).forEach(([k, c]) => lg.appendChild(
      h("li", {}, [h("span", { class: "sym cat-" + k, text: c.example.split(" ")[0] }), h("span", { text: " " + c.label })])));
  }
  return { open, init };
})();
