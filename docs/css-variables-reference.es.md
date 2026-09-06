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

### Layout

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-paginator-font-size` | `var(--hub-ref-font-size-base)` | Font size for paginator text |
| `--hub-paginator-gap` | `var(--hub-ref-space-1)` | Gap between page items |
| `--hub-paginator-settings-gap` | `var(--hub-ref-space-2)` | Gap between settings controls (per-page selector, labels) |

### Page Links

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-paginator-link-color` | `var(--hub-sys-color-primary)` | Text color of page links |
| `--hub-paginator-link-bg` | `var(--hub-sys-surface-page)` | Background of page links |
| `--hub-paginator-link-border-color` | `var(--hub-sys-border-color-default)` | Border color of page links |
| `--hub-paginator-link-border-width` | `1px` | Border width of page links |
| `--hub-paginator-link-border-radius` | `var(--hub-ref-radius-sm)` | Border radius of page links |
| `--hub-paginator-link-padding-x` | `0.75rem` | Horizontal padding of page links |
| `--hub-paginator-link-padding-y` | `0.375rem` | Vertical padding of page links |
| `--hub-paginator-link-focus-shadow` | `0 0 0 var(--hub-sys-focus-ring-width) var(--hub-sys-focus-ring-color)` | Focus ring of page links |
| `--hub-paginator-transition` | `color/background/border/box-shadow 0.15s ease-in-out` | Transition applied to page links |

### Page Links — Hover

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-paginator-link-hover-color` | `var(--hub-sys-color-primary)` | Text color on hover |
| `--hub-paginator-link-hover-bg` | `var(--hub-ref-surface-2)` | Background on hover |
| `--hub-paginator-link-hover-border-color` | `var(--hub-sys-border-color-default)` | Border color on hover |

### Page Links — Active (Current Page)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-paginator-link-active-color` | `var(--hub-ref-color-white)` | Text color of the active page |
| `--hub-paginator-link-active-bg` | `var(--hub-sys-color-primary)` | Background of the active page |
| `--hub-paginator-link-active-border-color` | `var(--hub-sys-color-primary)` | Border of the active page |

### Page Links — Disabled

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-paginator-link-disabled-color` | `var(--hub-sys-text-muted)` | Text color when disabled |
| `--hub-paginator-link-disabled-bg` | `var(--hub-ref-surface-2)` | Background when disabled |
| `--hub-paginator-link-disabled-border-color` | `var(--hub-sys-border-color-default)` | Border when disabled |

### Select (Per-Page Dropdown)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-paginator-select-color` | `var(--hub-sys-text-primary)` | Text color of the per-page select |
| `--hub-paginator-select-bg` | `var(--hub-sys-surface-page)` | Background of the per-page select |
| `--hub-paginator-select-border-color` | `var(--hub-sys-border-color-default)` | Border of the per-page select |
| `--hub-paginator-select-border-width` | `1px` | Border width of the per-page select |
| `--hub-paginator-select-border-radius` | `var(--hub-ref-radius-sm)` | Border radius of the per-page select |
| `--hub-paginator-select-padding-x` | `var(--hub-ref-space-2)` | Horizontal padding of the select |
| `--hub-paginator-select-padding-y` | `var(--hub-ref-space-1)` | Vertical padding of the select |

### Misc

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-paginator-icon-color` | `var(--hub-sys-text-primary)` | Color of navigation icons (arrows) |
| `--hub-paginator-icon-size` | `1em` | Size of navigation icons |
| `--hub-paginator-info-color` | `var(--hub-sys-text-muted)` | Color of pagination info text ("Showing 1 to 10 of 100") |
| `--hub-paginator-label-color` | `var(--hub-sys-text-muted)` | Color of labels (e.g., "Items per page") |
| `--hub-paginator-icon-angle-left` | `url("…")` (SVG) | Glifo de la flecha de página anterior |
| `--hub-paginator-icon-angle-right` | `url("…")` (SVG) | Glifo de la flecha de página siguiente |
| `--hub-paginator-icon-angle-double-left` | `url("…")` (SVG) | Glifo de la flecha de primera página |
| `--hub-paginator-icon-angle-double-right` | `url("…")` (SVG) | Glifo de la flecha de última página |

---

## List Variables

Defined on `.hub-list`. Control the appearance of the `<hub-ui-list>` component (hierarchical/tree lists).

### Bottom Bar Layout (List)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-bottom-bar-gap` | `var(--hub-ref-space-3)` | Separación entre bloques de la barra inferior |
| `--hub-list-bottom-bar-justify-content` | `space-around` | Distribución en el eje principal de los bloques de la barra inferior |
| `--hub-list-bottom-bar-align-items` | `center` | Alineación en el eje transversal de los bloques de la barra inferior |
| `--hub-list-bottom-bar-wrap` | `wrap` | Comportamiento de ajuste de línea de los bloques |
| `--hub-list-bottom-bar-paginator-order` | `1` | Orden del bloque del paginador |
| `--hub-list-bottom-bar-settings-order` | `2` | Orden del bloque de filas por página |
| `--hub-list-bottom-bar-info-order` | `3` | Orden del bloque de información |
| `--hub-list-bottom-bar-paginator-flex` | `0 0 auto` | Valor flex del bloque del paginador |
| `--hub-list-bottom-bar-settings-flex` | `0 0 auto` | Valor flex del bloque de ajustes |
| `--hub-list-bottom-bar-info-flex` | `0 0 auto` | Valor flex del bloque de información |

### Top Bar Layout (List)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-top-bar-gap` | `var(--hub-ref-space-2)` | Separación entre bloques de la barra superior |
| `--hub-list-top-bar-justify-content` | `end` | Distribución en el eje principal de los bloques de la barra superior |
| `--hub-list-top-bar-align-items` | `center` | Alineación en el eje transversal de los bloques de la barra superior |
| `--hub-list-top-bar-wrap` | `wrap` | Comportamiento de ajuste de línea de los bloques |
| `--hub-list-batch-actions-gap` | `var(--hub-ref-space-2)` | Separación entre botones de acciones por lotes |

### Context Pagination Tokens (List)

Estos tokens estilizan el paginador embebido desde el host de la lista:

- `--hub-list-pagination-font-size`, `--hub-list-pagination-gap`
- `--hub-list-pagination-icon-color`, `--hub-list-pagination-icon-size`
- `--hub-list-pagination-label-color`, `--hub-list-pagination-info-color`
- `--hub-list-pagination-link-color`, `--hub-list-pagination-link-bg`, `--hub-list-pagination-link-border-color`, `--hub-list-pagination-link-border-radius`
- `--hub-list-pagination-link-hover-*`, `--hub-list-pagination-link-active-*`, `--hub-list-pagination-link-disabled-*`
- `--hub-list-pagination-select-bg`, `--hub-list-pagination-select-border-color`, `--hub-list-pagination-select-border-radius`, `--hub-list-pagination-select-color`, `--hub-list-pagination-select-padding-x`, `--hub-list-pagination-select-padding-y`
- `--hub-list-pagination-settings-gap`

### Container

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-bg` | `transparent` | Fondo de todo el componente de listado (elemento host); transparente por defecto para que se vea la página |
| `--hub-list-border-radius` | `var(--hub-ref-radius-md)` | Radio de borde de la superficie del componente |
| `--hub-list-padding-x` | `var(--hub-ref-space-0)` | Relleno horizontal de la superficie del componente |
| `--hub-list-padding-y` | `var(--hub-ref-space-0)` | Relleno vertical de la superficie del componente |
| `--hub-list-gap` | `var(--hub-ref-space-4)` | Separación entre la barra superior, la colección de ítems y la barra inferior |
| `--hub-list-items-bg` | `transparent` | Fondo de la colección de ítems (`<ul>`); transparente para que se vea la superficie |
| `--hub-list-items-gap` | `var(--hub-ref-space-2)` | Separación entre ítems del listado |

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
| `--hub-list-item-color` | `var(--hub-sys-text-primary)` | Text color of list items |
| `--hub-list-item-bg` | `var(--hub-sys-surface-page)` | Fondo de los ítems; por defecto el surface de la página, para que se lean sólidos como las filas de la tabla |
| `--hub-list-item-border-color` | `var(--hub-sys-border-color-default)` | Border color of list items |
| `--hub-list-item-border-width` | `1px` | Border width of list items |
| `--hub-list-item-border-radius` | `var(--hub-ref-radius-sm)` | Border radius of list items |
| `--hub-list-item-gap` | `var(--hub-ref-space-2)` | Internal gap within items |
| `--hub-list-item-padding-x` | `var(--hub-ref-space-3)` | Horizontal padding of items |
| `--hub-list-item-padding-y` | `var(--hub-ref-space-2)` | Vertical padding of items |
| `--hub-list-item-hover-bg` | `var(--hub-ref-surface-2)` | Background color on item hover |
| `--hub-list-children-gap` | `var(--hub-list-item-padding-y)` | Margen superior que separa la lista de hijos anidada del contenido del ítem padre |

### Items — Selected

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-item-selected-bg` | `var(--hub-sys-color-primary)` | Background of selected items |
| `--hub-list-item-selected-color` | `var(--hub-ref-color-white)` | Text color of selected items |

### Empty State

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-empty-bg` | `var(--hub-ref-surface-2)` | Background when the list is empty |
| `--hub-list-empty-border-color` | `var(--hub-sys-border-color-default)` | Border color of the empty state |
| `--hub-list-empty-color` | `var(--hub-sys-text-muted)` | Text color of the empty state |
| `--hub-list-empty-padding` | `var(--hub-ref-space-3)` | Padding of the empty state |

### Search

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-search-input-bg` | `var(--hub-sys-surface-page)` | Background of the search input |
| `--hub-list-search-input-border-color` | `var(--hub-sys-border-color-default)` | Border color of the search input |
| `--hub-list-search-input-border-radius` | `var(--hub-ref-radius-sm)` | Border radius of the search input |
| `--hub-list-search-input-color` | `var(--hub-sys-text-primary)` | Text color of the search input |
| `--hub-list-search-btn-bg` | `var(--hub-ref-surface-2)` | Background of the search button |
| `--hub-list-search-btn-color` | `var(--hub-sys-text-primary)` | Text/icon color of the search button |
| `--hub-list-search-button-min-width` | `2.75rem` | Anchura mínima del botón de búsqueda |
| `--hub-list-search-border-color` | `var(--hub-list-search-input-border-color)` | Color de borde compartido para input/botón de búsqueda |
| `--hub-list-search-border-width` | `1px` | Grosor de borde compartido para input/botón de búsqueda |
| `--hub-list-search-border-radius` | `var(--hub-list-search-input-border-radius)` | Radio de borde compartido para input/botón de búsqueda |
| `--hub-list-search-input-padding-x` | `0.75rem` | Relleno horizontal del input de búsqueda |
| `--hub-list-search-input-padding-y` | `0.375rem` | Relleno vertical del input de búsqueda |
| `--hub-list-search-input-font-size` | `1rem` | Tamaño de fuente del input de búsqueda |

### Action Buttons (List)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-action-btn-bg` | `var(--hub-list-bg)` | Fondo de los botones de acción de la lista |
| `--hub-list-action-btn-color` | `var(--hub-list-item-color)` | Color de texto de los botones de acción |
| `--hub-list-action-btn-border-color` | `var(--hub-list-item-border-color)` | Color de borde de los botones de acción |
| `--hub-list-action-btn-border-radius` | `var(--hub-list-item-border-radius)` | Radio de borde de los botones de acción |
| `--hub-list-action-btn-padding-x` | `0.75rem` | Relleno horizontal de los botones de acción |
| `--hub-list-action-btn-padding-y` | `0.375rem` | Relleno vertical de los botones de acción |
| `--hub-list-action-btn-hover-bg` | `var(--hub-list-item-hover-bg)` | Fondo de los botones de acción al pasar el ratón |

### Drag & Drop (List)

| Variable | Por defecto | Descripción |
|----------|-------------|-------------|
| `--hub-list-drag-handle-color` | `var(--hub-sys-text-muted)` | Color del tirador de arrastre |
| `--hub-list-drag-handle-cursor` | `grab` | Cursor sobre el tirador de arrastre |
| `--hub-list-drag-handle-size` | `var(--hub-ref-icon-size)` | Tamaño de fuente del tirador de arrastre |
| `--hub-list-item-dragging-opacity` | `0.5` | Opacidad de la fila que se está arrastrando |
| `--hub-list-item-dragging-cursor` | `grabbing` | Cursor mientras se arrastra una fila |
| `--hub-list-drop-target-outline-color` | `var(--hub-list-accent)` | Color del contorno del destino de soltado |
| `--hub-list-drop-target-outline-width` | `2px` | Grosor del contorno del destino de soltado |
| `--hub-list-placeholder-bg` | `var(--hub-ref-surface-2)` | Fondo del marcador de posición de soltado |
| `--hub-list-placeholder-border-color` | `var(--hub-list-accent)` | Color del borde del marcador de posición |
| `--hub-list-placeholder-border-width` | `2px` | Grosor del borde del marcador de posición |
| `--hub-list-placeholder-border-style` | `dashed` | Estilo del borde del marcador de posición |
| `--hub-list-placeholder-border-radius` | `var(--hub-list-item-border-radius)` | Radio del borde del marcador de posición |
| `--hub-list-placeholder-min-height` | `2.5rem` | Altura mínima del marcador de posición |
| `--hub-list-ghost-opacity` | `0.85` | Opacidad del fantasma flotante de arrastre táctil |
| `--hub-list-ghost-shadow` | `0 0.5rem 1rem rgba(0, 0, 0, 0.15)` | Sombra del fantasma flotante de arrastre táctil |


### Connector (List)

Opt-in con el input `connected` — dibuja una línea vertical entre items consecutivos (aspecto timeline / pipeline). Solo en modo lista; se omite en cards.

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-connector-color` | `var(--hub-sys-border-color-default, #dee2e6)` | Color de la línea del conector |
| `--hub-list-connector-width` | `2px` | Grosor de la línea del conector |
| `--hub-list-connector-style` | `solid` | Estilo de borde del conector (p. ej. `dashed`) |
| `--hub-list-connector-offset` | `var(--hub-list-item-padding-x, var(--hub-ref-space-3, 1rem))` | Desplazamiento en línea desde el borde inicial del item |


### Icons (List)

La lista dibuja sus propios glifos y es dueña de las variables que hay detrás, así que cambiar aquí el chevron no toca el de la tabla.

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-icon-color` | `currentColor` | Color de relleno de los glifos de la lista |
| `--hub-list-icon-size` | `var(--hub-ref-icon-size, 1em)` | Tamaño de los glifos de la lista |
| `--hub-list-icon-chevron-up` | `url("…")` (SVG) | Glifo del disparador de un item padre desplegado |
| `--hub-list-icon-chevron-down` | `url("…")` (SVG) | Glifo del disparador de un item padre plegado |
| `--hub-list-icon-info` | `url("…")` (SVG) | Glifo delante de los mensajes de carga, error y sin resultados |
| `--hub-list-icon-search` | `url("…")` (SVG) | Glifo del botón de búsqueda |

### Misc

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-list-checkbox-size` | `1rem` | Size of selection checkboxes |
| `--hub-list-radio-size` | `var(--hub-list-checkbox-size)` | Tamaño del radio de selección simple |
| `--hub-list-divider-width` | `var(--hub-ref-border-width, 1px)` | Grosor de la regla entre filas cuando la lista es flush |
| `--hub-list-divider-color` | `var(--hub-list-item-border-color)` | Color de esa regla |
| `--hub-list-chevron-size` | `var(--hub-ref-icon-size)` | Size of expand/collapse chevrons |

---

## Table Variables

Defined on `.hub-table`. Control the appearance of the `<hub-ui-table>` component.

### Bottom Bar Layout (Table)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-bottom-bar-gap` | `var(--hub-ref-space-3)` | Separación entre bloques de la barra inferior |
| `--hub-table-bottom-bar-justify-content` | `space-around` | Distribución en el eje principal de los bloques de la barra inferior |
| `--hub-table-bottom-bar-align-items` | `center` | Alineación en el eje transversal de los bloques de la barra inferior |
| `--hub-table-bottom-bar-wrap` | `wrap` | Comportamiento de ajuste de línea de los bloques |
| `--hub-table-bottom-bar-paginator-order` | `1` | Orden del bloque del paginador |
| `--hub-table-bottom-bar-settings-order` | `2` | Orden del bloque de filas por página |
| `--hub-table-bottom-bar-info-order` | `3` | Orden del bloque de información |
| `--hub-table-bottom-bar-paginator-flex` | `0 0 auto` | Valor flex del bloque del paginador |
| `--hub-table-bottom-bar-settings-flex` | `0 0 auto` | Valor flex del bloque de ajustes |
| `--hub-table-bottom-bar-info-flex` | `0 0 auto` | Valor flex del bloque de información |

### Top Bar Layout (Table)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-top-bar-gap` | `var(--hub-ref-space-3)` | Separación entre bloques de la barra superior |
| `--hub-table-top-bar-justify-content` | `end` | Distribución en el eje principal de los bloques de la barra superior |
| `--hub-table-top-bar-align-items` | `center` | Alineación en el eje transversal de los bloques de la barra superior |
| `--hub-table-top-bar-wrap` | `wrap` | Comportamiento de ajuste de línea de los bloques |
| `--hub-table-batch-actions-gap` | `var(--hub-ref-space-2)` | Separación entre botones de acciones por lotes |
| `--hub-table-batch-actions-margin-inline-end` | `auto` | Empuja las acciones por lotes al inicio/fin según la dirección |

### Context Pagination Tokens (Table)

Estos tokens estilizan el paginador embebido desde el host de la tabla:

- `--hub-table-pagination-font-size`, `--hub-table-pagination-gap`
- `--hub-table-pagination-icon-color`, `--hub-table-pagination-icon-size`
- `--hub-table-pagination-label-color`, `--hub-table-pagination-info-color`
- `--hub-table-pagination-link-color`, `--hub-table-pagination-link-bg`, `--hub-table-pagination-link-border-color`, `--hub-table-pagination-link-border-radius`
- `--hub-table-pagination-link-hover-*`, `--hub-table-pagination-link-active-*`, `--hub-table-pagination-link-disabled-*`
- `--hub-table-pagination-select-bg`, `--hub-table-pagination-select-border-color`, `--hub-table-pagination-select-border-radius`, `--hub-table-pagination-select-color`, `--hub-table-pagination-select-padding-x`, `--hub-table-pagination-select-padding-y`
- `--hub-table-pagination-settings-gap`

### Container

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-container-bg` | `var(--hub-ref-color-white)` | Background of the table container |
| `--hub-table-container-color` | `var(--hub-sys-text-primary)` | Text color of the table container |
| `--hub-table-border-color` | `var(--hub-sys-border-color-default)` | Border color used in the table wrapper |
| `--hub-table-border-radius` | `var(--hub-ref-radius-md)` | Border radius of the table container |
| `--hub-table-border-width` | `var(--hub-ref-border-width)` | Border width of the table container |
| `--hub-table-container-gap` | `var(--hub-ref-space-3)` | Separación entre la barra superior, la tabla y la barra inferior |
| `--hub-table-container-max-block-size` | `none` | Altura máxima del cuerpo con scroll; con `options.scrollable`, fíjala para acotar el cuerpo y activar la cabecera fija |
| `--hub-table-container-overflow` | `auto` | Comportamiento de scroll del contenedor propio. `[stickyHeader]` lo cambia a `visible` para que el contenedor **no** atrape la cabecera fija y esta se ancle al contenedor scrollable del propio consumidor (una caja `max-height` + `overflow:auto`). Puedes forzar un valor concreto |
| `--hub-table-head-sticky-top` | `0` | Desplazamiento de la cabecera fija mientras el cuerpo hace scroll (p. ej. para dejar hueco a una barra de herramientas) |

### Search (Table)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-search-input-bg` | `var(--hub-table-container-bg)` | Fondo del input de búsqueda |
| `--hub-table-search-input-border-color` | `var(--hub-table-border-color)` | Color de borde del input de búsqueda |
| `--hub-table-search-input-color` | `var(--hub-table-container-color)` | Color de texto del input de búsqueda |
| `--hub-table-search-input-padding-x` | `0.75rem` | Relleno horizontal del input de búsqueda |
| `--hub-table-search-input-padding-y` | `0.375rem` | Relleno vertical del input de búsqueda |
| `--hub-table-search-input-font-size` | `1rem` | Tamaño de fuente del input de búsqueda |
| `--hub-table-search-button-bg` | `var(--hub-table-container-bg)` | Fondo del botón de búsqueda |
| `--hub-table-search-button-border-color` | `var(--hub-table-border-color)` | Color de borde del botón de búsqueda |
| `--hub-table-search-button-color` | `var(--hub-table-container-color)` | Color de texto/icono del botón de búsqueda |
| `--hub-table-search-button-min-width` | `2.75rem` | Anchura mínima del botón de búsqueda |
| `--hub-table-search-border-width` | `var(--hub-table-border-width)` | Grosor de borde compartido para input/botón de búsqueda |
| `--hub-table-search-border-radius` | `var(--hub-table-border-radius)` | Radio de borde compartido para input/botón de búsqueda |
| `--hub-table-search-clear-color` | `var(--hub-sys-text-muted)` | Color de la × que limpia la búsqueda, visible cuando hay término |
| `--hub-table-search-clear-hover-color` | `var(--hub-table-container-color)` | Color de la × en hover/foco |
| `--hub-table-search-clear-icon-size` | `0.75em` | Tamaño del glifo de la × |
| `--hub-table-search-clear-padding-x` | `var(--hub-ref-space-2)` | Padding horizontal de la × |

### Table Element

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-bg` | `var(--hub-ref-color-white)` | Background of the `<table>` element |
| `--hub-table-color` | `var(--hub-sys-text-primary)` | Text color inside the table |
| `--hub-table-border-color` | `var(--hub-sys-border-color-default)` | Border color of table rows and cells |
| `--hub-table-border-width` | `var(--hub-ref-border-width)` | Border width of table rows and cells |
| `--hub-table-group-separator-color` | `var(--hub-sys-border-color-default)` | Color of the separator between thead and tbody |
| `--hub-table-head-bg` | `var(--hub-table-bg)` | Superficie de la cabecera (thead); se mantiene opaca para que la cabecera fija cubra el cuerpo al hacer scroll |
| `--hub-table-head-color` | `var(--hub-table-color)` | Color del texto de la cabecera (thead) |
| `--hub-table-head-font-size` | `inherit` | Tamaño de fuente de las celdas de la cabecera (thead) |
| `--hub-table-head-font-weight` | `bold` | Grosor de fuente de las celdas de la cabecera (thead) (valor por defecto del `th` del navegador; usa `var(--hub-ref-font-weight-semibold, 600)` para el estilo del DS) |
| `--hub-table-head-padding-x` | `var(--hub-table-cell-padding-x)` | Relleno horizontal de las celdas de la cabecera (thead) |
| `--hub-table-head-padding-y` | `var(--hub-table-cell-padding-y)` | Relleno vertical de las celdas de la cabecera (thead) |
| `--hub-table-head-position` | `sticky` | `position` CSS de la cabecera cuando `[stickyHeader]` está activo; usa `static` para desactivarla en una tabla |
| `--hub-table-row-divider-color` | `var(--hub-table-border-color)` | Color del divisor entre filas del cuerpo (independiente del marco y los bordes verticales) |

### Cell Spacing

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-cell-padding-x` | `var(--hub-ref-space-3)` | Horizontal cell padding (normal) |
| `--hub-table-cell-padding-y` | `var(--hub-ref-space-2)` | Vertical cell padding (normal) |
| `--hub-table-cell-padding-x-sm` | `var(--hub-ref-space-2)` | Horizontal cell padding (compact/small) |
| `--hub-table-cell-padding-y-sm` | `var(--hub-ref-space-1)` | Vertical cell padding (compact/small) |
| `--hub-table-cell-vertical-align` | `middle` | Vertical alignment of cell content |

### Row States

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-hover-bg` | `var(--hub-sys-state-hover-bg)` | Background on row hover |
| `--hub-table-hover-color` | `var(--hub-sys-text-primary)` | Text color on row hover |
| `--hub-table-active-bg` | `var(--hub-sys-state-active-bg)` | Background for active rows |
| `--hub-table-active-color` | `var(--hub-sys-text-primary)` | Text color for active rows |
| `--hub-table-striped-bg` | `var(--hub-sys-state-striped-bg)` | Background for striped rows |
| `--hub-table-striped-color` | `var(--hub-sys-text-primary)` | Text color for striped rows |

### Accent Layer (Advanced)

These variables power the cascade pattern for row states (`striped`, `hover`, `active`). They are set internally and generally should not be overridden directly.

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-accent-bg` | `transparent` | Base accent background |
| `--hub-table-bg-type` | `initial` | Background set by variant type (striped) |
| `--hub-table-bg-state` | `initial` | Background set by interaction state (hover, active) |
| `--hub-table-color-type` | `initial` | Color set by variant type |
| `--hub-table-color-state` | `initial` | Color set by interaction state |
| `--hub-table-cell-bar-width` | `0` | Ancho de la barra de acento por celda (interno; la fila seleccionada lo fija desde `--hub-table-selected-bar-width`) |
| `--hub-table-cell-bar-color` | `transparent` | Color de la barra de acento por celda (interno; se fija desde `--hub-table-selected-bar-color`) |

### Fila seleccionada (Table)

El tinte de selección se aplica tanto a la selección propia de la librería como a una clase `hub-table__row--selected` puesta por el consumidor vía `[rowClass]` (patrón master-detail), sin necesidad de `!important`.

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-selected-bg` | `var(--hub-table-accent-subtle)` | Fondo de la fila seleccionada |
| `--hub-table-selected-color` | `var(--hub-sys-text-primary)` | Color de texto de la fila seleccionada |
| `--hub-table-selected-bar-width` | `0` | Ancho de la barra de acento en el borde inicial de la fila seleccionada («fila activa» master-detail). `0` = desactivada (sin cambio visual); pon p. ej. `3px` para mostrarla |
| `--hub-table-selected-bar-color` | `var(--hub-table-accent)` | Color de la barra de acento de la fila seleccionada |

### Icons

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-filter-button-gap` | `var(--hub-ref-space-2)` | Gap between filter button icon and text |
| `--hub-table-filter-button-padding-x` | `0.75rem` | Horizontal padding of the filter button |
| `--hub-table-filter-button-padding-y` | `0.375rem` | Vertical padding of the filter button |
| `--hub-table-filter-button-border-width` | `1px` | Border width of the filter button |
| `--hub-table-filter-button-border-color` | `transparent` | Border color of the filter button |
| `--hub-table-filter-button-border-radius` | `var(--hub-ref-radius-sm)` | Border radius of the filter button |
| `--hub-table-filter-button-transition` | `all 0.2s ease` | Transition applied to the filter button |
| `--hub-table-filter-button-hover-bg` | `rgba(0, 0, 0, 0.05)` | Background of the filter button on hover |
| `--hub-table-filter-button-active-bg` | `rgba(25, 135, 84, 0.1)` | Background when filters are applied |
| `--hub-table-filter-button-active-border-color` | `var(--hub-sys-color-success)` | Border color when filters are applied |
| `--hub-table-filter-button-icon-color` | `var(--hub-sys-text-muted)` | Filter button icon color |
| `--hub-table-filter-button-icon-active-color` | `var(--hub-sys-color-success)` | Filter button icon color when active |
| `--hub-table-filter-count-bg` | `var(--hub-sys-color-success)` | Background of the active-filter count badge |
| `--hub-table-filter-count-color` | `var(--hub-ref-color-white)` | Text color of the count badge |
| `--hub-table-filter-count-size` | `1.25rem` | Min width and height of the count badge |
| `--hub-table-filter-count-padding-x` | `0.4em` | Horizontal padding of the count badge |
| `--hub-table-filter-count-font-size` | `0.7rem` | Font size of the count badge |
| `--hub-table-filter-count-font-weight` | `700` | Font weight of the count badge |
| `--hub-table-filter-count-border-radius` | `50rem` | Border radius of the count badge |
| `--hub-table-batch-actions-btn-icon-gap` | `var(--hub-ref-space-1)` | Spacing between a batch action button's icon and text |
| `--hub-table-filter-row-bg` | `var(--hub-table-head-bg)` | Fondo de la fila de filtros bajo la cabecera |
| `--hub-table-filter-cell-padding-x` | `var(--hub-table-head-padding-x)` | Padding horizontal de una celda de filtro |
| `--hub-table-filter-cell-padding-y` | `var(--hub-table-head-padding-y)` | Padding vertical de una celda de filtro |
| `--hub-table-filter-control-bg` | `var(--hub-table-container-bg)` | Fondo de un control de filtro |
| `--hub-table-filter-control-color` | `var(--hub-table-container-color)` | Color de texto de un control de filtro |
| `--hub-table-filter-control-placeholder-color` | `var(--hub-sys-text-muted)` | Color del placeholder y de las etiquetas del rango |
| `--hub-table-filter-control-border-color` | `var(--hub-table-border-color)` | Color del borde de un control de filtro |
| `--hub-table-filter-control-border-width` | `var(--hub-table-border-width)` | Grosor del borde de un control de filtro |
| `--hub-table-filter-control-border-radius` | `var(--hub-ref-radius-sm)` | Radio del borde de un control de filtro |
| `--hub-table-filter-control-padding-x` | `var(--hub-ref-space-2)` | Padding horizontal dentro del control |
| `--hub-table-filter-control-padding-y` | `var(--hub-ref-space-1)` | Padding vertical dentro del control |
| `--hub-table-filter-control-font-size` | `var(--hub-ref-font-size-sm)` | Tamaño de fuente del control de filtro |
| `--hub-table-filter-control-focus-border-color` | `var(--hub-table-accent)` | Color del borde con el foco puesto |
| `--hub-table-filter-control-focus-shadow` | `0 0 0 0.2rem color-mix(…)` | Anillo de foco |
| `--hub-table-filter-control-active-bg` | `var(--hub-table-filter-button-active-bg)` | Fondo cuando el filtro tiene valor |
| `--hub-table-filter-control-active-border-color` | `var(--hub-table-filter-button-active-border-color)` | Color del borde cuando el filtro tiene valor |
| `--hub-table-delete-filters-bg` | `var(--hub-table-container-bg)` | Fondo del botón de limpiar filtros |
| `--hub-table-delete-filters-color` | `var(--hub-table-container-color)` | Color del texto y del icono |
| `--hub-table-delete-filters-border-color` | `var(--hub-table-border-color)` | Color del borde |
| `--hub-table-delete-filters-border-width` | `var(--hub-table-border-width)` | Grosor del borde |
| `--hub-table-delete-filters-border-radius` | `var(--hub-table-border-radius)` | Radio del borde |
| `--hub-table-delete-filters-padding-x` | `0.75rem` | Padding horizontal |
| `--hub-table-delete-filters-padding-y` | `0.375rem` | Padding vertical |
| `--hub-table-delete-filters-font-size` | `var(--hub-table-search-input-font-size)` | Tamaño de fuente (igual que el buscador contiguo) |
| `--hub-table-delete-filters-gap` | `var(--hub-ref-space-2)` | Separación entre el icono y la etiqueta |
| `--hub-table-delete-filters-hover-bg` | `color-mix(…, danger 10%, transparent)` | Fondo en hover/foco |
| `--hub-table-delete-filters-hover-border-color` | `var(--hub-sys-color-danger)` | Color del borde en hover/foco |
| `--hub-table-delete-filters-hover-color` | `var(--hub-sys-color-danger)` | Color del texto y del icono en hover/foco |
| `--hub-table-delete-filters-disabled-opacity` | `0.5` | Opacidad mientras hay una petición de filtrado en curso |
| `--hub-table-icon-color` | `currentColor` | Color of table icons (sort, filter, etc.) |
| `--hub-table-icon-size` | `1em` | Base size of table icons |
| `--hub-table-icon-sort` | `url("…")` (SVG) | Glifo del indicador de orden (sin ordenar) |
| `--hub-table-icon-sort-up` | `url("…")` (SVG) | Glifo del indicador de orden ascendente |
| `--hub-table-icon-sort-down` | `url("…")` (SVG) | Glifo del indicador de orden descendente |
| `--hub-table-icon-caret-up` | `url("…")` (SVG) | Glifo del expansor de fila (expandido) |
| `--hub-table-icon-caret-down` | `url("…")` (SVG) | Glifo del expansor de fila (colapsado) |
| `--hub-table-icon-close` | `url("…")` (SVG) | Glifo de cierre que usa el borrado del cuadro de búsqueda |

### Responsive Breakpoints

Las variantes responsive de la tabla (`.hub-table__responsive-sm|md|lg|xl|xxl`) se activan en breakpoints **fijos** — `576px`, `768px`, `992px`, `1200px`, `1400px` — definidos directamente en los `@media` del componente. **No** son personalizables mediante variables CSS, porque las custom properties no pueden leerse dentro de las condiciones `@media`.

---

## Internal Panels

El panel de filtro de columna y el menú de acciones de fila heredado toman su superficie de los tokens del sistema en vez de publicar una propia. Sus glifos son la excepción: un glifo no se puede sustituir de ninguna otra forma.

### Column Filter Panel

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-filter-icon-color` | `currentColor` | Color de relleno de los glifos del panel de filtro |
| `--hub-filter-icon-size` | `1em` | Tamaño de los glifos del panel de filtro |
| `--hub-filter-icon-trash` | `url("…")` (SVG) | Glifo del disparador que quita una regla |
| `--hub-filter-icon-plus` | `url("…")` (SVG) | Glifo del disparador que añade una regla |

### Row Actions Menu (deprecated)

| Variable | Default | Description |
|----------|---------|-------------|
| `--hub-table-dropdown-icon-color` | `currentColor` | Color de relleno del glifo del disparador |
| `--hub-table-dropdown-icon-size` | `1em` | Tamaño del glifo del disparador |
| `--hub-table-dropdown-icon-ellipsis-v` | `url("…")` (SVG) | Glifo por defecto del disparador del menú, sustituido entero por `options.icon` |

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
