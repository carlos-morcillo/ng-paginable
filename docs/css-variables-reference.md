# ng-hub-ui-paginable — CSS Variables Reference

Complete reference of all CSS custom properties (CSS variables) exposed by the `ng-hub-ui-paginable` library. Use these variables to customize the appearance of the **Table**, **List**, and **Paginator** components without modifying source code.

---

## Table of Contents

- [How it Works](#how-it-works)
- [Importing Styles](#importing-styles)
- [Base System Fallbacks](#base-system-fallbacks)
- [Paginator Variables](#paginator-variables)
- [List Variables](#list-variables)
- [Table Variables](#table-variables)
- [Internal Panels](#internal-panels)
- [Customization Examples](#customization-examples)
  - [Override a Single Component](#override-a-single-component)
  - [Dark Theme](#dark-theme)
  - [Compact Table](#compact-table)
  - [Custom Brand Colors](#custom-brand-colors)
  - [Bootstrap Integration](#bootstrap-integration)
- [Token Architecture (ref / sys / component)](#token-architecture)
- [Best Practices](#best-practices)

---

## How it Works

The library follows a **three-layer token architecture**:

```
ref (primitives)  →  sys (semantic)  →  component
```

| Layer | Prefix | Purpose |
|-------|--------|---------|
| `ref` | `--hub-ref-*` | Raw design values: colors, spacing, radii, font sizes |
| `sys` | `--hub-sys-*` | Semantic intent: surface colors, text colors, border colors, states |
| `component` | `--hub-{component}-*` | Component-specific tokens that reference `sys` or `ref` |

**Component variables always fall back to `sys`/`ref` tokens**, so changing a single `sys` variable propagates across every component that consumes it.

---

## Importing Styles

Component structure ships compiled with each component, so nothing has to be imported for the
table, the list or the paginator to render. The package's `styles` entry point carries the
opt-in theming mixins:

```scss
@use 'ng-hub-ui-paginable/styles' as *;
```

> **Tip**: Use `@use` instead of `@import` for proper SCSS scoping.

---

## Base System Fallbacks

Defined on `:root, :host`. These provide **sensible defaults** for the entire system. Override them to propagate changes globally.

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-sys-surface-page` | `#ffffff` | Main background color for pages and containers |
| `--hub-sys-border-color-default` | `#dee2e6` | Default border color used across all components |
| `--hub-sys-color-primary` | `#0d6efd` | Primary brand/action color |
| `--hub-sys-text-primary` | `#212529` | Primary text color |
| `--hub-sys-text-muted` | `#6c757d` | Secondary/muted text color |
| `--hub-sys-state-active-bg` | `rgba(0, 0, 0, 0.1)` | Background for active state (table rows) |
| `--hub-sys-state-hover-bg` | `rgba(0, 0, 0, 0.075)` | Background for hover state (table rows) |
| `--hub-sys-state-striped-bg` | `rgba(0, 0, 0, 0.05)` | Background for striped rows |
| `--hub-ref-surface-2` | `#f8f9fa` | Elevated/secondary surface color |
| `--hub-ref-color-white` | `#fff` | White color reference |
| `--hub-ref-border-width` | `1px` | Default border width |
| `--hub-ref-radius-sm` | `0.25rem` | Small border radius |
| `--hub-ref-radius-md` | `0.375rem` | Medium border radius |
| `--hub-ref-space-1` | `0.25rem` | Spacing scale — extra small |
| `--hub-ref-space-2` | `0.5rem` | Spacing scale — small |
| `--hub-ref-space-3` | `1rem` | Spacing scale — medium/base |
| `--hub-ref-icon-size` | `1em` | Default icon size |
| `--hub-ref-font-size-base` | `1rem` | Base font size |

---

## Paginator Variables

Defined on `.hub-paginator`. Control the appearance of pagination controls used by both the standalone `<hub-ui-paginator>` and the paginator embedded in `<hub-ui-table>`.

> The paginator embedded in `<hub-ui-table>` / list is themed through these same `--hub-paginator-*` tokens — override them on the table/list host to re-theme it contextually.

### Layout

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-paginator-font-size` | `var(--hub-ref-font-size-base, 1rem)` | Font size for paginator text |
| `--hub-paginator-gap` | `var(--hub-ref-space-1, 0.25rem)` | Gap between page items |
| `--hub-paginator-settings-gap` | `var(--hub-ref-space-2, 0.5rem)` | Gap between settings controls (per-page selector, labels) |

### Page Links

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-paginator-link-color` | `var(--hub-sys-color-primary, #0d6efd)` | Text color of page links |
| `--hub-paginator-link-bg` | `var(--hub-sys-surface-page, #ffffff)` | Background of page links |
| `--hub-paginator-link-border-color` | `var(--hub-sys-border-color-default, #dee2e6)` | Border color of page links |
| `--hub-paginator-link-border-width` | `1px` | Border width of page links |
| `--hub-paginator-link-border-radius` | `var(--hub-ref-radius-sm, 0.25rem)` | Border radius of page links |
| `--hub-paginator-link-padding-x` | `0.75rem` | Horizontal padding of page links |
| `--hub-paginator-link-padding-y` | `0.375rem` | Vertical padding of page links |
| `--hub-paginator-link-focus-shadow` | `0 0 0 var(--hub-sys-focus-ring-width, 0.25rem) var(--hub-sys-focus-ring-color, rgba(13, 110, 253, 0.25))` | Focus ring of page links |
| `--hub-paginator-transition` | `color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out` | Transition applied to page links |

### Page Links — Hover

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-paginator-link-hover-color` | `var(--hub-sys-color-primary, #0d6efd)` | Text color on hover |
| `--hub-paginator-link-hover-bg` | `var(--hub-ref-surface-2, #f8f9fa)` | Background on hover |
| `--hub-paginator-link-hover-border-color` | `var(--hub-sys-border-color-default, #dee2e6)` | Border color on hover |

### Page Links — Active (Current Page)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-paginator-link-active-color` | `var(--hub-ref-color-white, #fff)` | Text color of the active page |
| `--hub-paginator-link-active-bg` | `var(--hub-sys-color-primary, #0d6efd)` | Background of the active page |
| `--hub-paginator-link-active-border-color` | `var(--hub-sys-color-primary, #0d6efd)` | Border of the active page |

### Page Links — Disabled

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-paginator-link-disabled-color` | `var(--hub-sys-text-muted, #6c757d)` | Text color when disabled |
| `--hub-paginator-link-disabled-bg` | `var(--hub-ref-surface-2, #f8f9fa)` | Background when disabled |
| `--hub-paginator-link-disabled-border-color` | `var(--hub-sys-border-color-default, #dee2e6)` | Border when disabled |

### Select (Per-Page Dropdown)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-paginator-select-color` | `var(--hub-sys-text-primary, #212529)` | Text color of the per-page select |
| `--hub-paginator-select-bg` | `var(--hub-sys-surface-page, #ffffff)` | Background of the per-page select |
| `--hub-paginator-select-border-color` | `var(--hub-sys-border-color-default, #dee2e6)` | Border of the per-page select |
| `--hub-paginator-select-border-width` | `1px` | Border width of the per-page select |
| `--hub-paginator-select-border-radius` | `var(--hub-ref-radius-sm, 0.25rem)` | Border radius of the per-page select |
| `--hub-paginator-select-padding-x` | `var(--hub-ref-space-2, 0.5rem)` | Horizontal padding of the select |
| `--hub-paginator-select-padding-y` | `var(--hub-ref-space-1, 0.25rem)` | Vertical padding of the select |

### Misc

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-paginator-icon-color` | `var(--hub-sys-text-primary, #212529)` | Color of navigation icons (arrows) |
| `--hub-paginator-icon-size` | `1em` | Size of navigation icons |
| `--hub-paginator-info-color` | `var(--hub-sys-text-muted, #6c757d)` | Color of pagination info text ("Showing 1 to 10 of 100") |
| `--hub-paginator-label-color` | `var(--hub-sys-text-muted, #6c757d)` | Color of labels (e.g., "Items per page") |
| `--hub-paginator-icon-angle-left` | `url("…")` (SVG) | Glyph for the previous-page arrow |
| `--hub-paginator-icon-angle-right` | `url("…")` (SVG) | Glyph for the next-page arrow |
| `--hub-paginator-icon-angle-double-left` | `url("…")` (SVG) | Glyph for the first-page arrow |
| `--hub-paginator-icon-angle-double-right` | `url("…")` (SVG) | Glyph for the last-page arrow |

---

## List Variables

Defined on `.hub-list`. Control the appearance of the `<hub-ui-list>` component (hierarchical/tree lists).

### Accent & Selection (List)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-accent` | `var(--hub-sys-color-primary, #0d6efd)` | Accent slot — drives item selection colors |
| `--hub-list-accent-subtle` | `color-mix(in oklch, var(--hub-list-accent) 12%, var(--hub-sys-surface-page, #ffffff))` | Soft accent tint (derived) |
| `--hub-list-item-selected-bg` | `var(--hub-list-accent)` | Background of a selected item |
| `--hub-list-item-selected-color` | `var(--hub-list-accent-on)` | Text color of a selected item (contrast pair, derived) |

### Bottom Bar Layout (List)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-bottom-bar-gap` | `var(--hub-ref-space-3, 1rem)` | Gap between bottom bar blocks |
| `--hub-list-bottom-bar-justify-content` | `space-around` | Main axis distribution of bottom bar blocks |
| `--hub-list-bottom-bar-align-items` | `center` | Cross-axis alignment of bottom bar blocks |
| `--hub-list-bottom-bar-wrap` | `wrap` | Wrapping behavior for bottom bar blocks |
| `--hub-list-bottom-bar-paginator-order` | `1` | Order of paginator block |
| `--hub-list-bottom-bar-settings-order` | `2` | Order of rows-per-page block |
| `--hub-list-bottom-bar-info-order` | `3` | Order of info block |
| `--hub-list-bottom-bar-paginator-flex` | `0 0 auto` | Flex value for paginator block |
| `--hub-list-bottom-bar-settings-flex` | `0 0 auto` | Flex value for settings block |
| `--hub-list-bottom-bar-info-flex` | `0 0 auto` | Flex value for info block |

### Top Bar Layout (List)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-top-bar-gap` | `var(--hub-ref-space-2, 0.5rem)` | Gap between top bar blocks |
| `--hub-list-top-bar-justify-content` | `end` | Main axis distribution for top bar blocks |
| `--hub-list-top-bar-align-items` | `center` | Cross-axis alignment for top bar blocks |
| `--hub-list-top-bar-wrap` | `wrap` | Wrapping behavior for top bar blocks |
| `--hub-list-batch-actions-gap` | `var(--hub-ref-space-2, 0.5rem)` | Gap between list batch action buttons |

### Container

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-bg` | `transparent` | Background of the whole list component (host element); transparent by default so the page shows through |
| `--hub-list-border-radius` | `var(--hub-ref-radius-md, 0.375rem)` | Border radius of the list component surface |
| `--hub-list-padding-x` | `var(--hub-ref-space-0, 0)` | Horizontal padding of the list component surface |
| `--hub-list-padding-y` | `var(--hub-ref-space-0, 0)` | Vertical padding of the list component surface |
| `--hub-list-gap` | `var(--hub-ref-space-4, 1.5rem)` | Gap between the top bar, items collection and bottom bar |
| `--hub-list-items-bg` | `transparent` | Background of the items collection (`<ul>`); transparent so the surface shows through |
| `--hub-list-items-gap` | `var(--hub-ref-space-2, 0.5rem)` | Gap between list items |

### Cards Layout

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-cards-min-column-width` | `18rem` | Minimum width used by each root-level card column |
| `--hub-list-cards-gap` | `var(--hub-list-items-gap)` | Gap between cards when `options.display = 'cards'` |
| `--hub-list-cards-columns` | `auto-fit` | Column track count for the card grid; set a number to fix the column count |
| `--hub-list-cards-row-gap` | `var(--hub-list-cards-gap)` | Vertical gap between card rows |
| `--hub-list-cards-column-gap` | `var(--hub-list-cards-gap)` | Horizontal gap between card columns |
| `--hub-list-cards-bg` | `var(--hub-list-item-bg, transparent)` | Background color of a card |
| `--hub-list-cards-color` | `var(--hub-list-item-color)` | Text color of a card |
| `--hub-list-cards-padding-x` | `var(--hub-list-item-padding-x)` | Horizontal padding of a card |
| `--hub-list-cards-padding-y` | `var(--hub-list-item-padding-y)` | Vertical padding of a card |
| `--hub-list-cards-border-color` | `var(--hub-list-item-border-color)` | Border color of a card |
| `--hub-list-cards-border-width` | `var(--hub-list-item-border-width, 1px)` | Border width of a card |
| `--hub-list-cards-border-radius` | `var(--hub-list-item-border-radius)` | Border radius of a card |
| `--hub-list-cards-shadow` | `none` | Box shadow of a card (e.g. `var(--hub-sys-shadow-sm)`) |
| `--hub-list-cards-hover-bg` | `var(--hub-list-item-hover-bg)` | Background color of a clickable card on hover |
| `--hub-list-cards-hover-shadow` | `var(--hub-list-cards-shadow)` | Box shadow of a clickable card on hover |
| `--hub-list-cards-transition` | `background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out` | Transition applied to cards |

### Items

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-item-color` | `var(--hub-sys-text-primary, #212529)` | Text color of list items |
| `--hub-list-item-bg` | `var(--hub-sys-surface-page, #ffffff)` | Background of list items; defaults to the page surface so items read as solid like table rows |
| `--hub-list-item-border-color` | `var(--hub-sys-border-color-default, #dee2e6)` | Border color of list items |
| `--hub-list-item-border-width` | `1px` | Border width of list items |
| `--hub-list-item-border-radius` | `var(--hub-ref-radius-sm, 0.25rem)` | Border radius of list items |
| `--hub-list-item-gap` | `var(--hub-ref-space-2, 0.5rem)` | Internal gap within items |
| `--hub-list-item-padding-x` | `var(--hub-ref-space-3, 1rem)` | Horizontal padding of items |
| `--hub-list-item-padding-y` | `var(--hub-ref-space-2, 0.5rem)` | Vertical padding of items |
| `--hub-list-item-hover-bg` | `var(--hub-ref-surface-2, #f8f9fa)` | Background color on item hover |
| `--hub-list-children-gap` | `var(--hub-list-item-padding-y)` | Top margin separating a nested children list from its parent item content |

### Items — Selected

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-item-selected-bg` | `var(--hub-list-accent)` | Background of selected items |
| `--hub-list-item-selected-color` | `var(--hub-list-accent-on)` | Text color of selected items |

### Empty State

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-empty-bg` | `var(--hub-ref-surface-2, #f8f9fa)` | Background when the list is empty |
| `--hub-list-empty-border-color` | `var(--hub-sys-border-color-default, #dee2e6)` | Border color of the empty state |
| `--hub-list-empty-color` | `var(--hub-sys-text-muted, #6c757d)` | Text color of the empty state |
| `--hub-list-empty-padding-x` | `var(--hub-ref-space-3, 1rem)` | Horizontal padding of the empty state |
| `--hub-list-empty-padding-y` | `var(--hub-ref-space-3, 1rem)` | Vertical padding of the empty state |

### Search

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-search-input-bg` | `var(--hub-sys-surface-page, #ffffff)` | Background of the search input |
| `--hub-list-search-input-border-color` | `var(--hub-sys-border-color-default, #dee2e6)` | Border color of the search input |
| `--hub-list-search-input-border-radius` | `var(--hub-ref-radius-sm, 0.25rem)` | Border radius of the search input |
| `--hub-list-search-input-color` | `var(--hub-sys-text-primary, #212529)` | Text color of the search input |
| `--hub-list-search-btn-bg` | `var(--hub-ref-surface-2, #f8f9fa)` | Background of the search button |
| `--hub-list-search-btn-color` | `var(--hub-sys-text-primary, #212529)` | Text/icon color of the search button |
| `--hub-list-search-button-min-width` | `2.75rem` | Minimum width of the search button |
| `--hub-list-search-border-color` | `var(--hub-list-search-input-border-color)` | Shared border color for search input/button |
| `--hub-list-search-border-width` | `1px` | Shared border width for search input/button |
| `--hub-list-search-border-radius` | `var(--hub-list-search-input-border-radius)` | Shared border radius for search input/button |
| `--hub-list-search-input-padding-x` | `0.75rem` | Horizontal padding of the search input |
| `--hub-list-search-input-padding-y` | `0.375rem` | Vertical padding of the search input |
| `--hub-list-search-input-font-size` | `1rem` | Font size of the search input |

### Action Buttons (List)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-action-btn-bg` | `var(--hub-sys-surface-page, #ffffff)` | Background of list action buttons |
| `--hub-list-action-btn-color` | `var(--hub-list-item-color)` | Text color of list action buttons |
| `--hub-list-action-btn-border-color` | `var(--hub-list-item-border-color)` | Border color of list action buttons |
| `--hub-list-action-btn-border-radius` | `var(--hub-list-item-border-radius)` | Border radius of list action buttons |
| `--hub-list-action-btn-padding-x` | `0.75rem` | Horizontal padding of list action buttons |
| `--hub-list-action-btn-padding-y` | `0.375rem` | Vertical padding of list action buttons |
| `--hub-list-action-btn-hover-bg` | `var(--hub-list-item-hover-bg)` | Hover background of list action buttons |

### Drag & Drop (List)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-drag-handle-color` | `var(--hub-sys-text-muted, #6c757d)` | Color of the drag handle |
| `--hub-list-drag-handle-cursor` | `grab` | Cursor shown over the drag handle |
| `--hub-list-drag-handle-size` | `var(--hub-ref-icon-size, 1em)` | Font size of the drag handle |
| `--hub-list-item-dragging-opacity` | `0.5` | Opacity of the row being dragged |
| `--hub-list-item-dragging-cursor` | `grabbing` | Cursor while a row is being dragged |
| `--hub-list-drop-target-outline-color` | `var(--hub-list-accent)` | Outline color of the hovered drop target |
| `--hub-list-drop-target-outline-width` | `2px` | Outline width of the hovered drop target |
| `--hub-list-placeholder-bg` | `var(--hub-ref-surface-2, #f8f9fa)` | Background of the drop placeholder |
| `--hub-list-placeholder-border-color` | `var(--hub-list-accent)` | Border color of the drop placeholder |
| `--hub-list-placeholder-border-width` | `2px` | Border width of the drop placeholder |
| `--hub-list-placeholder-border-style` | `dashed` | Border style of the drop placeholder |
| `--hub-list-placeholder-border-radius` | `var(--hub-list-item-border-radius)` | Border radius of the drop placeholder |
| `--hub-list-placeholder-min-height` | `2.5rem` | Minimum height of the drop placeholder |
| `--hub-list-ghost-opacity` | `0.85` | Opacity of the floating touch drag ghost |
| `--hub-list-ghost-shadow` | `0 0.5rem 1rem rgba(0, 0, 0, 0.15)` | Box shadow of the floating touch drag ghost |


### Connector (List)

Opt-in via the `connected` input — draws a vertical line between consecutive items (a timeline / pipeline look). List display only; skipped in cards mode.

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-connector-color` | `var(--hub-sys-border-color-default, #dee2e6)` | Color of the connector line |
| `--hub-list-connector-width` | `2px` | Thickness of the connector line |
| `--hub-list-connector-style` | `solid` | Border-style of the connector (e.g. `dashed`) |
| `--hub-list-connector-offset` | `var(--hub-list-item-padding-x, var(--hub-ref-space-3, 1rem))` | Inline offset from the item's leading edge |


### Icons (List)

The list draws its own glyphs and owns the variables behind them, so changing the chevron here leaves the table's alone.

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-icon-color` | `currentColor` | Fill colour of the list's glyphs |
| `--hub-list-icon-size` | `var(--hub-ref-icon-size, 1em)` | Size of the list's glyphs |
| `--hub-list-icon-chevron-up` | `url("…")` (SVG) | Glyph on the trigger of an expanded parent item |
| `--hub-list-icon-chevron-down` | `url("…")` (SVG) | Glyph on the trigger of a collapsed parent item |
| `--hub-list-icon-info` | `url("…")` (SVG) | Glyph in front of the loading, error and no-results messages |
| `--hub-list-icon-search` | `url("…")` (SVG) | Glyph on the search button |

### Misc

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-checkbox-size` | `1rem` | Size of selection checkboxes |
| `--hub-list-radio-size` | `var(--hub-list-checkbox-size)` | Size of the single-selection radio |
| `--hub-list-divider-width` | `var(--hub-ref-border-width, 1px)` | Width of the rule between rows when the list is flush |
| `--hub-list-divider-color` | `var(--hub-list-item-border-color)` | Colour of that rule |
| `--hub-list-chevron-size` | `var(--hub-ref-icon-size, 1em)` | Size of expand/collapse chevrons |

---

## Table Variables

Defined on `.hub-table`. Control the appearance of the `<hub-ui-table>` component.

### Accent & Selection

The table reads a single accent slot and derives its family locally (same generative rule as the `--hub-{component}-accent` convention in the design-system docs):

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-accent` | `var(--hub-sys-color-primary, #0d6efd)` | Accent slot — drives selection tint and accent layers |
| `--hub-table-accent-subtle` | `color-mix(in oklch, var(--hub-table-accent) 12%, var(--hub-sys-surface-page, #ffffff))` | Soft accent tint (derived) |
| `--hub-table-selected-bg` | `var(--hub-table-accent-subtle)` | Selected row background. Applies to the built-in selection **and** a consumer-set `hub-table__row--selected` class (via `[rowClass]`) |
| `--hub-table-selected-color` | `var(--hub-sys-text-primary, #212529)` | Selected row text color |
| `--hub-table-selected-bar-width` | `0` | Width of the accent bar on the selected row's leading edge (master-detail "active row"). `0` = off (no visual change); set e.g. `3px` to reveal it |
| `--hub-table-selected-bar-color` | `var(--hub-table-accent)` | Colour of the selected-row accent bar |

### Bottom Bar Layout (Table)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-bottom-bar-gap` | `var(--hub-ref-space-3, 1rem)` | Gap between bottom bar blocks |
| `--hub-table-bottom-bar-justify-content` | `space-around` | Main axis distribution of bottom bar blocks |
| `--hub-table-bottom-bar-align-items` | `center` | Cross-axis alignment of bottom bar blocks |
| `--hub-table-bottom-bar-wrap` | `wrap` | Wrapping behavior for bottom bar blocks |
| `--hub-table-bottom-bar-paginator-order` | `1` | Order of paginator block |
| `--hub-table-bottom-bar-settings-order` | `2` | Order of rows-per-page block |
| `--hub-table-bottom-bar-info-order` | `3` | Order of info block |
| `--hub-table-bottom-bar-paginator-flex` | `0 0 auto` | Flex value for paginator block |
| `--hub-table-bottom-bar-settings-flex` | `0 0 auto` | Flex value for settings block |
| `--hub-table-bottom-bar-info-flex` | `0 0 auto` | Flex value for info block |

### Top Bar Layout (Table)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-top-bar-gap` | `var(--hub-ref-space-3, 1rem)` | Gap between top bar blocks |
| `--hub-table-top-bar-justify-content` | `end` | Main axis distribution for top bar blocks |
| `--hub-table-top-bar-align-items` | `center` | Cross-axis alignment for top bar blocks |
| `--hub-table-top-bar-wrap` | `wrap` | Wrapping behavior for top bar blocks |
| `--hub-table-batch-actions-gap` | `var(--hub-ref-space-2, 0.5rem)` | Gap between table batch action buttons |
| `--hub-table-batch-actions-margin-inline-end` | `auto` | Push batch actions to inline start/end depending on direction |

### Container

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-container-bg` | `var(--hub-ref-color-white, #fff)` | Background of the table container |
| `--hub-table-container-color` | `var(--hub-sys-text-primary, #212529)` | Text color of the table container |
| `--hub-table-border-color` | `var(--hub-sys-border-color-default, #dee2e6)` | Border color used in the table wrapper |
| `--hub-table-border-radius` | `var(--hub-ref-radius-md, 0.375rem)` | Border radius of the table container |
| `--hub-table-border-width` | `var(--hub-ref-border-width, 1px)` | Border width of the table container |
| `--hub-table-container-gap` | `var(--hub-ref-space-3, 1rem)` | Gap between the top bar, table and bottom bar |
| `--hub-table-container-max-block-size` | `none` | Max height of the scroll body; with `options.scrollable`, set it to cap the body height and engage the sticky header |
| `--hub-table-container-overflow` | `auto` | Scroll behaviour of the built-in container. `[stickyHeader]` flips it to `visible` so the container does **not** trap the sticky header, letting it pin to the consumer's own scroll ancestor (a `max-height` + `overflow:auto` box). Override to force a specific behaviour |
| `--hub-table-head-sticky-top` | `0` | Sticky offset of the header while the body scrolls (e.g. to clear a toolbar) |

### Search (Table)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-search-input-bg` | `var(--hub-table-container-bg, var(--hub-ref-color-white, #fff))` | Background of the search input |
| `--hub-table-search-input-border-color` | `var(--hub-table-border-color)` | Border color of the search input |
| `--hub-table-search-input-color` | `var(--hub-table-container-color, var(--hub-sys-text-primary, #212529))` | Text color of the search input |
| `--hub-table-search-input-padding-x` | `0.75rem` | Horizontal padding of the search input |
| `--hub-table-search-input-padding-y` | `0.375rem` | Vertical padding of the search input |
| `--hub-table-search-input-font-size` | `1rem` | Font size of the search input |
| `--hub-table-search-button-bg` | `var(--hub-table-container-bg, var(--hub-ref-color-white, #fff))` | Background of the search button |
| `--hub-table-search-button-border-color` | `var(--hub-table-border-color)` | Border color of the search button |
| `--hub-table-search-button-color` | `var(--hub-table-container-color, var(--hub-sys-text-primary, #212529))` | Text/icon color of the search button |
| `--hub-table-search-button-min-width` | `2.75rem` | Minimum width of the search button |
| `--hub-table-search-border-width` | `var(--hub-table-border-width)` | Shared border width for search input/button |
| `--hub-table-search-border-radius` | `var(--hub-table-border-radius)` | Shared border radius for search input/button |
| `--hub-table-search-clear-color` | `var(--hub-sys-text-muted, #6c757d)` | Colour of the clear (×) affordance, shown while the box holds a term |
| `--hub-table-search-clear-hover-color` | `var(--hub-table-container-color, var(--hub-sys-text-primary, #212529))` | Colour of the clear affordance on hover/focus |
| `--hub-table-search-clear-icon-size` | `0.75em` | Size of the clear affordance's glyph |
| `--hub-table-search-clear-padding-x` | `var(--hub-ref-space-2, 0.5rem)` | Horizontal padding of the clear affordance |

### Table Element

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-bg` | `var(--hub-ref-color-white, #fff)` | Background of the `<table>` element |
| `--hub-table-color` | `var(--hub-sys-text-primary, #212529)` | Text color inside the table |
| `--hub-table-border-color` | `var(--hub-sys-border-color-default, #dee2e6)` | Border color of table rows and cells |
| `--hub-table-border-width` | `var(--hub-ref-border-width, 1px)` | Border width of table rows and cells |
| `--hub-table-group-separator-color` | `var(--hub-sys-border-color-default, #dee2e6)` | Color of the separator between thead and tbody |
| `--hub-table-head-bg` | `var(--hub-table-bg, var(--hub-ref-color-white, #fff))` | Header (thead) surface; kept opaque so a sticky header covers the scrolling body |
| `--hub-table-head-color` | `var(--hub-table-color, var(--hub-sys-text-primary, #212529))` | Header (thead) text color |
| `--hub-table-head-font-size` | `inherit` | Header (thead) cell font size |
| `--hub-table-head-font-weight` | `bold` | Header (thead) cell font weight (browser `th` default; set to `var(--hub-ref-font-weight-semibold, 600)` for the DS look) |
| `--hub-table-head-padding-x` | `var(--hub-table-cell-padding-x)` | Header (thead) cell horizontal padding |
| `--hub-table-head-padding-y` | `var(--hub-table-cell-padding-y)` | Header (thead) cell vertical padding |
| `--hub-table-head-position` | `sticky` | CSS `position` of the header when `[stickyHeader]` is set; override to `static` to opt a table out |
| `--hub-table-row-divider-color` | `var(--hub-table-border-color)` | Color of the divider between body rows (independent of the frame and vertical borders) |

### Cell Spacing

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-cell-padding-x` | `var(--hub-ref-space-3, 1rem)` | Horizontal cell padding (normal) |
| `--hub-table-cell-padding-y` | `var(--hub-ref-space-2, 0.5rem)` | Vertical cell padding (normal) |
| `--hub-table-cell-padding-x-sm` | `var(--hub-ref-space-2, 0.5rem)` | Horizontal cell padding (compact/small) |
| `--hub-table-cell-padding-y-sm` | `var(--hub-ref-space-1, 0.25rem)` | Vertical cell padding (compact/small) |
| `--hub-table-cell-vertical-align` | `middle` | Vertical alignment of cell content |

### Row States

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-hover-bg` | `var(--hub-sys-state-hover-bg, rgba(0, 0, 0, 0.075))` | Background on row hover |
| `--hub-table-hover-color` | `var(--hub-sys-text-primary, #212529)` | Text color on row hover |
| `--hub-table-active-bg` | `var(--hub-sys-state-active-bg, rgba(0, 0, 0, 0.1))` | Background for active rows |
| `--hub-table-active-color` | `var(--hub-sys-text-primary, #212529)` | Text color for active rows |
| `--hub-table-striped-bg` | `var(--hub-sys-state-striped-bg, rgba(0, 0, 0, 0.05))` | Background for striped rows |
| `--hub-table-striped-color` | `var(--hub-sys-text-primary, #212529)` | Text color for striped rows |

### Accent Layer (Advanced)

These variables power the cascade pattern for row states (`striped`, `hover`, `active`). They are set internally and generally should not be overridden directly.

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-accent-bg` | `transparent` | Base accent background |
| `--hub-table-bg-type` | `initial` | Background set by variant type (striped) |
| `--hub-table-bg-state` | `initial` | Background set by interaction state (hover, active) |
| `--hub-table-color-type` | `initial` | Color set by variant type |
| `--hub-table-color-state` | `initial` | Color set by interaction state |
| `--hub-table-cell-bar-width` | `var(--hub-table-selected-bar-width)` | Per-cell leading accent-bar width (internal; the selected row sets it from `--hub-table-selected-bar-width`) |
| `--hub-table-cell-bar-color` | `var(--hub-table-selected-bar-color, var(--hub-table-accent))` | Per-cell leading accent-bar colour (internal; set from `--hub-table-selected-bar-color`) |

### Filter Button & Count Badge

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-filter-button-gap` | `var(--hub-ref-space-2, 0.5rem)` | Gap between filter button icon and text |
| `--hub-table-filter-button-padding-x` | `0.75rem` | Horizontal padding of the filter button |
| `--hub-table-filter-button-padding-y` | `0.375rem` | Vertical padding of the filter button |
| `--hub-table-filter-button-border-width` | `1px` | Border width of the filter button |
| `--hub-table-filter-button-border-color` | `transparent` | Border color of the filter button |
| `--hub-table-filter-button-border-radius` | `var(--hub-ref-radius-sm, 0.25rem)` | Border radius of the filter button |
| `--hub-table-filter-button-transition` | `all 0.2s ease` | Transition applied to the filter button |
| `--hub-table-filter-button-hover-bg` | `rgba(0, 0, 0, 0.05)` | Background of the filter button on hover |
| `--hub-table-filter-button-active-bg` | `color-mix(in oklch, var(--hub-sys-color-success, #198754) 10%, transparent)` | Background when filters are applied |
| `--hub-table-filter-button-active-border-color` | `var(--hub-sys-color-success, #198754)` | Border color when filters are applied |
| `--hub-table-filter-button-icon-color` | `var(--hub-sys-text-muted, #6c757d)` | Filter button icon color |
| `--hub-table-filter-button-icon-active-color` | `var(--hub-sys-color-success, #198754)` | Filter button icon color when active |
| `--hub-table-filter-count-bg` | `var(--hub-sys-color-success, #198754)` | Background of the active-filter count badge |
| `--hub-table-filter-count-color` | `var(--hub-ref-color-white, #fff)` | Text color of the count badge |
| `--hub-table-filter-count-size` | `1.25rem` | Min width and height of the count badge |
| `--hub-table-filter-count-padding-x` | `0.4em` | Horizontal padding of the count badge |
| `--hub-table-filter-count-font-size` | `0.7rem` | Font size of the count badge |
| `--hub-table-filter-count-font-weight` | `var(--hub-ref-font-weight-bold, 700)` | Font weight of the count badge |
| `--hub-table-filter-count-border-radius` | `var(--hub-ref-radius-pill, 50rem)` | Border radius of the count badge |
| `--hub-table-batch-actions-btn-icon-gap` | `var(--hub-ref-space-1, 0.25rem)` | Spacing between a batch action button's icon and text |

### Column Filter Row

The inline filter controls the table draws under the header (`filter.mode` other than `menu`),
including the two-ended range field. A cell whose filter currently holds a value takes the
`--active` state, so the row shows both which columns can be filtered and which of them are.

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-filter-row-bg` | `var(--hub-table-head-bg)` | Background of the filter row |
| `--hub-table-filter-cell-padding-x` | `var(--hub-table-head-padding-x)` | Horizontal padding of a filter cell |
| `--hub-table-filter-cell-padding-y` | `var(--hub-table-head-padding-y)` | Vertical padding of a filter cell |
| `--hub-table-filter-control-bg` | `var(--hub-table-container-bg, var(--hub-ref-color-white, #fff))` | Background of a filter control |
| `--hub-table-filter-control-color` | `var(--hub-table-container-color, var(--hub-sys-text-primary, #212529))` | Text color of a filter control |
| `--hub-table-filter-control-placeholder-color` | `var(--hub-sys-text-muted, #6c757d)` | Placeholder and range-label color |
| `--hub-table-filter-control-border-color` | `var(--hub-table-border-color)` | Border color of a filter control |
| `--hub-table-filter-control-border-width` | `var(--hub-table-border-width)` | Border width of a filter control |
| `--hub-table-filter-control-border-radius` | `var(--hub-ref-radius-sm, 0.25rem)` | Border radius of a filter control |
| `--hub-table-filter-control-padding-x` | `var(--hub-ref-space-2, 0.5rem)` | Horizontal padding inside a filter control |
| `--hub-table-filter-control-padding-y` | `var(--hub-ref-space-1, 0.25rem)` | Vertical padding inside a filter control |
| `--hub-table-filter-control-font-size` | `var(--hub-ref-font-size-sm, 0.875rem)` | Font size of a filter control |
| `--hub-table-filter-control-focus-border-color` | `var(--hub-table-accent)` | Border color while focused |
| `--hub-table-filter-control-focus-shadow` | `0 0 0 0.2rem color-mix(in oklch, var(--hub-table-accent) 25%, transparent)` | Focus ring |
| `--hub-table-filter-control-active-bg` | `var(--hub-table-filter-button-active-bg)` | Background when the filter holds a value |
| `--hub-table-filter-control-active-border-color` | `var(--hub-table-filter-button-active-border-color)` | Border color when the filter holds a value |

### Clear Filters Button

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-delete-filters-bg` | `var(--hub-table-container-bg, var(--hub-ref-color-white, #fff))` | Background of the button |
| `--hub-table-delete-filters-color` | `var(--hub-table-container-color, var(--hub-sys-text-primary, #212529))` | Text and icon color |
| `--hub-table-delete-filters-border-color` | `var(--hub-table-border-color)` | Border color |
| `--hub-table-delete-filters-border-width` | `var(--hub-table-border-width)` | Border width |
| `--hub-table-delete-filters-border-radius` | `var(--hub-table-border-radius)` | Border radius |
| `--hub-table-delete-filters-padding-x` | `0.75rem` | Horizontal padding |
| `--hub-table-delete-filters-padding-y` | `0.375rem` | Vertical padding |
| `--hub-table-delete-filters-font-size` | `var(--hub-table-search-input-font-size)` | Font size (matches the search field beside it) |
| `--hub-table-delete-filters-gap` | `var(--hub-ref-space-2, 0.5rem)` | Gap between the eraser icon and the label |
| `--hub-table-delete-filters-hover-bg` | `color-mix(in oklch, var(--hub-sys-color-danger, #dc3545) 10%, transparent)` | Background on hover/focus |
| `--hub-table-delete-filters-hover-border-color` | `var(--hub-sys-color-danger, #dc3545)` | Border color on hover/focus |
| `--hub-table-delete-filters-hover-color` | `var(--hub-sys-color-danger, #dc3545)` | Text and icon color on hover/focus |
| `--hub-table-delete-filters-disabled-opacity` | `0.5` | Opacity while a filter request is in flight |

### Icons

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-icon-color` | `currentColor` | Color of table icons (sort, filter, etc.) |
| `--hub-table-icon-size` | `1em` | Base size of table icons |
| `--hub-table-icon-sort` | `url("…")` (SVG) | Glyph for the sortable (unsorted) indicator |
| `--hub-table-icon-sort-up` | `url("…")` (SVG) | Glyph for the ascending sort indicator |
| `--hub-table-icon-sort-down` | `url("…")` (SVG) | Glyph for the descending sort indicator |
| `--hub-table-icon-caret-up` | `url("…")` (SVG) | Row-expander caret glyph (expanded) |
| `--hub-table-icon-caret-down` | `url("…")` (SVG) | Row-expander caret glyph (collapsed) |
| `--hub-table-icon-search` | `url("…")` (SVG) | Table search icon (SVG, overridable via mask-image) |
| `--hub-table-icon-filter` | `url("…")` (SVG) | Table filter icon (SVG, overridable via mask-image) |
| `--hub-table-icon-eraser` | `url("…")` (SVG) | Table eraser icon (SVG, overridable via mask-image) |
| `--hub-table-icon-close` | `url("…")` (SVG) | Close/dismiss glyph used by the search box's clear affordance |
| `--hub-table-icon-info` | `url("…")` (SVG) | Table info icon (SVG, overridable via mask-image) |
| `--hub-table-icon-chevron-up` | `url("…")` (SVG) | Declared for `.hub-table__icon--chevron-up`. Nothing in this package paints that class, and the rule is scoped to the table's own view, so overriding this variable changes nothing on screen |
| `--hub-table-icon-chevron-down` | `url("…")` (SVG) | Declared for `.hub-table__icon--chevron-down`. Nothing in this package paints that class, and the rule is scoped to the table's own view, so overriding this variable changes nothing on screen |
| `--hub-table-icon-chevron-left` | `url("…")` (SVG) | Declared for `.hub-table__icon--chevron-left`. Nothing in this package paints that class, and the rule is scoped to the table's own view, so overriding this variable changes nothing on screen |
| `--hub-table-icon-chevron-right` | `url("…")` (SVG) | Declared for `.hub-table__icon--chevron-right`. Nothing in this package paints that class, and the rule is scoped to the table's own view, so overriding this variable changes nothing on screen |
| `--hub-table-icon-angle-left` | `url("…")` (SVG) | Declared for `.hub-table__icon--angle-left`. Nothing in this package paints that class, and the rule is scoped to the table's own view, so overriding this variable changes nothing on screen |
| `--hub-table-icon-angle-right` | `url("…")` (SVG) | Declared for `.hub-table__icon--angle-right`. Nothing in this package paints that class, and the rule is scoped to the table's own view, so overriding this variable changes nothing on screen |
| `--hub-table-icon-angle-double-left` | `url("…")` (SVG) | Declared for `.hub-table__icon--angle-double-left`. Nothing in this package paints that class, and the rule is scoped to the table's own view, so overriding this variable changes nothing on screen |
| `--hub-table-icon-angle-double-right` | `url("…")` (SVG) | Declared for `.hub-table__icon--angle-double-right`. Nothing in this package paints that class, and the rule is scoped to the table's own view, so overriding this variable changes nothing on screen |
| `--hub-table-icon-ellipsis-v` | `url("…")` (SVG) | Declared for `.hub-table__icon--ellipsis-v`; nothing paints that class since 22.18.0 — theme `--hub-table-dropdown-icon-ellipsis-v` instead |
| `--hub-table-icon-trash` | `url("…")` (SVG) | Declared for `.hub-table__icon--trash`; nothing paints that class since 22.18.0 — theme `--hub-filter-icon-trash` instead |
| `--hub-table-icon-plus` | `url("…")` (SVG) | Declared for `.hub-table__icon--plus`; nothing paints that class since 22.18.0 — theme `--hub-filter-icon-plus` instead |

### Responsive Breakpoints

The responsive table variants (`.hub-table__responsive-sm|md|lg|xl|xxl`) trigger at **fixed** breakpoints — `576px`, `768px`, `992px`, `1200px`, `1400px` — defined directly in the component's `@media` queries. These are **not** overridable via CSS variables, because CSS custom properties cannot be read inside `@media` conditions.

---

## Internal Panels

The column filter panel and the legacy row-actions menu take their surface from the system tokens rather than publishing one of their own. Their glyphs are the exception: a glyph can be replaced no other way.

### Column Filter Panel

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-filter-icon-color` | `currentColor` | Fill colour of the filter panel glyphs |
| `--hub-filter-icon-size` | `1em` | Size of the filter panel glyphs |
| `--hub-filter-icon-trash` | `url("…")` (SVG) | Glyph on the remove-rule trigger |
| `--hub-filter-icon-plus` | `url("…")` (SVG) | Glyph on the add-rule trigger |

### Row Actions Menu (deprecated)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-dropdown-icon-color` | `currentColor` | Fill colour of the trigger glyph |
| `--hub-table-dropdown-icon-size` | `1em` | Size of the trigger glyph |
| `--hub-table-dropdown-icon-ellipsis-v` | `url("…")` (SVG) | Default glyph on the menu trigger, replaced whole by `options.icon` |

---

## Customization Examples

### Override a Single Component

Change only the paginator's active color to green:

```scss
.hub-paginator {
  --hub-paginator-link-active-bg: #198754;
  --hub-paginator-link-active-border-color: #198754;
  --hub-paginator-link-color: #198754;
  --hub-paginator-link-hover-color: #157347;
}
```

### Dark Theme

Override the system-level tokens to switch all three components to dark mode at once:

```scss
[data-theme='dark'],
.dark-theme {
  --hub-sys-surface-page: #121212;
  --hub-sys-text-primary: #f8f9fa;
  --hub-sys-text-muted: #adb5bd;
  --hub-sys-border-color-default: #343a40;
  --hub-sys-color-primary: #6ea8fe;
  --hub-sys-state-hover-bg: rgba(255, 255, 255, 0.075);
  --hub-sys-state-active-bg: rgba(255, 255, 255, 0.1);
  --hub-sys-state-striped-bg: rgba(255, 255, 255, 0.05);
  --hub-ref-surface-2: #1e1e1e;
  --hub-ref-color-white: #fff;
}

/* Optional: override table-specific tokens for dark */
.dark-theme .hub-table {
  --hub-table-container-bg: #1e1e1e;
  --hub-table-bg: #1e1e1e;
}
```

### Compact Table

Reduce spacing for a denser data display:

```scss
.compact-table .hub-table {
  --hub-table-cell-padding-x: 0.5rem;
  --hub-table-cell-padding-y: 0.25rem;
  --hub-table-border-radius: 0.2rem;
  font-size: 0.875rem;
}

.compact-table .hub-paginator {
  --hub-paginator-font-size: 0.8rem;
  --hub-paginator-gap: 0.125rem;
}
```

### Custom Brand Colors

Apply your brand color to the primary actions across all components:

```scss
:root {
  /* Change the primary color globally */
  --hub-sys-color-primary: #7c3aed; /* Purple brand */
}
```

This single change will automatically update:
- Paginator active page background and link colors
- List selected item background
- Any other component consuming `--hub-sys-color-primary`

### Bootstrap Integration

If you use Bootstrap 5, you can bridge Bootstrap tokens into the hub system:

```scss
:root {
  --hub-sys-surface-page: var(--bs-body-bg);
  --hub-sys-text-primary: var(--bs-body-color);
  --hub-sys-border-color-default: var(--bs-border-color);
  --hub-sys-color-primary: var(--bs-primary);
  --hub-ref-radius-sm: var(--bs-border-radius-sm);
  --hub-ref-radius-md: var(--bs-border-radius);
}
```

### Scoped Override per Instance

Wrap a specific table in a class to override its styles without affecting others:

```html
<div class="finance-table">
  <hub-ui-table [headers]="headers" [data]="data"></hub-ui-table>
</div>
```

```scss
.finance-table .hub-table {
  --hub-table-striped-bg: rgba(25, 135, 84, 0.05);
  --hub-table-hover-bg: rgba(25, 135, 84, 0.1);
}

.finance-table .hub-paginator {
  --hub-paginator-link-active-bg: #198754;
  --hub-paginator-link-active-border-color: #198754;
}
```

### List with Custom Selection Color

```scss
.custom-list .hub-list {
  --hub-list-item-selected-bg: #7c3aed;
  --hub-list-item-selected-color: #fff;
  --hub-list-item-hover-bg: rgba(124, 58, 237, 0.08);
  --hub-list-border-radius: 0.5rem;
}
```

---

## Token Architecture

### Relationship Diagram

```
┌─────────────────────────────────────────────────────┐
│  ref layer (primitives)                             │
│  --hub-ref-color-white: #fff                        │
│  --hub-ref-space-2: 0.5rem                          │
│  --hub-ref-radius-sm: 0.25rem                       │
└──────────────────┬──────────────────────────────────┘
                   │ consumed by
                   ▼
┌─────────────────────────────────────────────────────┐
│  sys layer (semantic)                               │
│  --hub-sys-surface-page: #ffffff                    │
│  --hub-sys-color-primary: #0d6efd                   │
│  --hub-sys-border-color-default: #dee2e6            │
└──────────────────┬──────────────────────────────────┘
                   │ consumed by
                   ▼
┌─────────────────────────────────────────────────────┐
│  component layer                                    │
│  --hub-paginator-link-bg: var(--hub-sys-surface-page)│
│  --hub-table-color: var(--hub-sys-text-primary)│
│  --hub-list-item-hover-bg: var(--hub-ref-surface-2)  │
└─────────────────────────────────────────────────────┘
```

### Override Priority

1. **Highest priority**: Component-level variable override (e.g., `--hub-paginator-link-bg: red`)
2. **Medium priority**: System-level variable override (e.g., `--hub-sys-surface-page: #f0f0f0`)
3. **Lowest priority**: Reference-level variable override (e.g., `--hub-ref-color-white: #fafafa`)

Override at the **sys level** when you want consistent theming across components. Override at the **component level** when you need granular control over a specific element.

---

## Best Practices

1. **Theme globally with `sys` tokens**. Changing `--hub-sys-color-primary` updates every component.
2. **Use component tokens for granular control**. If only the paginator needs a different active color, override `--hub-paginator-link-active-bg`.
3. **Scope overrides with CSS classes**. Wrap components in containers and target `.my-context .hub-table { ... }` to avoid leaking styles.
4. **Prefer `@use` over `@import`** when including the library's SCSS to avoid polluting the global namespace.
5. **Do not override accent/state internal variables** (`--hub-table-bg-state`, `--hub-table-bg-type`) unless you fully understand the cascade pattern.
6. **Test in both light and dark themes** if your application supports theming.
7. **Persist user preferences** (e.g., compact vs. normal) in localStorage and apply the corresponding CSS class on load.
