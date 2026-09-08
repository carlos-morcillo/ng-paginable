import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginableStateContext, PaginableStateDefault, ResolvedStateDefault } from '../../interfaces/paginable-state';
import { HubPaginableStateOutlet } from './paginable-state-outlet.component';

@Component({ selector: 'hub-global-state', standalone: true, template: '<span class="global">global</span>' })
class GlobalComponent {}

@Component({ selector: 'hub-instance-state', standalone: true, template: '<span class="instance">instance</span>' })
class InstanceComponent {}

@Component({
	selector: 'hub-inputs-state',
	standalone: true,
	template: '<span class="with-inputs">{{ message() }}</span>'
})
class InputsComponent {
	readonly message = input('');
}

@Component({
	standalone: true,
	imports: [HubPaginableStateOutlet],
	template: `
		<ng-template #fallback><span class="fallback">fallback</span></ng-template>
		<ng-template #local><span class="local">local</span></ng-template>
		<hub-state-outlet
			[template]="useLocal ? local : null"
			[instanceDefault]="instanceDefault"
			[globalDefault]="globalDefault"
			[fallback]="fallback"
			[context]="context"
		/>
	`
})
class HostComponent {
	useLocal = false;
	instanceDefault: PaginableStateDefault | null = null;
	globalDefault: ResolvedStateDefault | null = null;
	context: PaginableStateContext = {};
}

describe('HubPaginableStateOutlet', () => {
	let fixture: ComponentFixture<HostComponent>;
	let host: HostComponent;

	const html = () => fixture.nativeElement.innerHTML as string;

	beforeEach(() => {
		fixture = TestBed.createComponent(HostComponent);
		host = fixture.componentInstance;
	});

	it('renders the built-in fallback when nothing is provided', () => {
		fixture.detectChanges();
		expect(html()).toContain('fallback');
	});

	it('renders the global default component over the fallback', () => {
		host.globalDefault = { component: GlobalComponent };
		fixture.detectChanges();
		expect(html()).toContain('global');
		expect(html()).not.toContain('fallback');
	});

	it('renders the instance default over the global default', () => {
		host.globalDefault = { component: GlobalComponent };
		host.instanceDefault = InstanceComponent;
		fixture.detectChanges();
		expect(html()).toContain('instance');
		expect(html()).not.toContain('global');
	});

	it('renders the local directive template over every component default', () => {
		host.globalDefault = { component: GlobalComponent };
		host.instanceDefault = InstanceComponent;
		host.useLocal = true;
		fixture.detectChanges();
		expect(html()).toContain('local');
		expect(html()).not.toContain('global');
		expect(html()).not.toContain('instance');
	});

	it('passes inputs from the descriptor factory to the component', () => {
		host.globalDefault = { component: InputsComponent, inputs: (ctx) => ({ message: ctx.error }) };
		host.context = { error: 'hello' };
		fixture.detectChanges();
		expect(html()).toContain('hello');
	});

	it('falls back while a lazy instance default is pending, then swaps in', async () => {
		host.globalDefault = { component: GlobalComponent };
		host.instanceDefault = () => Promise.resolve(InstanceComponent);
		fixture.detectChanges();
		// Pending: instance not yet resolved, so the global default shows.
		expect(html()).toContain('global');

		await fixture.whenStable();
		fixture.detectChanges();
		expect(html()).toContain('instance');
	});
});
