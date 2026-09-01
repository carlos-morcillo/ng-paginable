import { ViewContainerRef } from '@angular/core';

/**
 * Where a menu panel opens relative to its trigger.
 *
 * Spelled out here rather than imported so this file keeps its zero dependencies; the
 * vocabulary matches what the button library's dropdown accepts, and an adapter for a
 * different library maps it onto whatever that one calls the same idea.
 */
export type HubPaginableMenuPlacement =
	'top-start' | 'top' | 'top-end' | 'start' | 'end' | 'bottom-start' | 'bottom' | 'bottom-end';

/**
 * One thing a person can do to a row, already resolved for *this* row.
 *
 * `hidden` never reaches an adapter: an action that does not exist on this row is not in
 * the list at all. `disabled` does, because a refused action still has to be drawn — that
 * is the difference between «not for this row» and «not right now», and an absence cannot
 * say the second one.
 */
export interface HubPaginableActionItem {
	/** Icon class or name, exactly as the consumer declared it. */
	icon?: string;
	/** Visible text. A row button usually has none; a menu item always should. */
	label?: string;
	/** Hover text. */
	tooltip?: string;
	/** Appearance, from the vocabulary the consumer already writes in its headers. */
	variant?: string;
	/** Accent, likewise. */
	color?: string;
	/** Whether it is drawn and refused. Resolved: never a predicate. */
	disabled: boolean;
	/** Runs the consumer's handler against the row this cell belongs to. */
	onSelect: () => void;
}

/** A single action drawn directly in the cell. */
export interface HubPaginableButtonAction extends HubPaginableActionItem {
	kind: 'button';
}

/** A trigger that opens a panel of actions. */
export interface HubPaginableMenuAction extends Omit<HubPaginableActionItem, 'onSelect'> {
	kind: 'menu';
	placement?: HubPaginableMenuPlacement;
	items: ReadonlyArray<HubPaginableActionItem>;
}

export type HubPaginableAction = HubPaginableButtonAction | HubPaginableMenuAction;

/** Everything one row's action cell holds, in the order it was declared. */
export interface HubPaginableActionsConfig {
	actions: ReadonlyArray<HubPaginableAction>;
}

/** Live handle to the actions rendered by a {@link HubPaginableActionsAdapter}. */
export interface HubPaginableActionsHandle {
	/**
	 * Pushes a new description in.
	 *
	 * Needed where the form-controls adapter needs only `setValue`: what a row action
	 * offers depends on the row, so a page change or an edit rewrites the whole cell, and
	 * tearing every action down and building it again would close any open menu with it.
	 */
	update(config: HubPaginableActionsConfig): void;
	/** Destroys everything created and releases its resources. */
	destroy(): void;
}

/**
 * Optional, structurally-typed adapter that draws the table's row actions with a real
 * component library.
 *
 * Declared here and not imported, exactly as {@link HubPaginableFormControlsAdapter} is,
 * so `ng-hub-ui-paginable` keeps **zero hard dependency** on `ng-hub-ui-buttons`. With an
 * adapter, every button and menu in every table is the one from the design system; with
 * none, the table falls back to the markup it has always drawn, which is deprecated and
 * says so.
 *
 * `ng-hub-ui-buttons` ships a ready-made implementation (`hubActionsAdapter`).
 */
export interface HubPaginableActionsAdapter {
	/**
	 * Draws one row's actions inside `container`.
	 *
	 * @returns A handle to update or destroy them.
	 */
	create(container: ViewContainerRef, config: HubPaginableActionsConfig): HubPaginableActionsHandle;
}
