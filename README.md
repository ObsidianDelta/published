# published

What Jason Jeyanandan publishes on the web, as a git history anyone can read. How and why is in one short post, [How I Publish](https://jeyanandan.com/blog/how-i-publish/).

| Folder | Site | What is in it |
|---|---|---|
| `jeyanandan.com/` | [jeyanandan.com](https://jeyanandan.com) | Jason's personal site: the essays, their figures, the pages |
| `obsidiandelta.com/` | [www.obsidiandelta.com](https://www.obsidiandelta.com) | Obsidian Delta: the posts and the home page |
| `daxfoundation.org/` | [daxfoundation.org](https://daxfoundation.org) | The DAX Foundation: the definitions, the initiatives, the figures |

## Why this exists

Everything on those sites is a public thought record. It is published iteratively: a rough draft goes out, is reread across every surface for cohesion, and is refined. A word that gives the wrong impression gets fixed. So every piece is versioned. A post shows the date it was first published and the date it was last changed, and the **History** link beside those dates lands here, on that file's commit list, where every change can be read as a diff. Nothing is quietly edited.

The same rule already holds for the specifications: the [Constraint Protocol](https://github.com/daxfoundation/constraint-protocol) keeps a decision log, the [Fuckery framework](https://github.com/ObsidianDelta/Fuckery) keeps a change log and a list of dead ends, and [Meta DAX](https://github.com/daxfoundation/metadax) dates every result. This repository extends it to the sites. The DAX Foundation's [definitions](https://daxfoundation.org/definitions/) also keep every earlier wording on the page itself.

## What is here, and what is not

Here: the markdown of every post, the source of every page, the SVG figures, and the small amount of site code that renders them (layouts, styles, the build scripts for the figures). Commit messages are the working log, as written at the time. Dates are the original commit dates.

Not here: media files (video, audio, raster images), build lock files, pages that are kept off the sites, and one unlisted area of obsidiandelta.com that is not part of the public record. Drafts stay out until they are published.

## How it is produced

For now this history is derived from the private repository where the sites are built: a workflow re-derives it on every change to the sites and pushes it here, so it is a pure function of that repository's history. Everything in it is published by Jason through his [cognitive companion](https://daxfoundation.org/definitions/#cognitive-companion), which is part of him, not a second party: the two are one unit, and what lands here is his, however it was produced. Commits authored "Obsidian Delta" are landings the companion made; the rest Jason typed himself. Author emails are rewritten to a no-reply address.

The direction is going to flip: this repository is intended to become the place content is landed first, with the sites built from it, so that "first published" and "updated" come from git rather than from a hand-typed date.

## Contributing

Pull requests here are not merged, because the content is derived. Corrections are welcome as issues on this repository; they are read, and the fix lands where the work is done and arrives here on the next sync.

## Licence

As stated on each site and in each post. Where nothing is stated, the text is © Jason Jeyanandan, all rights reserved; quoting with a link is welcome.
