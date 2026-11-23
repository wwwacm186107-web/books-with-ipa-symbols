# Fable Shelf (Stage 1)
Run: open `index.html` in a browser (no server or build step needed).
Edit stories in `js/stories.js`; colours in `css/variables.css`; category labels in `js/phonetics.js`.

## Modules
dom.js helper · phonetics.js categories + IPA tokenizer · stories.js data · reader.js two-page reader · pronunciation.js en-GB speech + audio hook · progress.js localStorage · app.js landing + routing.

## Edit content
- Replace/add a story: edit js/stories.js (see comment at top). Format per word: `text|IPA`.
- Fix IPA or classification: change the word's IPA in stories.js; symbol->category table is in js/phonetics.js.
- Custom audio: put files in assets/audio and map `word: path` in `WORD_AUDIO` (stories.js).

## Test checklist
Cards open stories · prev/next/finish work · arrow keys · IPA matches words · legend opens · word click speaks · sentence Listen + Stop · mobile (<800px) Story/Sounds tabs · progress badge after finishing · reload resumes page.
