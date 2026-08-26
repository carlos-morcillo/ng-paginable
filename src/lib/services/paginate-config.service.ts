import { InjectionToken } from '@angular/core';
import { PaginableTableConfig } from '../interfaces/paginable-table-config';

/**
 * This is not a real service, but it looks like it from the outside.
 * It's just an InjectionTToken used to import the config object, provided from the outside
 */
// tslint:disable-next-line: variable-name
export const PaginableConfigService = new InjectionToken<PaginableTableConfig>('PaginableConfig');
