import { TestBed } from '@angular/core/testing';
import { HubPaginationService } from './pagination.service';

/**
 * Test suite for HubPaginationService
 * Tests pagination, filtering, and sorting functionality for table data
 */
describe('HubPaginationService', () => {
	let service: HubPaginationService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [HubPaginationService]
		});
		service = TestBed.inject(HubPaginationService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('generate', () => {
		const mockData = [
			{ id: 1, name: 'Alice', age: 30 },
			{ id: 2, name: 'Bob', age: 25 },
			{ id: 3, name: 'Charlie', age: 35 },
			{ id: 4, name: 'David', age: 28 },
			{ id: 5, name: 'Eve', age: 32 }
		];

		it('should generate pagination for first page', () => {
			const result = service.generate(mockData, {
				page: 1,
				perPage: 2,
				paginate: true
			});

			expect(result.currentPage).toBe(1);
			expect(result.perPage).toBe(2);
			expect(result.total).toBe(5);
			expect(result.lastPage).toBe(3);
			expect(result.data.length).toBe(2);
			expect(result.data[0].name).toBe('Alice');
			expect(result.data[1].name).toBe('Bob');
		});

		it('should generate pagination for second page', () => {
			const result = service.generate(mockData, {
				page: 2,
				perPage: 2,
				paginate: true
			});

			expect(result.currentPage).toBe(2);
			expect(result.data.length).toBe(2);
			expect(result.data[0].name).toBe('Charlie');
			expect(result.data[1].name).toBe('David');
		});

		it('should generate pagination for last page with remaining items', () => {
			const result = service.generate(mockData, {
				page: 3,
				perPage: 2,
				paginate: true
			});

			expect(result.currentPage).toBe(3);
			expect(result.data.length).toBe(1);
			expect(result.data[0].name).toBe('Eve');
		});

		it('should use default page 1 if not specified', () => {
			const result = service.generate(mockData, {
				perPage: 2,
				paginate: true
			});

			expect(result.currentPage).toBe(1);
		});

		it('should use default perPage 20 if not specified and paginate is true', () => {
			const result = service.generate(mockData, {
				page: 1
			});

			expect(result.perPage).toBe(20);
		});

		it('should return all items when paginate is false', () => {
			const result = service.generate(mockData, {
				page: 1,
				perPage: 2,
				paginate: false
			});

			expect(result.data.length).toBe(5);
			expect(result.perPage).toBe(5);
		});

		it('should default paginate to true when not specified', () => {
			const result = service.generate(mockData, {
				page: 1,
				perPage: 2
			});

			expect(result.data.length).toBe(2);
		});

		it('should filter items by searchText and searchKeys', () => {
			const result = service.generate(mockData, {
				page: 1,
				perPage: 10,
				searchText: 'ali',
				searchKeys: ['name']
			});

			expect(result.total).toBe(1);
			expect(result.data.length).toBe(1);
			expect(result.data[0].name).toBe('Alice');
		});

		it('should filter items case-insensitively', () => {
			const result = service.generate(mockData, {
				page: 1,
				perPage: 10,
				searchText: 'alice', // lowercase matches 'Alice'
				searchKeys: ['name']
			});

			expect(result.total).toBe(1);
			expect(result.data[0].name).toBe('Alice');
		});

		it('should filter across multiple searchKeys', () => {
			const result = service.generate(mockData, {
				page: 1,
				perPage: 10,
				searchText: '30',
				searchKeys: ['name', 'age']
			});

			expect(result.total).toBe(1);
			expect(result.data[0].age).toBe(30);
		});

		it('should ignore empty searchText', () => {
			const result = service.generate(mockData, {
				page: 1,
				perPage: 10,
				searchText: '   ',
				searchKeys: ['name']
			});

			expect(result.total).toBe(5);
		});

		it('should return empty data for empty items array', () => {
			const result = service.generate([], {
				page: 1,
				perPage: 10
			});

			expect(result.data).toEqual([]);
			expect(result.total).toBe(0);
		});

		it('should handle null items array', () => {
			const result = service.generate(null as any, {
				page: 1,
				perPage: 10
			});

			expect(result.data).toEqual([]);
			expect(result.total).toBe(0);
		});

		it('should sort items with ordination ASC', () => {
			const result = service.generate(mockData, {
				page: 1,
				perPage: 10,
				ordination: {
					property: 'age',
					direction: 'ASC'
				}
			});

			expect(result.data[0].age).toBe(25);
			expect(result.data[1].age).toBe(28);
			expect(result.data[2].age).toBe(30);
			expect(result.data[3].age).toBe(32);
			expect(result.data[4].age).toBe(35);
		});

		it('should sort items with ordination DESC', () => {
			const result = service.generate(mockData, {
				page: 1,
				perPage: 10,
				ordination: {
					property: 'age',
					direction: 'DESC'
				}
			});

			expect(result.data[0].age).toBe(35);
			expect(result.data[1].age).toBe(32);
			expect(result.data[2].age).toBe(30);
			expect(result.data[3].age).toBe(28);
			expect(result.data[4].age).toBe(25);
		});

		it('should combine search and ordination', () => {
			const result = service.generate(mockData, {
				page: 1,
				perPage: 10,
				searchText: 'e',
				searchKeys: ['name'],
				ordination: {
					property: 'age',
					direction: 'ASC'
				}
			});

			// Alice, Charlie, Eve match 'e'
			expect(result.total).toBe(3);
			expect(result.data[0].name).toBe('Alice'); // age 30
			expect(result.data[1].name).toBe('Eve'); // age 32
			expect(result.data[2].name).toBe('Charlie'); // age 35
		});

		it('should calculate correct pagination metadata', () => {
			const result = service.generate(mockData, {
				page: 2,
				perPage: 2
			});

			expect(result.from).toBe(2);
			expect(result.to).toBe(4);
			expect(result.total).toBe(5);
			expect(result.lastPage).toBe(3);
		});
	});

	describe('orderBy', () => {
		const items = [
			{ id: 1, name: 'Charlie', score: 85 },
			{ id: 2, name: 'Alice', score: 92 },
			{ id: 3, name: 'Bob', score: 78 }
		];

		it('should sort in ASC order by default', () => {
			const result = service.orderBy([...items], 'name', 'ASC');
			expect(result[0].name).toBe('Alice');
			expect(result[1].name).toBe('Bob');
			expect(result[2].name).toBe('Charlie');
		});

		it('should sort in DESC order', () => {
			const result = service.orderBy([...items], 'name', 'DESC');
			expect(result[0].name).toBe('Charlie');
			expect(result[1].name).toBe('Bob');
			expect(result[2].name).toBe('Alice');
		});

		it('should sort numeric values', () => {
			const result = service.orderBy([...items], 'score', 'ASC');
			expect(result[0].score).toBe(78);
			expect(result[1].score).toBe(85);
			expect(result[2].score).toBe(92);
		});

		it('should handle nested properties', () => {
			const nestedItems = [{ user: { name: 'Charlie' } }, { user: { name: 'Alice' } }, { user: { name: 'Bob' } }];

			const result = service.orderBy(nestedItems, 'user.name', 'ASC');
			expect(result[0].user.name).toBe('Alice');
			expect(result[1].user.name).toBe('Bob');
			expect(result[2].user.name).toBe('Charlie');
		});

		it('should maintain stable sort for equal values', () => {
			const sameScoreItems = [
				{ id: 1, score: 85 },
				{ id: 2, score: 85 },
				{ id: 3, score: 85 }
			];

			const result = service.orderBy(sameScoreItems, 'score', 'ASC');
			// Stable sort should preserve original order for equal elements
			expect(result.length).toBe(3);
		});

		it('should sort the array in place (mutates original)', () => {
			const result = service.orderBy(items, 'name', 'ASC');

			// The method mutates and returns the same array
			expect(result).toBe(items);
			expect(result[0].name).toBe('Alice');
			expect(result[1].name).toBe('Bob');
			expect(result[2].name).toBe('Charlie');
		});
	});

	describe('get', () => {
		const obj = {
			name: 'John',
			address: {
				city: 'New York',
				zip: {
					code: '10001'
				}
			}
		};

		it('should get top-level property', () => {
			const result = service.get(obj, 'name');
			expect(result).toBe('John');
		});

		it('should get nested property with dot notation', () => {
			const result = service.get(obj, 'address.city');
			expect(result).toBe('New York');
		});

		it('should get deeply nested property', () => {
			const result = service.get(obj, 'address.zip.code');
			expect(result).toBe('10001');
		});

		it('should return undefined for non-existent property', () => {
			const result = service.get(obj, 'nonexistent');
			expect(result).toBeUndefined();
		});

		it('should return undefined for non-existent nested property', () => {
			const result = service.get(obj, 'address.country');
			expect(result).toBeUndefined();
		});

		it('should handle array path', () => {
			const result = service.get(obj, ['address', 'city']);
			expect(result).toBe('New York');
		});

		it('should handle empty object', () => {
			const result = service.get({}, 'any.path');
			expect(result).toBeUndefined();
		});

		it('should handle null object', () => {
			const result = service.get(null, 'any.path');
			expect(result).toBeUndefined();
		});
	});
});
