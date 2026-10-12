/* ============================================================================
   dish.js — Sri Lankan Tamil chicken curry, Jaffna style.
   The content module for the Cultural Showcase Kit. Everything dish-specific
   lives here: the language strings, the vocabulary, the three movements' panel
   copy, the recipe, the order-game steps, and the three prop builders that put
   a Jaffna market, a clay chatti on the fire, and a Sunday table into the scene.

   All Tamil is [READER] — drafted from the brief, not yet signed off. The kit
   shows the [READER] markers only when the page is opened with ?review=1.

   To make another diaspora's showcase, copy this file and change the content
   and the three builders; the kit (../_kit/cultural-showcase.js) does not change.
   See state/metadax/cultural/SHOWCASE-KIT.md.
   ============================================================================ */
(function () {
  "use strict";

  /* ---- vocabulary (brief; all [READER]) ---------------------------------- */
  /* Content fix (iter 2): curry leaves — the leaf is kariveppilai (கறிவேப்பிலை);
     karivembu is the tree. The leaf's word is shown; both forms kept in the
     [READER] note on the vocab line and in the report. */
  var VOCAB = [
    { en: "chicken curry", scr: "கோழிக் கறி", tr: "kozhi kari" },
    { en: "country chicken", scr: "நாட்டுக் கோழி", tr: "nattu kozhi" },
    { en: "Jaffna curry powder", scr: "யாழ்ப்பாணக் கறித் தூள்", tr: "yaazhppaana kari thool" },
    { en: "coconut milk", scr: "தேங்காய்ப் பால்", tr: "thengai paal" },
    { en: "pandan leaf (rampe)", scr: "ரம்பா", tr: "rampa" },
    { en: "curry leaves", scr: "கறிவேப்பிலை", tr: "kariveppilai" },   /* leaf, not karivembu (the tree) */
    { en: "fenugreek", scr: "வெந்தயம்", tr: "vendhayam" },
    { en: "mustard seeds", scr: "கடுகு", tr: "kadugu" },
    { en: "string hoppers", scr: "இடியப்பம்", tr: "idiyappam" },
    { en: "rice", scr: "சோறு", tr: "soru" }
  ];

  /* ---- the dish object ---------------------------------------------------- */
  var DISH = {
    id: "tamil-chicken-curry",
    lang: { comm: "ta", commLabel: "தமிழ்", commClass: "ta" },
    /* the accent trio for this dish (the engine applies these to :root; the shared
       CSS carries clean paper/ink/rule defaults). chilli red is the single accent;
       turmeric is the streak + small highlights; curry-leaf green is the reader
       markers only. See state/metadax/cultural/SHOWCASE-KIT.md §5. */
    palette: { accent: "#c8371e", accent2: "#2f6b3a", turmeric: "#e0a81c" },
    vocab: VOCAB,

    /* environment map off: the dawn HDRI washed the flat-tinted scene out.
       The asset stays in assets/ (CC0, see LICENSES.md) for a later pass. */
    env: null,

    links: {
      player: "/metadax/play/?sample=tamil-chicken-curry",
      repo: "https://github.com/daxfoundation/metadax",
      sponsors: "https://github.com/sponsors/ObsidianDelta",
      kofi: "https://ko-fi.com/jeyanandan",
      maddie: "https://formaddie.com"
    },

    ui: {
      kicker: { en: "Showcase · One dish, its story", ta: "காட்சி · ஒரு உணவு, அதன் கதை" },
      title: { en: "Sri Lankan Tamil chicken curry, Jaffna style", ta: "யாழ்ப்பாணக் கோழிக் கறி" },
      sub: {
        en: "Where it comes from · How to make it · What it means. A Jaffna kitchen in three stations — the lesson is in the scene, not decorating it.",
        ta: "எங்கிருந்து வருகிறது · எப்படி சமைப்பது · என்ன அர்த்தம். மூன்று நிலையங்களில் ஒரு யாழ்ப்பாண சமையலறை."
      },
      face1: { en: "One showcase.", ta: "ஒரே ஒரு காட்சி." },
      face2: { en: "Everything on this page — the lesson, the game, the Tamil, the recipe card — came out of the open Meta DAX recipe, from a brief of eight lines. The brief is below.", ta: "இந்தப் பக்கத்தில் உள்ள அனைத்தும் — பாடம், விளையாட்டு, தமிழ், செய்முறை அட்டை — எட்டு வரிகள் கொண்ட ஒரு சுருக்கத்திலிருந்து, திறந்த Meta DAX செய்முறையிலிருந்து வந்தது. சுருக்கம் கீழே உள்ளது." },
      face3: { en: "Model-generated example, reviewed for safety and not certified. Read by someone from the community before it goes out." },
      langEnLabel: "English", langCommLabel: "தமிழ்",
      loading: { en: "setting the kitchen…", ta: "சமையலறையை அமைக்கிறது…" },
      flip: { en: "tap to flip", ta: "மாற்ற தட்டவும்" },
      openpkg: { en: "Open the plain package in the player", ta: "எளிய தொகுப்பைத் திறக்க" },
      openadult: { en: "The adult cook's page", ta: "முதல் முறை சமைப்பவர்" },
      opencard: { en: "The recipe card", ta: "செய்முறை அட்டை" },
      openabout: { en: "About", ta: "பற்றி" },
      nogl: {
        en: "The 3D kitchen doesn't show on this device. Every lesson, word and game below works the same without it.",
        ta: "இந்த சாதனத்தில் 3D சமையலறை தெரியாது. கீழே உள்ள எல்லா பாடமும் விளையாட்டும் அதுவே வேலை செய்யும்."
      },

      /* "What this shows" — the behind-the-scenes section the engine renders under the
         stations: eight concepts, each pointing at the thing on this page that proves it;
         then the brief verbatim (with a copy button); then the "send me a scenario" box.
         Headings and the section/box labels carry Tamil ([READER] in review); the bodies
         stay English on purpose (full-sentence community-language copy is the reader's). */
      shows: {
        kicker: { en: "Behind the scenes", ta: "திரைக்குப் பின்னால்" },
        h: { en: "What this shows", ta: "இந்தப் பக்கம் என்ன காட்டுகிறது" },
        intro: { en: "This page is one example of what the platform does with a very simple set of prompts. Eight things it shows, and where on this page each one is:" },
        concepts: [
          {
            h: { en: "The learner", ta: "கற்பவர்" },
            body: { en: "Nila (invented, and she says so), ten, speaks Tamil at home and cannot read it, loves cricket, loses the thread when the denominators are different. Her page is the game and the transliteration line." },
            links: [ { label: { en: "the kid's game, station 2" }, station: 1 }, { label: { en: "the words, station 3" }, station: 2 } ]
          },
          {
            h: { en: "The guide", ta: "வழிகாட்டி" },
            body: { en: "Her mother, at the kitchen table on a Sunday. The guide's page maps the misconceptions before the lesson, holds the check, and carries the safety line — knives, heat, allergens: the guide's call, every time. And the lead swings: Nila teaches her mother the toggle and the rules of cricket." },
            links: [ { label: { en: "the guide page" }, href: "#adult" } ]
          },
          {
            h: { en: "Same lesson, any skin", ta: "ஒரே பாடம், எந்த உருவிலும்" },
            body: { en: "Fractions, ratio, heat and time, taught through one chicken. The same recipe built a fractions stadium for an eleven-year-old who loves football." },
            links: [ { label: { en: "Le Stade des Fractions" }, href: "/metadax/samples/stade-des-fractions/" } ]
          },
          {
            h: { en: "Any language", ta: "எந்த மொழியிலும்" },
            body: { en: "Tamil and English on one click, with the sounds written out for a child who speaks but cannot yet read. Another language layer — Hindi, Arabic — is the same mechanism. To be plain: the shared player does English and French today; this page carries the Tamil itself; the player is being extended." },
            links: [ { label: { en: "the Tamil toggle" }, href: "#langtoggle" } ]
          },
          {
            h: { en: "Built from a brief, not by hand", ta: "கையால் அல்ல, சுருக்கத்திலிருந்து" },
            body: { en: "Everything here came out of the short brief below — eight lines. Nobody hand-built the outline, the lessons, the misconceptions, the game or this page." },
            links: [ { label: { en: "the brief" }, href: "#brief" } ]
          },
          {
            h: { en: "Checked by a person, not certified", ta: "ஒரு மனிதர் பார்க்கிறார், சான்றளிக்கப்படவில்லை" },
            body: { en: "A reader from the community reads every word before it goes out; the checker catches the rest; nothing here is <em>the</em> way." },
            links: [ { label: { en: "A way, never the way" }, href: "#about" } ]
          },
          {
            h: { en: "The record is open", ta: "பதிவு திறந்திருக்கிறது" },
            body: { en: "The recipe, this package and its history are public." },
            links: [ { label: { en: "github.com/daxfoundation/metadax" }, href: "https://github.com/daxfoundation/metadax" } ]
          },
          {
            h: { en: "One file, works offline", ta: "ஒரே கோப்பு, இணையமில்லாமல் வேலை செய்யும்" },
            body: { en: "The plain package is a single JSON file; it comes down whole and runs in the player without a connection. That is the five-minutes-a-day benchmark made concrete." },
            links: [ { label: { en: "Open the plain package in the player" }, href: "/metadax/play/?sample=tamil-chicken-curry" } ]
          }
        ],
        brief: {
          h: { en: "The brief, verbatim — eight lines", ta: "சுருக்கம், அப்படியே — எட்டு வரிகள்" },
          lines: [
            "Dish: my mother's chicken curry, Jaffna style, the way she makes it.",
            "Learner: a ten-year-old who speaks Tamil at home but can't read it, loves cricket, gets lost when the denominators are different.",
            "Guide: her mother, at the kitchen table, on a Sunday.",
            "Teach it through the dish: where it comes from, how to make it, what it means.",
            "Language: English, with Tamil on one click and the sounds written out.",
            "Three sessions of twenty minutes, or one afternoon cooking.",
            "Someone from the community reads it before it goes out.",
            "Make a guide page, a learner page and a recipe card."
          ],
          copy: { en: "Copy the brief", ta: "சுருக்கத்தை நகலெடு" },
          copied: { en: "Copied", ta: "நகலெடுக்கப்பட்டது" },
          after: { en: "Then the factory did the rest: an outline, the lessons, the misconceptions, the game, the package, the checker, this page." }
        },
        scenario: {
          h: { en: "Send me a scenario", ta: "எனக்கு ஒரு சூழ்நிலையை அனுப்புங்கள்" },
          body: { en: "A dish — or any subject — a learner and a guide, in three lines, and I will build it in the open, the way this one was built. Reply wherever you found this, or open an issue at <a href=\"https://github.com/daxfoundation/metadax/issues\">github.com/daxfoundation/metadax/issues</a>. The first ten." },
          extra: { en: "Or run the recipe yourself: the repository has the skill and the prompt; a paste-ready version for any chat is being finished." }
        }
      },

      adult: {
        kicker: { en: "The second cook · a 2D page" },
        h: { en: "Cooking it for the first time", ta: "முதல் முறையாக சமைத்தல்" },
        intro: { en: "This one guide page serves two cooks. The first is Nila, about ten, who gets the 3D scene and the game above — both invented for this showcase. The second is an adult cooking the curry for the first time, who wants the chemistry and the order laid out plainly. That cook is here, and is also invented. In Tamil mode this page shows Tamil script alone, without the sounding-out line." },
        c1: { en: "The chemistry, in three facts", ta: "வேதியியல், மூன்று உண்மைகள்" },
        facts: [
          { lead: { en: "Capsaicin." }, body: { en: "The chilli heat is a chemical, capsaicin, and it is fat-soluble. Coconut fat carries it off the tongue — which is why a spoon of coconut milk helps and a glass of water does not." } },
          { lead: { en: "The roast, already in the powder." }, body: { en: "Jason's mother buys the Jaffna curry powder from the Tamil shop — she does not roast her own. What that powder is, is dark-roasted spices, ground: coriander, cumin, fennel, fenugreek, pepper, dried chillies and curry leaves. Roasting them makes new aroma compounds — a chemical change, not just heating — which is why the powder tastes of the roast. The roasting happened at the mill, not on this stove." } },
          { lead: { en: "The emulsion." }, body: { en: "Coconut milk is fat held in water. A hard boil breaks it and the fat separates; a simmer holds it. That is why the milk goes in last and never boils hard." } }
        ],
        c2: { en: "Sequence and scaling", ta: "வரிசையும் அளவீடும்" },
        seq: { en: "Order against time: marinate the bird (about 20 minutes), temper, onions then garlic-ginger-chilli, the marinated bird in its own juices (no water), tomato paste once the base has softened, coconut milk last at a simmer. Scaling: the spice, salt and coconut scale with the bird; the pot and the clock do not — a deeper pot takes a little longer to come up to heat, but ten times the bird is not ten times the time. The heat sets the time, not the arithmetic." }
      },

      recipe: {
        kicker: { en: "The recipe card · print this" },
        h: { en: "There is no one chicken curry", ta: "ஒரே ஒரு கோழிக் கறி கிடையாது" },
        intro: { en: "The top half is the representative method. The bottom half is now \"Jason's family's version, as he tells it\" — from his call with his mother. A few amounts and timings are still open questions he is asking her; those lines read \"Jason is asking her\". Print with your browser." },
        slot: { en: "The family-version slot is a single file: <code>state/metadax/cultural/tamil-chicken-curry/family-version.json</code>. It now has content, so this card and the package show the worked family version in Jason's own words; the open questions stay marked until he has her answers." }
      },

      about: {
        /* The About is the why — the initiative, not a repeat of the concepts above.
           Cultural variant of ABOUT-BLOCK.md (about/v2): what universal learning is,
           the inversion, one line on the recipe, the formaddie thread, the reader line,
           how to support. The five-showcase list is gone — concept 3 and the showcases
           index carry that now. */
        h: { en: "The why", ta: "ஏன்" },
        paras: [
          /* what universal learning is — any human, any subject, any bandwidth; the benchmark */
          { en: "This is the DAX Foundation's universal learning initiative. The aim is plain: any human being, any subject, any domain, any bandwidth — a lesson made of the one thing the learner already cares about, built for the one person doing it. The benchmark we hold it to is a hard one: a person who can communicate, to the equivalent of a master's degree, on five minutes of connectivity a day. <b>A way, never the way.</b>" },
          /* the inversion — thirty roles behind one learner, a few of them shown on this page */
          { en: "It turns the old ratio inside out. Not thirty learners to one teacher, but thirty roles behind one learner — and this page already shows a few of them: the cook, the historian, the translator, the examiner, and the family at the table." },
          /* what the recipe does, in one line; one link to the showcases index (not the five-item list) */
          { en: "What the recipe does, in one line: take the one thing a learner cares about and build the whole lesson through it, for that one learner — then do it again for the next, each from a short brief. The other showcases are built the same way — <a href=\"/metadax/showcases/\">the showcases</a>." },
          /* the formaddie thread, as it is now */
          { en: "There is a thread here to a sister project, Maddie, at <a href=\"https://formaddie.com\">formaddie.com</a>: you talk, she listens, your stories become a book. Every family has a dish only one person makes properly; this package is what that telling becomes for the next generation — the dish turned into a lesson a child can learn and cook, in the family's own words." },
          /* the reader line */
          { en: "Nothing here is certified. A reader from the community reads every word before it goes out, and the checker catches the rest. Model-generated, reviewed for safety, read by a person." }
        ],
        help: {
          /* how to support — Ko-fi, GitHub Sponsors, the next package (no community names),
             send a scenario, say what broke */
          h: { en: "How to support it, and how to help", ta: "எப்படி ஆதரிப்பது, எப்படி உதவுவது" },
          items: [
            { en: "Keep it running on Ko-fi — <a href=\"https://ko-fi.com/jeyanandan\">ko-fi.com/jeyanandan</a>." },
            { en: "Or through GitHub Sponsors — <a href=\"https://github.com/sponsors/ObsidianDelta\">github.com/sponsors/ObsidianDelta</a>: keep the lights on, or back the next package." },
            { en: "Send a scenario — a learner, a guide, a thing they love — and it gets built in the open." },
            { en: "Run a skill and say what broke. The ways it fails are how it gets better." }
          ]
        }
      },

      footer: {
        way: { en: "A way, never the way.", ta: "ஒரு வழி, ஒருபோதும் தனி வழி அல்ல." },
        safety: { en: "Model-generated; reviewed for safety, not certified. Read by someone from the community before it goes out." },
        reader: { en: "Read by Jason Jeyanandan." },
        sponsor: { en: "Built with the community.", ta: "சமூகத்துடன் கட்டப்பட்டது." },
        byline: { en: "Published by Jason Jeyanandan through his cognitive companion, one unit." }
      }
    },

    /* ---- the three stations --------------------------------------------- */
    stations: [
      {
        id: "market",
        movement: { en: "Movement 1" },
        nav: { en: "Where it comes from — the market & the map", ta: "எங்கிருந்து வருகிறது — சந்தையும் வரைபடமும்" },
        cap: { en: "Station 1 — the island and the market: the land that gives the larder.", ta: "நிலையம் 1 — தீவும் சந்தையும்." },
        view: { target: [0, 0, 0], r: 34, phi: 0.72, theta: 0.6 },
        panel: [
          { type: "heading", text: { en: "Where it comes from", ta: "எங்கிருந்து வருகிறது" } },
          { type: "prose", text: { en: "This is the curry Jason's mother makes — chicken curry, she calls it, no Tamil name at home. She is from Jaffna, the dry northern peninsula of Sri Lanka, and learned it from her mother. The peninsula is hot and dry — limestone soil, coconut and palmyra everywhere, chillies dried in the sun, country chickens kept at the house. " + rdr() + " The land explains the larder: coconut in reach, spices that keep, and a lean bird that runs." } },
          { type: "prose", why: true, text: { en: "Back home it was their own chickens and a firewood stove, probably, and coconut scraped fresh; in Canada the ingredients were hard to find at first, and now the Tamil shops have everything. The wider history — the spice trade, Jaffna Tamil cooking as its own tradition, what the diaspora carried out and kept — is a longer story than this page tells. " + rdr() + " The largest Sri Lankan Tamil community outside Sri Lanka is in the Toronto area. " + rdr() } },
          { type: "sub", text: { en: "Which ingredient grows where?", ta: "எது எங்கிருந்து வருகிறது?" } },
          { type: "note", text: { en: "Tap an ingredient on the market row, then tap where it comes from. This is the universality move: your dish is one of a family — a slow-simmer cousin of adobo, stew, tagine and mole, on the coconut-milk belt beside Kerala, Thailand and the Philippines. " + rdr() } },
          { type: "origin", cfg: originCfg() },
          { type: "vocab", ref: ["chicken curry", "country chicken", "Jaffna curry powder", "coconut milk"] }
        ],
        build: buildMarket
      },
      {
        id: "kitchen",
        movement: { en: "Movement 2" },
        fire: true,
        nav: { en: "How to make it — the chatti on the fire", ta: "எப்படி சமைப்பது — நெருப்பில் சட்டி" },
        cap: { en: "Station 2 — the clay chatti on the fire: temper, onions, the bird in its own juices, tomato, coconut milk last.", ta: "நிலையம் 2 — நெருப்பில் களிமண் சட்டி." },
        view: { target: [0, 2.2, 0], r: 15, phi: 0.92, theta: 0.5 },
        panel: [
          { type: "heading", text: { en: "How to make it", ta: "எப்படி சமைப்பது" } },
          { type: "prose", text: { en: "In the clay chatti, the way Jason's mother makes it: marinate the cut bird — skin on, bone in — about twenty minutes in salt, pepper, store-bought Jaffna curry powder and extra chilli. Temper the whole spices in hot coconut oil — fenugreek, mustard seeds, curry leaves, cinnamon — then the onions cut long, the garlic and ginger, a little rampe and star anise. In goes the marinated bird; it cooks in its own juices, <b>no water</b>. Tomato paste once the base has softened, and the coconut milk <b>last</b>, to taste — more for the white curry, less for the red — never a hard boil." } },
          { type: "sub", text: { en: "The order game — build a streak", ta: "வரிசை விளையாட்டு" } },
          { type: "note", streak: true, streakLabel: { en: "Streak:", ta: "தொடர்:" }, text: { en: "Tap the steps in order and each one drops into the pot. Every wrong tap names the slip." } },
          { type: "order", cfg: orderCfg() },
          { type: "sub", text: { en: "Keep the pot right", ta: "சட்டியை சரியாக வைத்திரு" } },
          { type: "note", text: { en: "Coconut milk is an emulsion — fat held in water. Drag the heat. A hard boil splits it; a simmer holds it. Watch the pot." } },
          { type: "heat", cfg: heatCfg(), start: 30 }
        ],
        build: buildKitchen
      },
      {
        id: "table",
        movement: { en: "Movement 3" },
        nav: { en: "What it means — the table", ta: "என்ன அர்த்தம் — மேசை" },
        cap: { en: "Station 3 — the table: the curry with rice, and the words the family uses.", ta: "நிலையம் 3 — மேசை." },
        view: { target: [0, 1.0, 0], r: 16, phi: 0.95, theta: 0.9 },
        panel: [
          { type: "heading", text: { en: "What it means", ta: "என்ன அர்த்தம்" } },
          { type: "prose", text: { en: "It is Jason's mother's go-to dish — the one people always enjoy at family dinners, and she is the one who makes it properly; Jason has not learned it yet. “We always entertain with food,” he says; “it’s central to our culture. People always come and eat.” For Jason, the way he likes it is the way she makes it: spicy and oily. This curry, for him, will always be his mother. The kitchen and the table are taught here; the faith is not." } },
          { type: "prose", text: { en: "There is no one chicken curry. Jason's family's own version is on the recipe card below — his mother makes it properly, and the one thing she does that no recipe says is the simplest: no water. The bird makes its own gravy, and how much coconut milk goes in at the end is the whole difference between the two curries the family knows — more for the white, less for the red." } },
          { type: "sub", text: { en: "The words the family uses", ta: "குடும்பம் பயன்படுத்தும் சொற்கள்" } },
          { type: "note", text: { en: "Tamil script, with the sound written out for a child who speaks Tamil but cannot yet read it. Every word is " + rdr() + ". Tap a word on the table, or in the list, to flip between the script, the sound, and the English." } },
          { type: "vocab", ref: "all" }
        ],
        build: buildTable
      }
    ],

    recipe: renderRecipe
  };

  /* small helper so [READER] appears in copy; the kit's CSS hides it unless review mode */
  function rdr() { return '<span class="reader">[READER]</span>'; }

  /* ---- interaction configs -------------------------------------------- */
  function originCfg() {
    var destLabels = { land: { en: "Jaffna (dry peninsula)", ta: "யாழ்ப்பாணம்" }, fam: { en: "a whole family of dishes", ta: "ஒரு உணவுக் குடும்பம்" } };
    return {
      items: [
        { name: { en: "coconut" }, key: "coconut", dest: "land", lift: true },
        { name: { en: "dried red chillies" }, key: "chillies", dest: "land", lift: true },
        { name: { en: "country chicken" }, key: "chicken", dest: "land", lift: true },
        { name: { en: "the slow-simmer move" }, key: "simmer", dest: "fam" },
        { name: { en: "the coconut-milk belt" }, key: "belt", dest: "fam" }
      ],
      dests: [{ label: destLabels.land, key: "land" }, { label: destLabels.fam, key: "fam" }],
      familyKey: "fam",
      prompt: { en: "Now tap where it comes from.", ta: "இப்போது எங்கிருந்து என்று தட்டவும்." },
      pickFirst: { en: "Pick an ingredient first." },
      right: { en: "Yes — {name}: {place}." },
      wrong: { en: "Not there. {name} belongs to: {place}." },
      landNote: { en: "The land gives the larder." },
      familyNote: { en: "Your dish is a relative of many, not an exception." },
      destLabel: function (key) { return destLabels[key] || { en: key }; }
    };
  }
  function orderCfg() {
    return {
      steps: [
        { id: "temper", n: 1, effect: "temper", label: { en: "temper (hot coconut oil, you own it)", ta: "தாளிப்பு" } },
        { id: "onions", n: 2, effect: "onions", label: { en: "onions, cut long", ta: "வெங்காயம்" } },
        { id: "aromatics", n: 3, effect: "aromatics", label: { en: "garlic, ginger, green chilli", ta: "பூண்டு, இஞ்சி, பச்சை மிளகாய்" } },
        { id: "bird", n: 4, effect: "bird", label: { en: "the marinated bird", ta: "ஊறவைத்த கோழி" } },
        { id: "tomato", n: 5, effect: "tomato", label: { en: "tomato paste", ta: "தக்காளி" } },
        { id: "coconut", n: 6, effect: "coconut", label: { en: "coconut milk — last", ta: "தேங்காய்ப் பால் — கடைசியாக" } }
      ],
      okMsg: { en: "Yes." },
      doneMsg: { en: "That's the order: temper, onions, garlic-ginger-chilli, the bird, tomato paste, coconut milk last." },
      alreadyMsg: { en: "That step already went in — late is not early, but this one was earlier." },
      notYetMsg: { en: "Not yet — {step} goes in first. The coconut milk is always last." }
    };
  }
  function heatCfg() {
    return {
      splitAt: 60,
      holdWord: { en: "simmer — holds", ta: "கொதிக்கும் முன் — பிடிக்கும்" },
      splitWord: { en: "hard boil — splits", ta: "கடுங்கொதி — உடையும்" },
      holdMsg: { en: "The emulsion holds. Coconut milk goes in late and stays here." },
      splitMsg: { en: "Too hot — the fat separates and the sauce turns grainy and oily. A hard boil splits the emulsion." }
    };
  }

  /* ---- the recipe card text ------------------------------------------- */
  function renderRecipe(o) {
    var R = o && o.REVIEW, m = R ? "   [READER]" : "";
    /* an open question Jason is asking his mother: reads "(Jason is asking her)"
       in public, and carries the [READER] marker in review mode */
    var ask = R ? "(Jason is asking her)   [READER]" : "(Jason is asking her)";
    return [
      "ONE DISH, ITS STORY — SRI LANKAN TAMIL CHICKEN CURRY, JAFFNA STYLE",
      "chicken curry — kozhi kari (கோழிக் கறி)" + m,
      "",
      "THE REPRESENTATIVE METHOD      Serves 4",
      "Jaffna curry powder is store-bought (from the Tamil shop). What it is made of,",
      "  dark-roasted & ground: coriander · cumin · fennel · fenugreek · black pepper",
      "  · dried red chillies · curry leaves (kariveppilai)" + m,
      "Marinate (about 20 min): bone-in, skin-on chicken + salt + pepper + curry powder",
      "  + chilli powder (chilli is separate from the curry powder; this is a spicy curry)",
      "Temper (hot coconut oil): fenugreek seed · mustard seeds (kadugu) · curry leaves · cinnamon",
      "Aromatics: onion (cut long) · garlic · ginger · green chilli (sometimes) · rampe (pandan)",
      "  · a little star anise",
      "Bird: whole bone-in country chicken (nattu kozhi), cut up, skin on — one bird feeds four",
      "No water — the bird makes its own gravy.",
      "Tomato: as paste, once the base has softened",
      "Coconut milk: at the end, to taste — more = white curry, less = red; never a hard boil",
      "Steps: 1 marinate  2 temper  3 onions  4 garlic, ginger, green chilli  5 the bird (no water)",
      "       6 tomato paste  7 coconut milk LAST, simmer, never a hard boil",
      "Serve with: rice / string hoppers (idiyappam) / pittu / bread" + m,
      "",
      "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -",
      "JASON'S FAMILY'S VERSION, AS HE TELLS IT",
      "  (from his call with his mother — names here are Jason and his mother only)",
      "What they call it: chicken curry (no Tamil name at home).",
      "Who makes it properly: his mother.    Who taught her: her mother.    Serves: about 4.",
      "The bird: a whole mature / stewing chicken (nattu kozhi), cut up, bone in and skin on.",
      "  The bones carry the flavour; the skin makes it richer.",
      "The powder: store-bought Jaffna curry powder; chilli separate; roughly 2–3 tbsp per bird " + ask,
      "The temper: fenugreek, mustard seeds, curry leaves, cinnamon, in hot coconut oil.",
      "Beyond the powder: crushed ginger & garlic, rampe, a little star anise.  Bay leaf? " + ask,
      "The order: temper → onions → garlic, ginger, green chilli → the marinated bird → tomato paste → coconut milk last.",
      "The one thing we do that no recipe says: no water — the bird makes its own gravy. More",
      "  coconut milk makes the white curry; less keeps it the red one.",
      "When the tomato paste goes in: " + ask,
      "Her words for 'never a hard boil' after the coconut milk: " + ask,
      "Overall time: " + ask,
      "We eat it with: rice / string hoppers (idiyappam) / pittu / bread.",
      "",
      "A way, never the way. Read by someone from the community before it goes out."
    ].join("\n");
  }

  /* =======================================================================
     PROP BUILDERS — the 3D for each station. Each receives (group, K) where K
     is the kit toolbox, and returns { labels, picks, api, anim }.
     ======================================================================= */

  /* ---- palette + low-poly helpers --------------------------------------
     One flat palette for the whole scene — warm earth, clay, palm green,
     chilli red, sea teal. The art-direction pass dropped the canvas-noise
     textures entirely: loaded CC0 models carry their own flat materials, and
     every hand-built prop uses a solid palette colour, so a primitive never
     sits next to a textured surface. */
  var PAL = {
    clay: 0xb5673a, clayRim: 0xc8824e, clayDark: 0x8a4a28,
    earth: 0x7a5a3c, earthDark: 0x4a3420,
    wood: 0x9c6f3e, woodDark: 0x6b4a28,
    palm: 0x3f7d3a, palmDark: 0x2f5f2c,
    chilli: 0xc8371e, chilliDark: 0x9a2314,
    sea: 0x2f8a8f, seaDeep: 0x1f6b70, sand: 0xd8c38a,
    turmeric: 0xe0a81c, onion: 0xcf9a5a, tomato: 0xc0392b,
    rice: 0xf3eeda, milk: 0xf6f0e2, curry: 0xbe5a2c,
    stone: 0x8a8078, cloth: 0xc8431f, clothStripe: 0xf2d9a0,
    base: 0x7a5636, baseRim: 0x5a3f22, leaf: 0x2f7a32, plaster: 0xcbb89a,
    outline: 0x241812, sky: 0x9fd0e6
  };
  var OUTLINE = { color: PAL.outline, thickness: 0.05 };

  /* The Kenney kits colour their models from a shared Textures/colormap.png
     that differs per kit; rather than ship three clashing colormaps, every
     loaded model is painted one flat palette colour, so the whole scene reads
     as one stylised look. Keyed by the GLB's basename. */
  var TINT = {
    "grass": PAL.palm, "coconut": PAL.woodDark, "coconut-half": PAL.wood,
    "hearth-stones": PAL.stone, "firewood": PAL.woodDark,
    "chatti-pot": PAL.clay, "chatti-lid": PAL.clayRim,
    "mortar": PAL.stone, "board": PAL.wood, "knife": 0xb9b6ae,
    "oil-bottle": 0xe6d7a8, "onion": PAL.onion, "tomato": PAL.tomato,
    "bowl": PAL.clay, "plate": 0xece4cf, "chair": PAL.wood, "table": PAL.wood
  };

  /* a flat-shaded standard material in one line */
  function fmat(K, c, rough) { return K.mat(c, { roughness: rough == null ? 0.82 : rough, metalness: 0.02 }); }

  /* a round diorama base with a raised rim — the little stage each station sits
     on. Flagged _noFit so the camera frames the props, not the plinth. */
  function dioramaBase(g, K, radius, y, color) {
    var T = K.THREE, yy = y || 0;
    var disc = new T.Mesh(new T.CylinderGeometry(radius, radius * 0.97, 0.6, 56), fmat(K, color || PAL.base, 0.95));
    disc.position.y = yy - 0.3; disc.receiveShadow = true; disc._noFit = true; g.add(disc);
    var rim = new T.Mesh(new T.TorusGeometry(radius, 0.14, 12, 72), fmat(K, PAL.baseRim, 0.8));
    rim.rotation.x = Math.PI / 2; rim.position.y = yy; rim.receiveShadow = true; rim._noFit = true; g.add(rim);
    return disc;
  }

  /* place a CC0 GLB at a spot with a hand-built fallback under it. Non-blocking:
     the fallback shows at once; the model swaps in when it arrives, or the
     fallback simply stays if the load fails. Returns the holder group. opts:
       pos [x,y,z], rotY, size (target max dimension), sizeY (target height),
       anchor "base"|"center" (default base), outline (bool | {color,thickness}),
       fallback fn(), onReady fn(model, holder), pick fn, noFit bool. */
  function model(g, K, url, opts) {
    opts = opts || {};
    var T = K.THREE, holder = new T.Group();
    if (opts.pos) holder.position.set(opts.pos[0], opts.pos[1], opts.pos[2]);
    if (opts.rotY != null) holder.rotation.y = opts.rotY;
    if (opts.noFit) holder._noFit = true;
    g.add(holder);
    var fb = opts.fallback ? opts.fallback() : null;
    if (fb) holder.add(fb);
    if (opts.pick) holder._pick = opts.pick;
    K.loadModel(url, {}, function (m) {
      if (!m) return;                                   /* load failed — fallback stays */
      var base = String(url).split("/").pop().replace(/\.glb$/, "");
      if (opts._tint == null && TINT[base] != null) opts._tint = TINT[base];
      normalizeModel(m, opts, T);
      if (opts.outline !== false) K.outline(m, typeof opts.outline === "object" ? opts.outline : OUTLINE);
      if (fb && fb.parent) fb.parent.remove(fb);
      holder.add(m);
      if (opts.onReady) try { opts.onReady(m, holder); } catch (e) {}
    });
    return holder;
  }

  /* scale a loaded model to a target size, sit it on y=0 (or centre it),
     centred on x/z, shadows on, a gentle env response for the stylised look. */
  function normalizeModel(m, opts, T) {
    m.traverse(function (n) {
      if (n.isMesh) {
        n.castShadow = true; n.receiveShadow = true;
        var mm = n.material ? (n.material.length ? n.material : [n.material]) : [];
        mm.forEach(function (x) {
          if (!x) return;
          if (opts._tint != null && x.color) { if (x.map) { x.map = null; } x.color.setHex(opts._tint); x.needsUpdate = true; }
          if (x.isMeshStandardMaterial) { x.envMapIntensity = 0.5; x.roughness = Math.max(x.roughness || 0, 0.7); if (x.metalness > 0.2) x.metalness = 0.1; }
        });
      }
    });
    m.updateWorldMatrix(true, true);
    var box = new T.Box3().setFromObject(m), size = new T.Vector3(), center = new T.Vector3();
    box.getSize(size); box.getCenter(center);
    var s = 1;
    if (opts.sizeY) s = opts.sizeY / (size.y || 1);
    else if (opts.size) s = opts.size / (Math.max(size.x, size.y, size.z) || 1);
    m.scale.setScalar(s);
    m.position.x = -center.x * s; m.position.z = -center.z * s;
    m.position.y = opts.anchor === "center" ? -center.y * s : -box.min.y * s;
  }

  /* a hand-built country hen in the flat low-poly style — no CC0 hen read right,
     so it is built here to match the loaded props. Returns a Group; y sets the
     body height so it sits in the market basket. */
  function makeHen(T, K, color, y) {
    var hen = new T.Group(); hen.position.y = y || 1.2;
    var bodyMat = fmat(K, color || 0xcaa36a, 0.75);
    var body = new T.Mesh(new T.SphereGeometry(0.42, 18, 14), bodyMat); body.scale.set(1.35, 1.0, 1.0); body.castShadow = true; hen.add(body);
    var tail = new T.Mesh(new T.ConeGeometry(0.28, 0.6, 10), bodyMat); tail.position.set(-0.5, 0.2, 0); tail.rotation.z = -0.9; tail.castShadow = true; hen.add(tail);
    var neck = new T.Mesh(new T.CylinderGeometry(0.14, 0.2, 0.4, 10), bodyMat); neck.position.set(0.42, 0.28, 0); neck.rotation.z = -0.4; hen.add(neck);
    var head = new T.Mesh(new T.SphereGeometry(0.2, 14, 12), bodyMat); head.position.set(0.55, 0.5, 0); head.castShadow = true; hen.add(head);
    var beak = new T.Mesh(new T.ConeGeometry(0.07, 0.2, 8), fmat(K, PAL.turmeric, 0.6)); beak.position.set(0.74, 0.48, 0); beak.rotation.z = -Math.PI / 2; hen.add(beak);
    var comb = new T.Mesh(new T.SphereGeometry(0.1, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), fmat(K, PAL.chilli, 0.6)); comb.position.set(0.55, 0.68, 0); comb.scale.set(1.4, 1, 0.5); hen.add(comb);
    var wattle = new T.Mesh(new T.SphereGeometry(0.06, 8, 6), fmat(K, PAL.chilli, 0.6)); wattle.position.set(0.68, 0.36, 0); hen.add(wattle);
    [0.2, -0.2].forEach(function (pz) { var leg = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 0.4, 6), fmat(K, PAL.turmeric, 0.6)); leg.position.set(0.12, -0.34, pz); hen.add(leg); });
    return hen;
  }

  function buildMarket(g, K) {
    var T = K.THREE, labels = [], picks = [], tweens = [];

    /* the station diorama: a teal sea disc with a rim, a pale sand shoal */
    dioramaBase(g, K, 27, -0.5, PAL.seaDeep);
    var sea = new T.Mesh(new T.CircleGeometry(26, 56), fmat(K, PAL.sea, 0.4));
    sea.rotation.x = -Math.PI / 2; sea.position.y = -0.4; sea.receiveShadow = true; sea._noFit = true; g.add(sea);
    var sand = new T.Mesh(new T.CircleGeometry(10.5, 56), fmat(K, PAL.sand, 1));
    sand.rotation.x = -Math.PI / 2; sand.position.y = -0.36; sand.scale.set(0.95, 1.1, 1); sand.receiveShadow = true; g.add(sand);

    /* Sri Lanka — an extruded teardrop with a cleaner coastline, one flat earth
       colour (the noise map is gone), Jaffna at the north (−Z) */
    var pts = [[0, 9], [1.0, 8.2], [1.7, 6.4], [2.8, 4.6], [3.4, 2], [3.2, -1.6], [2.3, -4.2], [1.0, -5.6], [0, -6], [-1.0, -5.6], [-2.3, -4.2], [-3.2, -1.6], [-3.4, 2], [-2.8, 4.6], [-1.7, 6.4], [-1.0, 8.2]];
    var shp = new T.Shape();
    pts.forEach(function (p, i) { if (i === 0) shp.moveTo(p[0], p[1]); else shp.lineTo(p[0], p[1]); });
    shp.closePath();
    var island = new T.Mesh(new T.ExtrudeGeometry(shp, { depth: 0.7, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.3, bevelSegments: 2 }),
      fmat(K, PAL.earth, 0.95));
    island.rotation.x = -Math.PI / 2; island.position.y = -0.3; island.scale.set(0.95, 0.95, 1);
    island.castShadow = true; island.receiveShadow = true; g.add(island);

    /* a few palm-green tufts on the island so the land reads as land (CC0 grass,
       hand-built cone fallback). Kept out of the camera fit — they are dressing. */
    [[1.4, -1.5], [-1.6, -0.5], [0.6, 2.2], [-0.8, 3.0], [2.0, 0.6]].forEach(function (p) {
      model(g, K, "./assets/grass.glb", {
        pos: [p[0], 0.05, p[1]], size: 1.2, noFit: true, outline: false,
        fallback: function () { var m = new T.Mesh(new T.ConeGeometry(0.35, 0.9, 6), fmat(K, PAL.palm)); m.position.y = 0.45; m.castShadow = true; return m; }
      });
    });

    /* Jaffna peninsula — a lifted, lit nub at the north */
    var jaffna = new T.Mesh(new T.CylinderGeometry(1.4, 1.9, 1.1, 6), fmat(K, PAL.sand, 0.9));
    jaffna.position.set(0, 0.5, -7.3); jaffna.castShadow = true; g.add(jaffna);
    var spot = new T.SpotLight(0xffe4b0, 1.3, 20, 0.6, 0.5); spot.position.set(0, 9, -7); spot.target = jaffna; g.add(spot); g.add(spot.target);
    labels.push({ obj: jaffna, offset: [0, 1.6, 0], slot: "above", text: { en: "Jaffna", ta: "யாழ்ப்பாணம்" } });

    /* diaspora arc — Jaffna out to a small Toronto marker */
    var toronto = new T.Mesh(new T.SphereGeometry(0.5, 16, 12), new T.MeshStandardMaterial({ color: 0xd94f4f, emissive: 0x551010, roughness: 0.5 }));
    toronto.position.set(-13, 2.2, -12); g.add(toronto);
    var curve = new T.QuadraticBezierCurve3(new T.Vector3(0, 1, -7.3), new T.Vector3(-7, 9, -10), new T.Vector3(-13, 2.2, -12));
    var arc = new T.Mesh(new T.TubeGeometry(curve, 40, 0.09, 8, false), new T.MeshStandardMaterial({ color: PAL.turmeric, emissive: 0x3a2800, roughness: 0.5 }));
    g.add(arc);
    labels.push({ obj: toronto, offset: [0, 1.0, 0], slot: "left", cls: "lead", text: { en: "Toronto — the diaspora line", ta: "டொரொன்டோ — புலம்பெயர் கோடு" }, reader: true });

    /* market row — four stalls, each a canopy on posts with a basket; each tappable.
       The coconut stall carries the one CC0 model used here; chillies, the spice
       tray and the hen are hand-built in the same flat low-poly style. */
    var stallSpecs = [
      { key: "coconut", x: 7.5, z: 6, cloth: 0xcf8a3a, name: { en: "coconuts", ta: "தேங்காய்" }, mound: 0x8a6b3a, kind: "balls" },
      { key: "chillies", x: 3, z: 8.5, cloth: PAL.chilli, name: { en: "chillies, sun-dried", ta: "மிளகாய்" }, mound: PAL.chilliDark, kind: "cone" },
      { key: "spices", x: -3, z: 8.5, cloth: 0x9a6b2f, name: { en: "the spice tray", ta: "மசாலா" }, mound: 0x9a6b2f, kind: "tray" },
      { key: "chicken", x: -7.5, z: 6, cloth: 0xd8c08a, name: { en: "country hen", ta: "நாட்டுக் கோழி" }, mound: 0xcaa36a, kind: "hen" }
    ];
    var stallByKey = {};
    stallSpecs.forEach(function (s) {
      var st = new T.Group(); st.position.set(s.x, 0, s.z);
      /* two posts + a canopy */
      [-0.9, 0.9].forEach(function (px) { var p = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 1.8, 6), fmat(K, PAL.woodDark)); p.position.set(px, 0.9, 0); p.castShadow = true; st.add(p); });
      var canopy = new T.Mesh(new T.BoxGeometry(2.4, 0.12, 1.4), fmat(K, s.cloth, 0.9)); canopy.position.y = 1.85; canopy.castShadow = true; st.add(canopy);
      var table = new T.Mesh(new T.BoxGeometry(2.2, 0.12, 1.2), fmat(K, PAL.wood, 0.8)); table.position.y = 0.8; table.castShadow = true; table.receiveShadow = true; st.add(table);
      var basket = new T.Mesh(new T.CylinderGeometry(0.92, 0.78, 0.5, 20), fmat(K, 0xb98b50, 0.95)); basket.position.y = 1.1; basket.castShadow = true; st.add(basket);
      if (s.kind === "balls") {
        /* CC0 coconuts in the basket, each with a sphere fallback */
        [[-0.4, -0.2], [0.25, -0.15], [-0.1, 0.3], [0.45, 0.35], [0.05, -0.4]].forEach(function (p, i) {
          model(st, K, "./assets/coconut.glb", {
            pos: [p[0], 1.28, p[1]], size: 0.62, rotY: i * 1.3,
            fallback: function () { var c = new T.Mesh(new T.SphereGeometry(0.28, 14, 10), fmat(K, s.mound)); c.position.y = 0.28; c.castShadow = true; return c; }
          });
        });
      }
      else if (s.kind === "cone") {
        var m = new T.Mesh(new T.ConeGeometry(0.7, 0.7, 20), fmat(K, s.mound)); m.position.y = 1.5; m.castShadow = true; st.add(m);
        /* strings of chillies hung from the canopy to dry */
        var chMat = fmat(K, PAL.chilliDark, 0.6);
        [-0.9, -0.45, 0, 0.45, 0.9].forEach(function (hx, hi) { for (var k = 0; k < 4; k++) { var ch = new T.Mesh(new T.ConeGeometry(0.05, 0.3, 6), chMat); ch.position.set(hx, 1.75 - k * 0.22, 0.75); ch.rotation.x = 0.4 + (hi % 2) * 0.2; st.add(ch); } });
      }
      else if (s.kind === "tray") { var tray = new T.Mesh(new T.BoxGeometry(1.8, 0.1, 1.0), fmat(K, PAL.baseRim)); tray.position.y = 0.92; st.add(tray); [0xb5651d, PAL.chilli, PAL.turmeric, 0x6b8e23].forEach(function (cc, i) { var mm = new T.Mesh(new T.ConeGeometry(0.22, 0.3, 14), fmat(K, cc)); mm.position.set(-0.6 + i * 0.4, 1.1, 0); mm.castShadow = true; st.add(mm); }); }
      else if (s.kind === "hen") { st.add(makeHen(T, K, s.mound, 1.15)); }
      st._baseY = 0;
      g.add(st); stallByKey[s.key] = st;
      picks.push({ obj: st }); st._pick = (function (key) { return function () { lift(key); }; })(s.key);
      labels.push({ obj: st, offset: [0, 2.3, 0], slot: s.x >= 0 ? "right" : "left", cls: "tap", text: s.name, tap: (function (key) { return function () { lift(key); }; })(s.key) });
    });

    labels.push({ obj: { position: new T.Vector3(0, 0, 0) }, offset: [0, 5.5, 0], slot: "above", text: { en: "the land gives the larder", ta: "நிலம் சரக்கறையைத் தருகிறது" } });

    /* ghost ring of relatives — rises when the learner picks "a whole family of dishes" */
    var ghostRing = new T.Group(); ghostRing.visible = false; ghostRing._noFit = true; g.add(ghostRing);
    var rels = [{ en: "tagine" }, { en: "adobo" }, { en: "moqueca" }, { en: "mole" }, { en: "kari" }];
    var ghostMat = new T.MeshBasicMaterial({ color: 0x9fe0c0, wireframe: true, transparent: true, opacity: 0.6 });
    rels.forEach(function (r, i) {
      var a = i / rels.length * Math.PI * 2, R = 4.5;
      var pot = new T.Mesh(new T.CylinderGeometry(0.7, 0.5, 0.8, 16), ghostMat);
      pot.position.set(Math.cos(a) * R, 1.2, Math.sin(a) * R + 2); ghostRing.add(pot);
      labels.push({ obj: pot, offset: [0, 1.0, 0], slot: "above", cls: "lead hidden-rel", text: r, _ring: true });
    });

    function lift(key) {
      var st = stallByKey[key]; if (!st) return;
      tweens.push({ t: 0, dur: 0.6, obj: st, from: 0, to: 1.1 });
    }
    function flyTo(key, destKey) {
      if (destKey === "fam") { ghostRing.visible = true; ghostRing._spin = true; }
      else { lift(key); }
    }

    function anim() {
      /* lift tweens (a ping-up-and-settle) */
      for (var i = tweens.length - 1; i >= 0; i--) {
        var tw = tweens[i]; tw.t += 1 / 60; var k = Math.min(1, tw.t / tw.dur);
        tw.obj.position.y = tw.obj._baseY + Math.sin(k * Math.PI) * tw.to;
        if (k >= 1) { tw.obj.position.y = tw.obj._baseY; tweens.splice(i, 1); }
      }
      if (ghostRing._spin) ghostRing.rotation.y += 0.004;
    }

    /* ring labels start hidden; show with the ghost ring */
    return { labels: labels, picks: picks, anim: anim, api: { lift: lift, flyTo: flyTo } };
  }

  function buildKitchen(g, K) {
    var T = K.THREE, labels = [], picks = [];
    var heat = 0.3, flames = [], smoke = [], bubbles = [], drops = [], sparks = [];

    /* the chatti is a wide, shallow clay pot (the CC0 model), so the sauce surface
       and every particle effect hang off these two numbers rather than fixed heights:
       mouthY is where the sauce sits, mouthR its radius inside the rim. */
    var potBaseY = 0.45, potH = 2.1, mouthY = 2.3, mouthR = 1.45, dropStart = mouthY + 4;

    /* round earth-floor diorama with a rim, and two low plastered walls behind */
    dioramaBase(g, K, 10.5, -0.5, PAL.earth);
    var wallMat = fmat(K, PAL.plaster, 1);
    var wallA = new T.Mesh(new T.BoxGeometry(16, 3.2, 0.4), wallMat); wallA.position.set(0, 1.1, -6.5); wallA.receiveShadow = true; wallA._noFit = true; g.add(wallA);
    var wallB = new T.Mesh(new T.BoxGeometry(0.4, 3.2, 13), wallMat); wallB.position.set(-7.5, 1.1, 0); wallB.receiveShadow = true; wallB._noFit = true; g.add(wallB);

    /* the hearth — a CC0 ring of stones with firewood, fallback to chunky dodecahedra */
    model(g, K, "./assets/hearth-stones.glb", {
      pos: [0, -0.02, 0], size: 4.6,
      fallback: function () { var grp = new T.Group(); for (var s = 0; s < 6; s++) { var a = s / 6 * Math.PI * 2; var stone = new T.Mesh(new T.DodecahedronGeometry(0.55, 0), fmat(K, PAL.stone, 0.95)); stone.position.set(Math.cos(a) * 2.2, 0.3, Math.sin(a) * 2.2); stone.castShadow = true; stone.receiveShadow = true; grp.add(stone); } return grp; }
    });
    [[0.3, 1.5, 0.5], [-1.1, -0.6, -0.4]].forEach(function (p) {
      model(g, K, "./assets/firewood.glb", {
        pos: [p[0], 0.05, p[1]], size: 2.0, rotY: p[2],
        fallback: function () { var log = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 2.0, 8), fmat(K, PAL.woodDark, 0.85)); log.rotation.z = Math.PI / 2; log.rotation.y = p[2]; return log; }
      });
    });

    /* animated flames licking up around the pot base (scaled cones flickering) */
    var flameMat = new T.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false });
    var NF = K.coarse ? 5 : 9;                         /* fewer flames on coarse pointers */
    for (var f = 0; f < NF; f++) {
      var fl = new T.Mesh(new T.ConeGeometry(0.3, 1.4, 7), f % 2 ? flameMat : new T.MeshBasicMaterial({ color: 0xffc23a, transparent: true, opacity: 0.85, blending: T.AdditiveBlending, depthWrite: false }));
      var aa = f / NF * Math.PI * 2; fl.position.set(Math.cos(aa) * 1.0, 0.4, Math.sin(aa) * 1.0);
      fl._ph = f; fl._base = 0.4; fl._noFit = true; flames.push(fl); g.add(fl);
    }
    /* smoke particles */
    var smokeGeo = new T.BufferGeometry(), smp = [], NSM = K.coarse ? 18 : 40;
    for (var sm = 0; sm < NSM; sm++) { smp.push((Math.sin(sm) * 0.6), 1.5 + (sm % 10) * 0.3, (Math.cos(sm) * 0.6)); }
    smokeGeo.setAttribute("position", new T.Float32BufferAttribute(smp, 3));
    var smoke1 = new T.Points(smokeGeo, new T.PointsMaterial({ color: 0x9a8f80, size: 0.5, transparent: true, opacity: 0.25, depthWrite: false }));
    smoke1._noFit = true; g.add(smoke1);

    /* the chatti — the CC0 clay pot, sized to potH and sat on the hearth, with a
       hand-built lathe pot as the fallback so the station is never empty */
    var pot = model(g, K, "./assets/chatti-pot.glb", {
      pos: [0, potBaseY, 0], sizeY: potH,
      fallback: function () {
        var profile = [];
        [[0.0, 0.0], [1.3, 0.05], [1.85, 0.4], [2.05, 1.1], [1.9, 1.75], [1.5, 2.0], [1.55, 2.15]].forEach(function (p) { profile.push(new T.Vector2(p[0], p[1])); });
        var m = new T.Mesh(new T.LatheGeometry(profile, 36), fmat(K, PAL.clay, 0.92)); m.castShadow = true; m.receiveShadow = true; return m;
      }
    });
    /* the lid, resting beside the pot */
    model(g, K, "./assets/chatti-lid.glb", {
      pos: [3.9, 0.08, 1.9], size: 1.7, rotY: 0.5,
      fallback: function () { var grp = new T.Group(); var dome = new T.Mesh(new T.SphereGeometry(0.85, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), fmat(K, PAL.clayDark, 0.92)); dome.rotation.x = Math.PI; dome.position.y = 0.4; grp.add(dome); var knob = new T.Mesh(new T.SphereGeometry(0.14, 12, 10), fmat(K, PAL.clayDark)); knob.position.y = 0.46; grp.add(knob); return grp; }
    });

    /* the sauce surface inside the pot (colour + displacement shift with heat), and
       a thin clay rim torus to frame it where the model's mouth sits */
    var rimRing = new T.Mesh(new T.TorusGeometry(mouthR + 0.06, 0.1, 10, 40), fmat(K, PAL.clayRim, 0.9)); rimRing.position.y = mouthY; rimRing.rotation.x = Math.PI / 2; rimRing._noFit = true; g.add(rimRing);
    var sauceGeo = new T.CircleGeometry(mouthR, 48);
    var sauce = new T.Mesh(sauceGeo, new T.MeshStandardMaterial({ color: 0xcf6a33, roughness: 0.5, metalness: 0.05 }));
    sauce.rotation.x = -Math.PI / 2; sauce.position.y = mouthY; sauce._noFit = true; g.add(sauce);
    var saucePos0 = sauceGeo.attributes.position.array.slice();

    /* bubbles */
    var NB = K.coarse ? 16 : 30;
    for (var b = 0; b < NB; b++) { var p = new T.Mesh(new T.SphereGeometry(0.09, 8, 6), new T.MeshStandardMaterial({ color: 0xf2ead9, roughness: 0.3 })); p._a = (b / NB) * 6.28; p._rr = Math.sqrt((b % 10) / 10) * mouthR * 0.85; p._sp = 0.3 + (b % 7) / 10; p._yy = (b % 9) / 9; p._noFit = true; g.add(p); bubbles.push(p); }

    /* steam over the pot — thin at a simmer, a thick roiling plume at a hard boil */
    var NST = K.coarse ? 20 : 44, stp = [], stv = [];
    for (var si2 = 0; si2 < NST; si2++) { var ra = Math.sqrt((si2 % 11) / 11) * mouthR * 0.85, ang = si2 * 2.399; stp.push(Math.cos(ang) * ra, mouthY + 0.2 + (si2 % 9) * 0.3, Math.sin(ang) * ra); stv.push(ra, ang, (si2 % 9) / 9); }
    var steamGeo = new T.BufferGeometry(); steamGeo.setAttribute("position", new T.Float32BufferAttribute(stp, 3));
    var steam = new T.Points(steamGeo, new T.PointsMaterial({ color: 0xf4efe6, size: 0.6, transparent: true, opacity: 0.0, depthWrite: false, blending: T.NormalBlending }));
    steam._noFit = true; g.add(steam);

    /* spice tray with coloured mounds (hand-built: no tray model read right) */
    var tray = new T.Mesh(new T.BoxGeometry(2.4, 0.18, 1.3), fmat(K, PAL.woodDark, 0.8)); tray.position.set(-4.5, 0.3, 1.5); tray.castShadow = true; tray.receiveShadow = true; g.add(tray);
    [0xb5651d, PAL.chilli, PAL.turmeric, 0x8b5a2b].forEach(function (cc, i) { var mm = new T.Mesh(new T.ConeGeometry(0.3, 0.4, 16), fmat(K, cc)); mm.position.set(-5.3 + i * 0.55, 0.55, 1.5); mm.castShadow = true; g.add(mm); });
    labels.push({ obj: tray, offset: [0, 1.0, 0], slot: "left", text: { en: "the spice tray", ta: "மசாலா தட்டு" } });

    /* the ammi — the CC0 mortar-and-pestle, fallback to a stone slab + roller */
    var ammi = model(g, K, "./assets/mortar.glb", {
      pos: [-4.3, 0.0, -1.6], sizeY: 1.1,
      fallback: function () { var grp = new T.Group(); var slab = new T.Mesh(new T.BoxGeometry(1.8, 0.3, 1.1), fmat(K, PAL.stone, 0.95)); slab.position.y = 0.15; slab.castShadow = true; slab.receiveShadow = true; grp.add(slab); var roller = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 1.3, 16), fmat(K, 0x938880, 0.95)); roller.rotation.z = Math.PI / 2; roller.position.y = 0.42; grp.add(roller); return grp; }
    });
    labels.push({ obj: ammi, offset: [0, 1.1, 0], slot: "left", text: { en: "the ammi — crush the ginger & garlic", ta: "அம்மி" } });

    /* cut bird on a CC0 board (tap for the fractions), a CC0 knife, and a few
       hand-built chillies and curry leaves scattered on it */
    var board = model(g, K, "./assets/board.glb", {
      pos: [4.6, 0.26, -1.6], size: 2.4, pick: showFractions,
      fallback: function () { var m = new T.Mesh(new T.BoxGeometry(2.0, 0.14, 1.4), fmat(K, PAL.wood, 0.78)); m.position.y = 0.07; m.castShadow = true; m.receiveShadow = true; return m; }
    });
    picks.push({ obj: board });
    model(g, K, "./assets/knife.glb", {
      pos: [5.5, 0.42, -0.9], size: 1.5, rotY: 0.8,
      fallback: function () { var grp = new T.Group(); var blade = new T.Mesh(new T.BoxGeometry(1.1, 0.04, 0.3), fmat(K, 0xbfc3c7, 0.4)); grp.add(blade); var handle = new T.Mesh(new T.BoxGeometry(0.4, 0.1, 0.14), fmat(K, PAL.woodDark)); handle.position.x = -0.72; grp.add(handle); return grp; }
    });
    var chilliMat = fmat(K, PAL.chilliDark, 0.55), leafMat = fmat(K, 0x2f6a2a, 0.6);
    [[0.7, 0.4, 0.5], [0.85, 0.1, -0.2]].forEach(function (p) { var ch = new T.Mesh(new T.ConeGeometry(0.07, 0.5, 7), chilliMat); ch.position.set(4.6 + p[0], 0.5, -1.6 + p[2]); ch.rotation.z = p[1]; ch.rotation.y = p[0]; g.add(ch); });
    [[-0.7, 0.3], [-0.55, -0.35], [-0.8, -0.05]].forEach(function (p) { var lf = new T.Mesh(new T.SphereGeometry(0.16, 8, 6), leafMat); lf.scale.set(1.5, 0.25, 0.7); lf.position.set(4.6 + p[0], 0.48, -1.6 + p[1]); g.add(lf); });
    var pieces = [];
    [[-0.5, -0.3], [0.1, -0.3], [-0.5, 0.3], [0.1, 0.3], [0.6, 0.0]].forEach(function (p) { var pc = new T.Mesh(new T.SphereGeometry(0.3, 12, 9), fmat(K, 0xd8b48a)); pc.scale.set(1.1, 0.7, 0.9); pc.position.set(4.6 + p[0], 0.56, -1.6 + p[1]); pc.castShadow = true; g.add(pc); pieces.push(pc); });
    var fracAnchors = [], fracShown = false;
    var fracLabels = ["1/2", "1/4", "1/4", "1/8", "1/8"];
    pieces.forEach(function (pc, i) { var an = { obj: pc, offset: [0, 0.5, 0], slot: "above", cls: "tap", text: { en: fracLabels[i] }, tap: showFractions, hidden: true }; fracAnchors.push(an); labels.push(an); });
    labels.push({ obj: board, offset: [0, 0.9, 0], slot: "right", cls: "tap", text: { en: "the bird, cut — tap for the fractions", ta: "கோழி வெட்டப்பட்டது" }, tap: showFractions });
    function showFractions() { fracShown = !fracShown; fracAnchors.forEach(function (a) { a.hidden = !fracShown; }); }

    /* split coconut (CC0 halves), the coconut-oil bottle (CC0), and a hand-built
       jug of coconut milk with a milk surface */
    [[4.65, 2.2], [5.35, 2.2]].forEach(function (pp, i) {
      model(g, K, "./assets/coconut-half.glb", {
        pos: [pp[0], 0.1, pp[1]], size: 0.75, rotY: i * 1.6,
        fallback: function () { var grp = new T.Group(); var half = new T.Mesh(new T.SphereGeometry(0.42, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), fmat(K, 0x8a6b3a)); half.rotation.x = Math.PI; half.position.y = 0.42; grp.add(half); var inner = new T.Mesh(new T.CircleGeometry(0.38, 20), fmat(K, PAL.milk)); inner.rotation.x = -Math.PI / 2; inner.position.y = 0.42; grp.add(inner); return grp; }
      });
    });
    model(g, K, "./assets/oil-bottle.glb", {
      pos: [2.1, 0.0, 2.9], sizeY: 1.3,
      fallback: function () { var m = new T.Mesh(new T.CylinderGeometry(0.22, 0.26, 1.3, 16), fmat(K, PAL.turmeric, 0.4)); m.position.y = 0.65; return m; }
    });
    labels.push({ obj: { position: new T.Vector3(2.1, 0.9, 2.9) }, offset: [0, 0.6, 0], slot: "right", text: { en: "coconut oil", ta: "தேங்காய் எண்ணெய்" } });
    var jug = new T.Mesh(new T.CylinderGeometry(0.5, 0.42, 1.1, 20), fmat(K, 0xece3d0, 0.6)); jug.position.set(3.2, 0.55, 2.6); jug.castShadow = true; g.add(jug);
    var milk = new T.Mesh(new T.CircleGeometry(0.44, 20), new T.MeshStandardMaterial({ color: PAL.milk, roughness: 0.3 })); milk.rotation.x = -Math.PI / 2; milk.position.set(3.2, 1.1, 2.6); g.add(milk);
    labels.push({ obj: jug, offset: [0, 0.9, 0], slot: "right", text: { en: "coconut milk", ta: "தேங்காய்ப் பால்" } });
    /* an onion and a tomato (CC0) by the board — the aromatics and the paste */
    model(g, K, "./assets/onion.glb", { pos: [3.7, 0.0, -2.5], size: 0.6, fallback: function () { var m = new T.Mesh(new T.SphereGeometry(0.3, 14, 10), fmat(K, PAL.onion)); m.position.y = 0.3; return m; } });
    model(g, K, "./assets/tomato.glb", { pos: [4.4, 0.0, -2.7], size: 0.5, fallback: function () { var m = new T.Mesh(new T.SphereGeometry(0.26, 14, 10), fmat(K, PAL.tomato)); m.position.y = 0.26; return m; } });

    labels.push({ obj: pot, offset: [0, mouthY + 1.3, 0], slot: "above", text: { en: "coconut milk last — at a simmer", ta: "தேங்காய்ப் பால் கடைசியாக" } });

    /* ---- the pot API the order game and heat slider drive ---- */
    var effectColors = { temper: 0xd98a2b, onions: 0xe0b878, aromatics: 0xcf7a33, bird: 0xcf6a33, tomato: 0x9c2d17, coconut: 0xe9c89a };
    function drop(id, effect) {
      /* a quick ingredient drop into the pot */
      var ing = new T.Mesh(new T.SphereGeometry(0.26, 12, 9), fmat(K, effectColors[effect] || 0xcccccc));
      ing.position.set((Math.sin(id.length) * 0.8), dropStart, (Math.cos(id.length) * 0.8)); ing._noFit = true; g.add(ing);
      drops.push({ obj: ing, t: 0, dur: 0.7, effect: effect });
    }
    function applyEffect(effect) {
      if (effect === "bird") sauce.material.color.setHex(0xb85a2c);           /* the bird's own juices deepen the gravy */
      else if (effect === "tomato") sauce.material.color.setHex(0x9c2d17);    /* tomato paste turns it red */
      else if (effect === "coconut") { sauce.material.color.setHex(0xe9c89a); sauce.material.roughness = 0.25; }  /* coconut milk pales it */
      else if (effect === "temper") burst(0xffd27a);
    }
    function burst(color) { for (var i = 0; i < 10; i++) { var pp = new T.Mesh(new T.SphereGeometry(0.07, 6, 5), new T.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false })); pp.position.set(0, mouthY + 0.2, 0); pp._v = new T.Vector3((Math.sin(i) * 0.08), 0.12 + (i % 3) * 0.03, (Math.cos(i) * 0.08)); pp._life = 1; pp._noFit = true; sparks.push(pp); g.add(pp); } }
    function smokePuff() { for (var i = 0; i < 8; i++) { var pp = new T.Mesh(new T.SphereGeometry(0.12, 6, 5), new T.MeshStandardMaterial({ color: 0x5a5048, transparent: true, opacity: 0.6 })); pp.position.set(0, mouthY + 0.3, 0); pp._v = new T.Vector3((Math.sin(i) * 0.05), 0.1, (Math.cos(i) * 0.05)); pp._life = 1; pp._noFit = true; sparks.push(pp); g.add(pp); } }
    function setHeat(v) { heat = v; }

    /* ---- per-frame animation ---- */
    function anim() {
      var tsec = (perfNow() % 100000) / 1000;
      flames.forEach(function (fl) { var sc = 0.7 + Math.abs(Math.sin(tsec * 6 + fl._ph)) * (0.5 + heat * 0.9); fl.scale.y = sc; fl.position.y = fl._base + sc * 0.3; fl.material.opacity = 0.7 + heat * 0.25; });
      /* smoke rising */
      var sp = smoke1.geometry.attributes.position.array;
      for (var i = 1; i < sp.length; i += 3) { sp[i] += 0.01 + heat * 0.02; if (sp[i] > 5) sp[i] = 1.4; }
      smoke1.geometry.attributes.position.needsUpdate = true;
      smoke1.material.opacity = 0.15 + heat * 0.2;
      /* steam over the pot — a thin veil at a simmer, a thick roiling plume at a hard boil */
      var roil = heat > 0.6 ? (heat - 0.6) / 0.4 : 0;
      var tp = steam.geometry.attributes.position.array;
      for (var n = 0; n < NST; n++) {
        var ra = stv[n * 3], ang = stv[n * 3 + 1];
        tp[n * 3 + 1] += 0.015 + heat * 0.03; if (tp[n * 3 + 1] > mouthY + 3.2) tp[n * 3 + 1] = mouthY + 0.2;
        var rr = ra * (1 + roil * 0.7), sway = roil * Math.sin(tsec * 3 + n) * 0.5;
        tp[n * 3] = Math.cos(ang) * rr + sway; tp[n * 3 + 2] = Math.sin(ang) * rr;
      }
      steam.geometry.attributes.position.needsUpdate = true;
      steam.material.opacity = 0.16 + heat * 0.5; steam.material.size = 0.5 + roil * 0.5;
      /* bubbles — slow at a simmer, violent split at a hard boil */
      var split = heat > 0.6, spread = split ? 1 + heat * 1.2 : 1;
      bubbles.forEach(function (p) { p._yy += (0.004 + heat * 0.04); if (p._yy > 1) p._yy = 0; p.visible = p._yy < (split ? 1 : 0.6); p.position.set(Math.cos(p._a) * p._rr * spread, mouthY + p._yy * (split ? 1.4 : 0.4), Math.sin(p._a) * p._rr * spread); });
      /* sauce surface: flat at a simmer, curdled two-tone displacement at a hard boil */
      var pos = sauce.geometry.attributes.position, arr = pos.array;
      for (var v = 0; v < arr.length; v += 3) { var x = saucePos0[v], z = saucePos0[v + 1]; var d = split ? Math.sin(x * 3 + tsec * 4) * Math.cos(z * 3) * 0.18 * ((heat - 0.6) / 0.4) : 0; arr[v + 2] = saucePos0[v + 2] + d; }
      pos.needsUpdate = true;
      if (split) { sauce.material.color.lerp(new T.Color(0xcf8a4a), 0.02); sauce.material.roughness = 0.7; }
      /* drops falling into pot */
      for (var di = drops.length - 1; di >= 0; di--) { var dp = drops[di]; dp.t += 1 / 60; var k = Math.min(1, dp.t / dp.dur); dp.obj.position.y = dropStart - (dropStart - mouthY) * k; dp.obj.position.x *= (1 - 0.04 * k); dp.obj.position.z *= (1 - 0.04 * k); if (k >= 1) { g.remove(dp.obj); applyEffect(dp.effect); drops.splice(di, 1); } }
      /* sparks */
      for (var si = sparks.length - 1; si >= 0; si--) { var s = sparks[si]; s.position.add(s._v); s._v.y -= 0.004; s._life -= 0.03; s.material.opacity = Math.max(0, s._life); if (s._life <= 0) { g.remove(s); sparks.splice(si, 1); } }
    }

    return { labels: labels, picks: picks, anim: anim, api: { drop: drop, setHeat: setHeat, smoke: smokePuff } };
  }

  function buildTable(g, K) {
    var T = K.THREE, labels = [], picks = [];

    /* round floor diorama with a rim, a plastered back wall and a daylight window */
    dioramaBase(g, K, 11, -2.3, PAL.earthDark);
    var wallMat = fmat(K, PAL.plaster, 1);
    var wall = new T.Mesh(new T.BoxGeometry(22, 12, 0.4), wallMat); wall.position.set(0, 3.7, -9); wall.receiveShadow = true; wall._noFit = true; g.add(wall);
    var winFrame = new T.Mesh(new T.BoxGeometry(5.2, 4.2, 0.3), fmat(K, PAL.baseRim)); winFrame.position.set(-5, 5.2, -8.75); winFrame._noFit = true; g.add(winFrame);
    var sky = new T.Mesh(new T.PlaneGeometry(4.6, 3.6), new T.MeshStandardMaterial({ color: PAL.sky, emissive: 0x6ea9c4, emissiveIntensity: 0.6, roughness: 0.4 })); sky.position.set(-5, 5.2, -8.6); sky._noFit = true; g.add(sky);
    var mullion = new T.Mesh(new T.BoxGeometry(0.16, 3.6, 0.2), fmat(K, PAL.baseRim)); mullion.position.set(-5, 5.2, -8.55); mullion._noFit = true; g.add(mullion);

    /* low round family table with a wood top and a cloth runner — hand-built: the
       CC0 round table reads as a small coffee table at family scale, so it is kept
       in flat palette colour to match the loaded crockery (see assets/LICENSES.md) */
    var tbl = new T.Mesh(new T.CylinderGeometry(6, 6, 0.5, 48), fmat(K, PAL.base, 0.75)); tbl.position.y = 0; tbl.receiveShadow = true; g.add(tbl);
    var runner = new T.Mesh(new T.BoxGeometry(3.2, 0.06, 11.6), fmat(K, PAL.cloth, 0.9)); runner.position.set(3.4, 0.27, 0); runner.receiveShadow = true; g.add(runner);
    [[-4.5, -4.5], [4.5, -4.5], [-4.5, 4.5], [4.5, 4.5]].forEach(function (p) { var leg = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 2.2, 10), fmat(K, PAL.woodDark, 0.8)); leg.position.set(p[0], -1.1, p[1]); leg.castShadow = true; g.add(leg); });

    /* banana leaf */
    var leaf = new T.Mesh(new T.CircleGeometry(4.2, 40), fmat(K, PAL.leaf, 0.6)); leaf.rotation.x = -Math.PI / 2; leaf.scale.set(1.25, 1, 0.8); leaf.position.set(0, 0.27, 0); leaf.receiveShadow = true; g.add(leaf);
    var vein = new T.Mesh(new T.BoxGeometry(9.5, 0.02, 0.1), fmat(K, 0x236026)); vein.position.set(0, 0.29, 0); g.add(vein);

    /* rice mound (hand-built) */
    var rice = new T.Mesh(new T.SphereGeometry(1.4, 24, 16, 0, 6.28, 0, Math.PI / 2), fmat(K, PAL.rice)); rice.position.set(-1.6, 0.28, 0); rice.castShadow = true; g.add(rice);
    /* curry bowl (CC0 bowl) with a hand-built curry surface; fallback to a lathe bowl */
    var bowl = model(g, K, "./assets/bowl.glb", {
      pos: [1.7, 0.27, 0.4], size: 2.3,
      fallback: function () { var m = new T.Mesh(new T.LatheGeometry([new T.Vector2(0, 0), new T.Vector2(1.0, 0.05), new T.Vector2(1.15, 0.6), new T.Vector2(1.1, 0.65)], 28), fmat(K, PAL.clayDark, 0.95)); m.castShadow = true; m.receiveShadow = true; return m; }
    });
    var curry = new T.Mesh(new T.CircleGeometry(0.95, 24), new T.MeshStandardMaterial({ color: PAL.curry, roughness: 0.45 })); curry.rotation.x = -Math.PI / 2; curry.position.set(1.7, 1.0, 0.4); g.add(curry);
    /* string hoppers on a CC0 plate, with hand-built coils; fallback to a disc */
    var plate = model(g, K, "./assets/plate.glb", {
      pos: [1.4, 0.28, -2.6], size: 2.6,
      fallback: function () { var m = new T.Mesh(new T.CylinderGeometry(1.1, 1.0, 0.14, 24), fmat(K, 0xeee6d4)); m.position.y = 0.07; return m; }
    });
    for (var hcoil = 0; hcoil < 3; hcoil++) { var coil = new T.Mesh(new T.TorusGeometry(0.38, 0.12, 8, 20), fmat(K, 0xf4efe2, 0.7)); coil.rotation.x = Math.PI / 2; coil.position.set(1.4 + (hcoil - 1) * 0.3, 0.62, -2.6); coil.castShadow = true; g.add(coil); }

    /* the empty chair — a place kept (CC0 chair, fallback to a boxy chair) */
    var chair = model(g, K, "./assets/chair.glb", {
      pos: [0, 0, 8.5], sizeY: 3.6, rotY: Math.PI,
      fallback: function () { var grp = new T.Group(); var seat = new T.Mesh(new T.BoxGeometry(1.6, 0.2, 1.6), fmat(K, PAL.woodDark)); seat.position.y = 2.0; grp.add(seat); var back = new T.Mesh(new T.BoxGeometry(1.6, 1.8, 0.2), fmat(K, PAL.woodDark)); back.position.set(0, 2.9, -0.7); grp.add(back); [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].forEach(function (p) { var l = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 2, 8), fmat(K, 0x3a281a)); l.position.set(p[0], 1.0, p[1]); grp.add(l); }); return grp; }
    });
    labels.push({ obj: chair, offset: [0, 3.6, 0], slot: "above", cls: "lead", text: { en: "a place kept — Sunday lunch", ta: "ஞாயிறு மதிய உணவு" }, reader: true });

    /* the recipe card on the table — tap to open the printable one */
    var card = new T.Mesh(new T.BoxGeometry(2.2, 0.08, 3.0), fmat(K, 0xf2ead9, 0.8)); card.position.set(-3.6, 0.34, 1.6); card.rotation.y = 0.3; card.castShadow = true; g.add(card);
    picks.push({ obj: card }); card._pick = openCard;
    labels.push({ obj: card, offset: [0, 0.8, 0], slot: "left", cls: "tap", text: { en: "the recipe card — tap to open", ta: "செய்முறை அட்டை" }, tap: openCard });
    function openCard() { try { location.hash = "#card"; var c = document.getElementById("card"); if (c) c.scrollIntoView({ behavior: "smooth" }); } catch (e) {} }

    /* the Tamil words float on the food — vocab labels that show script, sound and English together */
    var v = {}; DISH.vocab.forEach(function (x) { v[x.en] = x; });
    labels.push({ obj: rice, offset: [0, 1.5, 0], slot: "left", vocab: v["rice"] });
    labels.push({ obj: bowl, offset: [0, 1.6, 0], slot: "right", vocab: v["chicken curry"] });
    labels.push({ obj: plate, offset: [0, 1.0, 0], slot: "below", vocab: v["string hoppers"] });

    return { labels: labels, picks: picks };
  }

  /* a monotonic clock that survives environments without performance.now */
  function perfNow() { try { return performance.now(); } catch (e) { return 0; } }

  /* ---- mount ---------------------------------------------------------- */
  if (window.CulturalShowcase) window.CulturalShowcase.mount(DISH);
  else window.addEventListener("DOMContentLoaded", function () { window.CulturalShowcase && window.CulturalShowcase.mount(DISH); });
})();
