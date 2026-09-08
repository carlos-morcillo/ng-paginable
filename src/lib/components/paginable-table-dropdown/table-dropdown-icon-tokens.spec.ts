import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HubPaginableTableDropdownComponent } from './paginable-table-dropdown.component';

/**
 * The legacy row-actions menu draws one glyph, and it is its own.
 *
 * The trigger carried `hub-table__icon--ellipsis-v`, a class the table's scoped stylesheet
 * never delivers outside the table's own view: the three dots were not there, and a
 * consumer who wanted another glyph had to redefine a variable named after the table. The
 * component is deprecated, which is a reason not to grow its theming surface — but the
 * glyph has to come from somewhere, and in this library a glyph is always a variable.
 */
describe('table dropdown icon tokens', () => {
	let fixture: ComponentFixture<HubPaginableTableDropdownComponent>;

	function maskOf(selector: string): string {
		const element = fixture.nativeElement.querySelector(selector) as HTMLElement | null;
		expect(element, `no element matched "${selector}"`).not.toBeNull();
		return getComputedStyle(element!).maskImage;
	}

	function declared(token: string): string {
		return getComputedStyle(fixture.nativeElement).getPropertyValue(token);
	}

	beforeEach(() => {
		TestBed.configureTestingModule({ imports: [HubPaginableTableDropdownComponent] });

		fixture = TestBed.createComponent(HubPaginableTableDropdownComponent);
		fixture.componentRef.setInput('options', { buttons: [] });
		fixture.detectChanges();
	});

	it('names no class of the table anywhere in its markup', () => {
		expect(fixture.nativeElement.querySelectorAll('[class*="hub-table__icon"]').length).toBe(0);
	});

	it('draws the trigger glyph from its own variable', () => {
		expect(maskOf('.hub-table-dropdown__icon')).toBe('var(--hub-table-dropdown-icon-ellipsis-v)');
	});

	it('ships a default for the glyph it draws', () => {
		expect(declared('--hub-table-dropdown-icon-ellipsis-v')).toMatch(/^url\(/);
	});

	it('exposes the ink and the size of its glyph as its own variables', () => {
		expect(declared('--hub-table-dropdown-icon-color')).not.toBe('');
		expect(declared('--hub-table-dropdown-icon-size')).not.toBe('');
	});

	it('still lets a consumer supply a glyph class of their own', () => {
		fixture.componentRef.setInput('options', { buttons: [], icon: 'my-own-glyph' });
		fixture.detectChanges();

		const icon = fixture.nativeElement.querySelector('.hub-table-dropdown__icon') as HTMLElement;

		expect(icon.classList.contains('my-own-glyph')).toBe(true);
		expect(icon.classList.contains('hub-table-dropdown__icon--ellipsis-v')).toBe(false);
	});
});
