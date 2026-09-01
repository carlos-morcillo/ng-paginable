# Changelog

## [Unreleased]

## [22.16.0] - 2026-09-01

### Added

- **`provideHubPaginableActions`**, so the table's row buttons and menus are drawn by a
  real component library instead of by the table itself.

  What the table drew was markup in Bootstrap class names — `.btn`, `.dropdown-menu`,
  `.dropdown-item` — which resolve to nothing in a product that does not ship Bootstrap.
  Measured in one: the menu trigger fell back to the browser's default grey button
  (`2px outset`, square, the wrong height beside its neighbours) and the panel was a
  transparent box with no border, no shadow and no padding. The row actions had been
  given the design system's vocabulary; the menu was left behind wearing names that no
  longer resolve.

  Rather than restyle a second implementation of a dropdown the button library already
  has — with placement, outside-click, Escape, scroll and focus already solved — the
  table now *describes* what a row offers and an adapter draws it. Exactly the
  arrangement `provideHubPaginableFormControls` already uses for the table's inputs, and
  with the same consequence: **no new dependency**, in either direction.

  ```ts
  import { provideHubPaginableActions } from 'ng-hub-ui-paginable';
  import { hubActionsAdapter } from 'ng-hub-ui-buttons';

  providers: [provideHubPaginableActions(hubActionsAdapter)];
  ```

  Nothing changes in how actions are declared: `variant`, `color`, `icon`, `hidden`,
  `disabled` and `tooltip` stay the API, and a table already in use needs no edit to a
  single header. What the adapter receives is fully resolved for the row — hidden actions
  are absent, predicates are booleans, Observable labels are strings — so an adapter never
  has to know any of that is possible.

- **`hidden` and `disabled` on `PaginableTableDropdown`**, so a menu can be refused on a
  row like any other action.

### Deprecated

- **`PaginableTableDropdownComponent`**, and the built-in markup the table falls back to
  when no adapter is registered. Both still work and nothing breaks by upgrading; the
  table says so once per application, in production builds, naming the one line that
  fixes it.

### Fixed

- **A dropdown item now answers `hidden` and `disabled` like any other row action.**

  An action tucked into the ⋮ menu is the same action, and it answered to nothing. The
  menu read `hidden` as a plain boolean, so the predicate form — the one every button
  drawn directly in the cell accepts — was a function, and a function is always truthy:
  an action meant to disappear on *some* rows disappeared from *every* row. `disabled`
  was ignored outright, with no effect whatsoever.

  That is what pushed consumers to keep row-dependent actions out of the menu, which is
  precisely the crowding the menu exists to relieve: an action column with five buttons
  had no way to fold two of them away if either depended on the row.

  Both flags now take a boolean or a predicate over the row, resolved through the same
  path the cell's buttons use, and the refusal is enforced in the handler as well — the
  menu closes on click, so the `disabled` attribute alone would not stop it. A disabled
  item is drawn with the table's own formula and token
  (`--hub-table-action-disabled-opacity`), so it reads as refused in the menu exactly as
  it does in the cell.

## [22.15.0] - 2026-09-01

### Added

- **`disabled` on a row action** (`PaginableActionButton.disabled`), boolean or predicate,
  shaped exactly like `hidden` because both answer the same question about the same button.

  `hidden` was the only thing a consumer could say about an action that does not apply, and
  it says the wrong thing for half the cases: a cancelled payment is not a row where editing
  does not exist, it is a row where editing has nothing left to act on. Forced to choose,
  consumers hid the action — so the column changed shape row by row and nothing on screen
  said why the button was gone.

  It reaches the rendered `<button>`, so the browser refuses the click and announces the
  state, and the tooltip still shows — which is where the reason belongs. A refused action
  also **looks** refused now: this table draws its own buttons, so the browser's default
  disabled rendering never reached them, and without a rule a `disabled` action would have
  kept its full tint and its pointer while swallowing every click. Tunable through
  `--hub-table-action-disabled-opacity`.


## [22.14.1] - 2026-08-24

### Fixed

- **The search field's geometry actually reaches it now.** 22.14.0 claimed this and shipped it inert. The rule was written as `::ng-deep`, and nested by accident inside the component's right-to-left block, so it compiled to `:host.hub-table--rtl :host ::ng-deep …` — confined to a direction most tables are not in, and unmatchable even there, because `:host` twice describes an element inside itself. It read correctly in the source and applied in no table anywhere.

    It is not a `::ng-deep` rule any more, and that is the actual repair rather than a correction of the selector. Reaching into a component this table does not own was the wrong shape to begin with: custom properties inherit, so the container states the group's radius on its **own** element and whatever fills it reads it — the adapter's `<hub-input>`, or the native fallback, which ignores what it does not use. Nothing names the control.

    Measured on a consuming application: field and button both 38px where the button was 54px, trailing corners flattened, and no rule in the whole document naming the control. Two cases pin it — the container declares the radius, and no shipped selector mentions `ng-deep` or the control.

    The other half of what made the button overshoot — a form field's stacking margin, kept by a control that is not stacked in a form — moved to `ng-hub-ui-forms`, where the adapter that creates it says so once for every library that wires it.

## [22.14.0] - 2026-08-21

### Changed

- **A row action's colour is resolved, not enumerated.** `PaginableActionButton.color` is typed `… | (string & {})` and accepts any string on purpose, but the accent arrived as a class the stylesheet matched against seven built-in names. Anything else — a role a consumer declared, a literal `#ff6600` — produced a class matching no rule, an unset custom property and a `color-mix` with nothing to mix: a button with no accent, no error and no warning, from an API whose type said any string was welcome.

    The accent is a value now, written on the element through `resolveHubAccent` — the same helper this component already used for its own variant, and the list for hers. A bare word becomes `var(--hub-sys-color-<word>, <word>)` so both the system's roles and a consumer's own resolve; anything already a colour passes through untouched. The seven rules are gone, and the bench now pins that the stylesheet names no colours at all.


### Added

- **`variant` and `color` on a row action, so it can look like the buttons beside it.** The table draws these buttons itself — plain `<button>` elements — and `hub-buttons` styles appearance through `:host(...)`, which matches nothing on an element the primitive did not create. A consumer who wanted a tinted row action therefore rebuilt the tint in its own stylesheet: two copies of one formula, free to drift the moment either side changed.

    The vocabulary is `hubButton`'s (`solid`, `soft`, `outline`, `ghost`, plus the `default` this table has always drawn) and the tints ship here, built with the primitive's own arithmetic — the accent at 12% over the page surface for the subtle, at 80% over the ink for the emphasis — so the two read the same side by side. `default` stays the default and takes no colour: colouring it would be giving it a variant by the back door. A variant with no colour is `neutral`, not colourless.

### Fixed

- **The table's chrome controls survive being rendered through the hub-forms adapter.** `provideHubPaginableFormControls` swaps the search box and the page-size picker for `<hub-input>` and `<hub-select>`, and the CSS for them was written for the native fallbacks. The two encapsulation modes then failed in opposite directions: the table's stylesheet is **emulated**, so its `.hub-table__search-input` rule carried an `_ngcontent` attribute and never reached a dynamically created component — the field came out with none of the group geometry, a standalone rounded control beside the button it was meant to be joined to; the paginator's ships with **`encapsulation: None`**, so its `.hub-paginator__select` rule *did* reach the component's host and drew a second border and padding around a control that already draws its own. One rule too narrow, one too wide, from the same assumption. The native skin now names the native element, the adapter's host draws no box, and the search field is reached through `::ng-deep` scoped to the table's host.

- **The search button declares its own border.** It set a border *colour* and no width or style, which draws nothing unless something else supplies them — Bootstrap's `.btn`, which this family does not ship. Without it, the browser's own button chrome showed beside the search field.

- **The sort trigger stops borrowing chrome the host may not have.** `<hub-table>` draws its own sort button and styled only the glyph inside it, leaving the `<button>` to whatever the application provided — and it carried a bare `btn`, which is Bootstrap's and which this family neither ships nor depends on. In an application without Bootstrap the class matched nothing and every sortable column header showed the browser's native grey button around the glyph. The class is gone from the markup and the component now styles its own trigger: no box, no background, no padding, the header cell's own colour, and `--hub-table-sort-btn-hover-color` for the hover.

### Changed

- **Rebuilding `items` no longer prunes the selection, and no longer publishes.** The setter used to recompute the value from whatever survived the rebuild and, if it differed, announce it through the CVA. It reads as tidy and it is a guess: `items` shrinking means "those are gone" on a filtered catalogue and "this is page two" on a paged one, and the component sees the same thing in both cases — only the consumer, who did the paging, can tell. So a list that merely turned a page told its consumer the user had removed a selection they never touched, with no way to distinguish that from a real removal. The written value is now kept whole and only the part that is on offer is ticked. Angular's own `<select>` takes the same position: an option disappearing does not clear the model.

    **This is a behaviour change.** A consumer that relied on the list pruning its own value has to prune it itself, where it knows why the offer changed.


## [22.13.0] - 2026-08-18

### Added

- **`flushFields` on `hub-table`: the controls in the cells drawn as a spreadsheet, not as a form.** A field is boxed so it can be told apart from the page around it. A table cell already does that job — it has its own grid — so the box gets drawn twice, and an editable table ends up reading as a form that fell into a table.

    With it: the fields lose their border and surface, a static `prepend`/`append` reads as the plain text or icon it is rather than as a chip, and a projected button stops being welded to its neighbour — it gets its corners back, a gap, and its own border colour, because two actions in a cell are two things to press rather than one strip. The control's own shared corners come back too: nothing here is joined to anything, so nothing should show the flat side that says it is.

    Implemented as a token assignment on the cells rather than as an input on each field, which is why it reaches a consumer's own `cellTpt` content as well. It needs `ng-hub-ui-forms@22.21.0` for the seam tokens; on an older version the fields still go flat and the attached strip simply stays welded.

    One detail worth knowing before reaching for it: `hub-select` declares its own `--hub-select-border-width` and `--hub-select-bg`, so the bundle restates the select's twins — set only the shared pair and you get boxed selects among flat inputs.

## [22.12.3] - 2026-08-18

### Fixed

- **`flush` keeps the padding, in the list and in the table.** The variant zeroed `--hub-list-item-padding-x` — and `--hub-table-cell-padding-x` — along with the border, the radius and the surface. In a list that left the checkbox or radio hard against one edge and the trailing figure against the other; in a table it ran the columns into each other, which costs a table the one thing it is for. It was also incoherent with itself: the vertical padding stayed, so a flush collection had breathing room on one axis and none on the other.

    Flush answers to Bootstrap's `.list-group-flush`, which drops the side borders and the radius and **keeps** the padding — taking off the chrome is not the same as taking off the space to read in. A consumer who really does want the text bleeding to the edge sets `--hub-list-item-padding-x: 0` from outside, which is what the token is for.

## [22.12.2] - 2026-08-18

### Removed

- **An XML namespace that was declared and never used.** The table's loading spinner carried `xmlns:xlink="http://www.w3.org/1999/xlink"` on its inline `<svg>`, and `xlink:href` appears nowhere in this monorepo — the attribute had been dead since it was written.

    Worth a line because of how it surfaced: a supply-chain scanner reports the package as containing "fragments of URLs or external IP addresses, which the package may be accessing at runtime", and this was one of them. It was never an address — a namespace URI names a vocabulary and is never dereferenced — but one of the two it found turned out to be genuinely dead, so it goes.

    The other one stays: `http://www.w3.org/2000/svg` survives around fifty times, from the table's own icons, which are `data:image/svg+xml` URLs in SCSS. A `data:` URI is parsed as XML rather than as HTML, so the namespace declaration is what makes the icon render at all. The reasoning, and the decision to accept the alert rather than break the icons for it, is written down in `socket.yml` at the workspace root.

## [22.12.1] - 2026-08-17

### Fixed

- **A group row gets no radio in single selection.** The control was drawn on every row, so in a list grouped with `bindChildren` a heading became one of the things to choose — picking "Edificio Triana" answered with a building, which nobody can book. Only leaves carry a radio now, which is the single-selection twin of the cascade 22.12.0 gave `multiple`. It was the last thing standing between a grouped single-choice list and the primitive: a consumer needing one had to draw the control itself.


## [22.12.0] - 2026-08-17

### Changed

- **BREAKING — `clickFn` hands over the item, not the internal wrapper.** `ListClickEvent.item` carried the form group wrapping each row — `{selected, collapsed, data, children}` — while the published type said `item: T`. A consumer reading `event.item.<field>` by the types got `undefined`: no error, no warning, every guard silently false. It is the item now. `value` reads `bindLabel` from the item rather than from the wrapper (it was almost always `undefined` before), and a new `children: T[]` hands over a group's children as items. See `BREAKING_CHANGES.md`.

- **BREAKING — a group row selects its children instead of itself.** With `bindChildren`, a group's checkbox put the group's own value into the selection and left its children alone, so ticking a building meant "the building", which nobody can book, and a building with one room chosen looked exactly like one with none. Ticking a group now takes everything under it, a partly-selected group renders `indeterminate`, and only leaves travel in the value.

### Fixed

- **Rebuilding `items` no longer clears the selection, nor claims the user did.** The setter emptied the form and published the empty selection through the CVA, so a list that merely re-read its data dropped the choice *and* told the consumer the user had cleared it — with no way to tell a refresh from an edit. The selection is carried across the rebuild and matched by `bindValue`; only what the new items no longer offer falls out of it; and nothing is published unless something really went.

- **`setDisabledState` disables.** It assigned a flag the template never read, so a disabled list still changed its selection. The flag now disables the form — reaching every `selected` control, however deep — and the selection is left alone even when something drives it programmatically. Through the form and not a `[disabled]` binding, because Angular ignores that binding on a reactive control: it warns and the box stays live.

- **`options.searchable` searches.** The component rendered a search box wired to a `filter()` whose body was entirely commented out: a control the API offered and the component ignored. It filters now, with a `searchTerm` model and an optional `searchFn` — the same two names `hub-table` uses, so the components do not disagree about what "searchable" means. A group survives while any descendant matches, because hiding a building for not being named "Timple" would hide the Timple room inside it. Submitting returns to the first page: staying on page four of a list that just became three rows long shows an empty list, which reads as "nothing matched".


## [22.11.0] - 2026-08-17

### Added

- **`flush` on `hub-list` and `hub-table`: the collection drawn as a list rather than as a stack of cards.** Every row wears its own border, radius and surface by default. That is right for a collection standing on a page and wrong for a list of choices inside a dialog or a panel, where a bordered box per row reads as a region of its own rather than as one list to pick from — and where the surface has already drawn the frame.

    It had to be an input rather than something a consumer reaches with CSS, and the reason is worth writing down because it is a trap the whole token catalogue shares: `hub-list` declares its defaults on `:root, :host`, and the host is the very element a consumer puts a class on. Their assignment therefore ties on specificity and loses on source order — silently, with no error and no warning, which reads as "the token does nothing". The variant is declared on `:host(.hub-list--flush)`, where it out-weighs what it overrides, and `flush` binds the class.

    Two tokens come with it, read only under the variant: `--hub-list-divider-width` and `--hub-list-divider-color`, the rule that stands in for the gap. It falls between siblings only, so the list neither opens nor closes with one; a group and the collection it opens keep none between them; and the cards display gets none at all, because a grid separated by rules would draw them across the gaps.

    `hub-table` takes the same input, zeroing the outer border, the radius, the head rule and the cell padding. Its **row divider survives on purpose** — a table with no line between rows stops being readable across its columns, which is the one thing a table is for.

- **`hub-list-flush` as a mixin too**, in `styles/mixins/_list-theme.scss`, beside `hub-list-theme`. The input covers the common case with no stylesheet at all; the mixin is for the other one — applying the shape from your own selector, to every list in a region, without touching templates. The component includes that same mixin under `:host(.hub-list--flush)`, so the two cannot drift apart.

### Fixed

- **The package's stylesheets ship where the documentation says they do.** `ng-package.json` copied `src/lib/styles` with the short `assets` form, which **preserves the source path**, so the theming mixins landed at `ng-hub-ui-paginable/src/lib/styles/mixins/…` while their own docblocks told consumers to `@use 'ng-hub-ui-paginable/styles/mixins/list-theme'`. That path never resolved — `hub-list-theme` has been documented at an address it was not published to since it shipped. Now the long form with `output: "styles"`, which is what `utils` and `forms` already use.

- **The single-selection radio has a rule.** It shipped with the mode in 22.10.0 and had no CSS at all: `.hub-list__radio` matched nothing in the component, so the control rendered at the browser's own size beside a themed list, visibly not part of it. It now takes `--hub-list-radio-size` — defaulting to the checkbox's, since the two are the same control wearing a different rule about how many may be on — and the list's accent.


## [22.10.0] - 2026-08-17

### Added

- **`hub-list` single selection actually selects.** `selectable` has enumerated `single` since it shipped — its own transform even turns a bare `true` into it — and then nothing read the value. In the whole template `selectable()` was read once, to add a pointer cursor; the checkbox that mutates the selection was gated on `multiple`, and the row's click handler never touched it. So a consumer writing `selectable="single"` got a cursor and silence: an API typed, enumerated and inert.

    It is not an edge case — "choose one of these" is the ordinary shape for a room, a plan or a payment method — and every consumer that needed it built the row control by hand on top of an API that looked like it already did the job.

    Single now renders a radio per row, grouped per list instance so two lists on one page cannot fight over one selection, and picking a row releases the previous one across the whole tree rather than the visible page.

    **The value is the value, not a list of one.** Single emits the bare value (or `null`), and accepts one, exactly as `hub-select` does — asking "which one" should never mean reading `[0]` and then telling an empty array apart from a missing answer. `multiple` is untouched and still emits an array.

### Fixed

- **A value written by the form repainted nothing in single mode.** `writeValue` runs outside the component's own change detection, and the radio is a plain `[checked]` binding rather than a `formControlName` — which writes to the DOM itself and so never needed marking. Patching the control from the consumer's form moved the selection internally and left the rendered choice behind.

## [22.9.0] - 2026-08-17

### Added

- **`provideHubTableTooltip`, to give the table's own controls a themed tooltip.** Row actions and dropdown entries are drawn by the table from the `headers` configuration, so a consumer cannot reach them to restyle anything — their labels were stuck on the browser's native `title`, which ignores every theme and appears where the browser decides.

    Registering an adapter routes those labels to whatever tooltip the application already uses. Without one, the native `title` stays exactly as before: the table has no business requiring `ng-hub-ui-utils/styles/tooltip` in an application that never asked for it, and a themed tooltip missing its stylesheet is worse than the native one it replaced.

    ```ts
    provideHubTableTooltip({
        attach: (host, text) => {
            const controller = new HubTooltipController(host);
            controller.setText(text);
            return { update: (next) => controller.setText(next), destroy: () => controller.destroy() };
        }
    });
    ```

### Fixed

- **Icon-only row actions had no accessible name.** `title` was quietly serving as it. Moving the label to a tooltip and stopping there would have left a screen reader with an unlabelled button, so the text is now mirrored to `aria-label` — but only where the control renders no text of its own. Where a visible label exists it *is* the name, and overriding it with different words breaks WCAG 2.5.3 (Label in Name) in the belief of improving it.

## [22.8.1] - 2026-08-16

### Fixed

- **Row-action icons sat low in their buttons.** The button took its height from the line box of the glyph inside it, and an icon font's glyph is an inline-block resting on the baseline — so a 16px glyph in a 24px line box hung from that baseline and left the descender gap underneath. Measured on a 28px button: 4px of air above, 8px below.

    The content row now carries an explicit height and centres the glyph inside it, which keeps the button at 28px and splits the gap evenly. Measured after: 28px, 6 / 6.

    Recorded because both obvious repairs make it worse, and the next reader will reach for one of them: `display: flex` on the button or on the icon host removes the very line box that sets the height, collapsing the button from 28px to 20px; and `vertical-align: middle` does not centre, it overshoots to 7.78 / 4.22.

## [22.8.0] - 2026-08-14

### Changed

- **Translation lookups now resolve `HUBUI.PAGINABLE.*` before the legacy flat keys.** The table, list and paginator provide the namespace through `HUB_TRANSLATION_PREFIX`, so an application dictionary can feed them via `provideHubTranslationAdapter()` without reserving generic top-level keys. Existing flat dictionaries keep working — the bare key is still the fallback.

### Added

- README documentation for the application-wide translation adapter (`provideHubTranslationAdapter()` from `ng-hub-ui-utils`).

### Removed

- **Removed the `@angular/animations` peer dependency** and the unused table `fadeInOut` trigger declaration. The package is deprecated upstream and the trigger was never bound in the template. Applications that installed it only for `ng-hub-ui-paginable` can drop it.

## [22.7.1] - 2026-08-08

### Fixed

- Documentation links now point at the canonical localized URLs. The README linked to `https://hubui.dev/<path>` with no locale prefix and no trailing slash, and both forms are 301-redirected, so every reader arriving from npm or GitHub landed on a redirect instead of the canonical page.

## [22.7.0] - 2026-07-29

### Added

- **`--hub-table-head-border-width`** — the header's bottom-border thickness, until now locked to the shared `--hub-table-border-width` with no independent knob. Defaults to that same shared width, so nothing moves until overridden; a Bootstrap-style thicker header is `calc(var(--hub-table-border-width) * 2)` and keeps following the base width (upstream report: a theme thickening the grid moved every cell border but left the header behind).
- **`--hub-table-head-text-transform`** (default `none`) and **`--hub-table-head-letter-spacing`** (default `normal`) on the header titles — uppercase/tracked column headers without reaching for a `th` rule.

## [22.6.1] - 2026-07-26

### Fixed

- **SSR: importing the package no longer crashes on the server.** `DEFAULT_LANGUAGE` read `navigator.language` at module scope, so merely importing `ng-hub-ui-paginable` under Node/SSR threw `navigator is not defined` before any component ran. The constant now guards for a missing `navigator` and falls back to `'en'`.

### Removed

- Dead `ViewsService` (internal, never exported from the public API): `getViews()` threw `'not developed'`, `delete()` was commented out, and nothing consumed it.

## [22.6.0] - 2026-07-07

### Fixed

- **table — `[stickyHeader]` now pins the header inside a consumer's OWN scroll container.** The built-in `.hub-table__container` always established a scroll context (`overflow: auto`), which **trapped** the sticky header: when a product wrapped `<hub-table [stickyHeader]="true">` in its own fixed-height `overflow:auto` box (the common `max-height` + `overflow:auto` pattern), scrolling that box let the whole frame — header included — scroll out of view instead of pinning. `[stickyHeader]` now **releases** the container's scroll context (new `--hub-table-container-overflow`, flipped to `visible`) so the header sticks to the nearest scrolling ancestor, whether that is the built-in frame or an external box. The `options.scrollable` + `--hub-table-container-max-block-size` internal-scroll path is unchanged.
- **table — row/cell background is re-themeable by a plain tag selector (fixes dark-mode re-theming).** The surface tokens (`--hub-table-bg` / `--hub-table-color` and the `--hub-table-container-*` pair) were declared on `:host` (specificity `0,1,0`), which out-ranked a consumer's `hub-table { --hub-table-bg: … }` tag rule (`0,0,1`): re-mapping the surface for a dark theme reached the header but left the data cells/rows **white** (illegible) unless `!important` was used. Those surface tokens are no longer declared on `:host`; instead every consumption site reads them as `var(--hub-table-bg, <default>)`, so a plain `hub-table { --hub-table-bg: var(--su-surface) }` tag rule now reaches the rows and cells with **no `!important`**, while the default (and the sticky header) always resolve to an opaque colour via the same fallback. Built-in variant (`.hub-table__<variant>`) and state class rules are unchanged.

### Added

- **table — `--hub-table-container-overflow`** (default `auto`): the scroll behaviour of the built-in container. `[stickyHeader]` sets it to `visible` (see above) so the header pins to an external scroll ancestor; a product can also override it directly.
- **table — optional selected-row accent bar.** `--hub-table-selected-bar-width` (default `0` — no visual change) and `--hub-table-selected-bar-color` (defaults to the accent) draw a solid bar on the selected row's leading edge. Combined with the `hub-table__row--selected` tint (added in 22.5.0), a product can render the master-detail "active row" look — soft tint **plus** a leading accent bar — entirely through the `--hub-table-selected-*` tokens and `[rowClass]`, with no `!important`. RTL-aware (the bar mirrors to the trailing visual edge).

## [22.5.0] - 2026-07-07

### Added

- **table — `[stickyHeader]` input + `--hub-table-head-position`.** Pins the header while the body scrolls, **decoupled** from the built-in scroll frame: `[stickyHeader]="true"` makes the `thead` `position: sticky; top: 0` inside **any** consumer-provided scroll container (`max-height` + `overflow: auto`), not just the `options.scrollable` frame. The position is overridable via `--hub-table-head-position` (default `sticky`) and the offset via the existing `--hub-table-head-sticky-top`. Off by default — no change unless enabled.
- **table — themeable header typography & padding.** The header surface and text colour were already themeable via `--hub-table-head-bg` / `--hub-table-head-color`; the missing chrome is now exposed in the same namespace: `--hub-table-head-font-size`, `--hub-table-head-font-weight`, `--hub-table-head-padding-x`, `--hub-table-head-padding-y` (consumed by `.hub-table__header-cell` / `.hub-table__header-title-text`). Every token defaults to an existing value (cell padding / browser `th` weight), so there is **no visual change** until one is set.

### Changed

- **table — consumer-settable selected row.** The selected-row tint (`--hub-table-selected-bg` / `--hub-table-selected-color`) now also applies to a `hub-table__row--selected` class, so a product can drive the selected look from its own state via `[rowClass]` (e.g. `[rowClass]="row => row.isSelected ? 'hub-table__row--selected' : ''"`) instead of repainting the row. The built-in selection styling is unchanged.

## [22.4.0] - 2026-07-05

### Added

- **table — themeable header, row divider and scroll / sticky-header slots.** New CSS variables expose the header surface (`--hub-table-head-bg`, `--hub-table-head-color`), the inter-row divider (`--hub-table-row-divider-color`, independent of the outer frame and vertical borders), and a fixed-height scroll body with a working sticky header (`--hub-table-container-max-block-size` — set it together with `options.scrollable` to cap the body height; `--hub-table-head-sticky-top` for a sticky offset above a toolbar). Every token defaults to an existing value, so there is **no visual change** until one is set.
- **table — every built-in icon is now an overridable SVG token.** On top of the sort and row-expander caret glyphs, the remaining hard-coded icons — `search`, `filter`, `eraser`, `info`, `chevron-up/down/left/right`, `angle-left/right`, `angle-double-left/right`, `ellipsis-v`, `trash`, `plus` — now read a `--hub-table-icon-<name>` variable (painted through `mask-image`, tinted with `currentColor`), so a product can swap any of them to match its own iconography. Consumer icons passed through `header.icon` / `button.icon` still accept any icon-font class (Font Awesome, etc.).
- **table — master-detail expanding-row template gets a `colspan`.** The `*paginableTableExpandingRow` template context now exposes `colspan` (read it with `let-colspan="colspan"`) so a detail `<tr><td [attr.colspan]="colspan">` always spans the full table width. Both the expanding row and the state rows (loading / error / no-results) now use a full-width colspan that the browser clamps to the real column count — no manual counting needed.
- **table — multiple sticky columns per side.** `sticky: 'start' | 'end'` now supports **more than one** column pinned to the same side: a new `hubStickyColumns` directive measures each pinned column's real width and applies a cumulative offset, so sticky columns stack side by side instead of collapsing onto `left: 0` / `right: 0`. It re-syncs on viewport / column resize (`ResizeObserver`) and row / column changes (`MutationObserver`), and is SSR-safe (a no-op on the server). A single sticky column per side is unchanged.
- **list — opt-in item connector (timeline / pipeline look).** New `connected` input draws a vertical line between consecutive items (list display only, skipped in cards), themed via `--hub-list-connector-color` / `--hub-list-connector-width` / `--hub-list-connector-style` / `--hub-list-connector-offset`. Default-off — existing lists are unchanged.

### Fixed

- **list (cards) — long labels no longer overflow their card / grid track.** `.hub-list__label` now sets `min-width: 0` so the flex label can shrink to its column; in cards mode a long unbreakable token wraps (`overflow-wrap: anywhere`) instead of blowing out the item and overlapping the adjacent card.

### Changed

- **selectable rows / list items now show a `pointer` cursor on hover.** A `selectable` table row and a `selectable` list item (and card) advertise their interactivity with `cursor: pointer` — previously the pointer only appeared when a `clickFn` was set. Selection behaviour is unchanged (toggled via the checkbox).

## [22.3.1] - 2026-07-02

### Changed

- Hardcoded style values now consume the matching ds tokens (with the ds defaults as fallbacks) — no visual change.
- Docs: `docs/css-variables-reference.md` default values resynchronized with the actual code declarations (now guarded by the repo-level `tokens-parity` check F).

## [22.3.0] - 2026-06-29

### Added

- **table — automatic client-side pagination.** When `<hub-ui-table>` receives a plain array in `[data]` and `paginate` is `true` (the default) with no `totalItems` provided, the table now searches, filters, sorts and slices the data **entirely in memory** and computes the total itself — mirroring the client-side behaviour of `<hub-list>`. The global search box, sortable headers and every per-column filter (inline "row" filters — text, dropdown, boolean, number-range, date-range — and the advanced "menu" rule engine with AND/OR operators) all resolve client-side, and the page resets/clamps automatically as the result set changes. New internal `TableClientDataService` powers the engine; new public `clientMode`, `clientFilteredRows` and `displayedRows` signals on `TableComponent`.
- **application-wide input defaults via the provider.** `providePaginable()` (and `HubUITableModule.forRoot`) now accepts a `defaults` block — `PaginableDefaults` — to set library-wide default values for component inputs: `paginate`, `perPage`, `perPageOptions`, `paginationPosition`, `paginationInfo`, `searchable` and `debounce`. Any instance `@Input` still overrides them, and keys left unset keep each component's own default (e.g. `paginate` stays `true` for the table and `false` for the list). Example: `providePaginable({ defaults: { perPage: 25, perPageOptions: [25, 50, 100] } })`.

### Changed

- **table — `paginate` input is now functional.** It was previously declared but inert. It now gates the client-side mode described above. Passing a `PaginationState` to `[data]`, or setting `[totalItems]`, keeps the table in server mode (renders `[data]` as-is) exactly as before.

### Migration

- If you currently hand a **full array** to `<hub-ui-table>` expecting **all** rows to render without pagination, set `[paginate]="false"` — otherwise the table will now paginate it in memory (default page size `perPage`, 10). Consumers using server-side pagination (a `PaginationState`, or an array together with `[totalItems]`) are unaffected.

### Fixed

- **Documentation accuracy pass.** Rewrote `FUNCTIONALITIES.md` to separate "Implemented" from "Example available" and corrected stale rows (e.g. server-side pagination, resizable columns, row click, custom filter templates were marked as not covered despite being implemented); removed the non-existent "Ordinal Pipe" entry. Corrected the table's documented API (inputs/outputs) to match the real component: removed invented inputs (`pagination`, `selected`) and outputs (`rowClick`, `selectionChange`, `sortChange`, `filterChange`), documented the actual two-way `model` outputs (`pageChange`, `ordinationChange`, `filtersChange`, `searchTermChange`…) and the `clickFn` input. Fixed the CSS-variables section, whose group headings were rendering raw i18n keys (`DOCS.PAGINABLE.API.CSS_GROUP.*`) because those keys were never defined. Registered six existing-but-unhooked examples (action buttons, column visibility, custom filter templates, empty/error states, resizable columns, row click) and fixed the row-click example, which bound a non-existent `(rowClick)` output instead of the `clickFn` input.
- **`utils.spec.ts`** now imports the migrated helpers from `ng-hub-ui-utils` instead of the local `./utils` (which only re-exports `normalizeStateDefault`), unblocking the library's unit-test compilation.

## [22.2.0] - 2026-06-29

### Added

- **Agnostic form-controls integration.** The table's primitive controls (global search input, rows-per-page select) can now be rendered by an external component library without `ng-hub-ui-paginable` taking a hard dependency on it. New `HUB_PAGINABLE_FORM_CONTROLS` token, `provideHubPaginableFormControls()` provider, `HubPaginableControlDirective` and the `HubPaginableFormControlsAdapter` / `HubPaginableControlConfig` / `HubPaginableControlHandle` contract. With no adapter the table keeps rendering native `<input>` / `<select>` (zero dependencies); provide one (e.g. `hubFormControlAdapter` from `ng-hub-ui-forms`) and the controls upgrade automatically via dynamic component creation — `provideHubPaginableFormControls(hubFormControlAdapter)`.

## [22.1.3] - 2026-06-26

### Changed

- **table / list:** migrated the semantic accent to the open-set "local accent slot" pattern, aligned with the `ng-hub-ui-ds` engine. `--hub-table-accent` / `--hub-list-accent` now derive a full role family on the spot — `-emphasis` (`color-mix(in oklch, accent 80%, ink)`), `-subtle` (`color-mix(in oklch, accent 12%, surface)`) and `-on` (a grayscale contrast flip via relative-colour syntax). Overriding the single slot at runtime recomputes the whole family with no recompilation, so any accent — including a user-defined one such as `brand` — works through the `hub-table-theme()` / `hub-list-theme()` mixins, a `:host` rule, or `--hub-*-accent: var(--hub-sys-color-brand)`.
- **list:** the selected item now takes its text colour from the derived `--hub-list-accent-on` contrast token (was hard-wired to white), so a light or custom accent keeps the label legible.
- **table / list:** the semantic `variant` set is now the open nine ng-hub-ui-ds variants (`primary`, `secondary`, `success`, `danger`, `warning`, `info`, `neutral`, `light`, `dark`); was five.
- Migrated every `color-mix(in srgb, …)` to `color-mix(in oklch, …)` for perceptually even mixing (`--hub-table-accent-subtle`, `--hub-table-filter-button-active-bg`).

## [22.1.2] - 2026-06-25

### Fixed

- Design-token consistency pass: aligned inline fallback defaults with the canonical `ng-hub-ui-ds` values and routed hardcoded literals (z-index, font-weight, line-height, radii and theme-aware colours) through their `--hub-sys-*` / `--hub-ref-*` tokens, so they follow the active theme. No visual change when the ds tokens are loaded.

## [22.1.1] - 2026-06-24

### Added

- **list:** native drag-and-drop reordering. Enable it with `[sortable]="true"` on `<hub-list>`; works in the `list` and `cards` layouts and in nested trees. Reorder within a list, between siblings of the same parent, and **between lists** that share a `[dragGroup]` (cross-list transfer). The list reorders its own view optimistically and emits a typed `(sorted)` event — `ListSortEvent<T>` (`{ previousIndex, currentIndex, item, items, isTransfer, previousGroup, group, previousItems?, depth, parentItem }`); only the destination list emits on a cross-list transfer. Built on the native HTML5 drag-and-drop API with a **Pointer Events fallback** for touch/pen devices (floating ghost + edge autoscroll), plus opt-in **keyboard reordering** via `[keyboardSortable]` (Space/Enter to grab and drop, arrows to move, Escape to cancel) with `aria-live` announcements.
  - New projected directives: `HubListDragHandleDirective` (`[hubListDragHandle]` / `[listDragHandle]`) to restrict the drag start to a handle, `HubListDragPlaceholderDirective` (`[hubListDragPlaceholder]` / `[listDragPlaceholder]`) for a custom drop placeholder, and `HubListDragPreviewDirective` (`[hubListDragPreview]` / `[listDragPreview]`) for a custom drag image / touch ghost.
  - New inputs `sortable`, `dragGroup`, `sortDisabled` and `keyboardSortable`; new output `sorted`. New public `HubListDragService` coordinator and `ListSortEvent<T>` interface.
  - New CSS variables: `--hub-list-drag-handle-color/-cursor/-size`, `--hub-list-item-dragging-opacity`, `--hub-list-item-dragging-cursor`, `--hub-list-drop-target-outline-color/-width`, `--hub-list-placeholder-bg/-border-color/-border-width/-border-style/-border-radius/-min-height`, `--hub-list-ghost-opacity/-shadow`.
- **`hub-table-theme()` Sass mixin** (`styles/mixins/table-theme`) — theme a `<hub-table>` in one call: colours (`$accent`, `$bg`, `$color`, `$hover-*`, `$selected-*`, `$striped-*`, `$border-color`), borders (`$border-width`, `$border-radius`), density (`$cell-padding-x/y`) and the footer/bottom-bar layout (`$footer-gap/justify/align/wrap`). Every parameter is optional and defaults to `null`, so only the ones you pass are emitted as `--hub-table-*` overrides; the rest keep their defaults. Token-based, no Bootstrap dependency.
- **`hub-list-theme()` Sass mixin** (`styles/mixins/list-theme`) — the same one-call theming for `<hub-list>` (both `list` and `cards` layouts): colours (`$accent`, `$bg`, `$item-*`, `$hover-bg`, `$selected-*`), borders/radius, item density (`$item-padding-x/y`, `$gap`), the cards grid (`$cards-bg/border-color/border-radius/padding/min-column-width/gap`) and the footer layout. Optional params default to `null` — only the ones you pass are emitted.
- **Semantic `variant` accent** for the table and list (incl. its `cards` display), mirroring panels/nav. Set `options.variant` (`primary` / `success` / `danger` / `warning` / `info`) and the component re-bases a single accent through a CSS loop over the `--hub-sys-color-<variant>` family.
  - **Table**: the **selected row** is now styled (previously the `--selected` class carried no CSS) — it reads as a soft accent tint. New tokens `--hub-table-accent`, `--hub-table-accent-subtle`, `--hub-table-selected-bg`, `--hub-table-selected-color`. `options.variant` keeps applying the existing `.hub-table__<variant>` class, which now re-bases `--hub-table-accent`.
  - **List / cards**: the selected item accent now resolves through the new `--hub-list-accent` (was hard-wired to `--hub-sys-color-primary`). `options.variant` is reflected as `[data-variant]` on the host and re-bases the accent; applies to both the `list` and `cards` display modes.

### Changed

- **tooltip:** `TooltipDirective` moved to `ng-hub-ui-utils` so it can be reused across libraries. It is still re-exported from `ng-hub-ui-paginable` for backward compatibility, but new code should import it from `ng-hub-ui-utils`. The injected base class changed from `.ng-tooltip` to `.hub-tooltip` and tooltips are now themeable via `--hub-tooltip-*` variables.
- **list:** the drag-and-drop engine now lives in the shared `ng-hub-ui-utils` native drag-and-drop core (`HubDragDropService`, array/geometry helpers, drag-image and the Pointer Events fallback). The list re-exports them under the historical names (`HubListDragService`, etc.), so the public API is unchanged; `ng-hub-ui-utils` (already a peer dependency) must be `>=22.3.0`.

## [22.1.0] - 2026-06-23

### Added

- **states:** application-wide default components for the `loading`, `error` and `no-results` states. Register them through `providePaginable({ states: { loading, error, noResults } })` (or `HubUITableModule.forRoot`). Each accepts a component class, a lazy loader (`() => import(...).then(m => m.Cmp)`) or a full descriptor `{ component, inputs }` whose `inputs` factory maps the runtime context (`colspan`, `error`, `filters`) to the component's `@Input`s. Lazy defaults are pre-resolved at startup via an app initializer.
- **states:** per-instance overrides `[loadingComponent]`, `[errorComponent]` and `[noResultsComponent]` on both `<hub-table>` and `<hub-list>`. Precedence: local directive template → instance `@Input` → global config default → built-in template.
- **table:** consumer-driven `error` model input. When truthy the table renders its (previously dormant) error state.
- **list:** consumer-driven `loading` and `error` model inputs with their own rendered states, plus the no-results state (previously declared but never rendered). The list now reuses the shared loading/error/no-results directives and supports the same default-component system as the table.
- **directives:** the loading and error template directives are now element-agnostic. New generic selectors `paginableLoading` / `paginableError` (the `loadingTpt` / `errorTpt` and `paginableTableLoading` / `paginableTableError` selectors keep working). Classes renamed to `PaginableLoadingDirective` / `PaginableErrorDirective`; the old `PaginableTableLoadingDirective` / `PaginableTableErrorDirective` names remain exported as aliases.
- **api:** `providePaginable`, `PaginableDefaultsService`, `PaginableStateOutlet` and the `PaginableStateDefault` / `PaginableStateComponent` / `PaginableStateContext` / `ResolvedStateDefault` interfaces are now exported.

### Changed

- **config:** `PaginableTableConfig` gains an optional `states` section. `HubUITableModule.forRoot` now delegates to the shared `paginableCoreProviders` set (no behavioral change for existing consumers).
- **tokens:** replaced the `--hub-list-empty-padding` shorthand with the canonical directional `--hub-list-empty-padding-x` / `-y` tokens. No visual change. **BREAKING**: set the `-x`/`-y` tokens instead of the removed shorthand.

## [22.0.1] - 2026-06-17

### Fixed

- **list:** nested children lists were rendered flush against the parent item content. A top margin now separates a nested collection from its parent (in both the default list and card layouts).

### Added

- **list:** `--hub-list-children-gap` CSS variable (defaults to `var(--hub-list-item-padding-y)`) controlling the spacing between a nested children list and its parent item.

## [22.0.0] - 2026-06-17

### Changed

- **list:** reworked the BEM structure so the block lives on the host element. The host `hub-list` now carries the `.hub-list` block class (replacing the `d-flex flex-column gap-4` utilities) and renders the surface background, while the `<ul>` is now the `.hub-list__items` element with a transparent background. Its modifiers were renamed from `.hub-list--root` / `.hub-list--cards` to `.hub-list__items--root` / `.hub-list__items--cards`.
- **list:** the background now applies to the whole component (host) via `--hub-list-bg` instead of the items collection. Both `--hub-list-bg` (host) and `--hub-list-items-bg` (collection) default to `transparent`, so the list no longer paints a surface by default — each item defines itself with its own border. Set `--hub-list-bg` (e.g. `var(--hub-sys-surface-page)`) to render the component as a card.

### Added

- **list:** `--hub-list-gap` (spacing between the top bar, items collection and bottom bar) and `--hub-list-items-bg` (background of the items collection, transparent by default).
- **list:** `--hub-list-item-bg` (defaults to `var(--hub-sys-surface-page)`) so items render as solid surfaces like table rows and adapt to the active theme. Previously the item background was hard-coded to `transparent`. This also wires the previously dangling `--hub-list-cards-bg` default.

### Fixed

- **docs:** corrected the CSS variables reference. Fixed a doubled-prefix typo (`--hub-table-table-*` → `--hub-table-*`) across ~19 table variables, documented the previously missing table search block (`--hub-table-search-*`) and `--hub-table-container-gap`, documented the icon-glyph variables (`--hub-paginator-icon-angle-*`, `--hub-table-icon-sort*`), and brought the Spanish reference (`README`/`css-variables-reference.es.md`) to full parity with the English one (the EN and ES references now document the exact same 207 variables).
- **paginator:** `--hub-paginator-font-size` was defined, documented and overridden in the official examples but never applied. It is now used on the paginator root (`.hub-paginator-container`), so the documented font-size customization takes effect. The default (`var(--hub-ref-font-size-base)`) is unchanged.
- **list:** the `--hub-list-cards-*` CSS variables (`bg`, `color`, `padding-x/y`, `border-color/width/radius`, `shadow`, `hover-bg`, `hover-shadow`, `transition`, `columns`, `row-gap`, `column-gap`) were documented and overridable but never applied — the card layout only honoured `min-column-width` and `gap`, and hard-coded `auto-fit` for the grid columns. They are now wired up on the card items, so the documented cards customization (including the official example) takes effect. Defaults are unchanged, so existing card rendering is identical unless these variables are overridden.

### Removed

- **table:** removed the `--hub-table-breakpoint-sm/md/lg/xl/xxl` CSS variables. They were documented as overridable but had no effect: the responsive variants (`.hub-table__responsive-*`) trigger from `@media` queries with hard-coded pixel values, and CSS custom properties cannot be read inside `@media` conditions. The breakpoints (576/768/992/1200/1400px) are unchanged and remain fixed; the docs now state this explicitly.
- **list:** renamed CSS variables — `--hub-list-container-bg` → `--hub-list-bg`, `--hub-list-container-border-radius` → `--hub-list-border-radius`, `--hub-list-container-padding-x/y` → `--hub-list-padding-x/y`, and `--hub-list-container-gap` → `--hub-list-items-gap`. **Breaking:** update any consumer overrides that used the old `--hub-list-container-*` names or the `.hub-list` / `.hub-list--root` / `.hub-list--cards` selectors.

## [21.5.0] - 2026-06-16

### Added

- **paginator:** exposed previously hard-coded styles as CSS variables: `--hub-paginator-link-padding-x/y`, `--hub-paginator-link-border-width`, `--hub-paginator-link-focus-shadow`, `--hub-paginator-transition` and `--hub-paginator-select-border-width`.
- **table:** added CSS variables for the filter button geometry (`--hub-table-filter-button-gap`, `--hub-table-filter-button-padding-x/y`, `--hub-table-filter-button-border-width`, `--hub-table-filter-button-border-color`, `--hub-table-filter-button-border-radius`, `--hub-table-filter-button-transition`).
- **table:** added CSS variables for the active-filter count badge (`--hub-table-filter-count-bg`, `--hub-table-filter-count-color`, `--hub-table-filter-count-size`, `--hub-table-filter-count-padding-x`, `--hub-table-filter-count-font-size`, `--hub-table-filter-count-font-weight`, `--hub-table-filter-count-border-radius`).
- **table:** added `--hub-table-batch-actions-btn-icon-gap` for the batch action button icon spacing.

### Changed

- **paginator:** the link `:focus` ring now derives from the design-system tokens `--hub-sys-focus-ring-width` / `--hub-sys-focus-ring-color` instead of a hard-coded Bootstrap blue.
- **table:** the filter button and count badge now read their colors from design-system tokens (`--hub-sys-color-success`, `--hub-sys-text-muted`) instead of the Bootstrap `--bs-success` variable and literal hex values, so they follow the active theme.

## [21.4.0] - 2026-06-16

### Added

- **list:** added a dedicated set of `--hub-list-cards-*` CSS variables so the card layout can be styled independently from the list layout (`bg`, `color`, `padding-x/y`, `border-color`, `border-width`, `border-radius`, `shadow`, `hover-bg`, `hover-shadow`, `transition`).
- **list:** added `--hub-list-cards-columns` (defaults to `auto-fit`) to allow fixing the number of card columns, plus `--hub-list-cards-row-gap` and `--hub-list-cards-column-gap` for independent grid gaps.
- **list:** added `--hub-list-item-border-width` to expose the previously hard-coded list item border width.

### Changed

- **list:** card items now consume the new `--hub-list-cards-*` variables. Defaults inherit from the existing `--hub-list-item-*` values (and `shadow` defaults to `none`), so the rendered output is unchanged unless the new variables are overridden.

## [21.3.1] - 2026-06-14

### Changed

- Replaced the deprecated `ngStyle` directive with the native `[style]` binding on the table dropdown menu (Angular soft-deprecated `ngStyle`/`ngClass` in November 2024 in favour of native bindings, for better performance and smaller bundles).

## [21.3.0] - 2026-03-31

### Added

- **list:** added `options.display = 'cards'` to render root list items using a card grid layout.
- **styling:** added list card layout tokens for column sizing and card spacing.

### Changed

- **list:** switched root list rendering to a stable tracking key based on `bindValue`, `id`, or index fallback.
- **list:** normalized internal list markup and state classes to support both standard list and card layouts.

### Fixed

- **table:** render the bottom pagination bar only when pagination is enabled, avoiding an empty wrapper.
- **tests:** aligned table action button specs with the unified `PaginableActionButton` contract.

## [21.2.0] - 2026-03-19

### Added

- **actions:** added library default BEM classes for table/list/dropdown action buttons when no custom class list is provided.
- **styling:** added list action button and top bar CSS variables for consistent customization with table/list layouts.

### Changed

- **api:** removed `color` from `PaginableActionButton` to keep action button configuration CSS-framework agnostic.
- **api:** unified table/list action styling through `classlist` and class normalization helpers.
- **docs:** updated README EN/ES type references from legacy `RowButton`/`ListButton` to `PaginableActionButton`.

### Fixed

- **examples:** migrated table/list action examples to `classlist` instead of implicit Bootstrap classes generated from `color`.
- **rtl:** preserved RTL action ordering behavior while using normalized action class handling.

### Removed

- **interfaces:** removed legacy `row-button.ts` and `list-button.ts` in favor of the unified `PaginableActionButton`.

## [21.1.0] - 2026-03-18

### Added

- **i18n:** added additional locale dictionaries and updated table/list examples to switch languages dynamically.
- **examples:** added a dedicated bottom bar ordering example for paginable (`table` + `list`).

### Changed

- **bottom bar:** aligned table and list bottom bar structure and behavior (`paginator`, `settings`, `info`) with matching CSS APIs.
- **styling:** introduced mirrored bottom bar layout tokens for table and list, including ordering and flex control.
- **pagination theming:** added context pagination tokens (`--hub-table-pagination-*`, `--hub-list-pagination-*`) and mapped them to paginator styles.
- **docs:** updated README EN/ES styling guidance for context pagination theming and bottom bar layout tokens.

### Fixed

- **list pagination:** normalized per-page handler to support both numeric and event-based updates.
- **examples:** normalized table server-side example snippets to follow the standard tab format used in other paginable examples.

## [21.0.0] - 2026-03-10

### Changed

- **version:** bumped to 21.0.0 to align with Angular 21 update.
- **list:** renamed `PaginableListComponent` to `ListComponent` for consistency.
- **directives:** renamed `PaginableTableNotFoundDirective` to `PaginableNoResultsDirective`.
- **docs:** added `BREAKING_CHANGES.md` to document major version migrations.

## [19.14.0] - 2026-03-09

### Added

- **list:** added per-page selector and pagination info in `ListComponent`.
- **docs:** added `docs/css-variables-reference.es.md` and linked styling docs from README files.

### Changed

- **styles:** consolidated paginable styles around `src/lib/styles/paginable.scss`.
- **docs:** simplified styling sections in `README.md` and `README.es.md` to avoid duplication and point to CSS variables reference.

### Fixed

- **list:** fixed ControlValueAccessor propagation so `ngModel` selected items now match visual selection state.
- **list:** fixed root-level pagination to render only the current page slice.
- **paginator:** fixed missing pagination arrow icons by mapping paginator icon tokens to shared icon variables.

### Removed

- **styles:** removed legacy `src/lib/styles/table.scss`.
- **styles:** removed component-local SCSS files for list and paginator after style consolidation.

## [19.13.0] - 2026-01-12

### Added

- **interfaces:** added `tooltip` property to `RowButton` interface with Observable support for dynamic/translated content.
- **interfaces:** added Observable support for `title` and `tooltip` properties in `PaginableTableDropdown` interface.

### Changed

- **table:** row buttons now prioritize `label` over `title` for display text.
- **table:** all button labels, titles and tooltips now support reactive Observable values via `unwrapAsync` pipe.

### Documentation

- **interfaces:** added comprehensive JSDoc documentation to `PaginableTableDropdown` interface.
- **readme:** updated documentation for `RowButton` and `PaginableTableDropdown` interfaces with Observable support examples.
- **readme:** added "Action Buttons with Reactive Translations" section with i18n example.

## [19.12.0] - 2026-01-03

### Added

- **table:** added `rowClass` input to allow applying custom classes to rows based on data or a fixed string, enabling dynamic row styling.

### Documentation

- **paginable:** add missing JSDoc documentation to `PaginatorComponent`, `PaginableTableRangeInputComponent`, `MenuFilterComponent`, `ResizableComponent`, and `PaginableTableDropdownComponent`.

### Refactor

- **styles:** refactor row classes in `table.scss` to use `@each` loop for better maintainability and reduced code duplication.

## [19.11.5] - 2026-01-02

### Bug Fixes

- **paginable:** relax stricter type checking on `items` input and internal `_items` property to `any` to allow readonly arrays.
- **interfaces:** update `PaginableTableDropdown`, `ListButton`, and `PaginationState` to accept `ReadonlyArray` for better compatibility with immutable data sources.

### Refactor

- **paginable-list:** migrate `@Input` properties to `input()` signals for `bindValue`, `bindLabel`, `bindChildren`, `selectable`, `clickFn` and content queries.

## [19.11.4] - 2026-01-02

### Fixed

- Relaxed type definition for `items` input in `ListComponent` to accept `ReadonlyArray` and `any`.
- Updated `PaginationService.generate` signature to accept `ReadonlyArray<any>` alongside mutable arrays.

## [19.11.3] - 2026-01-02

### Changed

- Updated ng-hub-ui-utils peer dependency to version 1.2.0

## [19.11.2] - 2026-01-02

### Fixed

- Fixed paginable-list component implementation

### Changed

- Updated translation service from PaginableTranslationService to HubTranslationService
- Updated component test files
- Updated README documentation

## [19.11.1] - 2026-01-02

### Fixed

- Fixed build configuration to use compiled ng-hub-ui-utils from dist/ instead of source files
- Fixed missing PaginableTableConfig interface export in public API
- Resolved ng-packagr warnings by removing conflicting package.json entries

## [19.11.0] - 2026-01-01

### Added

- Expanded unit test coverage for core components, directives, services, and utilities.
- Translation pipe tests.

### Changed

- Table component template/layout cleanup and style adjustments across list, dropdown, paginator, and resizable components.
- Moved shared utility pipes to `ng-hub-ui-utils`.
- Documentation updates (notably `README.es.md`).

### Removed

- Storybook configuration from the package.
- Local copies of shared utility pipes (get/isObject/isObservable/isString/ucfirst/unwrapAsync).
- Legacy `table2` stylesheet.

## [19.10.2] - 2025-12-23

### Fixed

- Resolve TypeScript errors template typing; build passes

## [19.9.2] - 2025-07-21

### Added

- Add debouncedSignal utility function

## [19.9.1] - 2025-06-20

### Added

- Enhance item click handling by adding mouse event to clickFn updating ListClickEvent interface
- Enhance filtering capabilities by adding detailed documentation new input types for filters

## [19.9.0] - 2025-05-22

### Changed

- Refactor button interfaces for improved row action handling

## [19.7.1] - 2025-05-22

### Changed

- Version release.

## [19.7.0] - 2025-05-22

### Added

- Enhance row handling styling options in paginable table component

## [19.6.0] - 2025-05-21

### Added

- Implement HubTableComponent with pagination, filtering, selection features

### Changed

- Refactor dropdown component to use toggle method improve rendering logic

## [19.1.0] - 2025-04-11

### Changed

- Refactor component to use new input model resource handling

## [19.0.0] - 2025-01-21

### Changed

- Enhance PaginableTable with HubIconComponent

## [1.54.2] - 2024-12-26

### Changed

- Add HubIconComponent to PaginableTable

## [1.54.1] - 2024-12-26

### Changed

- Updating to angular 19

## [1.52.3] - 2024-09-26

### Fixed

- Stability improvements.

## [1.52.2] - 2024-09-26

### Fixed

- Stability improvements.

### Removed

- Removed residues from ngx-translate library

## [1.52.1] - 2024-09-26

### Fixed

- Stability improvements.

## [1.52.0] - 2024-09-26

### Changed

- Refactored pagination structure. Added BEM classes to all items to improve customisation.

## [1.51.4] - 2024-09-26

### Fixed

- Stability improvements.

## [1.51.3] - 2024-09-26

### Fixed

- Stability improvements.

## [1.51.2] - 2024-09-26

### Fixed

- Stability improvements.

## [1.51.1] - 2024-09-26

### Added

- Added cursor pointer to clickable items

## [1.51.0] - 2024-09-26

### Added

- Added clickFn input

## [1.50.2] - 2024-09-12

### Changed

- Version release.

## [1.50.1] - 2024-09-12

### Fixed

- Stability improvements.

## [1.50.0] - 2024-09-12

### Changed

- String observables are now allowed in the table headers

## [1.49.2] - 2024-07-25

### Fixed

- Stability improvements.

## [1.49.1] - 2024-07-23

### Fixed

- Stability improvements.

## [1.49.0] - 2024-07-23

### Added

- Added support for material, bootstrap and font awesome buttons.

## [1.48.1] - 2024-07-16

### Fixed

- Fixed issue with boolean filters.

## [1.48.0] - 2024-07-16

### Changed

- Version release.

## [1.47.0] - 2024-06-18

### Added

- Added null match modes.

## [1.46.2] - 2024-06-17

### Fixed

- Fixed boolean filter values.

## [1.46.1] - 2024-06-17

### Fixed

- Fixed column counts call.

## [1.46.0] - 2024-06-17

### Added

- Added boolean filters.

## [1.45.3] - 2024-05-13

### Changed

- Replaced Equals and NotEquals to Equal and NotEqual.

## [1.45.2] - 2024-05-13

### Fixed

- Fixed position style of table.

## [1.45.1] - 2024-04-25

### Fixed

- Fixed clear filter button.

## [1.45.0] - 2024-04-21

### Added

- Added filter rule removing.

## [1.44.4] - 2024-04-16

### Changed

- Updated translation logic

## [1.44.3] - 2024-03-27

### Fixed

- Fixed some filter issues.

## [1.44.1] - 2024-02-06

### Fixed

- Fixed dropdown buttons handlers.

## [1.44.0] - 2023-12-19

### Changed

- New bindValue, bindLabel, and bindChildren inputs allow more control over item properties mapping
- Item template now exposes data, depth, index, collapsed, and selected properties for greater customization.

## [1.43.1] - 2023-11-27

### Fixed

- Fixed checkbox click event.

## [1.43.0] - 2023-11-20

### Changed

- Refactored and documented paginable list.

## [1.42.0] - 2023-11-20

### Removed

- Removed library ngx-translate.

## [1.40.5] - 2023-11-09

### Fixed

- Fixed some translation issues.

## [1.40.4] - 2023-10-31

### Changed

- Updated documentation.

## [1.40.3] - 2023-10-31

### Changed

- Updated documentation.

## [1.40.2] - 2023-10-26

### Fixed

- Fixed some translation issues.

## [1.40.1] - 2023-10-25

### Fixed

- Fixed some translation issues.
- Fixed paginable list search and pagination.

## [1.40.0] - 2023-10-25

### Added

- Added menu filters.

### Changed

- Working on paginated lists.

## [1.39.0] - 2023-09-04

### Added

- Added stripped and variant options

## [1.38.0] - 2023-07-17

### Changed

- Updated dependencies to Angular 16.

## [1.37.1] - 2023-07-04

### Changed

- The tooltips are removed when clicking on the parent element.

## [1.37.0] - 2023-04-18

### Added

- The table actions now accept an observable as a value for the 'hidden' property

## [1.36.0] - 2023-04-18

### Changed

- The error message is now located within the table and takes up a whole row

## [1.35.1] - 2023-04-02

### Added

- Fixed specific filters

## [1.35.0] - 2023-04-02

### Added

- Initial ordination input

## [1.34.0] - 2023-03-31

### Changed

- Filter event

## [1.32.0] - 2023-03-31

### Changed

- Mock users externalized

## [1.31.3] - 2023-03-31

### Fixed

- Search input event

## [1.31.1] - 2023-03-21

### Fixed

- Optional modificator to some pagination interface properties

## [1.31.0] - 2023-03-15

### Added

- Added header template for headers customisation

## [1.30.3] - 2023-03-07

### Fixed

- Buttons cell width

## [1.30.0] - 2023-03-07

### Added

- Label and classlist properties to buttons

## [1.29.0] - 2023-03-06

### Removed

- Views

## [1.27.0] - 2022-07-27

### Added

- Single and multiple selection

## [1.26.0] - 2022-07-05

### Changed

- Angular 14

## [1.25.7] - 2022-07-05

### Fixed

- Reactive forms

## [1.25.6] - 2022-07-05

### Fixed

- Reactive forms

## [1.25.5] - 2022-07-01

### Fixed

- Bootstrap 5 styling

## [1.25.4] - 2022-03-31

### Fixed

- Rows-per-page selector styling for Bootstrap 5

## [1.24.10] - 2022-01-04

### Changed

- Version release.

## [1.24.9] - 2021-10-05

### Fixed

- Fixed the typeahead open/close button when results are displayed.

## [1.24.8] - 2021-09-29

### Added

- Translations in the views form.

### Fixed

- Fixed condition filling in the views edit form.

## [1.24.7] - 2021-09-27

### Fixed

- Translation updates.

## [1.24.6] - 2021-09-22

### Fixed

- Fixed error when changing saved views when values are null.

## [1.24.5] - 2021-09-22

### Fixed

- Fixed error when changing saved views when values are numbers.

## [1.24.4] - 2021-09-16

### Fixed

- Fixed error when changing filters if the views selector is not shown.

## [1.24.3] - 2021-09-03

### Fixed

- Translations and typeahead template fixes.

## [1.24.2] - 2021-09-02

### Fixed

- General fixes.

## [1.24.1] - 2021-08-30

### Fixed

- Search and views selector layout.

## [1.24.0] - 2021-08-26

### Added

- Typeahead for selecting, editing, and deleting routes.

## [1.23.7] - 2021-08-24

### Changed

- Module changes

## [1.23.5] - 2021-08-24

### Fixed

- Modal module export

## [1.23.3] - 2021-08-24

### Fixed

- Directive exports

## [1.23.2] - 2021-08-24

### Fixed

- Component exports

## [1.23.1] - 2021-08-24

### Removed

- Removed unnecessary directives

## [1.23.0] - 2021-08-23

### Added

- Ability to save filters as views
- Bootstrap 5 support

## [1.22.1] - 2021-06-23

### Fixed

- Batch action buttons are not enabled until items are selected

## [1.22.0] - 2021-06-23

### Added

- New isObservable pipe

## [1.21.2] - 2021-06-23

### Fixed

- Fixes for RxJS-related errors

## [1.21.1] - 2021-06-23

### Fixed

- Type detection for the last column

## [1.21.0] - 2021-06-22

### Added

- Added a function to show/hide a button inside a cell

## [1.20.0] - 2021-06-22

### Added

- Templates for custom filters

## [1.19.5] - 2021-06-22

### Fixed

- Fixed sorting variable name

## [1.19.4] - 2021-06-22

### Fixed

- Fixed form events

## [1.19.3] - 2021-06-21

### Fixed

- Layout fixes

## [1.19.2] - 2021-06-18

### Fixed

- Fixed filter loading

## [1.19.1] - 2021-06-18

### Fixed

- Component exports

## [1.19.0] - 2021-06-18

### Added

- New filtering fields

## [1.18.5] - 2021-06-16

### Fixed

- Fixed layout and event format for advanced filters

## [1.18.4] - 2021-06-15

### Fixed

- Fixed observables

## [1.18.3] - 2021-06-15

### Fixed

- Layout fixes

## [1.18.2] - 2021-06-15

### Fixed

- Component exports

## [1.18.1] - 2021-06-15

### Fixed

- Directive exports

## [1.18.0] - 2021-06-15

### Added

- Advanced per-column filters
- Loading state when pagination is an observable
- Error capture and message when pagination is an observable
- Customizable loading state
- Customizable error message

## [1.17.0] - 2021-06-11

### Added

- Columns with resize handles

## [1.16.14] - 2021-06-07

### Fixed

- Removed use of the isString function.

## [1.16.13] - 2021-05-19

### Fixed

- Mark selectable items when items are objects.

## [1.16.12] - 2021-05-19

### Fixed

- Mark selectable items when items are objects.
- Mark items when the row is also clickable.

## [1.16.11] - 2021-05-19

### Added

- Ability to make the table hoverable.

### Fixed

- Mark selectable items when the item isn't selectable but has batchActions.

## [1.16.10] - 2021-05-18

### Fixed

- When changing items per page, the page is reset to 1.

## [1.16.8] - 2021-05-18

### Fixed

- Fixed item selection when changing page.
- Fixed main component rendering.

## [1.16.7] - 2021-03-24

### Fixed

- Fixed column alignment.

## [1.16.5] - 2021-05-18

### Fixed

- When changing items per page, pagination goes to page 1.

## [1.16.3] - 2021-02-23

### Fixed

- Fixed item sorting.

## [1.16.2] - 2021-02-03

### Changed

- Angular 11.

## [1.16.1] - 2021-02-03

### Fixed

- TSLint correctly detects the component.

## [1.16.0] - 2021-01-20

### Added

- Action buttons can be shown/hidden based on their own hidden value.

## [1.15.1] - 2021-01-19

### Fixed

- Selected objects are compared correctly.

## [1.15.0] - 2020-12-29

### Added

- Ability to add batch actions

## [1.14.2] - 2020-12-22

### Fixed

- Dropdown component export

## [1.14.0] - 2020-12-22

### Added

- Ability to add dropdowns as actions

### Changed

- Actions can now be placed in any column

## [1.13.0] - 2020-12-21

### Added

- Implemented ControlValueAccessor

### Fixed

- Item selection when changing page

## [1.12.0] - 2020-12-18

### Added

- Attribute to make the table responsive based on xs, sm, md, lg, xl breakpoints
- Added sticky property to column headers to pin them to the start or end. Allowed values: start and end.

## [1.11.1] - 2020-11-30

### Removed

- Removed default language setting

## [1.11.0] - 2020-10-23

### Added

- Added @ngx-translate and Spanish/English languages

## [1.10.0] - 2020-09-24

### Added

- Ability to create tables without pagination by setting paginate to false.

### Changed

- triggerTheParamChanges event only emits non-null properties.

### Fixed

- Expanding rows button compatible with Font Awesome 5.
- Fixed paginator in client-side pagination.

## [1.9.0] - 2020-08-07

### Changed

- Updated to Angular 10

### Fixed

- Handled marking elements when they don't exist.

### Removed

- Dependencia ngx-avatar

## [1.8.1] - 2020-08-06

### Fixed

- Display pagination information.
- Display headers.

## [1.8.0] - 2020-08-05

### Added

- Ability to make table items selectable.
- Ability to change the number of items per page.

### Changed

- Pagination info appears by default.

## [1.7.3] - 2020-07-27

### Fixed

- Fixed pipe exports.

## [1.7.2] - 2020-07-27

### Fixed

- References to exporting all modules, components, directives, pipes, etc.

## [1.7.0] - 2020-07-27

### Added

- Ability to create expandable rows that show content via a toggle.

### Changed

- File reorganization.

## [1.6.0] - 2020-05-14

### Added

- Custom cells now receive the property and the full item.

## [1.5.0] - 2020-04-13

### Added

- Ability to map pagination elements.

### WIP

- Documentation page.

## [1.4.2] - 2020-01-07

### Changed

- Search is shown even when there are no results.

### Fixed

- Fixed action handler so it doesn't trigger the row event.

### WIP

- Documentation page.

## [1.4.1] - 2019-12-17

### Added

- Ability to customize the template of a column specified by parameter.

### Fixed

- Fixed action handler behavior.
- Renamed PaginableTableRowAction interface property from handle to handler.

### Removed

- Removed unused pipes.

## [1.4.0] - 2019-12-15

### Added

- Ability to customize the template of a column specified by parameter.

### Fixed

- Renamed PaginableTableRowAction interface property from handle to handler.

## [1.3.0] - 2019-12-12

### Added

- Ability to add a column of custom actions per row.

## [1.2.0] - 2019-10-07

### Added

- Ability to customize rows with templates.

### Changed

- Replaced Lodash function calls with custom functions.

### Fixed

- Errors when undefined or null were passed as component parameters.

## [1.1.0] - 2019-10-02

### Added

- Ability to control pagination by passing a Laravel pagination object.
- Result sorting and sort events.
