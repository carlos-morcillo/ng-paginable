import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { PaginableActionButton } from '../../interfaces/paginable-action-button';
import { TableRow } from '../../interfaces/table-row';
import { TableRowEvent } from '../../interfaces';
import { HubPaginableTableDropdownComponent } from './paginable-table-dropdown.component';

/**
 * An action tucked into the dropdown is the same action, and it answered to nothing.
 *
 * The buttons drawn directly in the cell take `hidden` and `disabled` as a boolean or as
 * a predicate over the row, which is how a consumer says «not on this one». The dropdown
 * read `hidden` as a plain boolean — a predicate is a function, and a function is always
 * truthy, so an action meant to hide on some rows disappeared from every row — and it
 * ignored `disabled` outright.
 *
 * That is what pushed consumers to keep row-dependent actions out of the dropdown, which
 * is exactly the crowding the dropdown exists to relieve.
 */
describe('dropdown item state', () => {
	let fixture: ComponentFixture<HubPaginableTableDropdownComponent>;
	let component: HubPaginableTableDropdownComponent;

	const houseRow = { data: { companyId: null }, event: new MouseEvent('click') } as TableRowEvent;
	const ownRow = { data: { companyId: 7 }, event: new MouseEvent('click') } as TableRowEvent;

	/** Refused on a design nobody owns, which is the case that motivated this. */
	const notOnHouseRows = (row: TableRow) => (row.data as any).companyId === null;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HubPaginableTableDropdownComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(HubPaginableTableDropdownComponent);
		component = fixture.componentInstance;
	});

	it('reads a boolean disabled', async () => {
		const item = { disabled: true } as PaginableActionButton;

		expect(await firstValueFrom(component.isItemDisabled(item, houseRow))).toBe(true);
	});

	it('asks a predicate about the row it is on', async () => {
		const item = { disabled: notOnHouseRows } as PaginableActionButton;

		expect(await firstValueFrom(component.isItemDisabled(item, houseRow))).toBe(true);
		expect(await firstValueFrom(component.isItemDisabled(item, ownRow))).toBe(false);
	});

	it('leaves an item alone when it says nothing', async () => {
		expect(await firstValueFrom(component.isItemDisabled({} as PaginableActionButton, ownRow))).toBe(false);
		expect(await firstValueFrom(component.isItemHidden({} as PaginableActionButton, ownRow))).toBe(false);
	});

	/**
	 * The regression that made a predicate unusable: `!item.hidden` on a function is
	 * always false, so the item vanished everywhere instead of on the rows it named.
	 */
	it('does not hide every row just because hidden is a function', async () => {
		const item = { hidden: notOnHouseRows } as PaginableActionButton;

		expect(await firstValueFrom(component.isItemHidden(item, houseRow))).toBe(true);
		expect(await firstValueFrom(component.isItemHidden(item, ownRow))).toBe(false);
	});

	it('does not run the handler of an item the row disabled', () => {
		let ran = false;
		const item = {
			disabled: notOnHouseRows,
			handler: () => {
				ran = true;
			}
		} as PaginableActionButton;

		fixture.componentRef.setInput('row', houseRow);
		fixture.detectChanges();

		component.executeDropdownAction(item);
		expect(ran).toBe(false);

		fixture.componentRef.setInput('row', ownRow);
		fixture.detectChanges();

		component.executeDropdownAction(item);
		expect(ran).toBe(true);
	});
});
