# Third-party notices

This project bundles data derived from third-party sources.

## BUDA py-tiblegenc font tables

`src/buda-tables.js` is generated (by `scripts/import-buda-tables.py`) from the
legacy-encoding font tables of **py-tiblegenc**, by the Buddhist Digital Archives
(BDRC / BUDA).

- Project: https://github.com/buda-base/py-tiblegenc
- License: Apache License 2.0 — full text in
  [`LICENSES/py-tiblegenc-Apache-2.0.txt`](LICENSES/py-tiblegenc-Apache-2.0.txt)
- Copyright © Buddhist Digital Resource Center and contributors.

**Changes made:** the per-font `(font, decimal codepoint) → Unicode` rows from
py-tiblegenc's CSV tables (`tiblegenc.csv`, `utfc.csv`, `udp.csv`, `attu.csv`)
were merged into a single JSON-like object keyed by font PostScript name and
serialized to a JavaScript module. On conflicts, the `tiblegenc` table takes
precedence. No mapping values were otherwise altered.

Per py-tiblegenc's own acknowledgements, those tables themselves build on:

- the InDesign conversion work of Élie Roux (eroux/tibetan-unicode-scripts),
- **UTFC** — Trace Foundation (Tashi Tsering, Nyima Droma),
- **UDP** — Leigh Brasington,
- **ATTU** — Frederick Johnson,
- review of the TibetanChogyal tables by the **Padmakara Translation Committee**.

With gratitude to all of the above.
