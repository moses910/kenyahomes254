# Google Maps link on the property location tag

Status: awaiting confirmation of the seams and the three edge calls below.

## Problem Statement

On a property page, a buyer sees where the home is as a plain inert text line
("street address, city") and a small static map preview that cannot be panned,
cannot be zoomed out, and captions itself with a pair of raw decimal numbers. To
actually look around the neighbourhood — schools, commute, satellite view — the
buyer has to memorise the address and retype it into another app. The link that
should already be there is missing. Listings where the agent never dropped a pin
get nothing useful at all.

## Solution

The location line on a property page becomes a real link to Google Maps that opens
in a new tab. A listing with a dropped pin links by exact coordinates. A listing
without one falls back to a text search built from its address, city and region,
plus the country for disambiguation. A listing with no location information at all
renders as plain text, exactly as today. The static map preview keeps its current
behaviour and gains a "View larger map" link to the same place. The stray comma
that appears whenever a listing has no street address is gone. One rule decides
every URL, so listing cards or a future "get directions" can reuse it instead of
re-inventing it.

## User Stories

1. As a buyer, I want the location on a property page to open Google Maps, so that I can explore the neighbourhood without retyping the address.
2. As a buyer, I want the link to land on the exact building when the agent dropped a pin, so that I am not left guessing somewhere on the street.
3. As a buyer, I want the link to still work when the agent only typed a city, so that every listing gives me something to open.
4. As a buyer, I want a listing with no location information to look normal rather than showing a dangling comma, so that the page never looks broken.
5. As a buyer, I want the map preview to offer a bigger view, so that I can see more context than the small static frame shows.
6. As a buyer on a phone, I want the link to open the Google Maps app, so that I do not have to fight the desktop site.
7. As a buyer using a screen reader, I want to know that the link leaves the site and opens a new tab, so that I am not surprised.
8. As a buyer, I want a visible hover state on the location, so that I can tell it is clickable before I click it.
9. As an agent, I want my exact pin honoured, so that the buyer sees precisely where the property is.
10. As an agent who never dropped a pin, I want my typed city and region to be enough, so that my listings are not second-class.
11. As a maintainer, I want one place that decides the Maps URL, so that adding the same link elsewhere later does not duplicate the rule.
12. As a maintainer, I want the label and URL rules covered by tests, so that a refactor of the property header cannot silently break the links.
13. As a maintainer, I want lint to be green before this feature lands, so that "no new errors" does not become the only thing I can check.

## Implementation Decisions

- **One pure module owns two rules.** `googleMapsUrl(location)` returns a URL or
  nothing; `locationLabel(location)` returns the human-readable text. Both take a
  narrow location shape (latitude, longitude, address, city, region) so a caller
  can pass a property row or a hand-built object.
- **URL rule.** When both coordinates are usable, Google's documented universal
  search URL with a coordinate query. Otherwise, when any of address, city or
  region is present, the same URL with a URL-encoded text query joined from the
  non-empty parts plus the country. Otherwise, nothing.
- **Coordinates are usable only when both are present and finite.** Anything else
  falls through to the text rule. No API key, no SDK, no billing surface is
  introduced anywhere.
- **The property header's location line becomes an anchor when a URL exists.** It
  keeps its pin icon, gains a trailing external-link icon, opens in a new tab with
  `noopener noreferrer`, and carries an accessible name that states both the
  destination and the new tab. When no URL exists it stays plain text.
- **The label keeps its current shape** — street address, then city — with empty
  parts skipped. Region is not added to the visible line; it only participates in
  the fallback query.
- **The map preview is otherwise untouched.** Same map, same non-interactive
  flags, same pin. Its caption keeps the coordinates and gains a "View larger map"
  link to the same URL. The preview only renders when both coordinates exist, so
  that link is always available wherever the caption appears.
- **Outbound links are plain anchors** styled as part of the surrounding text, not
  filled buttons.

### Decisions taken at the edges (confirm or overrule)

- **No location information at all:** the location line renders unlinked and
  visible; it does not disappear. Hiding it would silently change the header's
  rhythm, and the requirement is only that the page not look broken.
- **"View larger map" keeps the raw coordinate text** on the caption rather than
  replacing it.
- **Region never appears in the visible label**, even though it appears in the
  query.

## Testing Decisions

- **Seam:** the two rules exported by the new pure module. It is the highest seam
  that reaches the behaviour — both the URL decision and the label decision live
  there — and it needs no DOM, so it runs on the repo's existing toolchain with no
  new dependencies. This was verified before writing the spec: a colocated
  TypeScript test runs directly under `node`, and the project typecheck and lint
  stay clean with it present.
- **Covered:** coordinates win over text; the text fallback joins non-empty parts
  in order and appends the country token; nothing when there is no data; partial
  or non-finite coordinates fall through to text; the label skips missing parts
  without leaving a stray separator; encoding survives spaces and commas.
- **Not covered:** the rendered anchor. Its correctness is the module's output plus
  a click-through in a browser — the user's check, not a simulated-DOM assertion.
- **Prior art:** none. This repo has no test runner and no test file. This change
  introduces the first one, deliberately as a single node-runnable file so it
  cannot rot into an unrunnable harness.
- **Gate:** the new unit test, the project typecheck, and lint with no new errors.
  The one pre-existing lint error sits in a Lovable-generated file that forbids
  direct edits, so the generated Supabase integration directory is excluded from
  lint in its own commit before the feature work, and the gate reads green.

## Out of Scope

- **Listing cards and the agent dashboard** stay inert. Cards are wrapped in a
  card-wide link, so an inner anchor raises "which click wins" questions, and cards
  currently reveal only the city while the link would reveal exact coordinates.
- **Directions, Street View, copy-coordinates, sharing**, and deep links that open
  the native app on a specific viewport.
- **Any Google Maps embed, API or SDK integration**, any API key, any billing.
- **Showing region in the header**, or any other redesign of the location line.
  Chip/badge styling was explicitly rejected.
- **Backfilling coordinates** for existing listings, or geocoding the typed address
  at create time.
- **Analytics** on outbound clicks.
- **Interactivity of the map preview** (pan, zoom) and its own styling.

## Further Notes

- The comma fix ships with this change because it lives on the exact line being
  turned into a link. It is called out here so it is not mistaken for scope creep.
- "Location tag", in this codebase, means the pin-iconed text line in the property
  detail header. The app has no tag, chip or badge concept for location, and this
  change does not introduce one.
- The new module is deliberately separate from the existing map helper: that helper
  imports Leaflet, which cannot load outside a browser, so a URL rule living there
  would be untestable.
- Appendix — where it lives (naming files, kept out of the decisions above):
  the new module is `src/lib/googleMaps.ts`; its colocated test is
  `src/lib/googleMaps.test.ts`; the header anchor lives in
  `src/components/property/PropertyInfo.tsx`; the caption link lives in
  `src/components/property/PropertyMap.tsx`; a `test` script goes in
  `package.json`; the lint baseline comes from excluding the generated Supabase
  integration directory in `eslint.config.js`.

## Slices

**01 — Lint baseline.** What to build: the lint gate reads green, so later
tickets are judged on new errors only. Blocked by: none. Acceptance: `eslint .`
exits 0, and no generated file was edited.

**02 — Location URL and label rules.** What to build: the pure module plus its
tests and the `test` script — coordinates win, text fallback appends the country
token, nothing when there is no data, labels skip missing parts. Blocked by: 01.
Acceptance: the unit test fails first, then passes; typecheck and lint stay green.

**03 — Links on the property page.** What to build: the header's location line
becomes an anchor when a URL exists, and the map caption gains "View larger map".
Blocked by: 02. Acceptance: a listing with a pin, one with only a city, and one
with no location each render the agreed behaviour, confirmed by a browser
click-through.
