import { isDevMode } from '@angular/core';

/**
 * Said once per application, never once per row.
 *
 * A twenty-row table would otherwise print twenty identical lines on every change
 * detection pass, and a warning that scrolls is a warning nobody reads.
 */
let alreadySaid = false;

/**
 * Whether this build is one where the warning is emitted.
 *
 * **Deliberately the opposite of the framework convention**, on the maintainer's call
 * (2026-09-01): Angular, React and Vue all emit in development and strip the message
 * from production builds, so the person who can act on it sees it and the end user does
 * not. Here it is production-only. Isolated in this one predicate so reversing the
 * decision is inverting a condition, not hunting call sites.
 */
function shouldWarn(): boolean {
	return !isDevMode();
}

/**
 * Warns that the table is drawing its row actions with the deprecated built-in markup.
 *
 * That markup dresses itself in Bootstrap class names — `.btn`, `.dropdown-menu`,
 * `.dropdown-item` — which resolve to nothing in a product that does not ship Bootstrap:
 * the trigger falls back to the browser's default grey button and the panel to a
 * transparent box. Registering an adapter is what makes the actions look like the rest
 * of the application, and it is one line.
 */
export function warnDeprecatedActionsRendering(): void {
	if (alreadySaid || !shouldWarn()) {
		return;
	}
	alreadySaid = true;

	console.warn(
		[
			'[ng-hub-ui-paginable] Row actions are being drawn with the deprecated built-in',
			'markup, because no actions adapter is registered. It relies on Bootstrap class',
			'names and renders unstyled without them.',
			'',
			'  npm i ng-hub-ui-buttons',
			"  import { hubActionsAdapter } from 'ng-hub-ui-buttons';",
			'  providers: [ provideHubPaginableActions(hubActionsAdapter) ]'
		].join('\n')
	);
}

/** Reset between tests, so one spec's warning does not silence the next one's. */
export function resetActionsWarningForTesting(): void {
	alreadySaid = false;
}
