# Vendored third-party code

Self-hosted so the player makes **no** network requests to anyone. Nothing here loads from a CDN.

## three.js

- File: `three.module.min.js`
- Version: **0.169.0** (pinned)
- Source: npm `three@0.169.0`, from `build/three.module.min.js` (obtained via `npm pack three@0.169.0`)
- Licence: **MIT** — see `three.LICENSE` (Copyright © 2010-2024 three.js authors)
- Size: ~671 KB
- Loaded lazily: only a package that contains a `scene` block pulls this in. Packages without scenes load nothing from here.

To update: `npm pack three@<version>`, copy `package/build/three.module.min.js` and `package/LICENSE` here, and bump the version above.
