// The Privacy Policy and the Security Policy of daxfoundation.org, v1.0 (2026-11-05).
//
// One file, both languages, so the English and the French cannot drift apart
// (tests/policies/policies.test.mjs checks that every section exists in both).
// Written FROM the internal data map (Skippy state/privacy/DATA-MAP.md): every
// sentence here describes what the code already does. "Privacy and security
// are architecture, not policy."
//
// HOW TO CHANGE THIS FILE (state/privacy/POLICY-PROCESS.md):
//   1. a new service or a new kind of data gets a DATA-MAP row FIRST;
//   2. then the text here, in BOTH languages;
//   3. bump POLICY.version (x.y: y for wording, x for a material change),
//      set POLICY.date, and add an entry at the TOP of CHANGELOG;
//   4. copy the outgoing version's text to state/privacy/archive/ before it is replaced.
// Never write: incorporated, charity, registered charity, tax receipts, the names of
// AI model vendors, personal names, or capture capabilities beyond the Re·UI sentence.

export const POLICY = {
  version: '1.0',
  date: '2026-11-05',
  dateEn: '5 November 2026',
  dateFr: '5 novembre 2026',
  nextReview: '2027-02-05',
  nextReviewEn: '5 February 2027',
  nextReviewFr: '5 février 2027',
  contact: 'dax@daxfoundation.org',
};

const MAIL = '<a href="mailto:dax@daxfoundation.org">dax@daxfoundation.org</a>';
const SRC = '<a href="https://github.com/ObsidianDelta/published/tree/main/daxfoundation.org">github.com/ObsidianDelta/published</a>';

// ---------------------------------------------------------------- PRIVACY · EN
const privacyEn = {
  title: 'Privacy Policy',
  kicker: 'Privacy is architecture, not policy',
  lead: 'This page does not ask you to trust a promise. It describes what our systems already do: what they collect, what they never receive, where it is kept and how you control it. The code behind this site is public.',
  short: [
    'We collect as little as we can. Reading this site, playing Meta DAX and trying Re·UI need no account.',
    'Re·UI: your phone reads your hand as 21 points, on the phone. We never receive an image or sound: only points, gesture names and, if you use your voice, the recognised words.',
    'No cookies on our public pages, no advertising, no third-party trackers. We count visits with cookieless analytics.',
    'We never sell personal information, and we never give it to anyone to advertise to you.',
    'You can see, correct or delete what we hold about you. Write to ' + MAIL + '.',
    'Our data is stored by Cloudflare, mainly in the United States. We cannot promise storage in Canada today.',
  ],
  sections: [
    { id: 'who', h: '1. Who we are', html: `
<p>The DAX Foundation runs daxfoundation.org and the services on it: Meta DAX universal learning, the Re·UI research interface and the DAX research pipeline.</p>
<p>These services are built and operated by <strong>Obsidian Delta Corp.</strong>, a Canadian company and the DAX Foundation’s technology provider (Obsidian Delta calls itself the cognition provider). Obsidian Delta writes the code, runs the servers and carries out every measure described on this page. In this policy, “we” means the DAX Foundation together with Obsidian Delta Corp. acting for it.</p>
<p><strong>Accountability.</strong> The Managing Director of Obsidian Delta Corp. is accountable for the privacy and security of these services and acts as their privacy officer. Write to ${MAIL}, in English or French.</p>` },
    { id: 'architecture', h: '2. Architecture, not policy', html: `
<p>Five rules are built into how we make things. Everything else on this page follows from them.</p>
<ol>
<li><strong>Collect only what a feature needs.</strong> Every form lists its fields, and nothing else is kept.</li>
<li><strong>Process on your device whenever we can.</strong> Re·UI reads your hand on your phone; a Meta DAX learning record is a file saved to your own device.</li>
<li><strong>No trackers.</strong> No advertising, no third-party tracking scripts, no cookies on public pages.</li>
<li><strong>Every service is mapped before it launches.</strong> Each service has an entry in our internal data map (what, why, where, how long, who can read it) before it collects anything, and this policy is updated first.</li>
<li><strong>In public.</strong> The source of this site is published at ${SRC}, so anyone can check what a page does.</li>
</ol>` },
    { id: 'collect', h: '3. What we collect, service by service', html: `
<h3 id="collect-site">3.1 Reading daxfoundation.org</h3>
<p>No account and no cookies. To count visits we use Cloudflare Web Analytics, which does not use cookies or local storage and does not fingerprint your browser. It receives the page address, the page you came from, your browser type, your country and how fast the page loaded. Pages where we ask for your consent, such as the preview list, do not load it at all.</p>
<p>Some pages remember a display choice (for example a reading lens) in your browser’s own local storage. It never leaves your device.</p>
<p>A few Meta DAX sample pages load fonts from Google Fonts or a graphics library from cdnjs (run by Cloudflare). When your browser fetches those files, that provider receives your IP address and browser type.</p>

<h3 id="collect-preview">3.2 The preview list (daxfoundation.org/preview/)</h3>
<p>If you join, we keep: your name, email, role (learner, parent, teacher, school, other), country, your message if you write one, your language, when you joined or updated your entry, and which consent text you agreed to.</p>
<p>We do <strong>not</strong> keep your IP address with your entry. To stop spam, a salted, scrambled (hashed) form of your IP address is counted per hour and deleted after two hours. We send no email automatically; when we write, it is only about the preview.</p>

<h3 id="collect-reui">3.3 Re·UI and its relay (re.ui.research.daxfoundation.org)</h3>
<p><strong>On your phone.</strong> Your phone reads your hand as 21 points per hand, on the phone. The hand-reading software is downloaded to your phone from servers run by Google and by jsDelivr, which receive your IP address and browser type when it downloads. No image is ever sent to us.</p>
<p><strong>Voice is optional.</strong> When your browser can recognise words on the phone itself, it does. Otherwise your browser uses its own speech service (in Chrome, Google’s), under your browser maker’s terms. We never receive sound, only the recognised words. You can turn voice off at any time.</p>
<p><strong>What reaches us.</strong> Hand points, gesture names and commands, the recognised words, learning snapshots (which gesture was meant, how strong it was, whether it was right) under a scrambled person code, movement measures in some research rooms, and a role label such as “guest”. Hand points from the phone are passed live to the screens of the same room and are not stored. The rest is kept in that room’s record.</p>
<p><strong>No names needed.</strong> A room has no account and needs no name. Please do not say personal details aloud: recognised words are kept in the room’s record.</p>
<p><strong>Room keys.</strong> A room made with “create a room” gets a key. Its records open only with that key, and we store only a scrambled (hashed) form of it. Anyone who has the key can read that room’s records, so keep it private. Your browser keeps the key and your settings in its own local storage.</p>

<h3 id="collect-research">3.4 Research (research.daxfoundation.org)</h3>
<p>You first see a consent screen and can say no. If you take part, we keep the country and language you choose, your answers, how long each took, and whether the listening check passed. If you came through a research recruitment platform, we also keep the participant, study and session codes that platform gives us, so it can confirm you finished.</p>
<p>The answers become part of a free, open dataset. The public dataset carries a random code, country, language, times and answers, and <strong>never</strong> your name or your platform codes.</p>
<p>The request form for one-time sampler links (for universities and colleges) is not open yet and stores nothing today. This policy will be updated before it opens.</p>

<h3 id="collect-metadax">3.5 Meta DAX play, samples and showcases</h3>
<p>Nothing is sent to us. “Save this session to my record” builds the record on your device and downloads it as a file. It refuses diagnoses, email addresses, social handles and links. If you choose to publish a record, you do it in your own GitHub repository, under GitHub’s terms.</p>

<h3 id="collect-email">3.6 Email</h3>
<p>When you write to an @daxfoundation.org address, we receive your address and your message. Mail is delivered through Cloudflare Email Routing to a mailbox hosted by Google.</p>

<h3 id="collect-admin">3.7 Administration pages</h3>
<p>Our administration pages are not public. They sit behind Cloudflare Access with Google sign-in, open only to our administrator addresses, and they check the sign-in again in our own code.</p>

<h3 id="collect-logs">3.8 Technical logs</h3>
<p>Our hosting provider, Cloudflare, keeps short technical logs of requests to our servers (for example the time, the address requested and network details) so we can run and protect the services. For the Re·UI services these logs are switched on, and they are kept for up to 7 days.</p>` },
    { id: 'never', h: '4. What never happens', html: `
<ul>
<li>We never sell or rent personal information.</li>
<li>No advertising, no advertising profiles, no third-party trackers.</li>
<li>Re·UI never sends us an image or sound.</li>
<li>We do not give your personal information to service providers to train their AI models.</li>
<li>We make no decisions about you by automated means that have legal or similarly significant effects.</li>
</ul>` },
    { id: 'purposes', h: '5. Why we use it, and on what basis', html: `
<ul>
<li><strong>To provide what you asked for</strong> (a room, the preview list, a reply): your consent, and our legitimate interest in answering you.</li>
<li><strong>Research</strong> (Re·UI rooms, the research pipeline): your consent, given when you start.</li>
<li><strong>Counting visits and keeping services safe</strong> (cookieless analytics, technical logs, spam limits): our legitimate interest, using the least data that works.</li>
<li><strong>When the law requires it.</strong></li>
</ul>
<p>Under Canada’s PIPEDA and provincial laws we rely on your consent, which you can withdraw at any time. For people where the GDPR or UK GDPR applies, the legal bases are consent, legitimate interests and legal obligation, as listed above.</p>` },
    { id: 'consent', h: '6. Consent and withdrawing it', html: `
<p>You give consent with a clear action: a checkbox, “I agree”, or starting a session. You can withdraw it at any time by writing to ${MAIL}, or by turning a feature off (for example voice in Re·UI). Withdrawing does not undo what was lawfully done before, and published open-dataset rows (which carry no name or platform code) cannot be recalled from copies others already hold.</p>` },
    { id: 'sharing', h: '7. Who else handles it (service providers)', html: `
<p>We share personal information only with the providers that run our services, only for that purpose, and only what they need:</p>
<ul>
<li><strong>Cloudflare</strong>: hosting, databases and storage, DNS, email routing, access control for administration pages, cookieless analytics, technical logs.</li>
<li><strong>Google</strong>: the mailbox that receives email sent to us; sign-in for our administrators; hosting of the Re·UI hand-reading model file and Google Fonts. If your browser uses Google’s speech service for Re·UI voice, that is between you and your browser.</li>
<li><strong>jsDelivr</strong>: delivery of the Re·UI hand-reading software to your phone.</li>
<li><strong>GitHub</strong>: our source code and the public record of this site; your own records if you choose to publish them there.</li>
<li><strong>Research recruitment platforms</strong>, if you came through one: they are responsible for what they hold about you; we send back only a completion code.</li>
</ul>
<p>We disclose personal information to authorities only when the law requires it, and we will tell you unless the law forbids it. If the operation of these services passes from Obsidian Delta Corp. to the DAX Foundation or to another organization, we will tell you first, and the commitments on this page will go with the data.</p>` },
    { id: 'transfers', h: '8. Where it is stored (international transfers)', html: `
<p>Cloudflare runs a global network. Our main database is located in eastern North America, in the United States; other storage is placed by Cloudflare, usually in the same region. Google and GitHub process data mainly in the United States. <strong>We cannot guarantee storage in Canada today.</strong> Data held in another country can be subject to that country’s laws, including access by its authorities. We choose providers that protect data with encryption in transit and at rest.</p>` },
    { id: 'retention', h: '9. How long we keep it', html: `
<ul>
<li><strong>Preview list</strong>: until you ask to be removed or the preview list closes; then we delete it. Spam counters: two hours.</li>
<li><strong>Re·UI room records</strong>: each room keeps its latest 3,000 events and latest 600 learning batches. There is no automatic deletion period yet; we delete a room’s records when you ask. Movement clips saved in the Gesture Lab, and older lab records of hand points, have no limit yet either. Automatic periods will be set before any school use.</li>
<li><strong>Research answers</strong>: kept for the open dataset. Before publication, we delete your answers on request.</li>
<li><strong>Email</strong>: as long as needed to answer you and keep a record of the conversation.</li>
<li><strong>Technical logs</strong>: up to 7 days, under Cloudflare’s log retention.</li>
</ul>` },
    { id: 'rights', h: '10. Your rights', html: `
<p>You can ask us to:</p>
<ul>
<li>tell you what personal information we hold about you and give you a copy (access, portability);</li>
<li>correct it;</li>
<li>delete it;</li>
<li>stop using it, or withdraw your consent;</li>
<li>explain how it was used and with whom it was shared.</li>
</ul>
<p>Write to ${MAIL}. We answer within 30 days, for free. To protect you, we may ask you to write from the address you signed up with, or, for a Re·UI room, to give the room name and its key. These rights come from PIPEDA and provincial laws (including Québec’s Law 25, and Alberta’s and British Columbia’s PIPA). If you live where the GDPR or the UK GDPR applies, you have the same rights and may also object to processing based on legitimate interests.</p>` },
    { id: 'children', h: '11. Children', html: `
<p>We treat anyone under 16 as a child for these services. We do not knowingly collect personal information from a child without a parent or guardian: a child should not join the preview list or the research pipeline themselves.</p>
<p>Re·UI rooms need no name or account. For children, an adult creates and runs the room. Use by a school, with its students, will happen only under a written agreement with that school, after a legal review. That is not offered yet.</p>
<p>If you think a child has given us personal information, write to ${MAIL} and we will delete it.</p>` },
    { id: 'security', h: '12. Security', html: `
<p>How we protect information, and how to report a weakness, is in our <a href="/security/">Security Policy</a>.</p>` },
    { id: 'breach', h: '13. If something goes wrong', html: `
<p>If a breach of security safeguards involving personal information creates a real risk of significant harm, we will tell the people affected as soon as feasible, report it to the Office of the Privacy Commissioner of Canada (and to the Commission d’accès à l’information du Québec or another authority where the law requires it), and tell anyone who can reduce the harm. We keep a record of every breach for at least 24 months.</p>` },
    { id: 'evolves', h: '14. How this policy evolves', html: `
<p>This is version ${'{VERSION}'}, in force since ${'{DATE}'}. Every change is listed on the <a href="/privacy/changelog/">changelog</a>, and every past version stays readable in the public record.</p>
<ul>
<li>A new service, or a new kind of data, gets its data-map entry and an update of this policy <strong>before</strong> it launches.</li>
<li>We review this policy every quarter. Next review: ${'{NEXT}'}.</li>
<li>Any use with schools or with children under 16 gets a legal review first.</li>
<li>For a material change, we post a notice on this site at least 30 days before it applies, and, where it changes what we do with your preview-list entry, we email you.</li>
</ul>` },
    { id: 'contact', h: '15. Contact and complaints', html: `
<p>Questions, requests and complaints: ${MAIL}. We aim to resolve every concern directly.</p>
<p>You can also complain to the <a href="https://www.priv.gc.ca/en/report-a-concern/">Office of the Privacy Commissioner of Canada</a> (1-800-282-1376), to your provincial commissioner (in Québec, the <a href="https://www.cai.gouv.qc.ca/">Commission d’accès à l’information</a>), or, in the European Union or the United Kingdom, to your data protection authority.</p>` },
  ],
};

// ---------------------------------------------------------------- PRIVACY · FR
const privacyFr = {
  title: 'Politique de confidentialité',
  kicker: 'La vie privée est une architecture, pas une politique',
  lead: 'Cette page ne vous demande pas de croire une promesse. Elle décrit ce que nos systèmes font déjà : ce qu’ils recueillent, ce qu’ils ne reçoivent jamais, où c’est gardé et comment vous en gardez le contrôle. Le code de ce site est public.',
  short: [
    'Nous recueillons le moins possible. Lire ce site, jouer à Meta DAX et essayer Re·UI ne demandent aucun compte.',
    'Re·UI : votre téléphone lit votre main en 21 points, sur le téléphone. Nous ne recevons jamais d’image ni de son : seulement des points, des noms de gestes et, si vous utilisez votre voix, les mots reconnus.',
    'Aucun témoin (cookie) sur nos pages publiques, aucune publicité, aucun traceur tiers. Nous comptons les visites avec une mesure d’audience sans témoins.',
    'Nous ne vendons jamais de renseignements personnels, et nous ne les donnons jamais à quiconque pour vous faire de la publicité.',
    'Vous pouvez voir, corriger ou effacer ce que nous détenons à votre sujet. Écrivez à ' + MAIL + '.',
    'Nos données sont stockées par Cloudflare, surtout aux États-Unis. Nous ne pouvons pas garantir aujourd’hui un stockage au Canada.',
  ],
  sections: [
    { id: 'who', h: '1. Qui nous sommes', html: `
<p>La DAX Foundation exploite daxfoundation.org et les services qui s’y trouvent : Meta DAX, l’apprentissage universel, l’interface de recherche Re·UI et la chaîne de recherche DAX.</p>
<p>Ces services sont conçus et exploités par <strong>Obsidian Delta Corp.</strong>, une société canadienne, fournisseur technologique de la DAX Foundation (Obsidian Delta se décrit comme le fournisseur de cognition). Obsidian Delta écrit le code, exploite les serveurs et applique chacune des mesures décrites ici. Dans cette politique, « nous » désigne la DAX Foundation et Obsidian Delta Corp. agissant pour elle.</p>
<p><strong>Responsabilité.</strong> Le directeur général d’Obsidian Delta Corp. est responsable de la protection et de la sécurité des renseignements de ces services et en est le responsable de la protection des renseignements personnels. Écrivez à ${MAIL}, en français ou en anglais.</p>` },
    { id: 'architecture', h: '2. Une architecture, pas une politique', html: `
<p>Cinq règles sont intégrées à notre façon de construire. Tout le reste de cette page en découle.</p>
<ol>
<li><strong>Ne recueillir que ce dont une fonction a besoin.</strong> Chaque formulaire liste ses champs, et rien d’autre n’est gardé.</li>
<li><strong>Traiter sur votre appareil dès que possible.</strong> Re·UI lit votre main sur votre téléphone ; un dossier d’apprentissage Meta DAX est un fichier enregistré sur votre propre appareil.</li>
<li><strong>Aucun traceur.</strong> Aucune publicité, aucun script de pistage tiers, aucun témoin sur les pages publiques.</li>
<li><strong>Chaque service est répertorié avant son lancement.</strong> Chaque service a une entrée dans notre carte interne des données (quoi, pourquoi, où, combien de temps, qui peut le lire) avant de recueillir quoi que ce soit, et cette politique est mise à jour d’abord.</li>
<li><strong>En public.</strong> Le code de ce site est publié à ${SRC} : chacun peut vérifier ce que fait une page.</li>
</ol>` },
    { id: 'collect', h: '3. Ce que nous recueillons, service par service', html: `
<h3 id="fr-collect-site">3.1 Lire daxfoundation.org</h3>
<p>Aucun compte et aucun témoin. Pour compter les visites, nous utilisons Cloudflare Web Analytics, qui n’utilise ni témoins ni stockage local et ne prend pas l’empreinte de votre navigateur. Il reçoit l’adresse de la page, la page d’où vous venez, le type de navigateur, votre pays et la vitesse de chargement. Les pages où nous demandons votre consentement, comme la liste d’aperçu, ne le chargent pas du tout.</p>
<p>Certaines pages retiennent un choix d’affichage (par exemple une lentille de lecture) dans le stockage local de votre navigateur. Il ne quitte jamais votre appareil.</p>
<p>Quelques pages d’exemples Meta DAX chargent des polices de Google Fonts ou une bibliothèque graphique de cdnjs (exploité par Cloudflare). Quand votre navigateur télécharge ces fichiers, ce fournisseur reçoit votre adresse IP et le type de navigateur.</p>

<h3 id="fr-collect-preview">3.2 La liste d’aperçu (daxfoundation.org/preview/)</h3>
<p>Si vous vous inscrivez, nous gardons : votre nom, votre courriel, votre rôle (apprenant, parent, enseignant, école, autre), votre pays, votre message si vous en écrivez un, votre langue, la date d’inscription ou de mise à jour, et le texte de consentement accepté.</p>
<p>Nous ne gardons <strong>pas</strong> votre adresse IP avec votre inscription. Pour bloquer le pourriel, une forme salée et brouillée (hachée) de votre adresse IP est comptée par heure, puis effacée après deux heures. Aucun courriel n’est envoyé automatiquement ; quand nous écrivons, c’est seulement au sujet de l’aperçu.</p>

<h3 id="fr-collect-reui">3.3 Re·UI et son relais (re.ui.research.daxfoundation.org)</h3>
<p><strong>Sur votre téléphone.</strong> Votre téléphone lit votre main en 21 points par main, sur le téléphone. Le logiciel de lecture de la main est téléchargé sur votre téléphone depuis des serveurs exploités par Google et par jsDelivr, qui reçoivent votre adresse IP et le type de navigateur lors du téléchargement. Aucune image ne nous est jamais envoyée.</p>
<p><strong>La voix est facultative.</strong> Quand votre navigateur peut reconnaître les mots sur le téléphone même, il le fait. Sinon, il utilise son propre service de reconnaissance vocale (dans Chrome, celui de Google), selon les conditions de l’éditeur du navigateur. Nous ne recevons jamais de son, seulement les mots reconnus. Vous pouvez couper la voix en tout temps.</p>
<p><strong>Ce qui nous parvient.</strong> Des points de la main, des noms de gestes et de commandes, les mots reconnus, des instantanés d’apprentissage (quel geste était voulu, sa force, s’il était juste) sous un code de personne brouillé, des mesures de mouvement dans certaines salles de recherche, et une étiquette de rôle comme « invité ». Les points de la main venant du téléphone sont transmis en direct aux écrans de la même salle et ne sont pas stockés. Le reste est gardé dans le dossier de cette salle.</p>
<p><strong>Aucun nom requis.</strong> Une salle n’a pas de compte et n’exige aucun nom. Évitez de dire à voix haute des renseignements personnels : les mots reconnus sont gardés dans le dossier de la salle.</p>
<p><strong>Clés de salle.</strong> Une salle créée avec « créer une salle » reçoit une clé. Ses dossiers ne s’ouvrent qu’avec cette clé, et nous n’en gardons qu’une forme brouillée (hachée). Quiconque a la clé peut lire les dossiers de la salle : gardez-la privée. Votre navigateur garde la clé et vos réglages dans son propre stockage local.</p>

<h3 id="fr-collect-research">3.4 Recherche (research.daxfoundation.org)</h3>
<p>Vous voyez d’abord un écran de consentement et pouvez refuser. Si vous participez, nous gardons le pays et la langue que vous choisissez, vos réponses, le temps de chacune et le résultat de la vérification d’écoute. Si vous venez d’une plateforme de recrutement pour la recherche, nous gardons aussi les codes de participant, d’étude et de séance qu’elle nous transmet, pour qu’elle confirme que vous avez terminé.</p>
<p>Les réponses font partie d’un jeu de données ouvert et gratuit. Le jeu public contient un code aléatoire, le pays, la langue, les heures et les réponses, et <strong>jamais</strong> votre nom ni vos codes de plateforme.</p>
<p>Le formulaire de demande de liens d’essai uniques (pour les universités et les collèges) n’est pas encore ouvert et ne garde rien aujourd’hui. Cette politique sera mise à jour avant son ouverture.</p>

<h3 id="fr-collect-metadax">3.5 Meta DAX : jeu, exemples et vitrines</h3>
<p>Rien ne nous est envoyé. « Enregistrer cette séance dans mon dossier » construit le dossier sur votre appareil et le télécharge en fichier. Il refuse les diagnostics, les adresses courriel, les pseudonymes de réseaux sociaux et les liens. Si vous choisissez de publier un dossier, vous le faites dans votre propre dépôt GitHub, selon les conditions de GitHub.</p>

<h3 id="fr-collect-email">3.6 Courriel</h3>
<p>Quand vous écrivez à une adresse @daxfoundation.org, nous recevons votre adresse et votre message. Le courrier passe par le routage de courriel de Cloudflare vers une boîte hébergée par Google.</p>

<h3 id="fr-collect-admin">3.7 Pages d’administration</h3>
<p>Nos pages d’administration ne sont pas publiques. Elles sont protégées par Cloudflare Access avec connexion Google, ouvertes seulement à nos adresses d’administration, et notre propre code vérifie la connexion une seconde fois.</p>

<h3 id="fr-collect-logs">3.8 Journaux techniques</h3>
<p>Notre hébergeur, Cloudflare, garde de courts journaux techniques des requêtes à nos serveurs (par exemple l’heure, l’adresse demandée et des détails réseau) pour faire fonctionner et protéger les services. Pour les services Re·UI, ces journaux sont activés, et ils sont gardés jusqu’à 7 jours.</p>` },
    { id: 'never', h: '4. Ce qui n’arrive jamais', html: `
<ul>
<li>Nous ne vendons ni ne louons jamais de renseignements personnels.</li>
<li>Aucune publicité, aucun profil publicitaire, aucun traceur tiers.</li>
<li>Re·UI ne nous envoie jamais d’image ni de son.</li>
<li>Nous ne donnons pas vos renseignements personnels à des fournisseurs pour entraîner leurs modèles d’IA.</li>
<li>Nous ne prenons à votre sujet aucune décision entièrement automatisée ayant des effets juridiques ou d’importance semblable.</li>
</ul>` },
    { id: 'purposes', h: '5. Pourquoi nous les utilisons, et sur quelle base', html: `
<ul>
<li><strong>Fournir ce que vous avez demandé</strong> (une salle, la liste d’aperçu, une réponse) : votre consentement, et notre intérêt légitime à vous répondre.</li>
<li><strong>La recherche</strong> (salles Re·UI, chaîne de recherche) : votre consentement, donné au départ.</li>
<li><strong>Compter les visites et protéger les services</strong> (mesure d’audience sans témoins, journaux techniques, limites anti-pourriel) : notre intérêt légitime, avec le moins de données possible.</li>
<li><strong>Quand la loi l’exige.</strong></li>
</ul>
<p>Selon la LPRPDE et les lois provinciales du Canada, nous nous appuyons sur votre consentement, que vous pouvez retirer en tout temps. Pour les personnes visées par le RGPD ou le RGPD du Royaume-Uni, les bases juridiques sont le consentement, l’intérêt légitime et l’obligation légale, comme ci-dessus.</p>` },
    { id: 'consent', h: '6. Le consentement et son retrait', html: `
<p>Vous consentez par un geste clair : une case à cocher, « J’accepte », ou le début d’une séance. Vous pouvez retirer votre consentement en tout temps en écrivant à ${MAIL}, ou en coupant une fonction (par exemple la voix dans Re·UI). Le retrait n’annule pas ce qui a été fait légalement avant, et les lignes déjà publiées du jeu de données ouvert (sans nom ni code de plateforme) ne peuvent pas être rappelées des copies que d’autres détiennent déjà.</p>` },
    { id: 'sharing', h: '7. Qui d’autre les traite (fournisseurs de services)', html: `
<p>Nous ne communiquons des renseignements personnels qu’aux fournisseurs qui font fonctionner nos services, seulement à cette fin, et seulement ce dont ils ont besoin :</p>
<ul>
<li><strong>Cloudflare</strong> : hébergement, bases de données et stockage, DNS, routage du courriel, contrôle d’accès aux pages d’administration, mesure d’audience sans témoins, journaux techniques.</li>
<li><strong>Google</strong> : la boîte qui reçoit le courriel qui nous est envoyé ; la connexion de nos administrateurs ; l’hébergement du fichier de modèle de lecture de la main de Re·UI et de Google Fonts. Si votre navigateur utilise le service vocal de Google pour la voix dans Re·UI, cela relève de vous et de votre navigateur.</li>
<li><strong>jsDelivr</strong> : la livraison du logiciel de lecture de la main de Re·UI à votre téléphone.</li>
<li><strong>GitHub</strong> : notre code source et le registre public de ce site ; vos propres dossiers si vous choisissez de les y publier.</li>
<li><strong>Les plateformes de recrutement pour la recherche</strong>, si vous venez de l’une d’elles : elles sont responsables de ce qu’elles détiennent sur vous ; nous ne leur renvoyons qu’un code de fin.</li>
</ul>
<p>Nous ne communiquons des renseignements personnels aux autorités que lorsque la loi l’exige, et nous vous en informerons sauf si la loi l’interdit. Si l’exploitation de ces services passe d’Obsidian Delta Corp. à la DAX Foundation ou à une autre organisation, nous vous le dirons d’abord, et les engagements de cette page suivront les données.</p>` },
    { id: 'transfers', h: '8. Où c’est stocké (transferts internationaux)', html: `
<p>Cloudflare exploite un réseau mondial. Notre base de données principale se trouve dans l’est de l’Amérique du Nord, aux États-Unis ; les autres stockages sont placés par Cloudflare, habituellement dans la même région. Google et GitHub traitent les données surtout aux États-Unis. <strong>Nous ne pouvons pas garantir aujourd’hui un stockage au Canada.</strong> Des données détenues dans un autre pays peuvent être soumises à ses lois, y compris l’accès par ses autorités. Nous choisissons des fournisseurs qui protègent les données par chiffrement en transit et au repos.</p>` },
    { id: 'retention', h: '9. Combien de temps nous les gardons', html: `
<ul>
<li><strong>Liste d’aperçu</strong> : jusqu’à ce que vous demandiez à être retiré ou que la liste ferme ; nous l’effaçons alors. Compteurs anti-pourriel : deux heures.</li>
<li><strong>Dossiers des salles Re·UI</strong> : chaque salle garde ses 3 000 derniers événements et ses 600 derniers lots d’apprentissage. Il n’y a pas encore de durée d’effacement automatique ; nous effaçons les dossiers d’une salle sur demande. Les extraits de mouvement enregistrés dans le Gesture Lab et les anciens relevés de points de la main du laboratoire n’ont pas encore de limite non plus. Des durées automatiques seront fixées avant toute utilisation scolaire.</li>
<li><strong>Réponses de recherche</strong> : gardées pour le jeu de données ouvert. Avant publication, nous effaçons vos réponses sur demande.</li>
<li><strong>Courriel</strong> : le temps nécessaire pour vous répondre et garder une trace de l’échange.</li>
<li><strong>Journaux techniques</strong> : jusqu’à 7 jours, selon la conservation des journaux de Cloudflare.</li>
</ul>` },
    { id: 'rights', h: '10. Vos droits', html: `
<p>Vous pouvez nous demander :</p>
<ul>
<li>de vous dire quels renseignements personnels nous détenons à votre sujet et de vous en remettre une copie (accès, portabilité) ;</li>
<li>de les corriger ;</li>
<li>de les effacer ;</li>
<li>de cesser de les utiliser, ou de retirer votre consentement ;</li>
<li>d’expliquer comment ils ont été utilisés et à qui ils ont été communiqués.</li>
</ul>
<p>Écrivez à ${MAIL}. Nous répondons dans un délai de 30 jours, gratuitement. Pour vous protéger, nous pouvons vous demander d’écrire depuis l’adresse inscrite ou, pour une salle Re·UI, de donner le nom de la salle et sa clé. Ces droits viennent de la LPRPDE et des lois provinciales (dont la Loi 25 du Québec et les lois PIPA de l’Alberta et de la Colombie-Britannique). Si vous vivez là où s’applique le RGPD ou le RGPD du Royaume-Uni, vous avez les mêmes droits et pouvez aussi vous opposer à un traitement fondé sur l’intérêt légitime.</p>` },
    { id: 'children', h: '11. Les enfants', html: `
<p>Pour ces services, nous considérons toute personne de moins de 16 ans comme un enfant. Nous ne recueillons pas sciemment de renseignements personnels auprès d’un enfant sans parent ou tuteur : un enfant ne devrait pas s’inscrire lui-même à la liste d’aperçu ni à la chaîne de recherche.</p>
<p>Les salles Re·UI n’exigent ni nom ni compte. Pour les enfants, un adulte crée et anime la salle. L’utilisation par une école, avec ses élèves, se fera seulement dans le cadre d’une entente écrite avec cette école, après un examen juridique. Ce n’est pas encore offert.</p>
<p>Si vous croyez qu’un enfant nous a donné des renseignements personnels, écrivez à ${MAIL} et nous les effacerons.</p>` },
    { id: 'security', h: '12. Sécurité', html: `
<p>La façon dont nous protégeons les renseignements, et comment signaler une faille, se trouvent dans notre <a href="/security/#fr">Politique de sécurité</a>.</p>` },
    { id: 'breach', h: '13. Si quelque chose tourne mal', html: `
<p>Si une atteinte aux mesures de sécurité visant des renseignements personnels crée un risque réel de préjudice grave, nous en avisons les personnes touchées dès que possible, nous la déclarons au Commissariat à la protection de la vie privée du Canada (et à la Commission d’accès à l’information du Québec ou à une autre autorité lorsque la loi l’exige), et nous avisons quiconque peut réduire le préjudice. Nous tenons un registre de chaque atteinte pendant au moins 24 mois.</p>` },
    { id: 'evolves', h: '14. Comment cette politique évolue', html: `
<p>Ceci est la version ${'{VERSION}'}, en vigueur depuis le ${'{DATE}'}. Chaque changement est inscrit au <a href="/privacy/changelog/#fr">journal des modifications</a>, et chaque version antérieure reste lisible dans le registre public.</p>
<ul>
<li>Un nouveau service, ou un nouveau type de données, reçoit son entrée dans la carte des données et une mise à jour de cette politique <strong>avant</strong> son lancement.</li>
<li>Nous révisons cette politique chaque trimestre. Prochaine révision : ${'{NEXT}'}.</li>
<li>Toute utilisation avec des écoles ou des enfants de moins de 16 ans passe d’abord par un examen juridique.</li>
<li>Pour un changement important, nous publions un avis sur ce site au moins 30 jours avant qu’il s’applique et, s’il change ce que nous faisons de votre inscription à la liste d’aperçu, nous vous écrivons.</li>
</ul>` },
    { id: 'contact', h: '15. Nous joindre et porter plainte', html: `
<p>Questions, demandes et plaintes : ${MAIL}. Nous cherchons à régler chaque préoccupation directement.</p>
<p>Vous pouvez aussi porter plainte auprès du <a href="https://www.priv.gc.ca/fr/signaler-un-probleme/">Commissariat à la protection de la vie privée du Canada</a> (1-800-282-1376), de votre commissaire provincial (au Québec, la <a href="https://www.cai.gouv.qc.ca/">Commission d’accès à l’information</a>) ou, dans l’Union européenne ou au Royaume-Uni, de votre autorité de protection des données.</p>` },
  ],
};

// --------------------------------------------------------------- SECURITY · EN
const securityEn = {
  title: 'Security Policy',
  kicker: 'Security is architecture, not policy',
  lead: 'Our security is not a promise made after the fact. It is the way the services are built. This page lists the guarantees the architecture gives today, its known limits, and how to report a weakness to us.',
  short: [
    'Hand reading in Re·UI runs on your phone. We never receive an image or sound.',
    'Everything travels encrypted (HTTPS). Plain-HTTP requests are redirected to HTTPS.',
    'Administration pages sit behind Cloudflare Access with Google sign-in, for named administrator addresses only, and our code checks the sign-in again.',
    'Secrets are never in our code. They are generated inside our build system and stored as encrypted secrets; nobody reads them.',
    'Room keys are stored only as a one-way hash. IP addresses are not stored with entries.',
    'Found a weakness? Write to ' + MAIL + '. We answer within 3 business days, and we will not take legal action against good-faith research.',
  ],
  sections: [
    { id: 'principles', h: '1. What the architecture guarantees', html: `
<ol>
<li><strong>Data minimisation.</strong> Each service keeps only the fields listed in our <a href="/privacy/#collect">Privacy Policy</a>. A new field cannot launch without a data-map entry and a policy update first.</li>
<li><strong>On-device processing.</strong> Re·UI reads the hand on the phone; only numbers and words leave it. Meta DAX learning records are built and saved on your device.</li>
<li><strong>Encryption in transit.</strong> All our sites use HTTPS; plain HTTP is redirected, and daxfoundation.org tells browsers to use HTTPS only. Our providers encrypt stored data at rest.</li>
<li><strong>Least-privilege access.</strong> Administration pages are behind Cloudflare Access with Google sign-in and an allow-list of administrator addresses, and our own code verifies the Access token again before showing anything.</li>
<li><strong>Secrets never in code.</strong> Keys and tokens are generated inside our build system (for example with a random generator in the build runner), bound directly as encrypted secrets, and never printed. Only their names are ever listed.</li>
<li><strong>Per-room keys, stored as hashes.</strong> A Re·UI room created with a key stores only the key’s SHA-256 hash. Without the key, the room’s records stay closed.</li>
<li><strong>Logs kept small.</strong> No IP address is stored with a form entry; spam limits use a salted hash per hour, deleted after two hours; technical logs are kept for days, not months.</li>
<li><strong>No third-party trackers.</strong> Cookieless analytics only; pages that ask for consent load none.</li>
<li><strong>Takedown that holds.</strong> A room that is taken down answers “gone” to everyone, administrators included.</li>
<li><strong>Release gates.</strong> Every publication of this site runs automated checks before it goes live (for example: no unsupported claims, no trackers on consent pages, every page linked to these policies). A failed check stops the release.</li>
<li><strong>Public source.</strong> The source of this site is published at ${SRC}.</li>
</ol>` },
    { id: 'limits', h: '2. Known limits, stated plainly', html: `
<ul>
<li>Data is stored by Cloudflare, mainly in the United States. There is no Canadian data residency today.</li>
<li>Re·UI room records have no automatic deletion period yet (deletion on request). Automatic periods come before any school use.</li>
<li>Re·UI downloads its hand-reading software from Google’s and jsDelivr’s servers.</li>
<li>If your browser cannot recognise speech on the phone, it uses its own speech service (in Chrome, Google’s). Turn voice off to avoid that.</li>
</ul>` },
    { id: 'disclosure', h: '3. Reporting a vulnerability', html: `
<p>Write to ${MAIL} with “Security” in the subject. Please include what you found, where (address, steps to reproduce), what an attacker could do with it, and how to reach you. English or French. Our machine-readable contact file is at <a href="/.well-known/security.txt">/.well-known/security.txt</a>.</p>
<h3 id="scope">Scope</h3>
<ul>
<li>daxfoundation.org and every *.daxfoundation.org service we run, including re.ui.research.daxfoundation.org, research.daxfoundation.org and approve.daxfoundation.org;</li>
<li>the Re·UI relay service our pages connect to;</li>
<li>our public source code.</li>
</ul>
<p><strong>Out of scope:</strong> the services of our providers themselves (report those to them), denial-of-service and load testing, social engineering of people, physical attacks, spam, and reports from automated scanners with no demonstrated impact.</p>
<h3 id="rules">Rules for good-faith research</h3>
<ul>
<li>Only test against your own rooms, entries and data. Do not access, change or delete anyone else’s data; if you reach some by accident, stop, do not keep it, and tell us.</li>
<li>Do not degrade the services for other people.</li>
<li>Give us a reasonable time to fix the issue before telling anyone else; we will agree on a date with you.</li>
</ul>
<h3 id="safe-harbour">Safe harbour</h3>
<p>If you follow these rules, we consider your research authorised, we will not take legal action against you, and we will not ask anyone else to. If someone else does, we will make it known that you acted with our authorisation.</p>
<h3 id="targets">Our response targets</h3>
<ul>
<li>Acknowledgement: within 3 business days.</li>
<li>First assessment: within 10 business days.</li>
<li>Fix: critical issues within 7 days, high within 30 days, others within 90 days, or sooner when we can.</li>
<li>We keep you informed and, if you wish, credit you by name when the fix is public. We do not offer payment for reports.</li>
</ul>` },
    { id: 'incidents', h: '4. Incidents', html: `
<p>When an incident happens we contain it first, then assess what was affected. If personal information is involved, we follow the <a href="/privacy/#breach">breach section of the Privacy Policy</a>: we notify the people affected and the authorities when the law requires it, and we keep a record of every incident for at least 24 months.</p>` },
    { id: 'evolves', h: '5. How this policy evolves', html: `
<p>This is version ${'{VERSION}'}, in force since ${'{DATE}'}. It changes together with the Privacy Policy, under the same rules: every new service is reviewed for security before it launches, the policy is reviewed every quarter (next: ${'{NEXT}'}), and every change is listed on the <a href="/privacy/changelog/">changelog</a>. The security.txt file carries an expiry date and is renewed before it lapses.</p>` },
  ],
};

// --------------------------------------------------------------- SECURITY · FR
const securityFr = {
  title: 'Politique de sécurité',
  kicker: 'La sécurité est une architecture, pas une politique',
  lead: 'Notre sécurité n’est pas une promesse faite après coup. C’est la façon dont les services sont construits. Cette page liste les garanties que l’architecture offre aujourd’hui, ses limites connues et la façon de nous signaler une faille.',
  short: [
    'La lecture de la main dans Re·UI se fait sur votre téléphone. Nous ne recevons jamais d’image ni de son.',
    'Tout circule chiffré (HTTPS). Les requêtes en HTTP simple sont redirigées vers HTTPS.',
    'Les pages d’administration sont protégées par Cloudflare Access avec connexion Google, pour des adresses d’administration désignées seulement, et notre code vérifie la connexion une seconde fois.',
    'Les secrets ne sont jamais dans notre code. Ils sont générés dans notre système de construction et stockés comme secrets chiffrés ; personne ne les lit.',
    'Les clés de salle sont stockées seulement sous forme de hachage à sens unique. Les adresses IP ne sont pas gardées avec les inscriptions.',
    'Vous avez trouvé une faille ? Écrivez à ' + MAIL + '. Nous répondons dans un délai de 3 jours ouvrables, et nous n’intenterons aucune poursuite contre une recherche de bonne foi.',
  ],
  sections: [
    { id: 'principles', h: '1. Ce que l’architecture garantit', html: `
<ol>
<li><strong>Minimisation des données.</strong> Chaque service ne garde que les champs listés dans notre <a href="/privacy/#fr">Politique de confidentialité</a>. Un nouveau champ ne peut pas être lancé sans entrée dans la carte des données et mise à jour de la politique d’abord.</li>
<li><strong>Traitement sur l’appareil.</strong> Re·UI lit la main sur le téléphone ; seuls des nombres et des mots en sortent. Les dossiers d’apprentissage Meta DAX sont construits et enregistrés sur votre appareil.</li>
<li><strong>Chiffrement en transit.</strong> Tous nos sites utilisent HTTPS ; le HTTP simple est redirigé, et daxfoundation.org demande aux navigateurs de n’utiliser que HTTPS. Nos fournisseurs chiffrent les données stockées.</li>
<li><strong>Accès au strict nécessaire.</strong> Les pages d’administration sont protégées par Cloudflare Access avec connexion Google et une liste d’adresses d’administration autorisées, et notre propre code vérifie de nouveau le jeton d’accès avant d’afficher quoi que ce soit.</li>
<li><strong>Jamais de secrets dans le code.</strong> Les clés et jetons sont générés dans notre système de construction (par exemple par un générateur aléatoire dans l’exécuteur de construction), liés directement comme secrets chiffrés, et jamais affichés. Seuls leurs noms sont listés.</li>
<li><strong>Une clé par salle, stockée en hachage.</strong> Une salle Re·UI créée avec une clé ne garde que le hachage SHA-256 de la clé. Sans la clé, les dossiers de la salle restent fermés.</li>
<li><strong>Des journaux réduits.</strong> Aucune adresse IP n’est gardée avec une inscription ; les limites anti-pourriel utilisent un hachage salé par heure, effacé après deux heures ; les journaux techniques sont gardés quelques jours, pas des mois.</li>
<li><strong>Aucun traceur tiers.</strong> Seulement une mesure d’audience sans témoins ; les pages qui demandent un consentement n’en chargent aucune.</li>
<li><strong>Un retrait qui tient.</strong> Une salle retirée répond « disparue » à tout le monde, administrateurs compris.</li>
<li><strong>Contrôles avant publication.</strong> Chaque publication de ce site passe des vérifications automatiques avant d’être en ligne (par exemple : aucune affirmation non fondée, aucun traceur sur les pages de consentement, chaque page liée à ces politiques). Une vérification échouée arrête la publication.</li>
<li><strong>Code public.</strong> Le code de ce site est publié à ${SRC}.</li>
</ol>` },
    { id: 'limits', h: '2. Limites connues, dites simplement', html: `
<ul>
<li>Les données sont stockées par Cloudflare, surtout aux États-Unis. Il n’y a pas de résidence des données au Canada aujourd’hui.</li>
<li>Les dossiers des salles Re·UI n’ont pas encore de durée d’effacement automatique (effacement sur demande). Des durées automatiques viendront avant toute utilisation scolaire.</li>
<li>Re·UI télécharge son logiciel de lecture de la main depuis les serveurs de Google et de jsDelivr.</li>
<li>Si votre navigateur ne peut pas reconnaître la parole sur le téléphone, il utilise son propre service vocal (dans Chrome, celui de Google). Coupez la voix pour l’éviter.</li>
</ul>` },
    { id: 'disclosure', h: '3. Signaler une vulnérabilité', html: `
<p>Écrivez à ${MAIL} avec « Sécurité » dans l’objet. Indiquez ce que vous avez trouvé, où (adresse, étapes pour reproduire), ce qu’un attaquant pourrait en faire et comment vous joindre. En français ou en anglais. Notre fichier de contact lisible par machine est à <a href="/.well-known/security.txt">/.well-known/security.txt</a>.</p>
<h3 id="fr-scope">Portée</h3>
<ul>
<li>daxfoundation.org et chaque service *.daxfoundation.org que nous exploitons, dont re.ui.research.daxfoundation.org, research.daxfoundation.org et approve.daxfoundation.org ;</li>
<li>le service de relais Re·UI auquel nos pages se connectent ;</li>
<li>notre code source public.</li>
</ul>
<p><strong>Hors portée :</strong> les services de nos fournisseurs eux-mêmes (signalez-les-leur), les attaques par déni de service et les tests de charge, l’ingénierie sociale visant des personnes, les attaques physiques, le pourriel et les rapports d’outils automatiques sans impact démontré.</p>
<h3 id="fr-rules">Règles de la recherche de bonne foi</h3>
<ul>
<li>Ne testez que vos propres salles, inscriptions et données. N’accédez pas aux données d’autrui, ne les modifiez pas et ne les effacez pas ; si vous en atteignez par accident, arrêtez, ne les gardez pas et dites-le-nous.</li>
<li>Ne dégradez pas les services pour les autres.</li>
<li>Laissez-nous un délai raisonnable pour corriger avant d’en parler à d’autres ; nous conviendrons d’une date avec vous.</li>
</ul>
<h3 id="fr-safe-harbour">Protection juridique (« safe harbour »)</h3>
<p>Si vous suivez ces règles, nous considérons votre recherche comme autorisée, nous n’intenterons aucune poursuite contre vous et ne demanderons à personne de le faire. Si quelqu’un d’autre le fait, nous ferons savoir que vous avez agi avec notre autorisation.</p>
<h3 id="fr-targets">Nos délais de réponse</h3>
<ul>
<li>Accusé de réception : dans un délai de 3 jours ouvrables.</li>
<li>Première évaluation : dans un délai de 10 jours ouvrables.</li>
<li>Correction : problèmes critiques en 7 jours, élevés en 30 jours, autres en 90 jours, ou plus tôt si possible.</li>
<li>Nous vous tenons informé et, si vous le souhaitez, vous nommons quand la correction est publique. Nous n’offrons pas de paiement pour les signalements.</li>
</ul>` },
    { id: 'incidents', h: '4. Incidents', html: `
<p>Lors d’un incident, nous le contenons d’abord, puis évaluons ce qui a été touché. Si des renseignements personnels sont en cause, nous suivons la <a href="/privacy/#fr-breach">section sur les atteintes de la Politique de confidentialité</a> : nous avisons les personnes touchées et les autorités lorsque la loi l’exige, et nous tenons un registre de chaque incident pendant au moins 24 mois.</p>` },
    { id: 'evolves', h: '5. Comment cette politique évolue', html: `
<p>Ceci est la version ${'{VERSION}'}, en vigueur depuis le ${'{DATE}'}. Elle change avec la Politique de confidentialité, selon les mêmes règles : chaque nouveau service est examiné du point de vue de la sécurité avant son lancement, la politique est révisée chaque trimestre (prochaine : ${'{NEXT}'}), et chaque changement est inscrit au <a href="/privacy/changelog/#fr">journal des modifications</a>. Le fichier security.txt porte une date d’expiration et est renouvelé avant qu’elle arrive.</p>` },
  ],
};

// ------------------------------------------------------------------ CHANGELOG
// Newest first. Each entry: version, date, what changed (both languages).
export const CHANGELOG = [
  {
    version: '1.0',
    date: '2026-11-05',
    en: 'First publication of the Privacy Policy and the Security Policy, with security.txt. Covers daxfoundation.org, the preview list, Re·UI and its relay, the research pipeline, Meta DAX play and samples, email and administration pages.',
    fr: 'Première publication de la Politique de confidentialité et de la Politique de sécurité, avec security.txt. Couvre daxfoundation.org, la liste d’aperçu, Re·UI et son relais, la chaîne de recherche, le jeu et les exemples Meta DAX, le courriel et les pages d’administration.',
  },
];

function fill(doc, lang) {
  const map = {
    '{VERSION}': POLICY.version,
    '{DATE}': lang === 'fr' ? POLICY.dateFr : POLICY.dateEn,
    '{NEXT}': lang === 'fr' ? POLICY.nextReviewFr : POLICY.nextReviewEn,
  };
  const sub = (s) => s.replace(/\{VERSION\}|\{DATE\}|\{NEXT\}/g, (k) => map[k]);
  return { ...doc, sections: doc.sections.map((s) => ({ ...s, html: sub(s.html) })) };
}

export const PRIVACY = { en: fill(privacyEn, 'en'), fr: fill(privacyFr, 'fr') };
export const SECURITY = { en: fill(securityEn, 'en'), fr: fill(securityFr, 'fr') };
