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
export { DropdownComponent } from './components/dropdown/dropdown.component';
export type { DropdownEvent } from './components/dropdown/dropdown.component';
export { HubIconComponent } from './components/icon/icon.component';
export { ListComponent, PaginableListComponent } from './components/list/paginable-list/list.component';
export { PaginableTableDropdownComponent } from './components/paginable-table-dropdown/paginable-table-dropdown.component';
export { PaginableTableRangeInputComponent } from './components/paginable-table-range-input/paginable-table-range-input.component';
export { PaginatorComponent } from './components/paginator/paginator.component';
export { ResizableComponent } from './components/resizable/resizable.component';
export { PaginableStateOutlet } from './components/state-outlet/paginable-state-outlet.component';
export { TableComponent } from './components/table/table.component';

// Directives
export { HubListDragHandleDirective } from './directives/list-drag-handle.directive';
export { HubListDragPlaceholderDirective } from './directives/list-drag-placeholder.directive';
export { HubListDragPreviewDirective } from './directives/list-drag-preview.directive';
export { PaginableListItemDirective } from './directives/paginable-list-item.directive';
export { PaginableTableCellDirective } from './directives/paginable-table-cell.directive';
export { PaginableErrorDirective, PaginableTableErrorDirective } from './directives/paginable-error.directive';
export { PaginableTableExpandingRowDirective } from './directives/paginable-table-expanding-row.directive';
export { PaginableTableFilterDirective } from './directives/paginable-table-filter.directive';
export { PaginableTableHeaderDirective } from './directives/paginable-table-header.directive';
export { PaginableLoadingDirective, PaginableTableLoadingDirective } from './directives/paginable-loading.directive';
export {
	PaginableNoResultsDirective,
	PaginableEmptyStateDirective,
	PaginableTableNotFoundDirective
} from './directives/paginable-no-results.directive';
export { PaginableTableRowDirective } from './directives/paginable-table-row.directive';
export { ResizableDirective } from './directives/resizable.directive';
// Moved to ng-hub-ui-utils; re-exported here for backward compatibility.
export { TooltipDirective } from 'ng-hub-ui-utils';

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
export { PaginableDefaultsService } from './services/paginable-defaults.service';
export { PaginableService } from './services/paginable.service';
export { PaginationService } from './services/pagination.service';
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
