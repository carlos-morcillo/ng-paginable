import { Component, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HubPaginableNoResultsDirective } from './paginable-no-results.directive';

/**
 * Test component for HubPaginableNoResultsDirective.
 */
@Component({
	template: `
		<ng-template paginableNoResults>
			<div class="no-data-message">{{ noDataMessage }}</div>
		</ng-template>
	`,
	standalone: true,
	imports: [HubPaginableNoResultsDirective]
})
class TestNotFoundDirectiveComponent {
	readonly directive = viewChild.required(HubPaginableNoResultsDirective);

	noDataMessage = 'No data available';
}

/**
 * Test suite for HubPaginableNoResultsDirective.
 * Validates the new selector names and the legacy aliases kept for compatibility.
 */
describe('HubPaginableNoResultsDirective', () => {
	let component: TestNotFoundDirectiveComponent;
	let fixture: ComponentFixture<TestNotFoundDirectiveComponent>;
	let directive: HubPaginableNoResultsDirective;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [TestNotFoundDirectiveComponent]
		});

		fixture = TestBed.createComponent(TestNotFoundDirectiveComponent);
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

	it('should work with the noResultsTpt selector', () => {
		@Component({
			template: `
				<ng-template noResultsTpt>
					<div class="custom-empty-state">No results found</div>
				</ng-template>
			`,
			standalone: true,
			imports: [HubPaginableNoResultsDirective]
		})
		class TestNoResultsTptComponent {
			readonly directive = viewChild.required(HubPaginableNoResultsDirective);
		}

		const testFixture = TestBed.createComponent(TestNoResultsTptComponent);
		testFixture.detectChanges();

		expect(testFixture.componentInstance.directive()).toBeTruthy();
	});

	it('should keep supporting the legacy noDataTpt selector', () => {
		@Component({
			template: `
				<ng-template noDataTpt>
					<div class="custom-no-data">No results found</div>
				</ng-template>
			`,
			standalone: true,
			imports: [HubPaginableNoResultsDirective]
		})
		class TestNoDataTptComponent {
			readonly directive = viewChild.required(HubPaginableNoResultsDirective);
		}

		const testFixture = TestBed.createComponent(TestNoDataTptComponent);
		testFixture.detectChanges();

		expect(testFixture.componentInstance.directive()).toBeTruthy();
	});

	it('should keep supporting the legacy paginableTableNotFound selector', () => {
		@Component({
			template: `
				<ng-template paginableTableNotFound>
					<div class="custom-no-data">No results found</div>
				</ng-template>
			`,
			standalone: true,
			imports: [HubPaginableNoResultsDirective]
		})
		class TestLegacySelectorComponent {
			readonly directive = viewChild.required(HubPaginableNoResultsDirective);
		}

		const testFixture = TestBed.createComponent(TestLegacySelectorComponent);
		testFixture.detectChanges();

		expect(testFixture.componentInstance.directive()).toBeTruthy();
	});

	it('should keep supporting the previous paginableEmptyState selector', () => {
		@Component({
			template: `
				<ng-template paginableEmptyState>
					<div class="custom-empty-state">No results found</div>
				</ng-template>
			`,
			standalone: true,
			imports: [HubPaginableNoResultsDirective]
		})
		class TestPreviousSelectorComponent {
			readonly directive = viewChild.required(HubPaginableNoResultsDirective);
		}

		const testFixture = TestBed.createComponent(TestPreviousSelectorComponent);
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
