import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { HubTranslationService } from 'ng-hub-ui-utils';
import { TableComponent } from './table.component';

/** Minimal translation service stand-in so the standalone component can render. */
class MockHubTranslationService {
	private source = new Subject<unknown>();
	translationObserver = this.source.asObservable();
	getTranslation(key: string) {
		return key;
	}
	setTranslations() {}
	initialize() {}
}

/**
 * `paginationPosition` had been an input that moved nothing: the template drew one bar, under the
 * rows, and asked the input only whether to put a paginator inside it. `top` therefore deleted the
 * paginator instead of relocating it, and `both` was indistinguishable from `bottom` — while four
 * documents described the three values as placements.
 *
 * These read the placement off the rendered DOM rather than off the signal, which is the half the
 * old test suite never covered.
 */
describe('TableComponent pagination position', () => {
	let fixture: ComponentFixture<TableComponent>;

	/** Position of a pagination bar relative to the table container, in document order. */
	function barPlacements(): Array<'top' | 'bottom'> {
		const table = fixture.nativeElement.querySelector('.hub-table__container')!;
		return [...fixture.nativeElement.querySelectorAll('.hub-table__bottom-bar')].map((bar) =>
			table.compareDocumentPosition(bar as Node) & Node.DOCUMENT_POSITION_PRECEDING ? 'top' : 'bottom'
		);
	}

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TableComponent, BrowserAnimationsModule],
			providers: [{ provide: HubTranslationService, useClass: MockHubTranslationService }]
		}).compileComponents();

		fixture = TestBed.createComponent(TableComponent);
		fixture.componentInstance.page.set(1);
		fixture.componentInstance.perPage.set(10);
		fixture.componentInstance.totalItems.set(25);
	});

	it('draws the bar under the rows by default', () => {
		fixture.detectChanges();

		expect(barPlacements()).toEqual(['bottom']);
		expect(fixture.nativeElement.querySelectorAll('hub-paginator').length).toBe(1);
	});

	it('moves the whole bar above the rows with "top"', () => {
		fixture.componentRef.setInput('paginationPosition', 'top');
		fixture.detectChanges();

		expect(barPlacements()).toEqual(['top']);
		// The paginator travels with the bar instead of disappearing, and so do the page-size
		// selector and the row count, which are the rest of what the bar carries.
		expect(fixture.nativeElement.querySelectorAll('hub-paginator').length).toBe(1);
		expect(fixture.nativeElement.querySelectorAll('.hub-table__bottom-bar-settings').length).toBe(1);
		expect(fixture.nativeElement.querySelectorAll('.hub-table__bottom-bar-info').length).toBe(1);
	});

	it('draws the bar twice with "both"', () => {
		fixture.componentRef.setInput('paginationPosition', 'both');
		fixture.detectChanges();

		expect(barPlacements()).toEqual(['top', 'bottom']);
		expect(fixture.nativeElement.querySelectorAll('hub-paginator').length).toBe(2);
		expect(fixture.nativeElement.querySelectorAll('.hub-table__bottom-bar-settings').length).toBe(2);
	});

	it('keeps the toolbar above the bar it draws with "top"', () => {
		fixture.componentRef.setInput('searchable', true);
		fixture.componentRef.setInput('paginationPosition', 'top');
		fixture.detectChanges();

		// Search and batch actions are the table's toolbar and stay at the very top; the paging
		// chrome belongs next to the rows it pages.
		const toolbar = fixture.nativeElement.querySelector('.hub-table__top-bar')!;
		const bar = fixture.nativeElement.querySelector('.hub-table__bottom-bar')!;

		expect(toolbar.compareDocumentPosition(bar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
	});

	it('marks each bar with the placement it was drawn at', () => {
		fixture.componentRef.setInput('paginationPosition', 'both');
		fixture.detectChanges();

		expect(fixture.nativeElement.querySelectorAll('.hub-table__bottom-bar--top').length).toBe(1);
		expect(fixture.nativeElement.querySelectorAll('.hub-table__bottom-bar--bottom').length).toBe(1);
	});
});
