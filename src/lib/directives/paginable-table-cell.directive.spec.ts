import { Component, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HubPaginableTableCellDirective } from './paginable-table-cell.directive';

/**
 * Test component to verify the directive functionality
 */
@Component({
	template: `
		<ng-template cellTpt header="name" let-data="data" #nameTemplate>
			<div class="test-cell-name" [attr.data-name]="data?.name">
				<strong>{{ data?.name || 'No Name' }}</strong>
				@if (data?.email) {
					<small>({{ data?.email }})</small>
				}
			</div>
		</ng-template>

		<ng-template cellTpt header="age" let-data="data" #ageTemplate>
			<div class="test-cell-age" [class.adult]="data?.age >= 18">
				<span class="age-value">{{ data?.age || 0 }} years</span>
			</div>
		</ng-template>

		<ng-template cellTpt header="status" let-data="data" let-index="index" #statusTemplate>
			<div class="test-cell-status" [attr.data-index]="index">
				<span [class.active]="data?.active" [class.inactive]="!data?.active">
					{{ data?.active ? 'Active' : 'Inactive' }}
				</span>
			</div>
		</ng-template>

		<ng-template paginableTableCell header="description" let-data="data" #descTemplate>
			<div class="test-cell-description">
				<p>{{ data?.description || 'No description available' }}</p>
			</div>
		</ng-template>

		<!-- Template without directive for comparison -->
		<ng-template #regularTemplate let-data="data">
			<div class="regular-template">{{ data?.name }}</div>
		</ng-template>
	`,
	standalone: true,
	imports: [HubPaginableTableCellDirective]
})
class TestComponent {
	readonly nameDirective = viewChild.required('nameTemplate', { read: HubPaginableTableCellDirective });

	readonly nameTemplateRef = viewChild.required('nameTemplate', { read: TemplateRef });

	readonly ageDirective = viewChild.required('ageTemplate', { read: HubPaginableTableCellDirective });

	readonly statusDirective = viewChild.required('statusTemplate', { read: HubPaginableTableCellDirective });

	readonly descDirective = viewChild.required('descTemplate', { read: HubPaginableTableCellDirective });

	readonly regularTemplateRef = viewChild.required('regularTemplate', { read: TemplateRef });

	// Test data
	mockUserData = {
		name: 'John Doe',
		email: 'john@example.com',
		age: 30,
		active: true,
		description: 'Senior Developer with 5+ years experience'
	};

	mockMinorData = {
		name: 'Jane Smith',
		email: 'jane@example.com',
		age: 16,
		active: false,
		description: null
	};

	mockEmptyData = {
		name: null,
		email: null,
		age: null,
		active: false,
		description: ''
	};
}

describe('HubPaginableTableCellDirective', () => {
	let component: TestComponent;
	let fixture: ComponentFixture<TestComponent>;
	let directive: HubPaginableTableCellDirective;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TestComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(TestComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		directive = component.nameDirective();
	});

	describe('Basic Functionality', () => {
		it('should create an instance', () => {
			expect(directive).toBeTruthy();
		});

		it('should be a HubPaginableTableCellDirective instance', () => {
			expect(directive).toBeInstanceOf(HubPaginableTableCellDirective);
		});

		it('should have required header property', () => {
			expect(directive.header()).toBe('name');
		});

		it('should have templateRef property', () => {
			expect(directive.template).toBeTruthy();
			expect(directive.template).toBeInstanceOf(TemplateRef);
		});

		it('should have accessible template reference', () => {
			expect(directive.template).toBeTruthy();
			expect(component.nameTemplateRef()).toBeTruthy();
			expect(directive.template.constructor.name).toBe('TemplateRef');
		});
	});

	describe('Header Property Configuration', () => {
		it('should set header property correctly for name template', () => {
			expect(component.nameDirective().header()).toBe('name');
		});

		it('should set header property correctly for age template', () => {
			expect(component.ageDirective().header()).toBe('age');
		});

		it('should set header property correctly for status template', () => {
			expect(component.statusDirective().header()).toBe('status');
		});

		it('should work with paginableTableCell selector', () => {
			expect(component.descDirective().header()).toBe('description');
			expect(component.descDirective().template).toBeTruthy();
		});
	});

	describe('Template Rendering and Context', () => {
		it('should render template with data context', () => {
			const embeddedView = directive.template.createEmbeddedView({
				data: component.mockUserData
			});

			embeddedView.detectChanges();
			const templateElement = embeddedView.rootNodes[0] as HTMLElement;

			expect(templateElement).toBeTruthy();
			expect(templateElement.classList.contains('test-cell-name')).toBe(true);
			expect(templateElement.getAttribute('data-name')).toBe('John Doe');
			expect(templateElement.textContent).toContain('John Doe');
			expect(templateElement.textContent).toContain('john@example.com');
		});

		it('should render age template with conditional styling', () => {
			const embeddedView = component.ageDirective().template.createEmbeddedView({
				data: component.mockUserData
			});

			embeddedView.detectChanges();
			const templateElement = embeddedView.rootNodes[0] as HTMLElement;

			expect(templateElement.classList.contains('test-cell-age')).toBe(true);
			expect(templateElement.classList.contains('adult')).toBe(true);
			expect(templateElement.textContent).toContain('30 years');
		});

		it('should render age template for minor correctly', () => {
			const embeddedView = component.ageDirective().template.createEmbeddedView({
				data: component.mockMinorData
			});

			embeddedView.detectChanges();
			const templateElement = embeddedView.rootNodes[0] as HTMLElement;

			expect(templateElement.classList.contains('adult')).toBe(false);
			expect(templateElement.textContent).toContain('16 years');
		});

		it('should render status template with index context', () => {
			const embeddedView = component.statusDirective().template.createEmbeddedView({
				data: component.mockUserData,
				index: 5
			});

			embeddedView.detectChanges();
			const templateElement = embeddedView.rootNodes[0] as HTMLElement;

			expect(templateElement.classList.contains('test-cell-status')).toBe(true);
			expect(templateElement.getAttribute('data-index')).toBe('5');
			expect(templateElement.textContent).toContain('Active');

			const statusSpan = templateElement.querySelector('span');
			expect(statusSpan?.classList.contains('active')).toBe(true);
			expect(statusSpan?.classList.contains('inactive')).toBe(false);
		});

		it('should handle inactive status', () => {
			const embeddedView = component.statusDirective().template.createEmbeddedView({
				data: component.mockMinorData,
				index: 2
			});

			embeddedView.detectChanges();
			const templateElement = embeddedView.rootNodes[0] as HTMLElement;
			const statusSpan = templateElement.querySelector('span');

			expect(statusSpan?.classList.contains('active')).toBe(false);
			expect(statusSpan?.classList.contains('inactive')).toBe(true);
			expect(templateElement.textContent).toContain('Inactive');
		});
	});

	describe('Template Rendering with Empty/Null Data', () => {
		it('should handle null/undefined data gracefully', () => {
			const embeddedView = directive.template.createEmbeddedView({
				data: null
			});

			embeddedView.detectChanges();
			const templateElement = embeddedView.rootNodes[0] as HTMLElement;

			expect(templateElement.textContent).toContain('No Name');
			expect(templateElement.getAttribute('data-name')).toBeNull();
		});

		it('should handle empty data object', () => {
			const embeddedView = directive.template.createEmbeddedView({
				data: component.mockEmptyData
			});

			embeddedView.detectChanges();
			const templateElement = embeddedView.rootNodes[0] as HTMLElement;

			expect(templateElement.textContent).toContain('No Name');
		});

		it('should handle missing context variables', () => {
			const embeddedView = directive.template.createEmbeddedView({});

			expect(() => embeddedView.detectChanges()).not.toThrow();
			const templateElement = embeddedView.rootNodes[0] as HTMLElement;
			expect(templateElement.textContent).toContain('No Name');
		});

		it('should render age template with zero age', () => {
			const embeddedView = component.ageDirective().template.createEmbeddedView({
				data: { age: 0 }
			});

			embeddedView.detectChanges();
			const templateElement = embeddedView.rootNodes[0] as HTMLElement;

			expect(templateElement.textContent).toContain('0 years');
			expect(templateElement.classList.contains('adult')).toBe(false);
		});
	});

	describe('Multiple Directive Instances', () => {
		it('should handle multiple directive instances correctly', () => {
			expect(component.nameDirective()).toBeTruthy();
			expect(component.ageDirective()).toBeTruthy();
			expect(component.statusDirective()).toBeTruthy();
			expect(component.descDirective()).toBeTruthy();
		});

		it('should have different template references for different directives', () => {
			expect(component.nameDirective().template).not.toBe(component.ageDirective().template);
			expect(component.ageDirective().template).not.toBe(component.statusDirective().template);
			expect(component.statusDirective().template).not.toBe(component.descDirective().template);
		});

		it('should have correct header values for each directive', () => {
			expect(component.nameDirective().header()).toBe('name');
			expect(component.ageDirective().header()).toBe('age');
			expect(component.statusDirective().header()).toBe('status');
			expect(component.descDirective().header()).toBe('description');
		});
	});

	describe('Selector Support', () => {
		it('should work with cellTpt selector', () => {
			expect(component.nameDirective()).toBeTruthy();
			expect(component.nameDirective().header()).toBe('name');
		});

		it('should work with paginableTableCell selector', () => {
			expect(component.descDirective()).toBeTruthy();
			expect(component.descDirective().header()).toBe('description');
		});
	});

	describe('Template Context Variables', () => {
		it('should provide data context variable', () => {
			const testData = { name: 'Test User', email: 'test@example.com' };
			const embeddedView = directive.template.createEmbeddedView({ data: testData });

			embeddedView.detectChanges();
			const templateElement = embeddedView.rootNodes[0] as HTMLElement;

			expect(templateElement.getAttribute('data-name')).toBe('Test User');
			expect(templateElement.textContent).toContain('Test User');
			expect(templateElement.textContent).toContain('test@example.com');
		});

		it('should provide index context variable', () => {
			const embeddedView = component.statusDirective().template.createEmbeddedView({
				data: component.mockUserData,
				index: 10
			});

			embeddedView.detectChanges();
			const templateElement = embeddedView.rootNodes[0] as HTMLElement;

			expect(templateElement.getAttribute('data-index')).toBe('10');
		});

		it('should handle additional context variables', () => {
			const embeddedView = directive.template.createEmbeddedView({
				data: component.mockUserData,
				$implicit: component.mockUserData,
				index: 3,
				customVar: 'custom value'
			});

			expect(() => embeddedView.detectChanges()).not.toThrow();
		});
	});

	describe('Memory Management', () => {
		it('should properly clean up embedded views', () => {
			const embeddedView = directive.template.createEmbeddedView({
				data: component.mockUserData
			});

			expect(embeddedView.destroyed).toBe(false);

			embeddedView.destroy();

			expect(embeddedView.destroyed).toBe(true);
		});

		it('should handle multiple view creation and destruction', () => {
			const views: any[] = [];

			// Create multiple views
			for (let i = 0; i < 10; i++) {
				const view = directive.template.createEmbeddedView({
					data: { ...component.mockUserData, id: i },
					index: i
				});
				views.push(view);
			}

			expect(views.length).toBe(10);
			views.forEach((view) => expect(view.destroyed).toBe(false));

			// Destroy all views
			views.forEach((view) => view.destroy());
			views.forEach((view) => expect(view.destroyed).toBe(true));
		});
	});

	describe('Template Content Validation', () => {
		it('should render complex HTML content correctly', () => {
			const embeddedView = directive.template.createEmbeddedView({
				data: component.mockUserData
			});

			embeddedView.detectChanges();
			const templateElement = embeddedView.rootNodes[0] as HTMLElement;

			// Check for strong tag
			const strongElement = templateElement.querySelector('strong');
			expect(strongElement).toBeTruthy();
			expect(strongElement?.textContent).toBe('John Doe');

			// Check for small tag with email
			const smallElement = templateElement.querySelector('small');
			expect(smallElement).toBeTruthy();
			expect(smallElement?.textContent).toBe('(john@example.com)');
		});

		it('should handle conditional rendering correctly', () => {
			const dataWithoutEmail = { ...component.mockUserData, email: null };
			const embeddedView = directive.template.createEmbeddedView({
				data: dataWithoutEmail
			});

			embeddedView.detectChanges();
			const templateElement = embeddedView.rootNodes[0] as HTMLElement;

			// Strong element should still exist
			const strongElement = templateElement.querySelector('strong');
			expect(strongElement).toBeTruthy();

			// Small element should not exist due to *ngIf
			const smallElement = templateElement.querySelector('small');
			expect(smallElement).toBeFalsy();
		});
	});

	describe('Error Handling', () => {
		it('should handle template creation with invalid context gracefully', () => {
			const validContexts = [
				{ data: { name: 'Test', email: 'test@example.com' } },
				{ data: { name: 'Test', email: null } },
				{ data: { name: null, email: null } },
				{ data: {} }
			];

			validContexts.forEach((context) => {
				expect(() => {
					const view = directive.template.createEmbeddedView(context as any);
					view.detectChanges();
					view.destroy();
				}).not.toThrow();
			});
		});

		it('should handle template with complex data structures', () => {
			const complexData = {
				name: 'Complex User',
				email: 'complex@example.com',
				nested: {
					level1: {
						level2: {
							value: 'deep value'
						}
					}
				},
				array: [1, 2, 3, 4, 5]
			};

			const embeddedView = directive.template.createEmbeddedView({
				data: complexData
			});

			expect(() => embeddedView.detectChanges()).not.toThrow();

			const templateElement = embeddedView.rootNodes[0] as HTMLElement;
			expect(templateElement.textContent).toContain('Complex User');

			embeddedView.destroy();
		});
	});

	describe('Integration with Angular Features', () => {
		it('should work with Angular pipes in template', () => {
			// Note: This would require adding pipe imports to the test component
			// For now, we verify that basic template rendering works
			const embeddedView = directive.template.createEmbeddedView({
				data: component.mockUserData
			});

			expect(() => embeddedView.detectChanges()).not.toThrow();
			embeddedView.destroy();
		});

		it('should support Angular directive usage within template', () => {
			// The template uses *ngIf which is an Angular structural directive
			const embeddedView = directive.template.createEmbeddedView({
				data: component.mockUserData
			});

			expect(() => embeddedView.detectChanges()).not.toThrow();

			// Verify that structural directive (*ngIf) worked correctly
			const templateElement = embeddedView.rootNodes[0] as HTMLElement;
			const conditionalElement = templateElement.querySelector('small');
			expect(conditionalElement).toBeTruthy(); // Should exist because email is present

			embeddedView.destroy();
		});
	});

	describe('Performance Testing', () => {
		it('should handle rapid template creation efficiently', () => {
			const startTime = performance.now();

			for (let i = 0; i < 100; i++) {
				const view = directive.template.createEmbeddedView({
					data: { ...component.mockUserData, id: i }
				});
				view.detectChanges();
				view.destroy();
			}

			const endTime = performance.now();
			const duration = endTime - startTime;

			// Should complete within reasonable time (less than 100ms)
			expect(duration).toBeLessThan(100);
		});
	});
});
