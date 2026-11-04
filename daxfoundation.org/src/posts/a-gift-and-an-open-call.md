---
title: "A gift, and an open call"
description: "The DAX Foundation is incorporated. To mark it: a gift about what love sounds like, an open call for research into nonverbal communication in learning, and the lab where that research starts."
date: 2026-11-04
draft: false
unlisted: true
related:
  - url: /gift/
    label: "What love sounds like (the gift)"
  - url: https://daxfoundation.org/metadax/research/#formerly-brunswicklab
    label: "DAX Foundation Research"
  - url: https://research.daxfoundation.org/
    label: "DAX Research"
---

<style>
  .gx-fig { margin: 2.25rem 0; }
  .gx-fig img, .gx-pair img, .gx-ballet img { display: block; width: 100%; height: auto; border: 1px solid var(--line); background: #000; }
  .gx-fig figcaption, .gx-pair figcaption, .gx-cap { margin-top: 0.65rem; font-size: 0.875rem; line-height: 1.5; color: var(--muted); }
  .gx-label { display: block; margin-bottom: 0.35rem; font-size: 0.75rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--faint); }
  .gx-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin: 2.25rem 0; align-items: start; }
  .gx-pair figure { margin: 0; }
  .gx-gift { display: block; margin: 1.75rem 0; padding: 1.25rem 1.4rem; border: 1px solid #3a3222; background: linear-gradient(135deg, #17130b, #0d0d0d 70%); color: var(--fg); text-decoration: none; }
  .prose a.gx-gift { border-bottom: 1px solid #3a3222; }
  .gx-gift strong { display: block; font-size: 1.25rem; font-weight: 400; color: #f1d9a0; }
  .gx-gift span { display: block; margin-top: 0.35rem; font-size: 0.9375rem; color: var(--muted); }
  .gx-gift:hover, .gx-gift:focus-visible { border-color: #8a6d33; }
  /* The card ballet: a plain numbered list of frames; the script turns it into a player. */
  .gx-ballet { margin: 2.25rem 0; }
  .gx-ballet ol { list-style: none; margin: 0; padding: 0; }
  .gx-ballet li { margin: 0 0 1.75rem; }
  .gx-ballet li figure { margin: 0; }
  .gx-ballet .gx-step { color: #f1d9a0; margin-right: 0.4rem; }
  .gx-ballet .gx-controls { display: none; }
  .gx-ballet.is-live ol { display: grid; }
  .gx-ballet.is-live li { grid-area: 1 / 1; margin: 0; opacity: 0; visibility: hidden; transition: opacity 0.7s ease, visibility 0s linear 0.7s; }
  .gx-ballet.is-live li.is-on { opacity: 1; visibility: visible; transition: opacity 0.7s ease; }
  .gx-ballet.is-live .gx-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin-top: 0.9rem; }
  .gx-controls button { all: unset; box-sizing: border-box; cursor: pointer; padding: 0.4rem 0.7rem; border: 1px solid var(--line); color: var(--muted); font-size: 0.8125rem; letter-spacing: 0.04em; }
  .gx-controls button[aria-pressed="true"], .gx-controls button[aria-current="step"] { border-color: #8a6d33; color: #f1d9a0; }
  .gx-controls button:hover, .gx-controls button:focus-visible { color: var(--fg); border-color: var(--muted); }
  .gx-controls .gx-play { margin-left: auto; }
  .gx-lab { position: relative; aspect-ratio: 16 / 9; margin: 2.25rem 0 0.75rem; border: 1px solid var(--line); background: #000; overflow: hidden; }
  .gx-lab button { all: unset; box-sizing: border-box; display: block; width: 100%; height: 100%; cursor: pointer; position: relative; }
  .gx-lab button img { display: block; width: 100%; height: 100%; object-fit: cover; opacity: 0.7; transition: opacity 0.25s; }
  .gx-lab button:hover img, .gx-lab button:focus-visible img { opacity: 0.92; }
  .gx-lab button span { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); padding: 0.7rem 1.3rem; border: 1px solid var(--fg); background: rgba(10, 10, 10, 0.8); color: var(--fg); font-size: 1rem; letter-spacing: 0.04em; white-space: nowrap; }
  .gx-lab iframe { display: block; width: 100%; height: 100%; border: 0; }
  .gx-form { margin: 2rem 0; padding: 1.5rem; border: 1px solid var(--line); background: #0f0f0f; }
  .gx-form .gx-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .gx-form label { display: block; margin: 0 0 1rem; font-size: 0.875rem; color: var(--muted); }
  .gx-form label b { font-weight: 500; color: var(--fg); }
  .gx-form input[type="email"], .gx-form input[type="text"], .gx-form textarea { box-sizing: border-box; display: block; width: 100%; margin-top: 0.35rem; padding: 0.6rem 0.7rem; border: 1px solid #2c2c2c; background: #0a0a0a; color: var(--fg); font: inherit; font-size: 1rem; }
  .gx-form textarea { min-height: 5.5rem; resize: vertical; }
  .gx-form input:focus-visible, .gx-form textarea:focus-visible { outline: 1px solid var(--fg); outline-offset: 1px; }
  .gx-form .gx-consent { display: flex; gap: 0.7rem; align-items: flex-start; color: #d6d6d6; }
  .gx-form .gx-consent input { margin-top: 0.25rem; flex: none; width: 1.1rem; height: 1.1rem; accent-color: #c9a45a; }
  .gx-form .gx-hp { position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden; }
  .gx-form button[type="submit"] { all: unset; box-sizing: border-box; cursor: pointer; padding: 0.7rem 1.2rem; border: 1px solid #8a6d33; color: #f1d9a0; font-size: 0.9375rem; letter-spacing: 0.03em; }
  .gx-form button[type="submit"]:hover, .gx-form button[type="submit"]:focus-visible { background: #17130b; }
  .gx-form button[disabled] { opacity: 0.5; cursor: default; }
  .gx-form .gx-small { margin: 0.9rem 0 0; font-size: 0.8125rem; color: var(--faint); }
  .gx-form .gx-status { margin: 1rem 0 0; font-size: 0.9375rem; color: var(--fg); }
  .gx-form .gx-status:empty { display: none; }
  /* Wide pieces break out of the reading column, centred on it; on a phone they are the column. */
  .prose .gx-wide { width: min(64rem, calc(100vw - 2rem)); max-width: none; margin-left: calc((100% - min(64rem, calc(100vw - 2rem))) / 2); }
  .prose .gx-cap { color: var(--muted); margin-bottom: 1.5rem; }
  @media (max-width: 40rem) {
    .gx-pair, .gx-form .gx-row { grid-template-columns: 1fr; }
    .gx-form { padding: 1.1rem; }
    .gx-controls .gx-play { margin-left: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .gx-ballet.is-live li, .gx-ballet.is-live li.is-on { transition: none; }
  }
</style>

Today the DAX Foundation is incorporated. We are marking the day the way we mean to go on: with something given away, something asked for, and an honest look at the work as it stands.

## First, a gift: what love sounds like

The first thing the Foundation gives is about love. It is a page for anyone, in many languages, where you can discover what love sounds like, make your own, and share it.

<a class="gx-gift" href="/gift/"><strong>What love sounds like</strong><span>Pick an inspiration. Go from an emotion, to notes, to chords. Keep it, or share it.</span></a>

It works like a small studio. You pick an inspiration. Then you go one step at a time: from an emotion, to the notes it suggests, to the chords that hold them. What comes out is yours. There is no account and nothing to install.

Love comes first, and it means the whole range: family, friendship, belonging, care. After love come the things that grow beside it: creativity, ingenuity, curiosity, awe, hope, optimism, togetherness. We wanted the first gift to be about the best of us.

What you make stays with you unless you choose to share it. If you do, it joins an open dataset of what love sounds like, free to anyone, anywhere. Short paid surveys at [research.daxfoundation.org](https://research.daxfoundation.org/) feed the same dataset.

One rule for the music. Where a chord progression comes from a song or a tradition, the page names its source. It plays no copyrighted recordings, melodies or lyrics. Harmony is shared, and credit is given.

## An open call: Resonance UI

The second thing is a request. We are opening research into what we are calling Resonance UI, and we are looking for partners.

It is research into nonverbal communication. Learning has never been only words. It is a hand that points, eyes that follow it, a body that leans in, a voice that rises when something matters, a room that turns to look at the same thing. We want to study nonverbal, multimodal and embodied communication in learning, with care:

- gesture, and co-speech gesture: the hands that move with the words;
- gaze, and shared attention, especially across large displays;
- posture, and movement around shared displays;
- prosody: the pitch, timing and stress of the voice;
- embodied cognition: the body's part in thinking;
- how a group reasons together around shared visual material.

We are also assessing teacher receptivity: how ready teachers are to equip themselves, explicitly, to better enable learning in their students.

In the founder's words: "we're looking for a specific site where it could be the center of research for resonance UI." One place, a college, a university, a lab or a teacher-education program, anywhere in the world, where the work can live and be studied over time. Research partners are welcome. So is funding.

The data will be an open dataset. Brunswick Lab, formerly brunswicklab.com, is now part of [DAX Foundation Research](/metadax/research/#formerly-brunswicklab), and this is its work now.

## This is the call-out

If you are at a university or college, write to us from your institution's address and we will email you a one-time sampler link. It opens the lab on your own screens for sixty minutes from the first time it is opened.

We are doing this so we can start sharing research data with you, in a collaborative effort, to be used globally. That means open research data. It does not mean newsletters.

<form class="gx-form" id="gx-form" action="https://research.daxfoundation.org/api/sampler-request" method="post" novalidate>
  <label><b>Your institutional email address</b> (required)
    <input type="email" name="email" required autocomplete="email" inputmode="email" placeholder="you@university.edu"></label>
  <div class="gx-row">
    <label>Name (optional)<input type="text" name="name" autocomplete="name" maxlength="120"></label>
    <label>Institution (optional)<input type="text" name="institution" autocomplete="organization" maxlength="200"></label>
  </div>
  <label>Role (optional)<input type="text" name="role" autocomplete="organization-title" maxlength="120" placeholder="Lecturer, researcher, teacher educator, student"></label>
  <label>What interests you (optional)<textarea name="interest" maxlength="1000" placeholder="Gesture, gaze, prosody, shared displays, teacher education..."></textarea></label>
  <label class="gx-hp" aria-hidden="true">Leave this empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
  <label class="gx-consent"><input type="checkbox" name="consent" required><span>Participation is voluntary. What I share in this research is research data, published under an open licence.</span></label>
  <button type="submit">Email me a sampler link</button>
  <p class="gx-status" id="gx-status" role="status" aria-live="polite"></p>
  <p class="gx-small">The address must belong to a university or college; we check its domain against open lists of academic domains. It is used only to send your link. It is never published, and it joins no mailing list. If your college is not recognised, <a href="https://www.linkedin.com/in/jasonjeyanandan">message the founder on LinkedIn</a> and we will check it by hand.</p>
</form>

## We are experimenting with new ways of expressing cards

The third thing is a look at the work. Much of what we show is cards: a small surface that holds one idea. Here is how we have shown them until now.

<div class="gx-pair gx-wide">
  <figure><span class="gx-label">Before</span><img src="/figures/writing/a-gift-and-an-open-call/before-map.webp" width="1400" height="1273" loading="lazy" alt="The daxfoundation.org home page: a map of the DAX Foundation as a graph with three nodes, and beneath it three cards, one each for Nova DAX, Skippy DAX and the Constraint Protocol."><figcaption>The map on the home page, with a card for each of three builds.</figcaption></figure>
  <figure><span class="gx-label">Before</span><img src="/figures/writing/a-gift-and-an-open-call/before-chapter.webp" width="1400" height="1127" loading="lazy" alt="One chapter of the Meta DAX explainer: a small animated scene on the left and the chapter's question and text on the right."><figcaption>One chapter of the explainer: a scene, and the card's text beside it.</figcaption></figure>
</div>

These work. They are also flat: one screen, one reader, one card at a time.

Here is where they are going. The same kind of cards, in a scene that runs across three screens side by side, made for a room of people rather than one.

<div class="gx-ballet gx-wide" id="gx-ballet">
  <span class="gx-label">After</span>
  <ol>
    <li class="is-on"><figure><img src="/figures/writing/a-gift-and-an-open-call/after-1-arrive.webp" width="1280" height="676" loading="lazy" alt="Dark screen with glowing cards in French and English, joined by thin curved lines of light."><figcaption><span class="gx-step">1</span>The cards stream in and link to one another.</figcaption></figure></li>
    <li><figure><img src="/figures/writing/a-gift-and-an-open-call/after-2-throw.webp" width="1288" height="676" loading="lazy" alt="Two screens meeting at a bezel. On the left, a card is held; on the right, another card is in flight, trailing light, as it lands among the cards there."><figcaption><span class="gx-step">2</span>A card is picked up and thrown from one screen to the next.</figcaption></figure></li>
    <li><figure><img src="/figures/writing/a-gift-and-an-open-call/after-3-open.webp" width="1280" height="676" loading="lazy" alt="One card, Santé : la personne au centre, held open in the middle of the screen, with three smaller cards beneath it: the trap, the gesture, the teach-back."><figcaption><span class="gx-step">3</span>A card opens into its parts.</figcaption></figure></li>
    <li><figure><img src="/figures/writing/a-gift-and-an-open-call/after-4-sort.webp" width="1280" height="676" loading="lazy" alt="A screen titled Sept domaines, seven fields, with its cards sorted into a row along the bottom."><figcaption><span class="gx-step">4</span>The cards sort themselves, one group to each screen.</figcaption></figure></li>
    <li><figure><img src="/figures/writing/a-gift-and-an-open-call/after-5-converge.webp" width="1280" height="676" loading="lazy" alt="A white triangle, the Greek letter delta, drawn on a dark field, with cards streaming into it on trails of light."><figcaption><span class="gx-step">5</span>Everything converges into the Δ.</figcaption></figure></li>
  </ol>
  <div class="gx-controls" role="group" aria-label="Frames of the card scene">
    <button type="button" data-go="0">1</button><button type="button" data-go="1">2</button><button type="button" data-go="2">3</button><button type="button" data-go="3">4</button><button type="button" data-go="4">5</button>
    <button type="button" class="gx-play" aria-pressed="false">Play</button>
  </div>
</div>

<figure class="gx-fig gx-wide">
  <a href="/figures/writing/a-gift-and-an-open-call/after-4-sort-three-screens.webp"><img src="/figures/writing/a-gift-and-an-open-call/after-4-sort-three-screens.webp" width="2400" height="421" loading="lazy" alt="Three screens side by side, titled Le défi, La science and Sept domaines, each with its cards sorted into a row along the bottom."></a>
  <figcaption>The sorting moment across all three screens: the challenge, the science, the seven fields. Open the image to see it full size.</figcaption>
</figure>

None of this is finished. It is how we are learning what a card can do when more than one person is in the room.

## Here is the lab

The fourth thing is the lab itself: the research sampler we built to study nonverbal, multimodal communication. It plays a short intro reel, about thirty seconds, then settles into a plain laboratory demo that a phone can drive.

<div class="gx-lab gx-wide" id="gx-lab">
  <button type="button" aria-label="Start the research sampler here">
    <img src="/figures/writing/a-gift-and-an-open-call/lab-poster.webp" width="1280" height="720" loading="lazy" alt="The research sampler: cards in French and English on a dark field, linked by lines of light.">
    <span>Start the lab here</span>
  </button>
</div>
<p class="gx-cap gx-wide">Each visitor gets a fresh room. <a id="gx-lab-start" href="https://re.ui.research.daxfoundation.org/reui-start">Open it on your own screens</a>, with a phone to drive it.</p>

It is purposely plain, because it is a laboratory. What matters is what passes from one person to another without words, not how the screen looks. The time-limited sampler links in the call-out above are for institutions; if yours needs something else, [message the founder on LinkedIn](https://www.linkedin.com/in/jasonjeyanandan).

## What today is

A foundation, a gift, a question and a lab. Incorporation is one piece of paper. The rest is the work it is for, and we would rather do that work with you.

Which of the four would you try first?

## Sources

- DAX Foundation Research, "Formerly brunswicklab.com, now part of DAX Foundation Research": https://daxfoundation.org/metadax/research/#formerly-brunswicklab
- DAX Research, research.daxfoundation.org: https://research.daxfoundation.org/
- The research sampler, DAX Foundation Research: https://re.ui.research.daxfoundation.org/reui-start
- Hipo, university-domains-list, the open list of university domains the call-out checks against: https://github.com/Hipo/university-domains-list
- The "before" images are the daxfoundation.org home page as it stood on 4 November 2026. The "after" images are stills from the sampler's card scene, rendered across three screens.

<script>
  (function () {
    var LINKEDIN = 'https://www.linkedin.com/in/jasonjeyanandan';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // The lab: a fresh room per visitor, and the iframe only after a click.
    var base = 'https://re.ui.research.daxfoundation.org';
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var bytes = window.crypto && window.crypto.getRandomValues ? window.crypto.getRandomValues(new Uint8Array(8)) : null;
    var tail = '';
    for (var i = 0; i < 8; i++) tail += chars[(bytes ? bytes[i] : Math.floor(Math.random() * 256)) % chars.length];
    var room = 'reui-sample-web-' + tail;
    var start = document.getElementById('gx-lab-start');
    if (start) start.href = base + '/reui-start?room=' + room;
    var lab = document.getElementById('gx-lab');
    var labButton = lab && lab.querySelector('button');
    if (labButton) labButton.addEventListener('click', function () {
      var frame = document.createElement('iframe');
      frame.src = base + '/reui?room=' + room + '&n=1&of=1';
      frame.title = 'The research sampler';
      frame.allow = 'autoplay; fullscreen';
      frame.setAttribute('allowfullscreen', '');
      lab.replaceChildren(frame);
      frame.focus();
    });

    // The card ballet: one frame at a time, steps and play/pause; plays only on screen.
    var ballet = document.getElementById('gx-ballet');
    if (ballet) {
      var items = ballet.querySelectorAll('li');
      var steps = ballet.querySelectorAll('[data-go]');
      var play = ballet.querySelector('.gx-play');
      var at = 0, timer = null, wanted = !reduce, visible = false;
      var show = function (n) {
        at = (n + items.length) % items.length;
        for (var k = 0; k < items.length; k++) {
          items[k].classList.toggle('is-on', k === at);
          items[k].setAttribute('aria-hidden', k === at ? 'false' : 'true');
          if (steps[k]) { if (k === at) steps[k].setAttribute('aria-current', 'step'); else steps[k].removeAttribute('aria-current'); }
        }
      };
      var sync = function () {
        var run = wanted && visible;
        if (run && !timer) timer = setInterval(function () { show(at + 1); }, 3200);
        if (!run && timer) { clearInterval(timer); timer = null; }
        play.setAttribute('aria-pressed', wanted ? 'true' : 'false');
        play.textContent = wanted ? 'Pause' : 'Play';
      };
      for (var s = 0; s < steps.length; s++) steps[s].addEventListener('click', function (e) {
        wanted = false; show(+e.currentTarget.getAttribute('data-go')); sync();
      });
      play.addEventListener('click', function () { wanted = !wanted; sync(); });
      for (var m = 0; m < items.length; m++) { var im = items[m].querySelector('img'); if (im) im.loading = 'eager'; }
      ballet.classList.add('is-live');
      show(0);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { visible = es[0].isIntersecting; sync(); }, { threshold: 0.4 }).observe(ballet);
      } else { visible = true; }
      sync();
    }

    // The call-out: post to the research worker; if it is not there, fall back to LinkedIn.
    var form = document.getElementById('gx-form');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('gx-status');
      var say = function (html) { status.innerHTML = html; };
      var fallback = 'The request service is not open yet. <a href="' + LINKEDIN + '">Message the founder on LinkedIn</a> with your institutional address, and your sampler link will be emailed to it.';
      var email = form.email.value.trim();
      if (!form.email.checkValidity() || !email) { say('Please enter your institutional email address.'); form.email.focus(); return; }
      if (!form.consent.checked) { say('Please tick the consent box. Participation is voluntary.'); form.consent.focus(); return; }
      var body = {
        email: email, name: form.name.value, institution: form.institution.value, role: form.role.value,
        interest: form.interest.value, consent: true, website: form.website.value, source: 'daxfoundation.org/writing'
      };
      var button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      say('Sending…');
      fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { code: r.status, j: j }; }); })
        .then(function (res) {
          var esc = email.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
          if (res.code === 200 && res.j && res.j.ok) {
            say(res.j.repeat
              ? 'We already have a request from ' + esc + '. Your one-time sampler link will be emailed to that address.'
              : 'Thank you. Your one-time sampler link will be emailed to ' + esc + '.');
            form.reset();
          } else if (res.code === 422) {
            say('We could not recognise that address as a university or college. <a href="' + LINKEDIN + '">Message the founder on LinkedIn</a> and we will check it by hand.');
            button.disabled = false;
          } else if (res.code === 400) {
            say('Please check your email address and the consent box.');
            button.disabled = false;
          } else { say(fallback); button.disabled = false; }
        })
        .catch(function () { say(fallback); button.disabled = false; });
    });
  })();
</script>
