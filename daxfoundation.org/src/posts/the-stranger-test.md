---
title: The stranger test
description: Before anyone else tried the public page, we had it followed by stand-ins with no context at all. Here is what broke, what was fixed by when, and what has still not been tested by a person.
date: 2026-10-18
draft: false
series: results
part: 3
series_total: 5
related:
  - url: https://daxfoundation.org/writing/fourteen-small-experiments/
    label: "Fourteen small experiments, and why small first"
  - url: https://daxfoundation.org/writing/how-a-showcase-is-made/
    label: "How a showcase is made"
  - url: https://daxfoundation.org/writing/the-game-has-no-ai-in-it/
    label: "The game has no AI in it"
  - url: https://daxfoundation.org/writing/refusing-a-bypass-and-keeping-the-receipt/
    label: "Refusing a bypass, and keeping the receipt"
  - url: https://daxfoundation.org/metadax/guide/any-ai/
    label: "Build a package with the AI you already have"
---

A page that asks a parent to build a lesson with the AI they already have should be followed cold before a parent tries it. So on 11 October we followed ours with stand-ins. They were fresh models, not people: one was a plain chat with no tools, the other a clean coding assistant with only the skill installed. Each played an invented parent of an invented child of about nine, adding fractions with different denominators, who had written 1/2 + 1/3 = 2/5 and loves hockey.

No human stranger has run the page yet, as far as our records show. That run is still to do, and it is the invitation at the end. The stand-ins still found real faults: the player showed the learner the answers, the raw prompt needed files a stranger would not have, and the checker could hang. Fixes were merged on 12 October, and the page now works for the stand-ins. Whether it works for a person, they cannot tell us.

## What was followed, and where it broke

Open [the any-AI guide](https://daxfoundation.org/metadax/guide/any-ai/). Today it has four steps: open one plain-text prompt; paste it into the chat you already use and type Start under it; answer about a dozen questions with a made-up nickname; copy the package it hands back into [the player](https://daxfoundation.org/metadax/play/) and press Play. The player has two tabs, one for the guide and one for the learner. On 11 October the stand-ins followed the earlier version of those steps.

The prompt broke first. With only the prompt, and none of the six template files it told the assistant to attach, the stand-in interviewed the parent well and then refused to build, because the format files were missing. By the prompt's own rules the refusal was right, and a stranger would not have known where the templates were. That comes from our write-up of the session, which is not public yet; the public trace is [a correction we made that day to a post that said to paste the prompt](https://github.com/ObsidianDelta/published/commit/28c63afd0719ab27486629ee3a9cb60f2b53e377), citing "the stranger test showed it fails without the templates".

The player broke second. Before 12 October its code drew every question at once, ticked the right choice and printed the explanation under each one, on the learner's tab as on the guide's. Sort, sequence and build showed only a note saying "play it live in the player" ([the player's source at that point](https://github.com/ObsidianDelta/published/blob/fc2a331d906a44ac2e1e37682c4661a3c3a212b0/daxfoundation.org/public/metadax/play/index.html)). That is an answer key, not a game.

The checker broke third. It is the program the player runs on a package before it plays. Its copies had drifted apart, and the fix names two defects: a deadlock, and word lists that ignored case, so "AI" matched the French "j'ai" ([the checker commit](https://github.com/ObsidianDelta/published/commit/fc2a331d906a44ac2e1e37682c4661a3c3a212b0)).

## What was fixed, and by when

All times are UTC. The checker became one source at 06:04 on 12 October ([public PR 17](https://github.com/daxfoundation/metadax/pull/17)). At 06:27 the player became an interactive game ([the player commit](https://github.com/ObsidianDelta/published/commit/e8dd0a011d1afb82b33d04120e56791f8b940954)): one item at a time, choices shuffled, up a level after three right answers in a row, down after one miss, and the answers in a folded "Answer key (for you)" on the guide's tab. Also at 06:27 the prompt became self-contained ([public PR 18](https://github.com/daxfoundation/metadax/pull/18)); its first line now reads "Start now. This message is the whole instruction". At 06:31 the guide lost its attachment list ([the guide commit](https://github.com/ObsidianDelta/published/commit/a3ec7bb5d2fef77ec0e5463d1bd125c0f3fa6ea6)).

More stand-in runs followed on 12 October: two siblings learning to read, a second session built from the player's note, French, and telling time. Reviewers found content slips, and [public PR 19](https://github.com/daxfoundation/metadax/pull/19) added five quality rules, among them a passage on the learner's side and no giveaway numbers. A real coding-assistant install on a clean test machine, with the parent's answers supplied by us, showed several permission prompts and a hand-back that told the parent to paste a file that sits on disk. [Public PR 22](https://github.com/daxfoundation/metadax/pull/22) cut the prompts at 08:28, and the hand-back now points at the player's new "Open a file" button ([08:15 commit](https://github.com/ObsidianDelta/published/commit/1de553edea7cf57840a0b1be5bd46f688ec40928)).

One of our own follow-up changes to the player carried a curly-quote syntax error; [the commit that fixed it](https://github.com/ObsidianDelta/published/commit/514daa58092ee615740c527e514b4cd8ccb2aa6b) also added a test that the page's inline scripts compile. We read the live player's code again on 18 October: nothing is marked right before a choice is made.

## What nobody has tested, and what to do

Stand-ins are not parents. They answer every question in full sentences, never lose the thread, and all came from one maker's models, close to a consumer chat but not one. They show whether the page and prompt hold together, not whether a tired parent with a child at the table gets through, or whether another AI service behaves the same way. On 18 October [the metadax issue list](https://github.com/daxfoundation/metadax/issues) holds six open issues, all opened on 9 October, and none is a report from following the guide.

The move this week is to follow the page yourself with the AI you already have. Paste the prompt, type Start, give a made-up nickname and nothing identifying, and paste what comes back into the player. If something breaks, open an issue on that list (it needs a free GitHub account and is public, so leave out anything about your child). Tell us the step, what you saw, what you expected, and which AI you used.

The page before this one, [Fourteen small experiments](https://daxfoundation.org/writing/fourteen-small-experiments/), says why the small tests come first. The next, [How a showcase is made](https://daxfoundation.org/writing/how-a-showcase-is-made/), follows a brief, sometimes only eight lines, to a page a person has read. For the player this page says was once a key, as a parent sees it now, read [The game has no AI in it](https://daxfoundation.org/writing/the-game-has-no-ai-in-it/). The same habit, a kept record so the next failure is prevented, is the subject of [refusing a bypass and keeping the receipt](https://daxfoundation.org/writing/refusing-a-bypass-and-keeping-the-receipt/).

What broke for you, and at which of the four steps?

## Sources

- Our own public records, all verified on 18 October 2026. The 11 October write-up of the session is kept in our working archive and is not public yet.
- Public commit, 11 October 2026, 16:41 UTC, correcting the paste-the-prompt claim: https://github.com/ObsidianDelta/published/commit/28c63afd0719ab27486629ee3a9cb60f2b53e377
- The player's source before the fix, at commit fc2a331: https://github.com/ObsidianDelta/published/blob/fc2a331d906a44ac2e1e37682c4661a3c3a212b0/daxfoundation.org/public/metadax/play/index.html
- Checker commit, 12 October 2026, 06:04 UTC: https://github.com/ObsidianDelta/published/commit/fc2a331d906a44ac2e1e37682c4661a3c3a212b0 and public PR 17: https://github.com/daxfoundation/metadax/pull/17
- Player commit with "Open a file", 12 October 2026, 08:15 UTC: https://github.com/ObsidianDelta/published/commit/1de553edea7cf57840a0b1be5bd46f688ec40928
- Player commit, 12 October 2026, 06:27 UTC: https://github.com/ObsidianDelta/published/commit/e8dd0a011d1afb82b33d04120e56791f8b940954
- Public PR 18, merged 12 October 2026, 06:27 UTC: https://github.com/daxfoundation/metadax/pull/18 ; the live prompt: https://raw.githubusercontent.com/daxfoundation/metadax/main/skills/metadax-homeschool/prompt.md
- Any-AI guide commit, 12 October 2026, 06:31 UTC: https://github.com/ObsidianDelta/published/commit/a3ec7bb5d2fef77ec0e5463d1bd125c0f3fa6ea6
- Public PR 19 (merged 06:41 UTC) and PR 22 (merged 08:28 UTC), 12 October 2026: https://github.com/daxfoundation/metadax/pull/19 and https://github.com/daxfoundation/metadax/pull/22
- Player follow-up with the syntax fix and test, 12 October 2026, 07:44 UTC: https://github.com/ObsidianDelta/published/commit/514daa58092ee615740c527e514b4cd8ccb2aa6b
- The live player: https://daxfoundation.org/metadax/play/ and the live guide: https://daxfoundation.org/metadax/guide/any-ai/
