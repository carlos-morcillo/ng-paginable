import { Component, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HubPaginableErrorDirective } from './paginable-error.directive';

/**
 * Test component for HubPaginableErrorDirective
 */
@Component({
	template: `
		<ng-template paginableTableError>
			<div class="error-message">{{ errorMessage }}</div>
		</ng-template>
	`,
	standalone: true,
	imports: [HubPaginableErrorDirective]
})
class TestErrorDirectiveComponent {
	readonly directive = viewChild.required(HubPaginableErrorDirective);

	errorMessage = 'An error occurred';
}

/**
 * Test suite for HubPaginableErrorDirective
 * Tests custom error state template directive functionality
 */
describe('HubPaginableErrorDirective', () => {
	let component: TestErrorDirectiveComponent;
	let fixture: ComponentFixture<TestErrorDirectiveComponent>;
	let directive: HubPaginableErrorDirective;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [TestErrorDirectiveComponent]
		});

		fixture = TestBed.createComponent(TestErrorDirectiveComponent);
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

	it('should work with errorTpt selector', () => {
		@Component({
			template: `
				<ng-template errorTpt>
					<div class="custom-error">Error!</div>
				</ng-template>
			`,
			standalone: true,
			imports: [HubPaginableErrorDirective]
		})
		class TestErrorTptComponent {
			readonly directive = viewChild.required(HubPaginableErrorDirective);
		}

		const testFixture = TestBed.createComponent(TestErrorTptComponent);
		testFixture.detectChanges();

		expect(testFixture.componentInstance.directive()).toBeTruthy();
	});

	it('should be accessible via ViewChild', () => {
		expect(component.directive()).toBe(directive);
	});

	it('should provide template context', () => {
		expect(directive.template).toBeDefined();
	});
});
