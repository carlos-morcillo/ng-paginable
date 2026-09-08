import { Component, TemplateRef, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HubPaginableTableFilterDirective } from './paginable-table-filter.directive';

/**
 * Test component for HubPaginableTableFilterDirective
 */
@Component({
	template: `
		<ng-template paginableTableFilter [header]="filterHeader()">
			<input type="text" placeholder="Filter..." />
		</ng-template>
	`,
	standalone: true,
	imports: [HubPaginableTableFilterDirective]
})
class TestFilterDirectiveComponent {
	readonly directive = viewChild.required(HubPaginableTableFilterDirective);

	filterHeader = signal('filterColumn');
}

/**
 * Test suite for HubPaginableTableFilterDirective
 * Tests custom filter template directive functionality
 */
describe('HubPaginableTableFilterDirective', () => {
	let component: TestFilterDirectiveComponent;
	let fixture: ComponentFixture<TestFilterDirectiveComponent>;
	let directive: HubPaginableTableFilterDirective;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [TestFilterDirectiveComponent]
		});

		fixture = TestBed.createComponent(TestFilterDirectiveComponent);
		component = fixture.componentInstance;
		directive = component.directive();
		fixture.detectChanges();
	});

	it('should create an instance', () => {
		expect(directive).toBeTruthy();
	});

	it('should have a template reference', () => {
		expect(directive.template).toBeTruthy();
		expect(directive.template instanceof TemplateRef).toBe(true);
	});

	it('should have required header input', () => {
		expect(directive.header()).toBe('filterColumn');
	});

	it('should update header input', () => {
		component.filterHeader.set('newFilterColumn');
		fixture.detectChanges();

		expect(directive.header()).toBe('newFilterColumn');
	});

	it('should work with filterTpt selector', () => {
		@Component({
			template: `
				<ng-template filterTpt [header]="'statusFilter'">
					<select>
						<option>All</option>
					</select>
				</ng-template>
			`,
			standalone: true,
			imports: [HubPaginableTableFilterDirective]
		})
		class TestFilterTptComponent {
			readonly directive = viewChild.required(HubPaginableTableFilterDirective);
		}

		const testFixture = TestBed.createComponent(TestFilterTptComponent);
		testFixture.detectChanges();

		expect(testFixture.componentInstance.directive()).toBeTruthy();
		expect(testFixture.componentInstance.directive().header()).toBe('statusFilter');
	});

	it('should be accessible via ViewChild', () => {
		expect(component.directive()).toBe(directive);
	});

	it('should provide template context', () => {
		expect(directive.template).toBeDefined();
	});
});
