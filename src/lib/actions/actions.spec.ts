import { Component, ViewContainerRef, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PaginableActionButton } from '../interfaces/paginable-action-button';
import { PaginableTableDropdown } from '../interfaces/paginable-table-dropdown';
import { TableRowEvent } from '../interfaces';
import { TableRow } from '../interfaces/table-row';
import { HubPaginableActionsDirective } from './actions.directive';
import { provideHubPaginableActions } from './actions.provider';
import {
	HubPaginableActionsConfig,
	HubPaginableButtonAction,
	HubPaginableActionsHandle,
	HubPaginableMenuAction
} from './actions.types';

/**
 * The table stops drawing its row actions and describes them instead.
 *
 * What it drew was a second, poorer implementation of a dropdown the button library
 * already has: a panel placed by hand on the body, which neither flips when it does not
 * fit nor follows a scrolling container. Rather than keep maintaining it, the table now
 * says what a row offers and an adapter draws it, exactly as it already does for its
 * inputs.
 *
 * What the adapter receives is fully resolved: hidden actions are absent, predicates are
 * booleans, Observable labels are strings. An adapter that had to know a consumer may
 * write any of those would be a second place to get it wrong.
 */
describe('row actions through an adapter', () => {
	let seen: HubPaginableActionsConfig[];

	/** Records every description it is handed, so a test can assert on the last one. */
	const recorder = {
		create(_container: ViewContainerRef, config: HubPaginableActionsConfig): HubPaginableActionsHandle {
			seen.push(config);
			return {
				update: (next: HubPaginableActionsConfig) => seen.push(next),
				destroy: () => undefined
			};
		}
	};

	@Component({
		standalone: true,
		imports: [HubPaginableActionsDirective],
		template: `<ng-container [hubPaginableActions]="actions()" [row]="row()"></ng-container>`
	})
	class Host {
		readonly actions = signal<ReadonlyArray<PaginableActionButton | PaginableTableDropdown>>([]);
		readonly row = signal<TableRowEvent | undefined>(undefined);
	}

	let fixture: ComponentFixture<Host>;

	const houseRow = { data: { companyId: null }, event: new MouseEvent('click') } as TableRowEvent;
	const ownRow = { data: { companyId: 7 }, event: new MouseEvent('click') } as TableRowEvent;
	const notOnHouseRows = (row: TableRow) => (row.data as any).companyId === null;

	/** The description the adapter was last handed. */
	const latest = () => seen[seen.length - 1];

	/** The nth action, narrowed to a plain button so its handler can be fired. */
	const button = (index = 0) => latest().actions[index] as HubPaginableButtonAction;

	async function draw(
		actions: ReadonlyArray<PaginableActionButton | PaginableTableDropdown>,
		row: TableRowEvent
	): Promise<void> {
		fixture.componentInstance.actions.set(actions);
		fixture.componentInstance.row.set(row);
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
	}

	beforeEach(async () => {
		seen = [];
		await TestBed.configureTestingModule({
			imports: [Host],
			providers: [provideHubPaginableActions(recorder)]
		}).compileComponents();

		fixture = TestBed.createComponent(Host);
	});

	it('describes a plain action with what the consumer declared', async () => {
		await draw(
			[{ icon: 'icon--ph--eye', tooltip: 'Preview', variant: 'soft', color: 'secondary', handler: () => undefined }],
			ownRow
		);

		expect(latest().actions.length).toBe(1);
		expect(latest().actions[0]).toEqual(
			expect.objectContaining({
				kind: 'button',
				icon: 'icon--ph--eye',
				tooltip: 'Preview',
				variant: 'soft',
				color: 'secondary',
				disabled: false
			})
		);
	});

	/** Hidden is the table's business; the adapter never learns the action existed. */
	it('leaves out an action this row does not offer', async () => {
		await draw(
			[
				{ icon: 'icon--ph--eye', handler: () => undefined },
				{ icon: 'icon--ph--trash', hidden: notOnHouseRows, handler: () => undefined }
			],
			houseRow
		);

		expect(latest().actions.map((action: any) => action.icon)).toEqual(['icon--ph--eye']);
	});

	/** Disabled is the adapter's business: a refused action still has to be drawn. */
	it('resolves a predicate into a plain boolean the adapter can draw', async () => {
		const actions = [{ icon: 'icon--ph--trash', disabled: notOnHouseRows, handler: () => undefined }];

		await draw(actions, houseRow);
		expect(button().disabled).toBe(true);

		await draw(actions, ownRow);
		expect(button().disabled).toBe(false);
	});

	it('resolves a label declared as a stream', async () => {
		await draw([{ icon: 'icon--ph--pencil', label: of('Editar'), handler: () => undefined }], ownRow);

		expect(latest().actions[0].label).toBe('Editar');
	});

	it('describes a menu with the actions inside it', async () => {
		await draw(
			[
				{
					icon: 'icon--ph--dots-three-vertical',
					tooltip: 'More',
					position: 'end',
					buttons: [
						{ icon: 'icon--ph--pencil', label: 'Edit', disabled: notOnHouseRows, handler: () => undefined },
						{ icon: 'icon--ph--copy', label: 'Duplicate', handler: () => undefined }
					]
				}
			],
			houseRow
		);

		const menu = latest().actions[0] as HubPaginableMenuAction;

		expect(menu.kind).toBe('menu');
		expect(menu.placement).toBe('bottom-end');
		expect(menu.items.map((item) => item.label)).toEqual(['Edit', 'Duplicate']);
		expect(menu.items[0].disabled).toBe(true);
		expect(menu.items[1].disabled).toBe(false);
	});

	/** The regression the old menu had: a predicate hid an item on every row. */
	it('hides a menu item only on the rows it names', async () => {
		const actions = [
			{
				buttons: [
					{ label: 'Edit', hidden: notOnHouseRows, handler: () => undefined },
					{ label: 'Duplicate', handler: () => undefined }
				]
			} as PaginableTableDropdown
		];

		await draw(actions, houseRow);
		expect((latest().actions[0] as HubPaginableMenuAction).items.map((i) => i.label)).toEqual(['Duplicate']);

		await draw(actions, ownRow);
		expect((latest().actions[0] as HubPaginableMenuAction).items.map((i) => i.label)).toEqual(['Edit', 'Duplicate']);
	});

	it('runs the consumer handler against the row it was drawn for', async () => {
		let calledWith: TableRowEvent | null = null;
		await draw([{ icon: 'icon--ph--eye', handler: (row: any) => (calledWith = row) }], ownRow);

		button().onSelect();

		expect(calledWith).toBe(ownRow);
	});

	it('does not run the handler of an action this row refuses', async () => {
		let ran = false;
		await draw([{ icon: 'icon--ph--trash', disabled: notOnHouseRows, handler: () => (ran = true) }], houseRow);

		button().onSelect();

		expect(ran).toBe(false);
	});

	/** Updated rather than rebuilt, so an open menu survives a redraw of its own row. */
	it('updates the existing actions instead of creating them again', async () => {
		const actions = [{ icon: 'icon--ph--trash', disabled: notOnHouseRows, handler: () => undefined }];

		await draw(actions, ownRow);
		const afterFirst = seen.length;

		await draw(actions, houseRow);

		expect(seen.length).toBeGreaterThan(afterFirst);
		expect(button().disabled).toBe(true);
	});
});
