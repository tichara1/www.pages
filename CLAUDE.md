# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A GitHub Pages static site hosted at `tichara1.github.io/www-pages/`. It contains interactive mobile app UI prototypes — no build step, no package manager, no bundler.

## Development

There is nothing to install or build, but a static HTTP server **is required** — `file://` does not
work. The landing page `fetch`es `prototypes.json`, and the modular prototypes load `.jsx` via
`src=`; the browser blocks both over `file://` as cross-origin.

```
npx serve docs
# or
python3 -m http.server 8080 --directory docs
```

All runtime dependencies (React 18, Babel standalone, fonts) come from CDN.

## Layout

```
docs/
├── index.html          landing page (rozcestník) — the ONLY page in the root
├── prototypes.json     manifest driving the landing page
├── _config.yml
├── reserve/            Reserve Fitness
├── date/               Évora — src/ is live, prototype/ is archived
├── weather/            Počasí ČR
├── fitspot/            FitSpot — shell with a v1/v2 switch, both versions in subfolders
├── concept/            QR/NFC tag → PWA concept
└── superpowers/        specs & plans — not a prototype, never in the manifest
```

**One folder per prototype, entry point always `index.html`.** Nothing but the landing page,
the manifest and `_config.yml` belongs in `docs/` root.

**Developer documentation is not published.** `docs/_config.yml` excludes `superpowers/` along
with every README, test suite and helper script that is not part of a running page. The files stay
in the repo and are readable on GitHub; they just never reach the Pages site. Note that a Jekyll
`exclude:` list replaces the defaults rather than extending them.

## Adding a new prototype

1. Create `docs/<slug>/` with an `index.html` entry point. Assets stay inside that folder — no
   shared files across prototypes; duplication is cheaper than coupling here. Anything that is not
   part of the running page (tests, `package.json`, tooling) goes into `exclude` in
   `docs/_config.yml` so Pages does not publish it.
2. Append an object to `docs/prototypes.json`:

   ```json
   {
     "slug": "my-thing",
     "title": "My Thing",
     "path": "my-thing/",
     "tagline": "One line, what it is",
     "description": "Two or three sentences on what it does and what is interesting about it.",
     "tags": ["react", "ios"],
     "stack": "React 18 + Babel standalone",
     "status": "active",
     "updated": "2026-08-03"
   }
   ```

   - `path` is relative to `docs/` and ends with `/`. Usually `<slug>/`, but it can point deeper
     (Évora's slug is `evora` while its path is `date/src/`).
   - `status` — `active` | `wip` | `archived`. Archived entries are hidden behind a toggle.
   - `updated` — `YYYY-MM-DD`. Cards are sorted by this, descending.
   - `tags` are searchable and clickable; keep them lowercase and reuse existing ones.
3. Do **not** edit `index.html` — it renders whatever the manifest contains. Touch it only when
   changing the hub's own design or behaviour.
4. Verify: serve `docs/`, confirm the card appears and its link resolves.

Superseded versions stay in the repo as `status: archived` rather than being deleted.

## Architecture

**Zero-build stack:** JSX files are loaded as `<script type="text/babel">` and transpiled in the browser by Babel standalone. This means edits to `.jsx` files are reflected immediately on page reload — no compile step.

**Component/global injection pattern:** `ios-frame.jsx` renders iOS device chrome and assigns components to `window` (`IOSDevice`, `IOSStatusBar`, etc.). Script load order in the HTML is significant — the last script mounts the app into `#root`.

**Responsive scaling:** The mount script reads viewport dimensions and applies a CSS `scale()` transform to fit the 402×874 iOS device frame within the window.

### The prototypes

- **`docs/reserve/`** — Reserve Fitness: fitness class booking with three roles (customer, trainer, admin) switched from a strip above the device frame. State lives in a single `useStore` hook with `localStorage` persistence (`reserve.v1`). Role screens in `customer.jsx`, `trainer.jsx`, `admin.jsx`; shared UI in `shared.jsx` and `map.jsx`; `app.jsx` wires it together and mounts.
- **`docs/date/src/`** — Évora: date-planning app, the modular rewrite. Screens in `screens/`, primitives in `ui/`, i18n + storage + export helpers in `lib/`. CZ/EN switch at runtime, `.ics` and PNG-with-QR export, persistence under `evora.v1`. Manual test checklist in `TESTING.md`, design in `docs/superpowers/specs/2026-04-29-evora-f1-design.md`.
- **`docs/date/prototype/`** — Évora's predecessor, archived. Two monolithic files (`app.jsx` EN, `app-cz.jsx` CZ) with a flat screen-stack router (`go(screenName)` / `back()`).
- **`docs/weather/`** — Počasí ČR: Leaflet map of Czech weather from Open-Meteo (ICON-D2, falling back to ICON-EU for the far end of day 3). Daily view shows the most severe phenomenon between 08:00 and 20:00 and a *weighted* mean temperature for the same window (12–16 counts 3×, 9–12 2×, 16–18 1.5×, the rest 1×) so a cold morning cannot drag a warm afternoon down — the icon is never weighted. Clicking a marker switches to an hourly mode with a 0–23 slider that redraws every marker. Plain ES modules with relative imports — **not** the Babel/JSX stack the other prototypes use. The only prototype with tests: `node --test` from `docs/weather/`, 67 cases over WMO codes, model merging, aggregation and location data. Its `package.json` exists solely for `"type": "module"` (no dependencies, nothing to install). Design in `docs/superpowers/specs/2026-07-31-weathercz-design.md`, details in `docs/weather/README.md`.
- **`docs/fitspot/`** — FitSpot, two versions side by side. `index.html` is only a shell: a `v1 / v2` toggle above an iframe, with the choice held in `localStorage` (`fitspot.version`) and in `?v=`. **`v1/`** is the original concept — renting gym space by the hour — as a ~1.1 MB bundle produced by a Claude Design canvas (`<x-dc>` markup, `DCLogic` class, base64 assets including baked OSM tiles); treat it as an opaque artifact, do not hand-edit it. **`v2/`** is a modular rewrite on the repo's usual Babel/JSX stack: find a trainer by district → activity → optional venue type (gym, running track, outdoors), pick one off a live Leaflet map or the list, and send a training request carrying a message and a skippable health questionnaire the trainer sees on their side. The Super admin tab tracks the app owner's commission — one 15 % cut of each training, sliced three ways. Pure logic lives in `logic.js` and data in `data.js`; both are plain scripts with a `module.exports` guard, so `node --test` from `docs/fitspot/v2/` runs 33 cases over filtering, commission aggregation and request state. Script order in `v2/index.html` matters — `search.jsx` must precede `lessons.jsx` and `trainer.jsx`. Details in `docs/fitspot/README.md`.
- **`docs/concept/`** — product concept for a QR/NFC sticker that opens an instructional PWA. Static document page with Mermaid diagrams, no React.
