import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { HUB_PAGINABLE_ACTIONS } from './actions.token';
import { HubPaginableActionsAdapter } from './actions.types';

/**
 * Registers an actions adapter so the table draws its row buttons and menus with the
 * wired component library instead of its own deprecated markup.
 *
 * ```ts
 * import { provideHubPaginableActions } from 'ng-hub-ui-paginable';
 * import { hubActionsAdapter } from 'ng-hub-ui-buttons';
 *
 * providers: [provideHubPaginableActions(hubActionsAdapter)];
 * ```
 *
 * @param adapter Adapter implementation (e.g. `hubActionsAdapter` from
 *                `ng-hub-ui-buttons`).
 * @returns Environment providers to add to the application config.
 */
export function provideHubPaginableActions(adapter: HubPaginableActionsAdapter): EnvironmentProviders {
	return makeEnvironmentProviders([
		{
			provide: HUB_PAGINABLE_ACTIONS,
			useValue: adapter
		}
	]);
}
