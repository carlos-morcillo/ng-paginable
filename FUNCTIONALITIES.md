# Functionalities of Paginable Library

This table lists the functionalities of the `ng-hub-ui-paginable` library:

- **Implemented** — supported by the library code.
- **Example** — a working interactive example exists in the main repo (`src/app/pages/examples`, shown at `/paginable`).

## Paginable Table (`hub-ui-table`)

| Category                    | Functionality                                                                                                      | Implemented | Example |
| :-------------------------- | :----------------------------------------------------------------------------------------------------------------- | :---------: | :-----: |
| **Basic Usage**             | Simple table (auto columns)                                                                                        |     ✅      |   ✅    |
|                             | Striped & hoverable rows                                                                                           |     ✅      |   ✅    |
|                             | Flush (`flush`) — no chrome per row, a rule between them; for a collection inside a surface that already framed it |     ✅      |   ✅    |
|                             | Automatic client-side pagination (full array + `paginate`, in-memory search/filter/sort/slice)                     |     ✅      |   ✅    |
|                             | Pagination positioning (top / bottom / both)                                                                       |     ✅      |   ❌    |
|                             | Server-side pagination (`page`, `perPage`, `totalItems`, `PaginationState`)                                        |     ✅      |   ✅    |
| **Sorting & Filtering**     | Column sorting (ASC/DESC)                                                                                          |     ✅      |   ✅    |
|                             | Default ordination                                                                                                 |     ✅      |   ✅    |
|                             | Global search (`searchable`)                                                                                       |     ✅      |   ✅    |
|                             | Clear affordance inside the search box, shown while it holds a term                                                |     ✅      |   ✅    |
|                             | Inline column text filters                                                                                         |     ✅      |   ✅    |
|                             | Active-filter state on the filter cell (`hub-table__filter-cell--active`)                                          |     ✅      |   ✅    |
|                             | Clear-filters button (`hub-table__delete-filters-btn`)                                                             |     ✅      |   ✅    |
|                             | Advanced menu filters (operators, AND/OR)                                                                          |     ✅      |   ✅    |
|                             | Date-range filtering                                                                                               |     ✅      |   ✅    |
|                             | Number-range filtering                                                                                             |     ✅      |   ✅    |
|                             | Custom filter templates (`hubTableFilter`)                                                                         |     ✅      |   ✅    |
| **Selection & Interaction** | Single selection                                                                                                   |     ✅      |   ✅    |
|                             | Multiple selection                                                                                                 |     ✅      |   ✅    |
|                             | Select-all                                                                                                         |     ✅      |   ✅    |
|                             | Row click handling (`clickFn`)                                                                                     |     ✅      |   ✅    |
|                             | Dynamic row styling (`rowClass`)                                                                                   |     ✅      |   ✅    |
|                             | Row action buttons (per-row `buttons`)                                                                             |     ✅      |   ✅    |
|                             | Conditional row actions (`hidden` / `disabled`, boolean or predicate)                                              |     ✅      |   ✅    |
|                             | Row dropdown menus (nested `buttons`)                                                                              |     ✅      |   ✅    |
|                             | Conditional row menus (`hidden` / `disabled` on `PaginableTableDropdown`)                                          |     ✅      |   ✅    |
|                             | Batch actions (on selected items)                                                                                  |     ✅      |   ✅    |
| **Advanced Features**       | Expandable rows (master-detail)                                                                                    |     ✅      |   ✅    |
|                             | Sticky columns (start/end, multiple per side)                                                                      |     ✅      |   ✅    |
|                             | Sticky header on scroll (`scrollable` + `--hub-table-container-max-block-size`)                                    |     ✅      |   ❌    |
|                             | Sticky actions (`stickyActions`)                                                                                   |     ✅      |   ❌    |
|                             | Column visibility (`hidden`)                                                                                       |     ✅      |   ✅    |
|                             | Responsive layouts & breakpoints                                                                                   |     ✅      |   ✅    |
|                             | Resizable columns                                                                                                  |     ✅      |   ✅    |
|                             | Loading / empty / no-data states                                                                                   |     ✅      |   ✅    |
|                             | Error state (`error`)                                                                                              |     ✅      |   ✅    |
| **Templates & Directives**  | Custom cell templates (`hubTableCell`)                                                                             |     ✅      |   ✅    |
|                             | Custom header templates (`hubTableHeader`)                                                                         |     ✅      |   ✅    |
|                             | Custom filter templates (`hubTableFilter`)                                                                         |     ✅      |   ✅    |
|                             | Custom row template (`hubTableRow`)                                                                                |     ✅      |   ❌    |
|                             | Custom expanding-row template                                                                                      |     ✅      |   ✅    |
|                             | Custom loading / error / no-results templates (projected)                                                          |     ✅      |   ❌    |
|                             | App-wide default state components (provider `states`)                                                              |     ✅      |   ✅    |
| **Configuration**           | App-wide input defaults (`providePaginable({ defaults })`)                                                         |     ✅      |   ❌    |
|                             | Agnostic form-controls adapter (`provideHubPaginableFormControls`)                                                 |     ✅      |   ✅    |
|                             | Agnostic row-actions adapter (`provideHubPaginableActions`)                                                        |     ✅      |   ✅    |
|                             | RTL layout                                                                                                         |     ✅      |   ✅    |
|                             | Internationalization (i18n)                                                                                        |     ✅      |   ✅    |
|                             | CSS variables theming                                                                                              |     ✅      |   ✅    |

## Paginable List (`hub-ui-list`)

| Feature                                              | Implemented | Example |
| :--------------------------------------------------- | :---------: | :-----: |
| Client-side pagination (`paginate`)                  |     ✅      |   ✅    |
| Selectable list (single / multiple, checkboxes)      |     ✅      |   ✅    |
| Custom item templates                                |     ✅      |   ✅    |
| Cards layout                                         |     ✅      |   ✅    |
| Nested / tree lists                                  |     ✅      |   ✅    |
| Drag & drop reordering (incl. cross-list & keyboard) |     ✅      |   ✅    |
| Batch actions                                        |     ✅      |   ✅    |
| Loading / error / empty states                       |     ✅      |   ✅    |
| CSS variables theming                                |     ✅      |   ✅    |

## Standalone Components & Directives

| Item                                                                       | Implemented |                Example                |
| :------------------------------------------------------------------------- | :---------: | :-----------------------------------: |
| Standalone paginator (`hub-paginator`)                                     |     ✅      |                  ❌                   |
| Range input (`hub-table-range-input`)                                      |     ✅      | ❌ _(used inside advanced filtering)_ |
| Tooltip directive (`TooltipDirective`, re-exported from `ng-hub-ui-utils`) |     ✅      |                  ❌                   |

---

_Legend: **Implemented** = available in the library API. **Example** = a working interactive example exists in this repo and is shown in the documentation site._
