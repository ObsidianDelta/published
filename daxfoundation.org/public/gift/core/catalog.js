// The studio's data: the 15 love letters, the attributed theme catalog, the culture seeds and the
// source kinds. Every row names where it came from. Harmony + credits only: no melody, no lyrics,
// no audio of any work is stored here or played by the studio.
//
// Sources (reuse, not reinvention):
//   letters   <- state/beep-lang/LOVE-VOCAB-v0.md (15 letters; Love = D, re-love = D -> G)
//   works     <- state/beep-lang/THEME-CATALOG-v0.md (seed rows, confidence as catalogued)
//   cultures  <- state/gift/research/culture-catalog.md (seed regions; staff stubs, confidence low)

/** The 15 letters. `home` = the provisional home sound (chord symbols; "D1" = the single note D). */
export const LETTERS = Object.freeze([
  { id: 'love', home: ['D1'], hue: 350, contour: 'arch', set: true },
  { id: 'tenderness', home: ['G', 'Em7', 'Gmaj7'], hue: 20, contour: 'wave' },
  { id: 'togetherness', home: ['G', 'Dsus4', 'D', 'Em'], hue: 35, contour: 'rise' },
  { id: 'trust', home: ['G5'], hue: 200, contour: 'still' },
  { id: 'curiosity', home: ['C', 'F5', 'Bbsus2', 'Am'], hue: 170, contour: 'wave' },
  { id: 'adventure', home: ['C', 'G', 'Gsus4', 'D7'], hue: 15, contour: 'rise' },
  { id: 'creativity', home: ['Bbsus2', 'F'], hue: 280, contour: 'wide', open: true },
  { id: 'discovery', home: ['Dm7', 'Cm'], hue: 260, contour: 'wide' },
  { id: 'joy', home: ['C', 'Csus2', 'G', 'D', 'Am7'], hue: 48, contour: 'rise' },
  { id: 'hope', home: ['F'], hue: 90, contour: 'rise' },
  { id: 'birth', home: ['Am', 'Fmaj7', 'F', 'Csus4', 'C'], hue: 130, contour: 'arch' },
  { id: 'awe', home: ['Em', 'C', 'Em', 'C', 'Am7'], hue: 230, contour: 'wide' },
  { id: 'gratitude', home: ['Csus2', 'C', 'Cadd9'], hue: 60, contour: 'arch', open: true },
  { id: 'longing', home: ['Fsus4', 'F', 'Am'], hue: 300, contour: 'fall' },
  { id: 'doubt', home: ['Fsus4'], hue: 240, contour: 'still' },
]);
export const LETTER_IDS = Object.freeze(LETTERS.map((l) => l.id));
export const letterById = (id) => LETTERS.find((l) => l.id === id) || null;

/** The pinned word: re-love = D -> G, love called and answered. */
export const RELOVE = Object.freeze({ call: 62, answer: 67 }); // D4 -> G4

/** Contours: indices into the chord's tones (an index past the end wraps one octave up, at most). */
export const CONTOURS = Object.freeze({
  rise: [0, 1, 2, 3],
  fall: [3, 2, 1, 0],
  arch: [0, 2, 3, 1],
  still: [0, 0, 1, 0],
  wave: [0, 2, 1, 3],
  wide: [0, 3, 1, 4],
});

const CATALOG = 'THEME-CATALOG-v0';
const work = (id, title, work, year, composer, key, progression, confidence, extra = {}) =>
  Object.freeze({ id, title, work, year, composer, key, progression, confidence, source: CATALOG, ...extra });

/** Films: the love theme of each film, harmony as sketched in THEME-CATALOG-v0 (to verify). */
export const MOVIES = Object.freeze([
  work('braveheart-princess', 'Braveheart', 'Braveheart', 1995, 'James Horner', 'D, Celtic modal', ['Bm', 'G', 'D', 'A'], 'low', { featured: true, letters: ['longing', 'love'] }),
  work('titanic-heart', 'Titanic', 'Titanic', 1997, 'James Horner', 'E major', ['E', 'B', 'A', 'B'], 'medium'),
  work('loveactually-glasgow', 'Love Actually', 'Love Actually', 2003, 'Craig Armstrong', 'C major', ['C', 'G/B', 'Am', 'Fmaj7'], 'low'),
  work('superman-love', 'Superman', 'Superman', 1978, 'John Williams', 'Eb major', ['Eb', 'Gm/D', 'Cm', 'Abmaj7'], 'low'),
  work('nottinghill-she', 'Notting Hill', 'Notting Hill', 1999, 'Aznavour & Kretzmer', 'G major', ['G', 'Em', 'C', 'Cm'], 'low'),
  work('ghost-unchained', 'Ghost', 'Ghost', 1990, 'North & Zaret', 'C major', ['C', 'Am', 'F', 'G'], 'high'),
  work('casablanca-timegoesby', 'Casablanca', 'Casablanca', 1942, 'Herman Hupfeld', 'Eb major', ['Fm7', 'Bb7', 'Ebmaj7', 'Cm7'], 'medium'),
  work('notebook-main', 'The Notebook', 'The Notebook', 2004, 'Aaron Zigman', 'F major', ['F', 'Am', 'Bb', 'C'], 'low'),
  work('lalaland-mia', 'La La Land', 'La La Land', 2016, 'Justin Hurwitz', 'D major, jazz waltz', ['Dmaj7', 'Bm7', 'Em7', 'A7'], 'low'),
  work('up-married', 'Up', 'Up', 2009, 'Michael Giacchino', 'F major waltz', ['F', 'Dm', 'Gm7', 'C7'], 'low'),
]);

/** Songs: the catalogued rows that are songs. Same harmony and credits; never the tune or words. */
export const SONGS = Object.freeze([
  work('ghost-unchained', 'Unchained Melody', 'Ghost', 1990, 'North & Zaret', 'C major', ['C', 'Am', 'F', 'G'], 'high'),
  work('casablanca-timegoesby', 'As Time Goes By', 'Casablanca', 1942, 'Herman Hupfeld', 'Eb major', ['Fm7', 'Bb7', 'Ebmaj7', 'Cm7'], 'medium'),
  work('nottinghill-she', 'She', 'Notting Hill', 1999, 'Aznavour & Kretzmer', 'G major', ['G', 'Em', 'C', 'Cm'], 'low'),
  work('titanic-heart', 'My Heart Will Go On', 'Titanic', 1997, 'James Horner', 'E major', ['E', 'B', 'A', 'B'], 'medium'),
]);

/** attribution string, the same shape the research worker stores in stimulus_json.attribution. */
export const attributionOf = (w) => `${w.work} (${w.year}) — ${w.composer}`;

const culture = (id, region, language, tradition, mode, progression) =>
  Object.freeze({ id, region, language, tradition, mode, progression, confidence: 'low', source: 'culture-catalog seed', written: 'studio' });

/** Culture seeds. The progression is a generic one the studio wrote in the named mode, NOT taken
    from any work. All rows are staff stubs at low confidence awaiting community verification. */
export const CULTURES = Object.freeze([
  culture('in-tamil-film', 'South India', 'Tamil', 'Tamil film music', 'dorian (Kharaharapriya colour)', ['Dm', 'G', 'C', 'Dm']),
  culture('in-hindi-film', 'North India', 'Hindi', 'Hindi film music', 'aeolian', ['Am', 'F', 'C', 'G']),
  culture('kr-kdrama-ost', 'South Korea', 'Korean', 'K-drama soundtrack', 'ionian', ['C', 'G', 'Am', 'F']),
  culture('ng-yoruba-juju', 'West Africa', 'Yoruba', 'Jùjú', 'ionian', ['G', 'C', 'G', 'D']),
  culture('br-bossa-nova', 'Brazil', 'Portuguese', 'Bossa nova', 'ionian, extended chords', ['Dmaj7', 'Em7', 'A7', 'Dmaj7']),
  culture('mx-ranchera', 'Mexico', 'Spanish', 'Ranchera', 'ionian', ['G', 'C', 'D7', 'G']),
  culture('eg-arabic-mawwal', 'Egypt / Levant', 'Arabic', 'Mawwal', 'phrygian-dominant (Hijaz colour)', ['D', 'Eb', 'Cm', 'D']),
  culture('us-randb-soul', 'United States', 'English', 'R&B / soul', 'ionian, sevenths', ['Cmaj7', 'Am7', 'Dm7', 'G7']),
  culture('fr-chanson', 'France', 'French', 'Chanson', 'harmonic minor', ['Am', 'Dm', 'E', 'Am']),
  culture('jp-enka', 'Japan', 'Japanese', 'Enka', 'aeolian (yonanuki colour)', ['Am', 'Dm', 'Am', 'E']),
  culture('et-tizita', 'Ethiopia', 'Amharic', 'Tizita', 'pentatonic (qenet colour)', ['Am', 'C', 'Am', 'G']),
  culture('pk-ghazal', 'South Asia', 'Urdu', 'Ghazal', 'harmonic minor', ['Dm', 'Gm', 'A', 'Dm']),
]);

const L = (...ids) => Object.freeze(ids);
/** Source kinds. family decides the stage order (polymorphic experiments):
      work     source -> chords -> emotions -> notes -> sound
      culture  source -> chords -> emotions -> notes -> sound
      personal source -> emotions -> chords -> notes -> sound
    unlock = discoveries needed. items = quick picks with suggested letters. */
export const SOURCE_KINDS = Object.freeze([
  { id: 'movie', family: 'work', unlock: 0, glyph: '◐' },
  { id: 'memory', family: 'personal', unlock: 0, glyph: '◌' },
  { id: 'place', family: 'personal', unlock: 0, glyph: '◇' },
  { id: 'song', family: 'work', unlock: 1, glyph: '♪' },
  { id: 'person', family: 'personal', unlock: 1, glyph: '○' },
  { id: 'culture', family: 'culture', unlock: 1, glyph: '◎' },
  { id: 'season', family: 'personal', unlock: 3, glyph: '❀', items: { spring: L('birth', 'hope'), summer: L('joy', 'adventure'), autumn: L('longing', 'gratitude'), winter: L('togetherness', 'tenderness') } },
  { id: 'colour', family: 'personal', unlock: 3, glyph: '●', items: { red: L('love', 'adventure'), gold: L('joy', 'gratitude'), blue: L('longing', 'trust'), green: L('hope', 'birth'), violet: L('awe', 'curiosity'), white: L('tenderness', 'trust') } },
  { id: 'weather', family: 'personal', unlock: 3, glyph: '☁', items: { rain: L('longing', 'tenderness'), sun: L('joy', 'hope'), snow: L('awe', 'togetherness'), storm: L('adventure', 'doubt'), fog: L('curiosity', 'doubt') } },
  { id: 'timeofday', family: 'personal', unlock: 3, glyph: '◑', items: { dawn: L('birth', 'hope'), noon: L('joy', 'adventure'), dusk: L('gratitude', 'longing'), night: L('awe', 'tenderness') } },
  { id: 'word', family: 'personal', unlock: 3, glyph: '“' },
  { id: 'nature', family: 'personal', unlock: 5, glyph: '△', items: { sea: L('awe', 'longing'), forest: L('curiosity', 'togetherness'), mountain: L('awe', 'adventure'), river: L('trust', 'discovery'), desert: L('longing', 'awe'), sky: L('hope', 'awe') } },
  { id: 'food', family: 'personal', unlock: 5, glyph: '◒' },
  { id: 'journey', family: 'personal', unlock: 5, glyph: '→' },
  { id: 'home', family: 'personal', unlock: 5, glyph: '⌂' },
  { id: 'festival', family: 'personal', unlock: 5, glyph: '✦' },
  { id: 'keepsake', family: 'personal', unlock: 5, glyph: '✉' },
  { id: 'photograph', family: 'personal', unlock: 5, glyph: '▣' },
  { id: 'game', family: 'personal', unlock: 5, glyph: '◈' },
  { id: 'garden', family: 'personal', unlock: 5, glyph: '✿' },
  { id: 'city', family: 'personal', unlock: 7, glyph: '▥' },
  { id: 'first', family: 'personal', unlock: 7, glyph: '①' },
  { id: 'friend', family: 'personal', unlock: 7, glyph: '◍' },
  { id: 'animal', family: 'personal', unlock: 7, glyph: '◔' },
  { id: 'dream', family: 'personal', unlock: 7, glyph: '☾' },
  { id: 'scent', family: 'personal', unlock: 7, glyph: '≈' },
  { id: 'gift', family: 'personal', unlock: 7, glyph: '❒' },
  { id: 'ritual', family: 'personal', unlock: 7, glyph: '⟳' },
  { id: 'lesson', family: 'personal', unlock: 7, glyph: '✎' },
  { id: 'anything', family: 'personal', unlock: 7, glyph: '+' },
]);
export const kindById = (id) => SOURCE_KINDS.find((k) => k.id === id) || null;

/** the catalogue rows a work/culture kind offers. */
export function itemsFor(kindId) {
  if (kindId === 'movie') return MOVIES;
  if (kindId === 'song') return SONGS;
  if (kindId === 'culture') return CULTURES;
  return null;
}
export function catalogItem(kindId, id) {
  const rows = itemsFor(kindId);
  return rows ? rows.find((r) => r.id === id) || null : null;
}

/** Preset questions (i18n keys). A person can also write their own. */
export const QUESTIONS = Object.freeze(['q.mynotes', 'q.film', 'q.home', 'q.someone', 'q.culture', 'q.today']);
