import { Component, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HubPaginableListItemDirective } from './paginable-list-item.directive';

/**
 * Test component for HubPaginableListItemDirective
 */
@Component({
	template: `
		<ng-template listItemTpt let-item>
			<div class="list-item">{{ item.name }}</div>
		</ng-template>
	`,
	imports: [HubPaginableListItemDirective]
})
class TestListItemDirectiveComponent {
	readonly directive = viewChild.required(HubPaginableListItemDirective);
}

/**
 * Test suite for HubPaginableListItemDirective
 * Tests custom list item template directive functionality
 */
describe('HubPaginableListItemDirective', () => {
	let component: TestListItemDirectiveComponent;
	let fixture: ComponentFixture<TestListItemDirectiveComponent>;
	let directive: HubPaginableListItemDirective;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [TestListItemDirectiveComponent, HubPaginableListItemDirective]
		});

		fixture = TestBed.createComponent(TestListItemDirectiveComponent);
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

	it('should provide template context', () => {
		expect(directive.template).toBeDefined();
	});
});
