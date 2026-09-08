import { Component, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HubPaginableTableRowDirective } from './paginable-table-row.directive';

/**
 * Test component for HubPaginableTableRowDirective
 */
@Component({
	template: `
		<ng-template paginableTableRow let-row>
			<div class="custom-row">{{ row.name }}</div>
		</ng-template>
	`,
	standalone: true,
	imports: [HubPaginableTableRowDirective]
})
class TestRowDirectiveComponent {
	readonly directive = viewChild.required(HubPaginableTableRowDirective);
}

/**
 * Test suite for HubPaginableTableRowDirective
 * Tests custom row template directive functionality
 */
describe('HubPaginableTableRowDirective', () => {
	let component: TestRowDirectiveComponent;
	let fixture: ComponentFixture<TestRowDirectiveComponent>;
	let directive: HubPaginableTableRowDirective;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [TestRowDirectiveComponent]
		});

		fixture = TestBed.createComponent(TestRowDirectiveComponent);
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

	it('should be accessible via ViewChild', () => {
		expect(component.directive()).toBe(directive);
	});

	it('should work with rowTpt selector', () => {
		@Component({
			template: `
				<ng-template rowTpt let-row>
					<div>{{ row.data }}</div>
				</ng-template>
			`,
			standalone: true,
			imports: [HubPaginableTableRowDirective]
		})
		class TestRowTptComponent {
			readonly directive = viewChild.required(HubPaginableTableRowDirective);
		}

		const testFixture = TestBed.createComponent(TestRowTptComponent);
		testFixture.detectChanges();

		expect(testFixture.componentInstance.directive()).toBeTruthy();
	});

	it('should provide template context', () => {
		expect(directive.template).toBeDefined();
	});
});
