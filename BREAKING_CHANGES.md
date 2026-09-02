# Breaking Changes: ng-hub-ui-paginable

## v22.17.0

### The column filters and the clear-filters button no longer wear Bootstrap class names

- **Change**: the default filter controls dropped `.form-control` / `.form-select` for `hub-table__filter-control` (`--select` on the two selects), and the clear-filters button dropped `.btn.btn-outline-danger`. Each is now drawn from `--hub-table-filter-control-*` / `--hub-table-delete-filters-*`. The range control dropped three sets: `.form-control d-flex flex-column` on its root, `d-flex align-items-center justify-content-between` on each field, and `.text-muted` on each label.
- **Impact**: CSS that reached the filter row through those names — `.hub-table__filter-cell .form-control`, `.hub-table__delete-filters-btn.btn-outline-danger` — no longer matches. Bootstrap consumers see the library's field instead of Bootstrap's; the two are the same shape, but the clear button is now neutral at rest and destructive only on hover.
- **Migration**: theme through the tokens (`--hub-table-filter-control-border-color`, `--hub-table-delete-filters-hover-bg`, …), or target `.hub-table__filter-control` / `.hub-table__delete-filters-btn`. To keep the old red-at-rest button: `--hub-table-delete-filters-color: var(--hub-sys-color-danger); --hub-table-delete-filters-border-color: var(--hub-sys-color-danger);`.
- **Why not keep both**: the names promised a stylesheet this family does not ship, so in a product without Bootstrap the whole filter row was invisible — the bug this release fixes. Keeping them would leave two owners of one appearance, free to drift apart, and the library's own rules would have to out-specify a stylesheet it cannot see.

### The range control no longer ships a `.form-control` compatibility block

- **Change**: `paginable-table-range-input.component.scss` carried a `// Legacy support for form-control` rule that gave anything inside a `.form-control` the range control's own layout. It is deleted.
- **Impact**: this is the vector the entry above does not cover, and it reaches further. A **custom filter template** of your own — `filterTpt` markup wrapped in `.form-control`, which is exactly what this library's own README has been instructing — inherited that block and now inherits nothing. The control keeps its shape; a hand-written template that leaned on the block loses its layout.
- **Migration**: give your template its own layout, or reach for `.hub-table__filter-control`, which the library now styles. The README snippets are corrected in this release, so copying them afresh produces markup that works in a product with or without Bootstrap.
- **Why**: the block existed to make a Bootstrap name work inside a library that no longer emits one. Keeping a compatibility shim for a class the library has stopped writing means maintaining an appearance nobody owns.

### Rebuilding `items` keeps the whole selection and publishes nothing

- **Change**: the `items` setter no longer recomputes the value from what survived the rebuild, and no longer calls `onChange`. What was written into the control stays written; only the part of it that the new items can show is ticked.
- **Impact**: a consumer that paged or filtered its own data and relied on the list pruning the value for it now keeps entries that are not on the current page. A consumer that listened for that publication to learn "the selection shrank" no longer hears it — which is the point: it was indistinguishable from the user clearing the field.
- **Migration**: prune on the consumer's side, where the reason for the change is known. If the offer really shrank (an item was deleted), intersect the value with the new items and write it back. If it only paged, do nothing — which is what most callers wanted and could not get.
- **Why not an option**: a flag would ask every consumer to answer a question the library cannot pose properly. The distinction is not "prune or not", it is "why did `items` change", and only the caller holds that.

## v22.12.0

### `clickFn` hands over the item, not the internal wrapper

- **Change**: `ListClickEvent.item` now carries the list item you passed in `items`. It used to carry the form group wrapping it — `{selected, collapsed, data, children}` — while the published type said `item: T`. `value` now reads `bindLabel` from the item rather than from that wrapper, and a new `children: T[]` carries a group's children as items.
- **Impact**: code written against the **runtime** rather than the type — reading `event.item.data`, or `event.item.children` expecting wrappers — breaks. Code written against the **published type** — `event.item.<field>` — starts working, having silently received `undefined` until now.
- **Migration**: delete the unwrapping. `event.item.data` becomes `event.item`; `event.item.children.map(c => c.data)` becomes `event.children`. A consumer that defended against both shapes (`item.data ?? item`) needs no change.
- **Why not an alias**: adding `event.row` and deprecating `item` would leave the library carrying a field that is documented as the item and is not, for ever, to protect code that depends on a contradiction between the runtime and the type. One name, correct, is the cheaper price — and it is paid once.

### A group row no longer contributes its own value to the selection

- **Change**: with `bindChildren`, ticking a group's checkbox now selects **its children**, and the group's own value no longer enters the selection. A group whose children are partly selected renders indeterminate.
- **Impact**: a consumer who relied on a group's value appearing in the array — treating a heading as a selectable datum — gets the leaves instead.
- **Migration**: read the leaves. If a group genuinely is a datum in your data, it should not have `children`.

## v22.1.1

### Tooltip directive moved to `ng-hub-ui-utils`

- **Change**: `TooltipDirective` now lives in `ng-hub-ui-utils`. It is still re-exported from `ng-hub-ui-paginable` for backward compatibility, so existing imports keep working. The injected base class changed from `.ng-tooltip` to `.hub-tooltip`.
- **Impact**: any custom CSS targeting `.ng-tooltip` no longer applies.
- **Migration**: import `TooltipDirective` from `ng-hub-ui-utils`, and restyle via the new `.hub-tooltip` class or the `--hub-tooltip-*` CSS variables. Requires `ng-hub-ui-utils >= 22.2.0`.

## v22.0.0

This release aligns the major with Angular 22 and restructures the List component's CSS API. `peerDependencies` stays at `>=18.0.0`, so Angular 18–22 remain supported.

### 1. List BEM structure moved to the host element

- **Change**: the `.hub-list` block class now lives on the host element (`<hub-list>`); the inner `<ul>` is now `.hub-list__items`. The root/cards modifiers were renamed from `.hub-list--root` / `.hub-list--cards` to `.hub-list__items--root` / `.hub-list__items--cards`.
- **Impact**: CSS targeting `.hub-list` as the `<ul>`, or the `.hub-list--root` / `.hub-list--cards` selectors, no longer matches.
- **Migration**: target `.hub-list__items` (and `--root` / `--cards`) for the items collection; `.hub-list` now refers to the component host.

### 2. List CSS variables renamed

- **Change**:
    - `--hub-list-container-bg` → `--hub-list-bg`
    - `--hub-list-container-border-radius` → `--hub-list-border-radius`
    - `--hub-list-container-padding-x` / `-y` → `--hub-list-padding-x` / `-y`
    - `--hub-list-container-gap` → `--hub-list-items-gap`
- **Impact**: overrides using the old `--hub-list-container-*` names have no effect.
- **Migration**: rename the variables in your overrides. The background model also changed: `--hub-list-bg` (host) and `--hub-list-item-bg` (items) now control backgrounds; the host is transparent and items use the page surface by default.

### 3. Table responsive breakpoint variables removed

- **Change**: `--hub-table-breakpoint-sm` / `-md` / `-lg` / `-xl` / `-xxl` were removed.
- **Impact**: none in practice — they never had any effect, because CSS custom properties cannot be read inside `@media` conditions.
- **Migration**: none. The responsive variants (`.hub-table__responsive-*`) still trigger at the fixed `576px` / `768px` / `992px` / `1200px` / `1400px` breakpoints.

## v21.2.0

This major release removes framework-specific styling assumptions from action buttons and unifies the action button contract.

### 1. `PaginableActionButton.color` removed

- **Change**: `color` is no longer part of `PaginableActionButton`.
- **Impact**: Configurations that relied on automatic Bootstrap class generation (`btn-${color}` or `text-${color}`) must now provide classes explicitly.
- **Migration**: Move style intent to `classlist`.

```typescript
// Before
{
  title: 'Delete',
  color: 'danger'
}

// After
{
  title: 'Delete',
  classlist: 'btn btn-danger'
}
```

### 2. Legacy action interfaces removed

- **Change**: `RowButton` and `ListButton` have been removed.
- **Migration**: Replace all usages with `PaginableActionButton`.

```typescript
// Before
buttons: Array<RowButton | PaginableTableDropdown>;
batchActions: Array<PaginableTableDropdown | ListButton>;

// After
buttons: Array<PaginableActionButton | PaginableTableDropdown>;
batchActions: Array<PaginableTableDropdown | PaginableActionButton>;
```

## v21.0.0

This major release aligns with Angular 21 and introduces structural renaming to improve consistency across the library.

### 2. Component Renaming

- **Change**: `PaginableListComponent` has been renamed to `ListComponent`.
- **Migration**: Update your imports and component references:

    ```typescript
    // Before
    import { PaginableListComponent } from 'ng-hub-ui-paginable';

    // After
    import { ListComponent } from 'ng-hub-ui-paginable';
    ```

### 3. Directive Renaming

- **Change**: The empty state directive `PaginableTableNotFoundDirective` has been renamed to `PaginableNoResultsDirective`.
- **Migration**: Update your template and imports:

    ```html
    <!-- Before -->
    <ng-template paginableTableNotFound> No results found. </ng-template>

    <!-- After -->
    <ng-template paginableNoResults> No results found. </ng-template>
    ```
