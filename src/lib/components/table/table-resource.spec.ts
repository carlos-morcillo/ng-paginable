import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HubTranslationService } from 'ng-hub-ui-utils';
import { Subject } from 'rxjs';

import { HubPaginableResource } from '../../interfaces/paginable-resource';
import { PaginationState } from '../../interfaces/pagination-state';
import { PaginableService } from '../../services/paginable.service';
import { PaginableConfigService } from '../../services/paginate-config.service';
import { TableComponent } from './table.component';

class MockHubTranslationService {
	translationObserver = new Subject<any>().asObservable();
	getTranslation(key: string) {
		return key;
	}
	setTranslations() {}
	initialize() {}
}

class MockPaginableService {
	config = { language: 'en', mapping: {} };
	get mapping() {
		return this.config.mapping;
	}
	initialize() {}
}

interface Person {
	id: number;
	name: string;
}

/**
 * A hand-rolled stand-in for `resource()` / `httpResource()`, which is the whole point of typing
 * the input structurally: the table asks for three signals, not for a class from a version of
 * Angular this package does not require.
 *
 * Its `value()` rethrows the failure, because Angular's does: a resource in the error state has
 * no value to hand over and says so by throwing. A stand-in that answered politely there was how
 * a table that reads the value before the error came to pass its own tests.
 */
function fakeResource<T>(): HubPaginableResource<T> & {
	set: (value: Array<T> | PaginationState<T> | null) => void;
	setLoading: (value: boolean) => void;
	fail: (error: unknown) => void;
} {
	const value = signal<Array<T> | PaginationState<T> | null>(null);
	const loading = signal(false);
	const error = signal<unknown>(undefined);

	return {
		value: () => {
			const failure = error();
			if (failure) {
				throw failure;
			}
			return value();
		},
		isLoading: () => loading(),
		error: () => error(),
		set: (next) => value.set(next),
		setLoading: (next) => loading.set(next),
		fail: (next) => error.set(next)
	};
}

/**
 * A table fed from a resource: the collection, the loading state and the failure arrive in one
 * binding instead of three the consumer has to keep in step.
 */
@Component({
	standalone: true,
	imports: [TableComponent],
	template: ` <hub-table [headers]="headers" [resource]="resource" /> `
})
class Host {
	readonly headers = [{ title: 'Name', property: 'name' }];
	readonly resource = fakeResource<Person>();
}

describe('table [resource]', () => {
	let fixture: ComponentFixture<Host>;
	let host: Host;

	const table = () => fixture.debugElement.children[0].componentInstance as TableComponent<Person>;
	const bodyRows = () => [...fixture.nativeElement.querySelectorAll('tr.hub-table__body-row')] as HTMLElement[];
	const names = () => bodyRows().map((row) => row.textContent?.trim());

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [Host, BrowserAnimationsModule],
			providers: [
				{ provide: HubTranslationService, useClass: MockHubTranslationService },
				{ provide: PaginableService, useClass: MockPaginableService },
				{ provide: PaginableConfigService, useValue: { language: 'en', mapping: {} } }
			]
		}).compileComponents();
		fixture = TestBed.createComponent(Host);
		host = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('renders the rows of a resource whose value is a plain array', () => {
		host.resource.set([
			{ id: 1, name: 'Ada' },
			{ id: 2, name: 'Grace' }
		]);
		fixture.detectChanges();

		expect(names()).toEqual(['Ada', 'Grace']);
	});

	it('reads the page, the size and the total off a paginated value', () => {
		host.resource.set({
			page: 3,
			perPage: 25,
			totalItems: 120,
			data: [{ id: 7, name: 'Hedy' }]
		});
		fixture.detectChanges();

		expect(names()).toEqual(['Hedy']);
		expect(table().page()).toBe(3);
		expect(table().perPage()).toBe(25);
		expect(table().totalItems()).toBe(120);
	});

	it('draws the loading state while the resource is fetching', () => {
		host.resource.setLoading(true);
		fixture.detectChanges();

		expect(table().loading()).toBe(true);

		host.resource.setLoading(false);
		host.resource.set([{ id: 1, name: 'Ada' }]);
		fixture.detectChanges();

		expect(table().loading()).toBe(false);
		expect(names()).toEqual(['Ada']);
	});

	it('draws the error state when the resource failed', () => {
		host.resource.fail(new Error('boom'));
		fixture.detectChanges();

		expect(table().error()).toBeInstanceOf(Error);
		expect(fixture.nativeElement.querySelector('.hub-table__error')).toBeTruthy();
	});

	it('keeps the rows of the last good load behind the error state', () => {
		host.resource.set([{ id: 1, name: 'Ada' }]);
		fixture.detectChanges();

		host.resource.fail(new Error('boom'));
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.hub-table__error')).toBeTruthy();

		// A refresh that fails should not cost the reader the table they were looking at.
		host.resource.fail(undefined);
		fixture.detectChanges();

		expect(names()).toEqual(['Ada']);
	});
});

/** Bound together, the resource is the more specific statement of intent and wins. */
@Component({
	standalone: true,
	imports: [TableComponent],
	template: ` <hub-table [headers]="headers" [data]="rows" [resource]="resource" /> `
})
class BothHost {
	readonly headers = [{ title: 'Name', property: 'name' }];
	readonly rows: Person[] = [{ id: 99, name: 'From data' }];
	readonly resource = fakeResource<Person>();
}

describe('table [resource] alongside [data]', () => {
	let fixture: ComponentFixture<BothHost>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [BothHost, BrowserAnimationsModule],
			providers: [
				{ provide: HubTranslationService, useClass: MockHubTranslationService },
				{ provide: PaginableService, useClass: MockPaginableService },
				{ provide: PaginableConfigService, useValue: { language: 'en', mapping: {} } }
			]
		}).compileComponents();
		fixture = TestBed.createComponent(BothHost);
		fixture.detectChanges();
	});

	it('renders the resource, not the array', () => {
		fixture.componentInstance.resource.set([{ id: 1, name: 'From resource' }]);
		fixture.detectChanges();

		const names = [...fixture.nativeElement.querySelectorAll('tr.hub-table__body-row')].map((row: any) =>
			row.textContent?.trim()
		);
		expect(names).toEqual(['From resource']);
	});
});
