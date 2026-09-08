import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HubDropdownComponent } from './dropdown.component';

/**
 * The table closes every dropdown but the one just opened by comparing `dropdown.id()` with
 * the id it was given, so the identifier is not decoration: it is how a menu is told apart
 * from its siblings, and it is reflected on the host so the DOM says the same thing.
 *
 * It reached the host through a bare `@HostBinding()` on a field holding an `input()`, which
 * binds the signal itself rather than what it holds — nothing unwraps a signal in a host
 * binding — so the rendered `id` was the stringified function.
 */
describe('HubDropdownComponent', () => {
	let fixture: ComponentFixture<HubDropdownComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({ imports: [HubDropdownComponent] }).compileComponents();
		fixture = TestBed.createComponent(HubDropdownComponent);
	});

	it('reflects the identifier it was given on the host element', () => {
		fixture.componentRef.setInput('id', 'row-actions-7');
		fixture.detectChanges();

		expect(fixture.nativeElement.getAttribute('id')).toBe('row-actions-7');
	});

	it('reflects its generated identifier when the consumer gives none', () => {
		fixture.detectChanges();

		const rendered = fixture.nativeElement.getAttribute('id');

		expect(rendered).toBe(fixture.componentInstance.id());
		expect(rendered).toMatch(/^[A-Za-z0-9]+$/);
	});
});
