import { TestBed } from '@angular/core/testing';
import { MenuFilterOperators, NumberMatchModes, StringMatchModes } from '../interfaces/column-filter-event';
import { PaginableTableHeader } from '../interfaces/paginable-table-header';
import { TableRow } from '../interfaces/table-row';
import { TableClientDataService } from './table-client-data.service';

/** Wraps raw data into a {@link TableRow} for the tests. */
const row = <T>(data: T): TableRow<T> => ({ selected: false, collapsed: true, data });

interface Person {
	name: string;
	age: number;
	active: boolean;
	profile?: { score: number };
}

describe('TableClientDataService', () => {
	let service: TableClientDataService;

	const people: Array<TableRow<Person>> = [
		row({ name: 'John', age: 30, active: true, profile: { score: 80 } }),
		row({ name: 'Jane', age: 25, active: false, profile: { score: 95 } }),
		row({ name: 'Joana', age: 40, active: true, profile: { score: 60 } }),
		row({ name: 'Mark', age: 18, active: false, profile: { score: 70 } })
	];

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(TableClientDataService);
	});

	describe('search', () => {
		it('matches case-insensitively across keys', () => {
			const result = service.search(people, 'jo', ['name']);
			expect(result.map((r) => r.data.name)).toEqual(['John', 'Joana']);
		});

		it('returns all rows for a blank term', () => {
			expect(service.search(people, '   ', ['name']).length).toBe(people.length);
		});

		it('returns all rows when there are no keys', () => {
			expect(service.search(people, 'jo', []).length).toBe(people.length);
		});
	});

	describe('sort', () => {
		it('sorts ascending by a numeric property', () => {
			const result = service.sort(people, { property: 'age', direction: 'ASC' });
			expect(result.map((r) => r.data.age)).toEqual([18, 25, 30, 40]);
		});

		it('sorts descending by a numeric property', () => {
			const result = service.sort(people, { property: 'age', direction: 'DESC' });
			expect(result.map((r) => r.data.age)).toEqual([40, 30, 25, 18]);
		});

		it('sorts by a nested property path', () => {
			const result = service.sort(people, { property: 'profile.score', direction: 'ASC' });
			expect(result.map((r) => r.data.profile?.score)).toEqual([60, 70, 80, 95]);
		});

		it('does not mutate the input array', () => {
			const copy = people.concat();
			service.sort(people, { property: 'age', direction: 'DESC' });
			expect(people).toEqual(copy);
		});
	});

	describe('applyColumnFilters — row mode', () => {
		it('filters by a dropdown value (loose equality)', () => {
			const headers: PaginableTableHeader[] = [{ property: 'name', filter: { type: 'dropdown', options: [] } }];
			const result = service.applyColumnFilters(people, headers, { name: 'Jane' });
			expect(result.map((r) => r.data.name)).toEqual(['Jane']);
		});

		it('filters by a boolean value', () => {
			const headers: PaginableTableHeader[] = [{ property: 'active', filter: { type: 'boolean' } }];
			const result = service.applyColumnFilters(people, headers, { active: true });
			expect(result.map((r) => r.data.name)).toEqual(['John', 'Joana']);
		});

		it('treats boolean false as an active filter', () => {
			const headers: PaginableTableHeader[] = [{ property: 'active', filter: { type: 'boolean' } }];
			const result = service.applyColumnFilters(people, headers, { active: false });
			expect(result.map((r) => r.data.name)).toEqual(['Jane', 'Mark']);
		});

		it('filters by a number range, ignoring null bounds', () => {
			const headers: PaginableTableHeader[] = [{ property: 'age', filter: { type: 'number-range' } }];
			const result = service.applyColumnFilters(people, headers, { age: [20, 35] });
			expect(result.map((r) => r.data.name)).toEqual(['John', 'Jane']);

			const openEnded = service.applyColumnFilters(people, headers, { age: [null, 25] });
			expect(openEnded.map((r) => r.data.name)).toEqual(['Jane', 'Mark']);
		});

		it('filters text by case-insensitive substring', () => {
			const headers: PaginableTableHeader[] = [{ property: 'name', filter: { type: 'text' } }];
			const result = service.applyColumnFilters(people, headers, { name: 'jo' });
			expect(result.map((r) => r.data.name)).toEqual(['John', 'Joana']);
		});

		it('ignores empty filter values', () => {
			const headers: PaginableTableHeader[] = [{ property: 'name', filter: { type: 'text' } }];
			expect(service.applyColumnFilters(people, headers, { name: '' }).length).toBe(people.length);
			expect(service.applyColumnFilters(people, headers, {}).length).toBe(people.length);
		});
	});

	describe('applyColumnFilters — menu mode', () => {
		const menuHeader = (type: string): PaginableTableHeader[] => [
			{ property: type === 'number' ? 'age' : 'name', filter: { type: type as any, mode: 'menu' } }
		];

		it('evaluates a string "Contains" rule', () => {
			const result = service.applyColumnFilters(people, menuHeader('text'), {
				name: { operator: MenuFilterOperators.And, rules: [{ value: 'an', matchMode: StringMatchModes.Contains }] }
			});
			expect(result.map((r) => r.data.name)).toEqual(['Jane', 'Joana']);
		});

		it('evaluates a number "GreaterThan" rule', () => {
			const result = service.applyColumnFilters(people, menuHeader('number'), {
				age: {
					operator: MenuFilterOperators.And,
					rules: [{ value: '28' as any, matchMode: NumberMatchModes.GreaterThan }]
				}
			});
			expect(result.map((r) => r.data.name)).toEqual(['John', 'Joana']);
		});

		it('combines rules with AND', () => {
			const result = service.applyColumnFilters(people, menuHeader('number'), {
				age: {
					operator: MenuFilterOperators.And,
					rules: [
						{ value: '20' as any, matchMode: NumberMatchModes.GreaterThan },
						{ value: '35' as any, matchMode: NumberMatchModes.LessThan }
					]
				}
			});
			expect(result.map((r) => r.data.name)).toEqual(['John', 'Jane']);
		});

		it('combines rules with OR', () => {
			const result = service.applyColumnFilters(people, menuHeader('number'), {
				age: {
					operator: MenuFilterOperators.Or,
					rules: [
						{ value: '18' as any, matchMode: NumberMatchModes.Equal },
						{ value: '40' as any, matchMode: NumberMatchModes.Equal }
					]
				}
			});
			expect(result.map((r) => r.data.name)).toEqual(['Joana', 'Mark']);
		});
	});

	describe('process', () => {
		it('runs search, filtering and sorting together', () => {
			const headers: PaginableTableHeader[] = [{ property: 'name' }, { property: 'active', filter: { type: 'boolean' } }];
			const result = service.process(people, {
				searchTerm: 'jo',
				searchKeys: ['name'],
				headers,
				filters: { active: true },
				ordination: { property: 'age', direction: 'DESC' }
			});
			// 'jo' → John, Joana; active=true keeps both; sorted by age DESC.
			expect(result.map((r) => r.data.name)).toEqual(['Joana', 'John']);
		});
	});
});
