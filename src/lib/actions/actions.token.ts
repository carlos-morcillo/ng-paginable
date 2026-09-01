import { InjectionToken } from '@angular/core';
import { HubPaginableActionsAdapter } from './actions.types';

/**
 * Injection token resolving the optional actions adapter used by the table.
 *
 * Inject it with `{ optional: true }`; a `null` value means "draw the deprecated built-in
 * markup". Register it through {@link provideHubPaginableActions}.
 */
export const HUB_PAGINABLE_ACTIONS = new InjectionToken<HubPaginableActionsAdapter>('HUB_PAGINABLE_ACTIONS');
