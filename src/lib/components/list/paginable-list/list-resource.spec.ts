import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HubTranslationService } from 'ng-hub-ui-utils';
import { Subject } from 'rxjs';

import { HubPaginableResource } from '../../../interfaces/paginable-resource';
import { PaginationState } from '../../../interfaces/pagination-state';
import { HubListComponent } from './list.component';

class MockHubTranslationService {
	readonly translationObserver = new Subject<any>().asObservable();
	getTranslation(key: string) {
		return key;
	}
	setTranslations() {}
	initialize() {}
}

interface Room {
	id: number;
	label: string;
}

/**
 * A stand-in for `resource()` / `httpResource()`. The input is typed by shape rather than by
 * `ResourceRef`, which is exactly what lets three plain signals stand in for one here — and what
 * keeps the package's `@angular/core >= 18` floor where it is.
 *
 * Its `value()` rethrows the failure, because Angular's does: a resource in the error state has
 * no value to hand over and says so by throwing.
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

@Component({
	standalone: true,
	imports: [HubListComponent],
	template: ` <hub-list [resource]="resource" /> `
})
class Host {
	readonly resource = fakeResource<Room>();
}

describe('list [resource]', () => {
	let fixture: ComponentFixture<Host>;
	let host: Host;

	const list = () => fixture.debugElement.children[0].componentInstance as HubListComponent<Room>;
	const labels = () =>
		[...fixture.nativeElement.querySelectorAll('.hub-list__label')].map((label: any) => label.textContent?.trim());

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [Host],
			providers: [{ provide: HubTranslationService, useClass: MockHubTranslationService }]
		}).compileComponents();
		fixture = TestBed.createComponent(Host);
		host = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('renders the items of a resource whose value is a plain array', () => {
		host.resource.set([
			{ id: 1, label: 'Blue room' },
			{ id: 2, label: 'Green room' }
		]);
		fixture.detectChanges();

		expect(labels()).toEqual(['Blue room', 'Green room']);
	});

	it('reads the page, the size and the total off a paginated value', () => {
		host.resource.set({
			page: 2,
			perPage: 25,
			totalItems: 80,
			data: [{ id: 9, label: 'Red room' }]
		});
		fixture.detectChanges();

		expect(labels()).toEqual(['Red room']);
		expect(list().page()).toBe(2);
		expect(list().perPage()).toBe(25);
		expect(list().totalItems()).toBe(80);
	});

	it('draws the loading state while the resource is fetching, and the items once it is not', () => {
		host.resource.setLoading(true);
		fixture.detectChanges();

		expect(list().loading()).toBe(true);
		expect(fixture.nativeElement.querySelector('.hub-list__item--state')).toBeTruthy();

		host.resource.setLoading(false);
		host.resource.set([{ id: 1, label: 'Blue room' }]);
		fixture.detectChanges();

		expect(list().loading()).toBe(false);
		expect(labels()).toEqual(['Blue room']);
	});

	it('draws the error state when the resource failed', () => {
		host.resource.fail(new Error('boom'));
		fixture.detectChanges();

		expect(list().error()).toBeInstanceOf(Error);
		expect(fixture.nativeElement.querySelector('.hub-list__error')).toBeTruthy();
	});

	it('keeps the items of the last good load behind the error state', () => {
		host.resource.set([{ id: 1, label: 'Blue room' }]);
		fixture.detectChanges();

		host.resource.fail(new Error('boom'));
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.hub-list__error')).toBeTruthy();

		// A refresh that fails should not cost the reader the list they were looking at.
		host.resource.fail(undefined);
		fixture.detectChanges();

		expect(labels()).toEqual(['Blue room']);
	});
});

/** Bound together, the resource is the more specific statement of intent and wins. */
@Component({
	standalone: true,
	imports: [HubListComponent],
	template: ` <hub-list [items]="items" [resource]="resource" /> `
})
class BothHost {
	readonly items: Room[] = [{ id: 99, label: 'From items' }];
	readonly resource = fakeResource<Room>();
}

describe('list [resource] alongside [items]', () => {
	let fixture: ComponentFixture<BothHost>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [BothHost],
			providers: [{ provide: HubTranslationService, useClass: MockHubTranslationService }]
		}).compileComponents();
		fixture = TestBed.createComponent(BothHost);
		fixture.detectChanges();
	});

	it('renders the resource, not the array', () => {
		fixture.componentInstance.resource.set([{ id: 1, label: 'From resource' }]);
		fixture.detectChanges();

		const labels = [...fixture.nativeElement.querySelectorAll('.hub-list__label')].map((label: any) =>
			label.textContent?.trim()
		);
		expect(labels).toEqual(['From resource']);
	});
});
