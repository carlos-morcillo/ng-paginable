// Modules
export { HubUITableModule } from './paginable.module';
export { HubUITableModule as TableModule } from './paginable.module';

// Providers
export { providePaginable, paginableCoreProviders } from './paginable.providers';

// Cross-library integrations (optional, agnostic): a registered adapter draws these,
// and without one the table keeps its own fallback.
export * from './actions';
export * from './form-controls';

// Components
export { HubDropdownComponent } from './components/dropdown/dropdown.component';
export type { DropdownEvent } from './components/dropdown/dropdown.component';
export { HubPaginableIconComponent } from './components/icon/icon.component';
/**
 * @deprecated Renamed to `HubPaginableIconComponent`, and removed under this name in **23.0.0**.
 * `ng-hub-ui-icons` exports a `HubIconComponent` of its own, so the two could not be imported
 * into the same file without one shadowing the other. The class behind this alias is unchanged.
 */
export { HubPaginableIconComponent as HubIconComponent } from './components/icon/icon.component';
export { HubListComponent, PaginableListComponent } from './components/list/paginable-list/list.component';
export { HubPaginableTableDropdownComponent } from './components/paginable-table-dropdown/paginable-table-dropdown.component';
export { HubPaginableTableRangeInputComponent } from './components/paginable-table-range-input/paginable-table-range-input.component';
export { HubPaginatorComponent } from './components/paginator/paginator.component';
export { HubResizableComponent } from './components/resizable/resizable.component';
export { HubPaginableStateOutlet } from './components/state-outlet/paginable-state-outlet.component';
export { HubTableComponent } from './components/table/table.component';

// Directives
export { HubListDragHandleDirective } from './directives/list-drag-handle.directive';
export { HubListDragPlaceholderDirective } from './directives/list-drag-placeholder.directive';
export { HubListDragPreviewDirective } from './directives/list-drag-preview.directive';
export { HubPaginableListItemDirective } from './directives/paginable-list-item.directive';
export { HubPaginableTableCellDirective } from './directives/paginable-table-cell.directive';
export { HubPaginableErrorDirective, PaginableTableErrorDirective } from './directives/paginable-error.directive';
export { HubPaginableTableExpandingRowDirective } from './directives/paginable-table-expanding-row.directive';
export { HubPaginableTableFilterDirective } from './directives/paginable-table-filter.directive';
export { HubPaginableTableHeaderDirective } from './directives/paginable-table-header.directive';
export { HubPaginableLoadingDirective, PaginableTableLoadingDirective } from './directives/paginable-loading.directive';
export {
	HubPaginableNoResultsDirective,
	PaginableEmptyStateDirective,
	PaginableTableNotFoundDirective
} from './directives/paginable-no-results.directive';
export { HubPaginableTableRowDirective } from './directives/paginable-table-row.directive';
export { HubResizableDirective } from './directives/resizable.directive';

// Interfaces
export * from './interfaces';
export type {
	PaginableStateContext,
	PaginableStateComponent,
	PaginableStateDefault,
	PaginableStateComponentLoader,
	ResolvedStateDefault
} from './interfaces/paginable-state';

// Services
export { HubListDragService } from './services/hub-list-drag.service';
export type { ActiveDrag, DragPointerMode, DragRegistration, DragTarget } from './services/hub-list-drag.service';
export { HubPaginableDefaultsService } from './services/paginable-defaults.service';
export { HubPaginableService } from './services/paginable.service';
export { HubPaginationService } from './services/pagination.service';
export { HubTranslationService } from 'ng-hub-ui-utils';

// Constants
export { TableBreakpoint } from './constants/breakpoints';

// Enums
export { SelectionTypes } from './enums/selection-types';
export { RowClass } from './enums/row-class.enum';

// i18n dictionaries
export { locale as enLocale } from './assets/i18n/en';
export { locale as esLocale } from './assets/i18n/es';
export { locale as caLocale } from './assets/i18n/ca';
export { locale as euLocale } from './assets/i18n/eu';
export { locale as glLocale } from './assets/i18n/gl';
export { locale as astLocale } from './assets/i18n/ast';
export { locale as anLocale } from './assets/i18n/an';
export { locale as deLocale } from './assets/i18n/de';
export { locale as zhLocale } from './assets/i18n/zh';
export { locale as arLocale } from './assets/i18n/ar';
export { locale as ruLocale } from './assets/i18n/ru';

export * from './table-tooltip';

// ─── Deprecated aliases ───────────────────────────────────────────────────────
// Every class in the family carries the `Hub` prefix, so a consumer importing several
// packages into one file cannot end up with two `TableComponent`s — nor collide with a
// name of their own. The classes behind these aliases are unchanged; only the exported
// names move. They all go in **23.0.0**, together with the older compatibility names
// (`TableModule`, `PaginableListComponent`, `PaginableTableErrorDirective`,
// `PaginableTableLoadingDirective`, `PaginableEmptyStateDirective`,
// `PaginableTableNotFoundDirective`) already exported above.

/** @deprecated Renamed to `HubTableComponent`, and removed under this name in **23.0.0**. */
export { HubTableComponent as TableComponent } from './components/table/table.component';
/** @deprecated Renamed to `HubListComponent`, and removed under this name in **23.0.0**. */
export { HubListComponent as ListComponent } from './components/list/paginable-list/list.component';
/** @deprecated Renamed to `HubDropdownComponent`, and removed under this name in **23.0.0**. */
export { HubDropdownComponent as DropdownComponent } from './components/dropdown/dropdown.component';
/** @deprecated Renamed to `HubPaginatorComponent`, and removed under this name in **23.0.0**. */
export { HubPaginatorComponent as PaginatorComponent } from './components/paginator/paginator.component';
/** @deprecated Renamed to `HubResizableComponent`, and removed under this name in **23.0.0**. */
export { HubResizableComponent as ResizableComponent } from './components/resizable/resizable.component';
/** @deprecated Renamed to `HubPaginableStateOutlet`, and removed under this name in **23.0.0**. */
export { HubPaginableStateOutlet as PaginableStateOutlet } from './components/state-outlet/paginable-state-outlet.component';
/** @deprecated Renamed to `HubPaginableTableDropdownComponent`, and removed under this name in **23.0.0**. */
export { HubPaginableTableDropdownComponent as PaginableTableDropdownComponent } from './components/paginable-table-dropdown/paginable-table-dropdown.component';
/** @deprecated Renamed to `HubPaginableTableRangeInputComponent`, and removed under this name in **23.0.0**. */
export { HubPaginableTableRangeInputComponent as PaginableTableRangeInputComponent } from './components/paginable-table-range-input/paginable-table-range-input.component';
/** @deprecated Renamed to `HubResizableDirective`, and removed under this name in **23.0.0**. */
export { HubResizableDirective as ResizableDirective } from './directives/resizable.directive';
/** @deprecated Renamed to `HubPaginableListItemDirective`, and removed under this name in **23.0.0**. */
export { HubPaginableListItemDirective as PaginableListItemDirective } from './directives/paginable-list-item.directive';
/** @deprecated Renamed to `HubPaginableTableCellDirective`, and removed under this name in **23.0.0**. */
export { HubPaginableTableCellDirective as PaginableTableCellDirective } from './directives/paginable-table-cell.directive';
/** @deprecated Renamed to `HubPaginableErrorDirective`, and removed under this name in **23.0.0**. */
export { HubPaginableErrorDirective as PaginableErrorDirective } from './directives/paginable-error.directive';
/** @deprecated Renamed to `HubPaginableTableExpandingRowDirective`, and removed under this name in **23.0.0**. */
export { HubPaginableTableExpandingRowDirective as PaginableTableExpandingRowDirective } from './directives/paginable-table-expanding-row.directive';
/** @deprecated Renamed to `HubPaginableTableFilterDirective`, and removed under this name in **23.0.0**. */
export { HubPaginableTableFilterDirective as PaginableTableFilterDirective } from './directives/paginable-table-filter.directive';
/** @deprecated Renamed to `HubPaginableTableHeaderDirective`, and removed under this name in **23.0.0**. */
export { HubPaginableTableHeaderDirective as PaginableTableHeaderDirective } from './directives/paginable-table-header.directive';
/** @deprecated Renamed to `HubPaginableLoadingDirective`, and removed under this name in **23.0.0**. */
export { HubPaginableLoadingDirective as PaginableLoadingDirective } from './directives/paginable-loading.directive';
/** @deprecated Renamed to `HubPaginableNoResultsDirective`, and removed under this name in **23.0.0**. */
export { HubPaginableNoResultsDirective as PaginableNoResultsDirective } from './directives/paginable-no-results.directive';
/** @deprecated Renamed to `HubPaginableTableRowDirective`, and removed under this name in **23.0.0**. */
export { HubPaginableTableRowDirective as PaginableTableRowDirective } from './directives/paginable-table-row.directive';
/** @deprecated Renamed to `HubPaginableDefaultsService`, and removed under this name in **23.0.0**. */
export { HubPaginableDefaultsService as PaginableDefaultsService } from './services/paginable-defaults.service';
/** @deprecated Renamed to `HubPaginableService`, and removed under this name in **23.0.0**. */
export { HubPaginableService as PaginableService } from './services/paginable.service';
/** @deprecated Renamed to `HubPaginationService`, and removed under this name in **23.0.0**. */
export { HubPaginationService as PaginationService } from './services/pagination.service';
