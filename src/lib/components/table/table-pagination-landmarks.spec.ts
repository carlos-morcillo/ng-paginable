import { ComponentFixture, TestBed } from '@angular/core/testing';

import { locale as enLocale } from '../../assets/i18n/en';
import { providePaginable } from '../../paginable.providers';
import { TableComponent } from './table.component';

/**
 * With `paginationPosition="both"` the table draws its pagination bar twice, and each bar carries
 * a `<nav>`. Two navigation landmarks that answer to the same name are indistinguishable in a
 * screen reader's landmark list, so the reader cannot tell the one above the rows from the one
 * below and has no way to choose.
 *
 * These specs read the accessible name off the rendered `<nav>` — the thing assistive technology
 * actually announces — rather than asserting that some class or attribute is present.
 */
describe('TableComponent pagination landmarks', () => {
	let fixture: ComponentFixture<TableComponent>;

	/** Applies the `ucfirst` pipe every shipped label is piped through before it is rendered. */
	const ucfirst = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

	/** Accessible name of every pagination `<nav>`, in document order. */
	function paginationLandmarkNames(): Array<string | null> {
		return [...fixture.nativeElement.querySelectorAll('nav.hub-paginator-container')].map((nav) =>
			(nav as HTMLElement).getAttribute('aria-label')
		);
	}

	beforeEach(async () => {
		TestBed.resetTestingModule();
		await TestBed.configureTestingModule({
			imports: [TableComponent],
			providers: [providePaginable({ language: 'en' })]
		}).compileComponents();

		fixture = TestBed.createComponent(TableComponent);
		fixture.componentInstance.page.set(1);
		fixture.componentInstance.perPage.set(10);
		fixture.componentInstance.totalItems.set(25);
	});

	it('gives the two bars of "both" names a reader can tell apart', () => {
		fixture.componentRef.setInput('paginationPosition', 'both');
		fixture.detectChanges();

		const [top, bottom] = paginationLandmarkNames();

		expect(paginationLandmarkNames().length).toBe(2);
		expect(top).toBeTruthy();
		expect(bottom).toBeTruthy();
		expect(top).not.toBe(bottom);
	});

	it('names each bar of "both" after the end of the table it sits at', () => {
		fixture.componentRef.setInput('paginationPosition', 'both');
		fixture.detectChanges();

		expect(paginationLandmarkNames()).toEqual([
			ucfirst(enLocale.data.PAGINATION_TOP),
			ucfirst(enLocale.data.PAGINATION_BOTTOM)
		]);
	});

	it('leaves the lone bar its plain name when there is nothing to tell it apart from', () => {
		fixture.detectChanges();

		expect(paginationLandmarkNames()).toEqual([ucfirst(enLocale.data.PAGINATION)]);
	});

	it('leaves the lone bar its plain name at the top as well', () => {
		fixture.componentRef.setInput('paginationPosition', 'top');
		fixture.detectChanges();

		expect(paginationLandmarkNames()).toEqual([ucfirst(enLocale.data.PAGINATION)]);
	});
});
