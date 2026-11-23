/* Phonetic categories + British English (RP) symbol classification.
   Colours live in css/variables.css. Fixed lookup table: nothing is guessed at runtime. */
window.PHONETIC_CATEGORIES = {
  shortVowel: { label: "Short vowels",         color: "var(--short-vowel)", example: "/ɪ/ /e/ /æ/ /ʌ/ /ɒ/ /ʊ/ /ə/" },
  longVowel:  { label: "Long vowels",          color: "var(--long-vowel)",  example: "/iː/ /ɑː/ /uː/ /ɔː/ /ɜː/" },
  diphthong:  { label: "Diphthongs",           color: "var(--diphthong)",   example: "/eɪ/ /aɪ/ /əʊ/ /ɔɪ/ /aʊ/ /ɪə/ /eə/ /ʊə/" },
  voiced:     { label: "Voiced consonants",    color: "var(--voiced)",      example: "/b/ /d/ /ɡ/ /v/ /ð/ /z/ /ʒ/ /dʒ/ /m/ /n/ /ŋ/ /l/ /r/ /j/ /w/" },
  voiceless:  { label: "Voiceless consonants", color: "var(--voiceless)",   example: "/p/ /t/ /k/ /f/ /θ/ /s/ /ʃ/ /h/ /tʃ/" }
};

window.Phonetics = (function () {
  const groups = {
    shortVowel: ["ɪ", "e", "æ", "ʌ", "ɒ", "ʊ", "ə", "i"],
    longVowel:  ["iː", "ɑː", "ɔː", "uː", "ɜː"],
    diphthong:  ["eɪ", "aɪ", "ɔɪ", "əʊ", "aʊ", "ɪə", "eə", "ʊə"],
    voiced:     ["b", "d", "ɡ", "v", "ð", "z", "ʒ", "dʒ", "m", "n", "ŋ", "l", "r", "j", "w"],
    voiceless:  ["p", "t", "k", "f", "θ", "s", "ʃ", "h", "tʃ"]
  };
  const lookup = {};
  Object.entries(groups).forEach(([cat, list]) => list.forEach(s => (lookup[s] = cat)));
  const symbols = Object.keys(lookup).sort((a, b) => b.length - a.length); // longest match first
  const STRESS = ["ˈ", "ˌ"];

  /* "ˈlaɪən" -> [{symbol:"ˈ",category:null},{symbol:"l",...},{symbol:"aɪ",...},...] */
  function tokenizeIpa(ipa) {
    const out = [];
    let s = ipa.replace(/g/g, "ɡ");
    while (s.length) {
      if (STRESS.includes(s[0])) { out.push({ symbol: s[0], category: null }); s = s.slice(1); continue; }
      const m = symbols.find(sym => s.startsWith(sym));
      if (!m) throw new Error("Unknown IPA symbol in: " + ipa);
      out.push({ symbol: m, category: lookup[m] });
      s = s.slice(m.length);
    }
    return out;
  }

  /* Sentence string "The|ðə lion|ˈlaɪən" -> word objects (same data feeds both pages). */
  function parseSentence(str) {
    return str.trim().split(/\s+/).map(tok => {
      const [text, ipa] = tok.split("|");
      return { text, speak: text.replace(/[^A-Za-z0-9'’-]/g, ""), ipa: tokenizeIpa(ipa) };
    });
  }
  return { tokenizeIpa, parseSentence, lookup };
})();
