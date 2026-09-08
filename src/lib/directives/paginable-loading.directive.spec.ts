import { Component, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HubPaginableLoadingDirective } from './paginable-loading.directive';

/**
 * Test component for HubPaginableLoadingDirective
 */
@Component({
	template: `
		<ng-template paginableTableLoading>
			<div class="loading-spinner">{{ loadingMessage }}</div>
		</ng-template>
	`,
	standalone: true,
	imports: [HubPaginableLoadingDirective]
})
class TestLoadingDirectiveComponent {
	readonly directive = viewChild.required(HubPaginableLoadingDirective);

	loadingMessage = 'Loading...';
}

/**
 * Test suite for HubPaginableLoadingDirective
 * Tests custom loading state template directive functionality
 */
describe('HubPaginableLoadingDirective', () => {
	let component: TestLoadingDirectiveComponent;
	let fixture: ComponentFixture<TestLoadingDirectiveComponent>;
	let directive: HubPaginableLoadingDirective;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [TestLoadingDirectiveComponent]
		});

		fixture = TestBed.createComponent(TestLoadingDirectiveComponent);
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

	it('should work with loadingTpt selector', () => {
		@Component({
			template: `
				<ng-template loadingTpt>
					<div class="custom-loading">Please wait...</div>
				</ng-template>
			`,
			standalone: true,
			imports: [HubPaginableLoadingDirective]
		})
		class TestLoadingTptComponent {
			readonly directive = viewChild.required(HubPaginableLoadingDirective);
		}

		const testFixture = TestBed.createComponent(TestLoadingTptComponent);
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
