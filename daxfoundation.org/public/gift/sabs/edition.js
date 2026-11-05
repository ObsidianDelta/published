// The Uruguayan edition of the love gift, made for one person: Sebastián ("Sabs"), a Uruguayan
// heart that grew up in Canada. Loaded by app.js only for /gift/?para=sabs (usually &lang=es).
// Without that parameter none of this runs, and the gift is the same for everyone else.
//
// What it adds, lightly ("just a little bit more Uruguayan"):
//   - rioplatense Spanish (voseo) over the studio's Spanish strings, and the flagship experiment
//     itself in Spanish (it is English-only elsewhere for now)
//   - a candombe heartbeat (./candombe.js, synthesised): chico, repique and piano under the love
//     sounds, one beat per heartbeat of the field
//   - the Uruguayan sky in the colours (celeste and white, the gold of the Sol de Mayo), with a
//     touch of Canadian red and white: Uruguay ⇄ Canadá
//   - a dedication at the start and a signature at the end
// No personal data of any kind lives here: this is a public page.
import { LANG_CODES } from '../core/i18n.js';
import { createCandombe } from './candombe.js';

const CELESTE = 199, SOL = 45, BLANCO = -1; // field hues (-1 is the field's warm white)
const qLang = new URLSearchParams(location.search).get('lang');
const LANG_OK = LANG_CODES.includes(qLang);

/** the query the page keeps while you move through the studio, so a reload stays the edition */
export const query = '?para=sabs' + (LANG_OK ? '&lang=' + qLang : '');
/** the edition speaks the language in the link, else rioplatense Spanish */
export const lang = () => (LANG_OK ? qLang : 'es');

// ---------- rioplatense Spanish (voseo), over the studio's es tables ----------
const UY = {
  'age.q': 'Antes de arrancar: ¿tenés 13 años o más?',
  'age.yes': 'Sí, tengo 13 o más',
  'age.note': 'Cualquier respuesta está bien. Si preferís no decirlo, la investigación abierta y tus palabras en los enlaces quedan apagadas.',
  'nav.breath': 'Tomate un respiro',
  'nav.knows': 'Lo que esta página sabe de vos',
  'knows.title': 'Lo que esta página sabe de vos',
  'breath.t': 'Siempre tenés el control.',
  'breath.s': 'Podés parar acá. No se pierde nada, y no se mandó nada sin que dijeras que sí.',
  'breath.back': 'Volver adonde estaba',
  'app.sub': 'Diseñá un experimento chiquito. Escuchá la respuesta. Compartila.',
  'home.start': 'Arrancar un experimento',
  'home.example.go': 'Probalo con Braveheart',
  'home.empty.shared': 'Cuando alguien te mande un experimento, va a aparecer acá.',
  'prog.streak0': 'Descubrí algo hoy para arrancar una racha',
  'prog.alphabet': 'Encontraste todo el alfabeto del amor.',
  'question.custom': 'O hacé la tuya',
  'source.text': 'Nombralo en pocas palabras',
  'source.pickitem': 'Elegí uno',
  'source.add': 'Sumar otra fuente',
  'source.need': 'Elegí una fuente para seguir.',
  'chords.tap': 'Tocá un acorde para escucharlo.',
  'emotions.lead': '¿Qué sentimientos escuchás?',
  'emotions.guess': 'La primera intuición del estudio brilla — vos decidís.',
  'emotions.pick': 'Elegí hasta {n}.',
  'emotions.need': 'Elegí al menos un sentimiento.',
  'result.echo.t': 'Tu sonido se inclina hacia {a}. Probá {b} después: está del otro lado del alfabeto.',
  'share.lead': 'Compartilo',
  'share.text': 'Hice el mío. Hacé el tuyo, o remezclalo.',
  'share.default': '¿Cómo suena el amor? El mío suena así: {feeling}. Hacé el tuyo: {url}',
  'shared.k': 'Compartido con vos',
  'shared.from': 'Alguien te mandó su amor hecho sonido. Escuchalo y después hacé el tuyo.',
  'knows.local.items': 'tus experimentos, lo que desbloqueaste, tu idioma y tu respuesta a la pregunta de edad.',
  'knows.research.t': 'Podés sumar un experimento a un conjunto de datos público sobre cómo suena el amor en distintas culturas. Vas a ver exactamente qué se mandaría antes de mandar nada.',
  'knows.cleared': 'Borrado. Arrancás de cero.',
  'research.offer': '¿Sumar esto a la investigación abierta?',
  'tpl.sub': 'Cien maneras de hacer una sola pregunta. Arrancá por cualquiera que esté abierta.',
  'tpl.own': 'Diseñá el tuyo',
  'tpl.own.sub': 'Elegí cualquier fuente y armá vos las etapas.',
  'tpl.choose': 'Elegí para seguir.',
  'tpl.taps': 'Tocá al ritmo de tu corazón',
  'tpl.english': 'Por ahora, los textos de los experimentos están en inglés; el insignia, para vos, habla uruguayo.',
  'tpl.care': 'Opcional y suave. Saltealo si querés.',
  'tpl.sliders.hint': 'Dejá en cero lo que quieras.',
  'tpl.colour': 'Elegí un color',
  'api.hidden': 'Todavía no hay suficientes voces acá: sumate entre las cinco primeras.',
  'api.share.open': 'Este enlace se guarda en research.daxfoundation.org. ¿Lo abrimos? Tu navegador va a contactar ese servidor.',
  'api.added': 'Sumado. Podés retirarlo cuando quieras.',
  'gift.k': 'Un regalo para vos',
  'gift.make': 'Hacé el tuyo',
  'btn.makemine': 'Hacé el tuyo',
  'open.tap': 'Tocá “amor” en tu idioma',
  'open.hold': 'Mantené apretado el corazón si tenés 13 años o más',
  'reveal.k': 'Tu regalo está pronto',
};
/** wrap the studio's translator: rioplatense first (Spanish only), then the studio's own chain */
export function wrapT(t, l) {
  if (l !== 'es') return t;
  return function tUY(key, vars) {
    const s = UY[key];
    if (s === undefined) return t(key, vars);
    return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] === undefined ? m : String(vars[k]))) : s;
  };
}

// the flagship experiment (state/gift/experiments, English-only for now), in rioplatense
const FLAG = {
  'The love theme you carry': 'El tema de amor que llevás adentro',
  "Which film's love theme lives in you -- and what does it sound like when it becomes yours?": '¿Qué tema de amor de película vive en vos? ¿Y cómo suena cuando se vuelve tuyo?',
  'A film love theme': 'Un tema de amor de película',
  'Pick a film whose love theme you carry.': 'Elegí una película cuyo tema de amor llevás con vos.',
  "Film composers lean on a small set of chord movements to say 'love'. We catalogue the movement (chord names, key) with full credit -- facts about the work, the way textbooks do -- and never the melody, lyrics or recording.": 'Los compositores de cine usan un puñado de movimientos de acordes para decir «amor». Catalogamos el movimiento (los nombres de los acordes, la tonalidad) con todo su crédito —datos sobre la obra, como en los libros de texto— y nunca la melodía, la letra ni la grabación.',
  'The chord movement, credited. Confidence shown.': 'El movimiento de acordes, con su crédito y su nivel de confianza.',
  'Listen to just the chords. Here is what they carry.': 'Escuchá solo los acordes. Esto es lo que traen.',
  "Each chord is read three ways: its quality (major brightens, minor aches, maj7 softens, sus leaves a question open), its job in the key (home, lift, pull, ache), and the moves between chords (an arrival, an 'amen', a door that opens somewhere unexpected).": 'Cada acorde se lee de tres maneras: su color (el mayor ilumina, el menor duele, el maj7 suaviza, el sus deja una pregunta abierta), su función en la tonalidad (casa, impulso, tirón, dolor) y los pasos entre acordes (una llegada, un «amén», una puerta que se abre adonde no esperabas).',
  'The 15 letters of love, as these chords lean.': 'Las 15 letras del amor, según hacia dónde se inclinan estos acordes.',
  'When you hear it, what comes back to you?': 'Cuando lo escuchás, ¿qué te vuelve?',
  'A theme means something different to everyone who carries it. Your answer is blended with the chords, two parts chords to one part you.': 'Un tema significa algo distinto para cada uno que lo lleva. Tu respuesta se mezcla con los acordes: dos partes de acordes, una parte vos.',
  'What you bring to it.': 'Lo que le ponés vos.',
  'a first love': 'un primer amor',
  'someone far away': 'alguien que está lejos',
  'watching it with family': 'verla en familia',
  'a goodbye': 'una despedida',
  'a promise': 'una promesa',
  'nothing in particular -- it is just beautiful': 'nada en especial: es lindo y ta',
  "The film's feeling and yours, together.": 'Lo que siente la película y lo que sentís vos, juntos.',
  'Chords, you, and the blend.': 'Los acordes, vos y la mezcla.',
  'Make it yours: nudge any letter up or down.': 'Hacelo tuyo: subí o bajá cualquier letra.',
  'Your feeling, tuned.': 'Tu sentimiento, afinado.',
  'These are the notes of your feeling.': 'Estas son las notas de lo que sentís.',
  'Each mode (a set of seven or five notes) has a colour, from bright Lydian to dark Phrygian; pentatonic sets are the near-universal singable ones. We pick the mode closest to your feeling and start it on D -- in this project, the note for love.': 'Cada modo (un juego de siete o cinco notas) tiene su color, del lidio luminoso al frigio oscuro; las pentatónicas son las que casi todo el mundo puede cantar. Elegimos el modo más cercano a lo que sentís y lo arrancamos en re: en este proyecto, la nota del amor.',
  'Your notes on the circle of twelve.': 'Tus notas en el círculo de las doce.',
  'A new progression, written only in your notes.': 'Una progresión nueva, escrita solo con tus notas.',
  "We search every chord that fits inside your notes for the four-chord path whose feeling is closest to yours. The film gave the spark; the result is yours, not the film's.": 'Buscamos, entre todos los acordes que caben en tus notas, el camino de cuatro acordes que más se parece a lo que sentís. La película dio la chispa; el resultado es tuyo, no de la película.',
  'Your chords, with roman numerals.': 'Tus acordes, con números romanos.',
  'Hear it on a heartbeat.': 'Escuchalo sobre un latido.',
  'Voices move as little as possible from chord to chord (smooth voice leading), over a lub-dub bass at a resting heart rate.': 'Las voces se mueven lo menos posible de un acorde al otro (conducción de voces suave), sobre un bajo que late, lub-dub, como un corazón en reposo. Abajo, para vos, suena un candombe.',
  'Play.': 'Dale play.',
  'Is this a love that was, that is, or that will be?': '¿Es un amor que fue, que es o que va a ser?',
  'Was echoes and falls; will rises.': 'Lo que fue resuena y cae; lo que será sube.',
  'Frame it with the call and the answer.': 'Enmarcalo con la llamada y la respuesta.',
  'D calls, G answers, then your sound.': 'Re llama, sol responde, y después tu sonido.',
};
const BONUS = { 'Make it yours': 'Hacelo tuyo', 'Was, is, will be': 'Fue, es, será', 'The answer': 'La respuesta' };

function localize(root) {
  if (document.documentElement.lang !== 'es') return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits = [];
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const v = n.nodeValue, k = v.trim();
    if (!k) continue;
    if (FLAG[k]) hits.push([n, v.replace(k, FLAG[k])]);
    else if (k.includes(' · ')) {
      const en = Object.keys(BONUS).find((b) => k.endsWith(' · ' + b));
      if (en) hits.push([n, v.slice(0, v.lastIndexOf(en)) + BONUS[en]]);
    }
  }
  for (const [n, v] of hits) {
    n.nodeValue = v;
    const p = n.parentElement;
    if (p && p.getAttribute('lang') === 'en') p.setAttribute('lang', 'es');
  }
  root.querySelectorAll('[aria-label]').forEach((e) => { const v = FLAG[e.getAttribute('aria-label')]; if (v) e.setAttribute('aria-label', v); });
}

// ---------- drawn simply: the Sol de Mayo, the two flags ----------
const NS = 'http://www.w3.org/2000/svg';
function solSvg(cls = 'sol') {
  const P = (r, a) => `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
  let rays = '';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2, b = a + Math.PI / 16, d = 0.07;
    rays += `<polygon points="${P(21, a - d)} ${P(46, a)} ${P(21, a + d)}"/>`; // straight ray
    rays += `<path d="M${P(21, b - 0.05)} Q${P(28, b + 0.09)} ${P(32, b)} T${P(40, b)} Q${P(32, b + 0.02)} ${P(21, b + 0.05)}Z"/>`; // wavy ray
  }
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', '-50 -50 100 100'); s.setAttribute('class', cls); s.setAttribute('aria-hidden', 'true');
  s.innerHTML = `<g class="sol-rays">${rays}</g><circle r="20" class="sol-face"/>`
    + '<g class="sol-feat"><circle cx="-6.5" cy="-4" r="1.8"/><circle cx="6.5" cy="-4" r="1.8"/>'
    + '<path d="M0 -2 L-1.4 4 L1.4 4" fill="none"/><path d="M-6.5 8 Q0 12.5 6.5 8" fill="none"/></g>';
  return s;
}
const LEAF = 'M0,-9 L1.3,-6.2 L2.8,-7 L2.3,-3.2 L4.7,-5.6 L5.3,-4.2 L7.9,-4.8 L6.9,-2.1 L8.3,-1.4 L4.6,1.7 L5.2,3.1 L0.6,2.5 L0.7,6.4 L-0.7,6.4 L-0.6,2.5 L-5.2,3.1 L-4.6,1.7 L-8.3,-1.4 L-6.9,-2.1 L-7.9,-4.8 L-5.3,-4.2 L-4.7,-5.6 L-2.3,-3.2 L-2.8,-7 L-1.3,-6.2 Z';
function flags() {
  const f = document.createElement('span'); f.className = 'sabs-flags'; f.setAttribute('aria-hidden', 'true');
  const uy = document.createElement('span'); uy.className = 'flag uy'; uy.appendChild(solSvg('sol mini'));
  const ar = document.createElement('span'); ar.className = 'flag-arrow'; ar.textContent = '⇄';
  const ca = document.createElement('span'); ca.className = 'flag ca';
  const leaf = document.createElementNS(NS, 'svg'); leaf.setAttribute('viewBox', '-10 -10 20 18'); leaf.innerHTML = `<path d="${LEAF}"/>`;
  ca.appendChild(leaf);
  f.append(uy, ar, ca);
  return f;
}
const h = (tag, cls, ...kids) => { const e = document.createElement(tag); if (cls) e.className = cls; e.append(...kids.filter((k) => k !== null && k !== undefined)); return e; };

// ---------- the layer ----------
export function mount({ field, player, app }) {
  try {
    const root = document.documentElement;
    root.dataset.edition = 'sabs';
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = new URL('./sabs.css', import.meta.url).href;
    document.head.appendChild(css);
    const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', '#0a1a2e');

    // the sky over the field: celeste and white with the gold of the sun, under every feeling
    const setPalette = field.setPalette.bind(field);
    field.setPalette = (hues) => setPalette(hues && hues.length ? [...hues.slice(0, 4), CELESTE, SOL] : [CELESTE, BLANCO, CELESTE, BLANCO, SOL]);
    field.setPalette([]);

    // the candombe follows the heart: one beat of the cuerda per heartbeat of the field
    const drums = createCandombe({ ducked: () => player.playing });
    const setBpm = field.setBpm.bind(field);
    field.setBpm = (v) => { setBpm(v); drums.setBpm(v || 66); };

    // a small ribbon: who it's for, Uruguay ⇄ Canadá, and the drums on or off
    const toggle = h('button', 'sabs-drum', h('span', 'sabs-drum-dot'), 'Candombe');
    toggle.type = 'button'; toggle.setAttribute('aria-pressed', 'false');
    const syncToggle = () => toggle.setAttribute('aria-pressed', String(drums.on));
    toggle.addEventListener('click', () => { drums.toggle(); syncToggle(); });
    const ribbon = h('aside', 'sabs-ribbon', solSvg('sol tiny'), h('span', 'sabs-for', 'Para Sabs'), flags(), toggle);
    ribbon.setAttribute('aria-label', 'Edición uruguaya, para Sebastián');
    app.before(ribbon);

    // the dedication, first; its tap is also the one that lets the drums start
    const go = h('button', 'btn pri big sabs-go', 'Dale, tocá para empezar');
    go.type = 'button';
    const ded = h('section', 'sabs-ded',
      h('div', 'sabs-ded-in',
        solSvg('sol big'),
        h('p', 'kicker sabs-k', 'Edición uruguaya'),
        h('h1', 'sabs-h', 'Para Sebastián'),
        h('p', 'sabs-sub', 'un corazón uruguayo que creció en Canadá'),
        h('p', 'sabs-line', flags(), h('span', null, 'Montevideo ⇄ Mississauga · amigos desde gurises')),
        h('p', 'sabs-note', 'Abajo del amor suena un candombe —chico, repique y piano— al ritmo de tu corazón.'),
        go));
    ded.setAttribute('role', 'dialog'); ded.setAttribute('aria-modal', 'true'); ded.setAttribute('aria-labelledby', 'sabs-h');
    ded.querySelector('.sabs-h').id = 'sabs-h';
    document.body.appendChild(ded);
    document.body.classList.add('sabs-dedicating');
    setTimeout(() => { try { go.focus({ preventScroll: true }); } catch { /* ignore */ } }, 60);
    go.addEventListener('click', (e) => {
      drums.start(); syncToggle();
      try { field.burst(e.clientX || undefined, e.clientY || undefined, SOL, 1.2); player.bell(74, 0.07); setTimeout(() => player.bell(67, 0.06), 420); } catch { /* ignore */ }
      ded.classList.add('out'); document.body.classList.remove('sabs-dedicating');
      setTimeout(() => { ded.remove(); const w = app.querySelector('.word.on, .word, h1, h2'); if (w) try { w.focus({ preventScroll: true }); } catch { /* ignore */ } }, 700);
    });

    // every render: rioplatense for the flagship, the signature at the end, the footer line
    const firma = () => h('div', 'sabs-firma',
      h('p', 'sabs-firma-t', 'Te quiero, hermano.'),
      h('p', 'sabs-firma-j', '— Jason'),
      h('p', 'sabs-firma-f', flags(), h('span', null, 'Montevideo ⇄ Mississauga')));
    const pass = () => {
      localize(app);
      const card = app.querySelector('.result article.card, .shared article.card');
      if (card && !(card.nextElementSibling && card.nextElementSibling.classList.contains('sabs-firma'))) card.after(firma());
      const foot = app.querySelector('footer.foot');
      if (foot && !foot.querySelector('.sabs-foot')) foot.prepend(h('p', 'sabs-foot', solSvg('sol tiny'), 'Para Sebastián, un corazón uruguayo que creció en Canadá. Te quiero, hermano. — Jason'));
    };
    const mo = new MutationObserver(() => { mo.disconnect(); try { pass(); } catch { /* never break the studio */ } mo.observe(app, { childList: true, subtree: true }); });
    mo.observe(app, { childList: true, subtree: true });
    pass();
  } catch { /* the edition is a layer: if anything fails, the gift still works */ }
}
