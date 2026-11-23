/* British English speech via Web Speech API, with optional recorded audio per word. */
window.Pronunciation = (function () {
  const synth = window.speechSynthesis;
  const supported = !!(synth && window.SpeechSynthesisUtterance);
  let voice = null, notified = false, audio = null, playingEl = null;
  let notify = () => {};

  function pickVoice() {
    if (!supported) return;
    const v = synth.getVoices();
    voice = v.find(x => /^en[-_]GB$/i.test(x.lang)) || null;
  }
  if (supported) { pickVoice(); synth.addEventListener("voiceschanged", pickVoice); }

  function stop() {
    if (supported) synth.cancel();
    if (audio) { audio.pause(); audio = null; }
    if (playingEl) { playingEl.classList.remove("is-playing"); playingEl = null; }
    notify("");
  }
  function begin(el) { stop(); playingEl = el; el.classList.add("is-playing"); }
  function end() { if (playingEl) { playingEl.classList.remove("is-playing"); playingEl = null; } notify(""); }

  function speak(text, el, onBoundary) {
    begin(el);
    const file = window.WORD_AUDIO && window.WORD_AUDIO[text.toLowerCase()];
    if (file) { audio = new Audio(file); audio.onended = end; audio.onerror = end; audio.play().catch(end); return; }
    if (!supported) { end(); notify("Speech isn't supported in this browser. Try Chrome, Edge or Safari."); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-GB";
    if (voice) u.voice = voice;
    else if (!notified) { notified = true; notify("No British English voice found on this device, so it will use the default English voice."); }
    if (onBoundary) u.onboundary = e => { if (e.name === "word") onBoundary(e.charIndex); };
    u.onend = end;
    u.onerror = end;
    notify("Playing…");
    synth.speak(u);
  }

  return {
    supported, stop,
    setNotifier: fn => { notify = fn; },
    speakWord: (word, el) => speak(word, el),
    /* words: array of plain words; wordEls: matching elements to highlight */
    speakSentence(words, sentenceEl, wordEls) {
      let pos = 0; const starts = words.map(w => { const s = pos; pos += w.length + 1; return s; });
      let last = null;
      speak(words.join(" "), sentenceEl, ci => {
        const i = starts.filter(s => s <= ci).length - 1;
        if (last) last.classList.remove("is-current");
        last = wordEls[i] || null;
        if (last) last.classList.add("is-current");
      });
    }
  };
})();
