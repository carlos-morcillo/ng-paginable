import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HubIconComponent } from 'ng-hub-ui-icons';
import { HubIconComponent as DeprecatedAlias, HubPaginableIconComponent } from '../../index';

/**
 * `ng-hub-ui-icons` and this package both exported a `HubIconComponent`, and both matched the
 * `hub-icon` element. An application that imported the two into one component could not write
 * `<hub-icon>` at all — the compiler rejected the template with NG8023, "Multiple components
 * match node with tagname hub-icon" — and the two class names collided in the import list.
 *
 * These cases fix both halves: the element name belongs to `ng-hub-ui-icons` alone, and this
 * package's component answers to a name of its own.
 */
describe('icon name collision with ng-hub-ui-icons', () => {
	@Component({
		standalone: true,
		imports: [HubPaginableIconComponent, HubIconComponent],
		template: `
			<hub-paginable-icon [config]="{ type: 'font-awesome', value: 'fa-home' }" />
			<hub-icon name="house" />
		`
	})
	class BothPackages {}

	/** Distinct classes now, so importing both into one file needs no aliasing. */
	it('exports a different class from each package', () => {
		expect(HubPaginableIconComponent).not.toBe(HubIconComponent);
	});

	/** The old name has to keep resolving, or the rename is a break with no migration window. */
	it('keeps the old name working as an alias of the renamed class', () => {
		expect(DeprecatedAlias).toBe(HubPaginableIconComponent);
	});

	/**
	 * The selector, read off the compiled definition rather than the decorator's source, so the
	 * rule holds for whatever someone adds to it next: this package must not claim `hub-icon`.
	 */
	it('leaves the hub-icon element to ng-hub-ui-icons', () => {
		const selectors: string[][] = (HubPaginableIconComponent as any).ɵcmp.selectors;
		const names = selectors.map(([tag]) => tag);

		expect(names).toContain('hub-paginable-icon');
		expect(names).not.toContain('hub-icon');
	});

	/**
	 * The point of the whole change, and the case that failed to compile before it: one component
	 * importing both packages, each element drawn by the package that owns it.
	 */
	it('lets one component use both icons at once, each drawn by its own package', () => {
		const fixture = TestBed.createComponent(BothPackages);
		fixture.detectChanges();

		const ours: HTMLElement = fixture.nativeElement.querySelector('hub-paginable-icon');
		const theirs: HTMLElement = fixture.nativeElement.querySelector('hub-icon');

		expect(ours.querySelector('i')?.className).toContain('fa-home');
		expect(theirs.classList.contains('hub-icon')).toBe(true);
	});
});
