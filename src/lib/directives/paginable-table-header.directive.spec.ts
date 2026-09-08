import { Component, TemplateRef, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HubPaginableTableHeaderDirective } from './paginable-table-header.directive';

/**
 * Test component for HubPaginableTableHeaderDirective
 */
@Component({
	template: `
		<ng-template paginableTableHeader [header]="headerName()">
			<div class="custom-header">{{ headerTitle }}</div>
		</ng-template>
	`,
	standalone: true,
	imports: [HubPaginableTableHeaderDirective]
})
class TestHeaderDirectiveComponent {
	readonly directive = viewChild.required(HubPaginableTableHeaderDirective);

	headerName = signal('testColumn');
	headerTitle = 'Test Header';
}

/**
 * Test suite for HubPaginableTableHeaderDirective
 * Tests custom header template directive functionality
 */
describe('HubPaginableTableHeaderDirective', () => {
	let component: TestHeaderDirectiveComponent;
	let fixture: ComponentFixture<TestHeaderDirectiveComponent>;
	let directive: HubPaginableTableHeaderDirective;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [TestHeaderDirectiveComponent]
		});

		fixture = TestBed.createComponent(TestHeaderDirectiveComponent);
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
		expect(directive.header()).toBe('testColumn');
	});

	it('should update header input', () => {
		component.headerName.set('newColumn');
		fixture.detectChanges();

		expect(directive.header()).toBe('newColumn');
	});

	it('should work with headerTpt selector', () => {
		@Component({
			template: `
				<ng-template headerTpt [header]="'columnName'">
					<div>Custom Header</div>
				</ng-template>
			`,
			standalone: true,
			imports: [HubPaginableTableHeaderDirective]
		})
		class TestHeaderTptComponent {
			readonly directive = viewChild.required(HubPaginableTableHeaderDirective);
		}

		const testFixture = TestBed.createComponent(TestHeaderTptComponent);
		testFixture.detectChanges();

		expect(testFixture.componentInstance.directive()).toBeTruthy();
		expect(testFixture.componentInstance.directive().header()).toBe('columnName');
	});

	it('should be accessible via ViewChild', () => {
		expect(component.directive()).toBe(directive);
	});

	it('should provide template context', () => {
		expect(directive.template).toBeDefined();
	});
});
