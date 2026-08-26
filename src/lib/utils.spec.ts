import { TestBed } from '@angular/core/testing';
import { ApplicationRef, signal } from '@angular/core';
// These utilities were migrated to `ng-hub-ui-utils`; the local `./utils` now only keeps
// `normalizeStateDefault`. Import from the package root so this suite tests the real
// (re-exported) implementations instead of failing to compile.
import {
	debouncedSignal,
	equals,
	isDefined,
	isObject,
	mergeDeep,
	generateUniqueId,
	interpolateString,
	getValue
} from 'ng-hub-ui-utils';

/**
 * Test suite for utility functions
 * Tests core utility functions used throughout the table library
 */
describe('Utils', () => {
	describe('equals', () => {
		it('should return true for identical primitives', () => {
			expect(equals(1, 1)).toBe(true);
			expect(equals('test', 'test')).toBe(true);
			expect(equals(true, true)).toBe(true);
		});

		it('should return false for different primitives', () => {
			expect(equals(1, 2)).toBe(false);
			expect(equals('test', 'other')).toBe(false);
			expect(equals(true, false)).toBe(false);
		});

		it('should return true for both null values', () => {
			expect(equals(null, null)).toBe(true);
		});

		it('should return false if one value is null', () => {
			expect(equals(null, 1)).toBe(false);
			expect(equals(1, null)).toBe(false);
		});

		it('should return true for NaN values', () => {
			expect(equals(NaN, NaN)).toBe(true);
		});

		it('should return true for equal arrays', () => {
			expect(equals([1, 2, 3], [1, 2, 3])).toBe(true);
			expect(equals(['a', 'b'], ['a', 'b'])).toBe(true);
		});

		it('should return false for different arrays', () => {
			expect(equals([1, 2, 3], [1, 2, 4])).toBe(false);
			expect(equals([1, 2], [1, 2, 3])).toBe(false);
		});

		it('should return true for equal nested arrays', () => {
			expect(equals([1, [2, 3]], [1, [2, 3]])).toBe(true);
		});

		it('should return false for different nested arrays', () => {
			expect(equals([1, [2, 3]], [1, [2, 4]])).toBe(false);
		});

		it('should return true for equal objects', () => {
			expect(equals({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
		});

		it('should return false for different objects', () => {
			expect(equals({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
		});

		it('should return false for objects with different keys', () => {
			expect(equals({ a: 1 }, { a: 1, b: 2 })).toBe(false);
		});

		it('should return true for equal nested objects', () => {
			expect(equals({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
		});

		it('should return false for different nested objects', () => {
			expect(equals({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
		});

		it('should return false when comparing array to object', () => {
			expect(equals([], {})).toBe(false);
			expect(equals({}, [])).toBe(false);
		});

		it('should handle undefined values in objects', () => {
			expect(equals({ a: undefined }, { a: undefined })).toBe(true);
			expect(equals({ a: 1 }, { a: undefined })).toBe(false);
		});

		it('should return true for empty objects', () => {
			expect(equals({}, {})).toBe(true);
		});

		it('should return true for empty arrays', () => {
			expect(equals([], [])).toBe(true);
		});
	});

	describe('isDefined', () => {
		it('should return true for defined values', () => {
			expect(isDefined(0)).toBe(true);
			expect(isDefined('')).toBe(true);
			expect(isDefined(false)).toBe(true);
			expect(isDefined([])).toBe(true);
			expect(isDefined({})).toBe(true);
		});

		it('should return false for undefined', () => {
			expect(isDefined(undefined)).toBe(false);
		});

		it('should return false for null', () => {
			expect(isDefined(null)).toBe(false);
		});
	});

	describe('isObject', () => {
		it('should return true for plain objects', () => {
			expect(isObject({})).toBe(true);
			expect(isObject({ a: 1 })).toBe(true);
		});

		it('should return false for arrays', () => {
			expect(isObject([])).toBe(false);
			expect(isObject([1, 2, 3])).toBe(false);
		});

		it('should return false for primitives', () => {
			expect(isObject(1)).toBe(false);
			expect(isObject('string')).toBe(false);
			expect(isObject(true)).toBe(false);
		});

		it('should return falsy for null and undefined', () => {
			// isObject returns the truthy/falsy result of the condition
			expect(isObject(null)).toBeFalsy();
			expect(isObject(undefined)).toBeFalsy();
		});
	});

	describe('mergeDeep', () => {
		it('should merge simple objects', () => {
			const target = { a: 1, b: 2 };
			const source = { b: 3, c: 4 };
			const result = mergeDeep(target, source);

			expect(result).toEqual({ a: 1, b: 3, c: 4 });
			expect(target).toEqual({ a: 1, b: 2 }); // Original unchanged
		});

		it('should merge nested objects', () => {
			const target = { a: { b: 1, c: 2 } };
			const source = { a: { c: 3, d: 4 } };
			const result = mergeDeep(target, source);

			expect(result).toEqual({ a: { b: 1, c: 3, d: 4 } });
		});

		it('should handle deep nesting', () => {
			const target = { a: { b: { c: 1 } } };
			const source = { a: { b: { d: 2 } } };
			const result = mergeDeep(target, source);

			expect(result.a.b).toEqual({ c: 1, d: 2 });
		});

		it('should add new properties from source', () => {
			const target = { a: 1 };
			const source = { b: 2, c: 3 };
			const result = mergeDeep(target, source);

			expect(result).toEqual({ a: 1, b: 2, c: 3 });
		});

		it('should override primitive values', () => {
			const target = { a: 1 };
			const source = { a: 2 };
			const result = mergeDeep(target, source);

			expect(result.a).toBe(2);
		});

		it('should handle empty objects', () => {
			expect(mergeDeep({}, { a: 1 })).toEqual({ a: 1 });
			expect(mergeDeep({ a: 1 }, {})).toEqual({ a: 1 });
		});

		it('should not merge arrays', () => {
			const target = { arr: [1, 2] };
			const source = { arr: [3, 4] };
			const result = mergeDeep(target, source);

			expect(result.arr).toEqual([3, 4]);
		});

		it('should handle non-object sources', () => {
			const target = { a: 1 };
			const result = mergeDeep(target, null);

			expect(result).toEqual({ a: 1 });
		});
	});

	describe('generateUniqueId', () => {
		it('should generate id of specified length', () => {
			expect(generateUniqueId(10).length).toBe(10);
			expect(generateUniqueId(16).length).toBe(16);
			expect(generateUniqueId(32).length).toBe(32);
		});

		it('should generate different ids', () => {
			const id1 = generateUniqueId(16);
			const id2 = generateUniqueId(16);

			// While theoretically possible they could be the same, it's extremely unlikely
			expect(id1).not.toBe(id2);
		});

		it('should only contain alphanumeric characters', () => {
			const id = generateUniqueId(100);
			expect(id).toMatch(/^[A-Za-z0-9]+$/);
		});

		it('should handle zero length', () => {
			expect(generateUniqueId(0)).toBe('');
		});

		it('should handle length of 1', () => {
			expect(generateUniqueId(1).length).toBe(1);
		});
	});

	describe('interpolateString', () => {
		it('should replace simple placeholders', () => {
			const result = interpolateString('Hello {{name}}', { name: 'World' });
			expect(result).toBe('Hello World');
		});

		it('should replace multiple placeholders', () => {
			const result = interpolateString('{{greeting}} {{name}}!', {
				greeting: 'Hello',
				name: 'World'
			});
			expect(result).toBe('Hello World!');
		});

		it('should handle nested properties', () => {
			const result = interpolateString('Hello {{user.name}}', {
				user: { name: 'John' }
			});
			expect(result).toBe('Hello John');
		});

		it('should return original string when no params', () => {
			const result = interpolateString('Hello {{name}}');
			expect(result).toBe('Hello {{name}}');
		});

		it('should keep placeholder if value undefined', () => {
			const result = interpolateString('Hello {{name}}', { other: 'value' });
			expect(result).toBe('Hello {{name}}');
		});

		it('should handle empty string', () => {
			const result = interpolateString('', { name: 'World' });
			expect(result).toBe('');
		});

		it('should handle null params', () => {
			const result = interpolateString('Hello {{name}}', null);
			expect(result).toBe('Hello {{name}}');
		});

		it('should replace with falsy values', () => {
			expect(interpolateString('{{value}}', { value: 0 })).toBe('0');
			expect(interpolateString('{{value}}', { value: false })).toBe('false');
			expect(interpolateString('{{value}}', { value: '' })).toBe('');
		});

		it('should handle placeholders with spaces', () => {
			const result = interpolateString('{{ name }}', { name: 'World' });
			expect(result).toBe('World');
		});
	});

	describe('getValue', () => {
		const testObject = {
			name: 'John',
			age: 30,
			address: {
				city: 'New York',
				zip: {
					code: '10001'
				}
			},
			hobbies: ['reading', 'gaming']
		};

		it('should get simple property', () => {
			expect(getValue(testObject, 'name')).toBe('John');
			expect(getValue(testObject, 'age')).toBe(30);
		});

		it('should get nested property', () => {
			expect(getValue(testObject, 'address.city')).toBe('New York');
		});

		it('should get deeply nested property', () => {
			expect(getValue(testObject, 'address.zip.code')).toBe('10001');
		});

		it('should return undefined for non-existent property', () => {
			expect(getValue(testObject, 'nonExistent')).toBeUndefined();
		});

		it('should return undefined for non-existent nested property', () => {
			expect(getValue(testObject, 'address.nonExistent')).toBeUndefined();
		});

		it('should handle array access', () => {
			expect(getValue(testObject, 'hobbies')).toEqual(['reading', 'gaming']);
		});

		it('should handle null target', () => {
			expect(getValue(null, 'name')).toBeUndefined();
		});

		it('should handle undefined target', () => {
			expect(getValue(undefined, 'name')).toBeUndefined();
		});

		it('should handle empty key', () => {
			// Empty string key returns undefined as target[''] doesn't exist
			expect(getValue(testObject, '')).toBeUndefined();
		});
	});

	describe('debouncedSignal', () => {
		/**
		 * Awaits a real timer.
		 *
		 * These tests drive `debouncedSignal` with real timers, so the wait after the last change
		 * must clear the debounce window by a wide margin. A tight margin (the old 35ms against a
		 * 20ms debounce whose last change landed at 10ms) loses the race under load — and because
		 * the assertion used to live inside a `setTimeout`, a failure never resolved the promise and
		 * the test died of a 5s timeout instead of reporting what went wrong.
		 *
		 * @param ms - Milliseconds to wait.
		 * @returns A promise resolved once the timer fires.
		 */
		const after = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

		beforeEach(() => {
			TestBed.configureTestingModule({});
		});

		it('should create a debounced signal', () =>
			new Promise<void>((resolve) => {
				TestBed.runInInjectionContext(() => {
					const appRef = TestBed.inject(ApplicationRef);
					const source = signal(0);
					const debounced = debouncedSignal(source, 10);

					expect(debounced()).toBe(0);

					source.set(1);
					// Flush the effect so it schedules the debounced update.
					appRef.tick();
					// Immediate value should still be 0
					expect(debounced()).toBe(0);

					setTimeout(() => {
						// After debounce delay, value should update
						expect(debounced()).toBe(1);
						resolve();
					}, 15);
				});
			}));

		it('should use default delay of 0', async () => {
			const appRef = TestBed.inject(ApplicationRef);
			const source = signal('initial');
			const debounced = TestBed.runInInjectionContext(() => debouncedSignal(source));

			source.set('updated');
			// Flush the effect so it schedules the debounced update.
			appRef.tick();

			await after(30);
			expect(debounced()).toBe('updated');
		});

		it('should accept signal for debounce delay', async () => {
			const appRef = TestBed.inject(ApplicationRef);
			const delay = signal(10);
			const source = signal(0);
			const debounced = TestBed.runInInjectionContext(() => debouncedSignal(source, delay));

			source.set(1);
			// Flush the effect so it schedules the debounced update.
			appRef.tick();

			await after(60);
			expect(debounced()).toBe(1);
		});

		it('should cancel previous timeout on rapid changes', async () => {
			const appRef = TestBed.inject(ApplicationRef);
			const source = signal(0);
			const debounced = TestBed.runInInjectionContext(() => debouncedSignal(source, 20));

			source.set(1);
			appRef.tick();
			await after(5);

			source.set(2);
			appRef.tick();
			await after(5);

			source.set(3);
			appRef.tick();

			// Each change restarts the window, so nothing has landed 10ms into a 20ms debounce.
			expect(debounced()).toBe(0);

			// Only the last value should be set.
			await after(80);
			expect(debounced()).toBe(3);
		});
	});
});
