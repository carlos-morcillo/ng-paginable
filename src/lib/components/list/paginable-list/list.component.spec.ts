import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { HubTranslationService } from 'ng-hub-ui-utils';

import { SelectionTypes } from '../../../enums/selection-types';
import { ListComponent } from './list.component';

interface TestListItem {
	id: number;
	label: string;
}

class MockHubTranslationService {
	private readonly translationSource = new Subject<any>();
	readonly translationObserver = this.translationSource.asObservable();

	getTranslation(key: string) {
		const translations: Record<string, string> = {
			SEARCH: 'search',
			NO_RESULTS_FOUND: 'No results found',
			ROWS_PER_PAGE: 'Rows per page',
			SHOWING_X_OF_Y_ROWS: 'Showing {{amount}} of {{total}} rows'
		};
		return translations[key] || key;
	}

	setTranslations() {}
	initialize() {}
}

describe('ListComponent', () => {
	let component: ListComponent<TestListItem>;
	let fixture: ComponentFixture<ListComponent<TestListItem>>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ListComponent],
			providers: [
				{
					provide: HubTranslationService,
					useClass: MockHubTranslationService
				}
			]
		});

		fixture = TestBed.createComponent(ListComponent<TestListItem>);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('items', [
			{ id: 1, label: 'First item' },
			{ id: 2, label: 'Second item' }
		]);
		fixture.detectChanges();
	});

	it('should create the list component', () => {
		expect(component).toBeTruthy();
	});

	it('should render the loading state when loading is set', () => {
		fixture.componentRef.setInput('loading', true);
		fixture.detectChanges();

		expect(fixture.nativeElement.querySelector('.hub-list__loading')).toBeTruthy();
		expect(fixture.nativeElement.querySelectorAll('.hub-list__item-content').length).toBe(0);
	});

	it('should render the error state when error is set', () => {
		fixture.componentRef.setInput('error', new Error('boom'));
		fixture.detectChanges();

		expect(fixture.nativeElement.querySelector('.hub-list__error')).toBeTruthy();
		expect(fixture.nativeElement.querySelectorAll('.hub-list__item-content').length).toBe(0);
	});

	it('should render the no-results state when there are no items', () => {
		fixture.componentRef.setInput('items', []);
		fixture.detectChanges();

		expect(fixture.nativeElement.querySelector('.hub-list__no-results')).toBeTruthy();
	});

	it('should default selectable to null', () => {
		expect(component.selectable()).toBeNull();
		expect(component.multipleSelectable()).toBe(false);
	});

	it('should normalize boolean selectable values to single selection', () => {
		fixture.componentRef.setInput('selectable', true);
		fixture.detectChanges();

		expect(component.selectable()).toBe(SelectionTypes.Single);
		expect(component.multipleSelectable()).toBe(false);
	});

	it('should support multiple selection through SelectionTypes', () => {
		fixture.componentRef.setInput('selectable', SelectionTypes.Multiple);
		fixture.detectChanges();

		expect(component.selectable()).toBe(SelectionTypes.Multiple);
		expect(component.multipleSelectable()).toBe(true);
		expect(fixture.nativeElement.querySelectorAll('.hub-list__checkbox').length).toBe(2);
	});

	/**
	 * `selectable` enumerated `single` from the start and then nothing read it: the value
	 * added a pointer cursor and no control, so "choose one of these" — the ordinary shape for
	 * a room, a plan, a payment method — had to be built by hand on top of a typed API that
	 * looked like it already did the job.
	 */
	describe('single selection', () => {
		/** Picks a row the way a reader does, through its control. */
		function pickRow(index: number): void {
			const radios = fixture.nativeElement.querySelectorAll('.hub-list__radio') as NodeListOf<HTMLInputElement>;
			radios[index].click();
			fixture.detectChanges();
		}

		beforeEach(() => {
			fixture.componentRef.setInput('selectable', SelectionTypes.Single);
			fixture.componentRef.setInput('bindValue', 'id');
			fixture.detectChanges();
		});

		it('renders a radio per row, and no checkbox', () => {
			expect(fixture.nativeElement.querySelectorAll('.hub-list__radio').length).toBe(2);
			expect(fixture.nativeElement.querySelectorAll('.hub-list__checkbox').length).toBe(0);
		});

		/**
		 * The value shape is the decision this mode had to make. It answers with the value
		 * rather than a list of one, exactly as `hub-select` does — a consumer asking "which
		 * one" should not have to reach for `[0]` and then tell an empty array apart from a
		 * missing answer.
		 */
		it('emits the value itself, not a list of one', () => {
			const emitted: unknown[] = [];
			component.registerOnChange((value: unknown) => emitted.push(value));

			pickRow(0);

			expect(emitted).toEqual([1]);
		});

		it('releases the previous row when another is picked', () => {
			const emitted: unknown[] = [];
			component.registerOnChange((value: unknown) => emitted.push(value));

			pickRow(0);
			pickRow(1);

			expect(emitted).toEqual([1, 2]);

			const radios = fixture.nativeElement.querySelectorAll('.hub-list__radio') as NodeListOf<HTMLInputElement>;
			expect(radios[0].checked).toBe(false);
			expect(radios[1].checked).toBe(true);
		});

		it('accepts a bare value from the form, since that is what it emits', () => {
			component.writeValue(2 as never);
			fixture.detectChanges();

			const radios = fixture.nativeElement.querySelectorAll('.hub-list__radio') as NodeListOf<HTMLInputElement>;
			expect(radios[0].checked).toBe(false);
			expect(radios[1].checked).toBe(true);
		});

		it('reports nothing selected as null rather than an empty list', () => {
			const emitted: unknown[] = [];
			component.registerOnChange((value: unknown) => emitted.push(value));

			pickRow(0);
			component.writeValue(null as never);
			component.onSelectionChange();

			expect(emitted[emitted.length - 1]).toBeNull();
		});

		/**
		 * A radio group is scoped by name across the whole document, so two lists on one page
		 * would fight over one selection if they shared a name.
		 */
		it('gives each list its own radio group', () => {
			const other = TestBed.createComponent(ListComponent<TestListItem>);

			expect(other.componentInstance.radioGroupName).not.toBe(component.radioGroupName);
		});
	});

	it('keeps emitting an array in multiple selection', () => {
		fixture.componentRef.setInput('selectable', SelectionTypes.Multiple);
		fixture.componentRef.setInput('bindValue', 'id');
		fixture.detectChanges();

		const emitted: unknown[] = [];
		component.registerOnChange((value: unknown) => emitted.push(value));

		const boxes = fixture.nativeElement.querySelectorAll('.hub-list__checkbox') as NodeListOf<HTMLInputElement>;
		boxes[0].click();
		fixture.detectChanges();

		expect(emitted).toEqual([[1]]);
	});

	it('should render the initial per-page value in the selector', async () => {
		fixture.componentRef.setInput('paginate', true);
		fixture.detectChanges();
		// Allow the NgModel value accessor to apply the selected option.
		await fixture.whenStable();
		fixture.detectChanges();

		const select = fixture.nativeElement.querySelector('.hub-paginator__select') as HTMLSelectElement;
		expect(select).toBeTruthy();
		expect(select.selectedOptions[0]?.textContent?.trim()).toBe('10');
	});

	it('should apply rtl host class when options.rtl is enabled', () => {
		fixture.componentRef.setInput('options', {
			cursor: 'default',
			hoverableRows: false,
			striped: null,
			variant: null,
			searchable: false,
			collapsed: true,
			rtl: true
		});
		fixture.detectChanges();

		expect(fixture.nativeElement.classList.contains('hub-list--rtl')).toBe(true);
	});

	it('should render search button before input when rtl is enabled', () => {
		fixture.componentRef.setInput('options', {
			display: 'list',
			cursor: 'default',
			hoverableRows: false,
			striped: null,
			variant: null,
			searchable: true,
			collapsed: true,
			rtl: true
		});
		fixture.detectChanges();

		const searchElement = fixture.nativeElement.querySelector('.hub-list__search') as HTMLElement;
		expect(searchElement).toBeTruthy();
		expect(searchElement.firstElementChild?.classList.contains('hub-list__search-btn')).toBe(true);
	});

	it('should enable cards layout when options.display is cards', () => {
		fixture.componentRef.setInput('options', {
			display: 'cards',
			cursor: 'default',
			hoverableRows: false,
			striped: null,
			variant: null,
			searchable: false,
			collapsed: true,
			rtl: false
		});
		fixture.detectChanges();

		const rootList = fixture.nativeElement.querySelector('.hub-list__items--root') as HTMLElement;
		expect(rootList.classList.contains('hub-list__items--cards')).toBe(true);
	});

	it('should map a semantic variant name to its ds accent token with a raw fallback', () => {
		fixture.componentRef.setInput('options', {
			display: 'list',
			cursor: 'default',
			hoverableRows: false,
			striped: null,
			variant: 'primary',
			searchable: false,
			collapsed: true,
			rtl: false
		});
		fixture.detectChanges();

		expect(fixture.nativeElement.style.getPropertyValue('--hub-list-accent')).toBe('var(--hub-sys-color-primary, primary)');
	});

	it('should pass a literal accent colour through unchanged', () => {
		fixture.componentRef.setInput('options', {
			display: 'list',
			cursor: 'default',
			hoverableRows: false,
			striped: null,
			variant: '#ff0000',
			searchable: false,
			collapsed: true,
			rtl: false
		});
		fixture.detectChanges();

		expect(fixture.nativeElement.style.getPropertyValue('--hub-list-accent')).toBe('#ff0000');
	});

	// HUBUI-004 — a long unbreakable label renders inside the card's `.hub-list__label`
	// in cards mode (the element the cards-scoped wrap rules `white-space: normal` +
	// `overflow-wrap: anywhere` target). The visual wrap itself is a layout property
	// verified in the showcase demo; jsdom does not resolve the nested cards override.
	it('should render a long unbreakable label inside the card label in cards mode', () => {
		const longToken = 'Supercalifragilisticexpialidocioussupercalifragilistic';
		fixture.componentRef.setInput('items', [{ id: 1, label: longToken }]);
		fixture.componentRef.setInput('options', {
			display: 'cards',
			cursor: 'default',
			hoverableRows: false,
			striped: null,
			variant: null,
			searchable: false,
			collapsed: true,
			rtl: false
		});
		fixture.detectChanges();

		const rootList = fixture.nativeElement.querySelector('.hub-list__items--root') as HTMLElement;
		expect(rootList.classList.contains('hub-list__items--cards')).toBe(true);

		const label = fixture.nativeElement.querySelector('.hub-list__label') as HTMLElement;
		expect(label).toBeTruthy();
		expect(label.textContent).toContain(longToken);
	});
	describe('flush', () => {
		it('does not mark the host by default: a list is a stack of cards until told otherwise', () => {
			expect(fixture.nativeElement.classList.contains('hub-list--flush')).toBe(false);
		});

		it('marks the host so the variant can out-weigh the defaults on :host', () => {
			fixture.componentRef.setInput('flush', true);
			fixture.detectChanges();

			expect(fixture.nativeElement.classList.contains('hub-list--flush')).toBe(true);
		});

		it('accepts the bare attribute, so <hub-list flush> is enough', () => {
			fixture.componentRef.setInput('flush', '');
			fixture.detectChanges();

			expect(component.flush()).toBe(true);
		});
	});

	describe('single selection', () => {
		it('draws a radio per row rather than nothing at all', () => {
			fixture.componentRef.setInput('selectable', SelectionTypes.Single);
			fixture.detectChanges();

			const radios = fixture.nativeElement.querySelectorAll('.hub-list__radio');
			expect(radios.length).toBe(2);
			expect(fixture.nativeElement.querySelectorAll('.hub-list__checkbox').length).toBe(0);
		});

		it('groups its radios per list instance, so two lists do not fight over one name', () => {
			fixture.componentRef.setInput('selectable', SelectionTypes.Single);
			fixture.detectChanges();

			const other = TestBed.createComponent(ListComponent<TestListItem>);
			other.componentRef.setInput('items', [{ id: 3, label: 'Third item' }]);
			other.componentRef.setInput('selectable', SelectionTypes.Single);
			other.detectChanges();

			const mine = fixture.nativeElement.querySelector('.hub-list__radio') as HTMLInputElement;
			const theirs = other.nativeElement.querySelector('.hub-list__radio') as HTMLInputElement;

			expect(mine.name).toBeTruthy();
			expect(mine.name).not.toBe(theirs.name);
		});
	});
	describe('clickFn payload', () => {
		it('hands over the row, which is what the type has always promised', () => {
			let seen: any = null;
			fixture.componentRef.setInput('clickFn', (event: any) => (seen = event));
			fixture.detectChanges();

			(fixture.nativeElement.querySelector('.hub-list__item') as HTMLElement).click();

			expect(seen.item).toEqual({ id: 1, label: 'First item' });
			expect(seen.value).toBe('First item');
			expect(seen.children).toEqual([]);
		});

		it("hands over a group's children as items too, not as internal wrappers", () => {
			fixture.componentRef.setInput('items', [{ id: 10, label: 'Building', children: [{ id: 11, label: 'Room' }] }]);
			let seen: any = null;
			fixture.componentRef.setInput('clickFn', (event: any) => (seen = event));
			fixture.detectChanges();

			(fixture.nativeElement.querySelector('.hub-list__item') as HTMLElement).click();

			expect(seen.children).toEqual([{ id: 11, label: 'Room' }]);
		});
	});

	describe('rebuilding the items', () => {
		it('keeps the selection: a refresh is not the user changing their mind', () => {
			fixture.componentRef.setInput('selectable', SelectionTypes.Multiple);
			fixture.componentRef.setInput('bindValue', 'id');
			fixture.detectChanges();

			component.writeValue([2] as any);
			fixture.detectChanges();

			fixture.componentRef.setInput('items', [
				{ id: 1, label: 'First item' },
				{ id: 2, label: 'Second item' }
			]);
			fixture.detectChanges();

			expect(component.value).toEqual([2]);
		});

		/**
		 * Changed in 22.14.0, and the reason is the whole point of this block.
		 *
		 * This used to answer `[1]`: the value was recomputed from whatever survived the
		 * rebuild. It reads as tidy and it is a guess — `items` shrinking means "those are
		 * gone" on a filtered catalogue and "this is page two" on a paged one, and the
		 * component sees the same thing in both cases. The consumer did the paging; it is
		 * the one that can tell.
		 */
		it('keeps what is no longer on offer, because only the consumer knows why it went', () => {
			fixture.componentRef.setInput('selectable', SelectionTypes.Multiple);
			fixture.componentRef.setInput('bindValue', 'id');
			fixture.detectChanges();

			component.writeValue([1, 2] as any);
			fixture.detectChanges();

			fixture.componentRef.setInput('items', [{ id: 1, label: 'First item' }]);
			fixture.detectChanges();

			expect(component.value).toEqual([1, 2]);
		});

		/** Kept whole in the model, but only the part it can draw is ticked. */
		it('ticks only the rows it can actually show', () => {
			fixture.componentRef.setInput('selectable', SelectionTypes.Multiple);
			fixture.componentRef.setInput('bindValue', 'id');
			fixture.detectChanges();

			component.writeValue([1, 2] as any);
			fixture.detectChanges();

			fixture.componentRef.setInput('items', [{ id: 1, label: 'First item' }]);
			fixture.detectChanges();

			const ticked = fixture.nativeElement.querySelectorAll('input[type="checkbox"]:checked');
			expect(ticked.length).toBe(1);
		});

		/**
		 * The defect this change exists for: paging a list published the off-page selection
		 * as if the user had removed it, and the consumer had no way to tell that from a
		 * real removal.
		 */
		it('says nothing through the CVA when the offer shrinks', () => {
			fixture.componentRef.setInput('selectable', SelectionTypes.Multiple);
			fixture.componentRef.setInput('bindValue', 'id');
			fixture.detectChanges();

			component.writeValue([1, 2] as any);
			fixture.detectChanges();

			let told = 0;
			component.registerOnChange(() => told++);

			fixture.componentRef.setInput('items', [{ id: 1, label: 'First item' }]);
			fixture.detectChanges();

			expect(told).toBe(0);
		});

		it('says nothing through the CVA when the refresh changed nothing', () => {
			fixture.componentRef.setInput('selectable', SelectionTypes.Multiple);
			fixture.componentRef.setInput('bindValue', 'id');
			fixture.detectChanges();

			component.writeValue([2] as any);
			fixture.detectChanges();

			let told = 0;
			component.registerOnChange(() => told++);

			fixture.componentRef.setInput('items', [
				{ id: 1, label: 'First item' },
				{ id: 2, label: 'Second item' }
			]);
			fixture.detectChanges();

			expect(told).toBe(0);
		});
	});

	describe('a disabled list', () => {
		it('disables its controls rather than only remembering it was told to', () => {
			fixture.componentRef.setInput('selectable', SelectionTypes.Multiple);
			fixture.detectChanges();

			component.setDisabledState!(true);
			fixture.detectChanges();

			const boxes = [...fixture.nativeElement.querySelectorAll('.hub-list__checkbox')];
			expect(boxes.length).toBeGreaterThan(0);
			expect(boxes.every((box: HTMLInputElement) => box.disabled)).toBe(true);
		});

		it('does not change the selection when something drives it anyway', () => {
			fixture.componentRef.setInput('selectable', SelectionTypes.Multiple);
			fixture.componentRef.setInput('bindValue', 'id');
			fixture.detectChanges();

			component.setDisabledState!(true);
			component.onSelectionChange();

			expect(component.value).toEqual([]);
		});
	});

	describe('a group of children', () => {
		beforeEach(() => {
			fixture.componentRef.setInput('items', [
				{
					id: 10,
					label: 'Building',
					children: [
						{ id: 11, label: 'Room A' },
						{ id: 12, label: 'Room B' }
					]
				}
			]);
			fixture.componentRef.setInput('selectable', SelectionTypes.Multiple);
			fixture.componentRef.setInput('bindValue', 'id');
			fixture.detectChanges();
		});

		it('does not travel in the selection: a heading is not a datum', () => {
			component.writeValue([11, 12] as any);
			fixture.detectChanges();

			expect(component.value).toEqual([11, 12]);
		});

		it('ticking it takes everything under it', () => {
			const group = component.form.controls[0];
			group.get('selected')!.setValue(true);
			component.onGroupSelectionChange(group);

			expect(component.value).toEqual([11, 12]);
		});

		it('is indeterminate while it holds some of its children but not all', () => {
			component.writeValue([11] as any);
			fixture.detectChanges();

			expect(component.isPartiallySelected(component.form.controls[0])).toBe(true);

			component.writeValue([11, 12] as any);
			fixture.detectChanges();

			expect(component.isPartiallySelected(component.form.controls[0])).toBe(false);
		});
	});

	describe('search', () => {
		beforeEach(() => {
			fixture.componentRef.setInput('options', { searchable: true });
			fixture.detectChanges();
		});

		it('filters, which is what the box has always looked like it did', () => {
			component.searchFG.setValue('second');
			component.filter();
			fixture.detectChanges();

			const labels = [...fixture.nativeElement.querySelectorAll('.hub-list__label')].map((el: HTMLElement) =>
				el.textContent?.trim()
			);
			expect(labels).toEqual(['Second item']);
		});

		it('keeps a group whose child matches, or the match would be hidden with it', () => {
			fixture.componentRef.setInput('items', [
				{ id: 10, label: 'Building', children: [{ id: 11, label: 'Timple room' }] }
			]);
			fixture.detectChanges();

			component.searchFG.setValue('timple');
			component.filter();
			fixture.detectChanges();

			expect(component.getVisibleItems(component.items(), true).length).toBe(1);
		});

		it('returns to the first page, so a narrowed list is not shown empty', () => {
			fixture.componentRef.setInput('paginate', true);
			fixture.componentRef.setInput('perPage', 1);
			component.page.set(2);
			fixture.detectChanges();

			component.searchFG.setValue('first');
			component.filter();

			expect(component.page()).toBe(1);
		});
	});
	describe('single selection over a grouped list', () => {
		beforeEach(() => {
			fixture.componentRef.setInput('items', [
				{
					id: 10,
					label: 'Building',
					children: [
						{ id: 11, label: 'Room A' },
						{ id: 12, label: 'Room B' }
					]
				}
			]);
			fixture.componentRef.setInput('selectable', SelectionTypes.Single);
			fixture.detectChanges();
		});

		it('gives a group no radio: a heading is not one of the things to choose', () => {
			const groupRow = fixture.nativeElement.querySelector('.hub-list__item');

			expect(groupRow.querySelector(':scope > .hub-list__item-content .hub-list__radio')).toBeNull();
		});

		it('gives every room one, once the group is open', () => {
			fixture.componentRef.setInput('options', { collapsed: false });
			fixture.detectChanges();

			expect(fixture.nativeElement.querySelectorAll('.hub-list__radio').length).toBe(2);
		});
	});
});
