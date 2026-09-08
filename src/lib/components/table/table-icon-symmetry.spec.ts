import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HubTranslationService } from 'ng-hub-ui-utils';
import { Subject } from 'rxjs';

import { HubPaginableService } from '../../services/paginable.service';
import { PaginableConfigService } from '../../services/paginate-config.service';
import { HubPaginatorComponent } from '../paginator/paginator.component';
import { HubTableComponent } from './table.component';

/**
 * The arrow glyphs come in pairs, and a pair is one shape and its reflection.
 *
 * Each icon is an SVG path inside a CSS variable, so a dropped minus sign is a control
 * point landing on the wrong side of the curve: the glyph still draws, still fills, still
 * looks like an arrow at a glance, and nothing in the build complains. Comparing the two
 * strings would not help either — the pairs are traced from different corners and in
 * different directions, so the encodings legitimately differ.
 *
 * What cannot legitimately differ is the geometry. The paths are walked into absolute
 * points (anchors and control points alike), the reflection is applied, and the two point
 * lists have to agree. That is the property a reader checks by eye, written down.
 */

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

type Point = readonly [number, number];

/** How the second glyph of a pair is obtained from the first. */
type Reflection = 'vertical' | 'horizontal' | 'point';

/** The `d` attribute and the viewBox of an icon token's inline SVG. */
function glyphOf(cssValue: string): { d: string; viewBox: number[] } {
	// The CSSOM re-serialises the data URL unquoted, escaping its spaces and quotes.
	const svg = decodeURIComponent(cssValue.replace(/\\(.)/g, '$1'));
	const d = /d='([^']+)'/.exec(svg);
	const viewBox = /viewBox='([^']+)'/.exec(svg);

	if (!d || !viewBox) {
		throw new Error(`not an inline SVG icon: ${cssValue.slice(0, 60)}…`);
	}

	return { d: d[1], viewBox: viewBox[1].split(/\s+/).map(Number) };
}

/** Splits a path's `d` into command letters and numbers, in source order. */
function tokenize(d: string): Array<string | number> {
	const out: Array<string | number> = [];
	const number = /[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/y;

	for (let i = 0; i < d.length;) {
		const char = d[i];

		if (/[A-Za-z]/.test(char)) {
			out.push(char);
			i += 1;
		} else if (char === ' ' || char === ',') {
			i += 1;
		} else {
			number.lastIndex = i;
			const match = number.exec(d);
			if (!match) throw new Error(`unexpected "${char}" at ${i} in ${d}`);
			out.push(Number(match[0]));
			i = number.lastIndex;
		}
	}

	return out;
}

/**
 * Every absolute point the path visits — anchors and control points, in order.
 *
 * Control points are included on purpose: they are where the sign errors hide, and a
 * comparison of anchors alone would pass a curve bulging the wrong way.
 */
function pointsOf(d: string): Point[] {
	const tokens = tokenize(d);
	const points: Point[] = [];
	let i = 0;
	let command = '';
	let x = 0;
	let y = 0;
	let startX = 0;
	let startY = 0;
	// Second control point of the previous curve, which S/s reflects to build its first.
	let priorControlX = 0;
	let priorControlY = 0;

	const take = (count: number) => tokens.slice(i, (i += count)) as number[];
	const add = (px: number, py: number) => points.push([Math.round(px * 1e3) / 1e3, Math.round(py * 1e3) / 1e3]);

	while (i < tokens.length) {
		// A number where a command letter could be repeats the previous command.
		if (typeof tokens[i] === 'string') {
			command = tokens[i] as string;
			i += 1;
		}

		switch (command) {
			case 'M':
			case 'm': {
				const [dx, dy] = take(2);
				x = command === 'm' ? x + dx : dx;
				y = command === 'm' ? y + dy : dy;
				startX = x;
				startY = y;
				add(x, y);
				priorControlX = x;
				priorControlY = y;
				// A repeated pair after a moveto is a lineto, per the SVG grammar.
				command = command === 'M' ? 'L' : 'l';
				break;
			}
			case 'L':
			case 'l': {
				const [dx, dy] = take(2);
				x = command === 'l' ? x + dx : dx;
				y = command === 'l' ? y + dy : dy;
				add(x, y);
				priorControlX = x;
				priorControlY = y;
				break;
			}
			case 'H':
			case 'h': {
				const [dx] = take(1);
				x = command === 'h' ? x + dx : dx;
				add(x, y);
				priorControlX = x;
				priorControlY = y;
				break;
			}
			case 'V':
			case 'v': {
				const [dy] = take(1);
				y = command === 'v' ? y + dy : dy;
				add(x, y);
				priorControlX = x;
				priorControlY = y;
				break;
			}
			case 'C':
			case 'c': {
				const [a, b, c, e, f, g] = take(6);
				const relative = command === 'c';
				const c1x = relative ? x + a : a;
				const c1y = relative ? y + b : b;
				const c2x = relative ? x + c : c;
				const c2y = relative ? y + e : e;
				const endX = relative ? x + f : f;
				const endY = relative ? y + g : g;
				add(c1x, c1y);
				add(c2x, c2y);
				add(endX, endY);
				priorControlX = c2x;
				priorControlY = c2y;
				x = endX;
				y = endY;
				break;
			}
			case 'S':
			case 's': {
				const [a, b, c, e] = take(4);
				const relative = command === 's';
				const c2x = relative ? x + a : a;
				const c2y = relative ? y + b : b;
				const endX = relative ? x + c : c;
				const endY = relative ? y + e : e;
				add(2 * x - priorControlX, 2 * y - priorControlY);
				add(c2x, c2y);
				add(endX, endY);
				priorControlX = c2x;
				priorControlY = c2y;
				x = endX;
				y = endY;
				break;
			}
			case 'Z':
			case 'z': {
				x = startX;
				y = startY;
				add(x, y);
				priorControlX = x;
				priorControlY = y;
				break;
			}
			default:
				throw new Error(`unsupported path command "${command}" in ${d}`);
		}
	}

	return points;
}

/**
 * The points of `source` reflected onto where `target` should be.
 *
 * The axis is derived from the first point of each glyph rather than assumed to be the
 * centre of the viewBox: several of these arrows sit off-centre in their box, which is a
 * placement question and not a shape one.
 */
function reflect(source: Point[], target: Point[], kind: Reflection): Point[] {
	const centreX = (source[0][0] + target[0][0]) / 2;
	const centreY = (source[0][1] + target[0][1]) / 2;

	return source.map(([x, y]) => {
		const flippedX = kind === 'vertical' ? x : 2 * centreX - x;
		const flippedY = kind === 'horizontal' ? y : 2 * centreY - y;
		return [flippedX, flippedY] as Point;
	});
}

/** Index of the first point where the reflection disagrees, or -1. */
function firstDisagreement(expected: Point[], actual: Point[]): number {
	for (let i = 0; i < expected.length; i++) {
		if (Math.abs(expected[i][0] - actual[i][0]) > 0.05 || Math.abs(expected[i][1] - actual[i][1]) > 0.05) {
			return i;
		}
	}
	return -1;
}

/** Pairs of glyphs that are one shape and its reflection, with the reflection each uses. */
const PAIRS: ReadonlyArray<readonly [string, string, Reflection]> = [
	['sort-up', 'sort-down', 'point'],
	['caret-up', 'caret-down', 'point'],
	['chevron-up', 'chevron-down', 'vertical'],
	['chevron-left', 'chevron-right', 'horizontal'],
	['angle-left', 'angle-right', 'horizontal'],
	['angle-double-left', 'angle-double-right', 'point']
];

/** The pairs the paginator declares for itself. */
const PAGINATOR_PAIRS: ReadonlyArray<readonly [string, string, Reflection]> = [
	['angle-left', 'angle-right', 'horizontal'],
	['angle-double-left', 'angle-double-right', 'point']
];

describe('icon glyph symmetry', () => {
	/** Reads a token off the element the component's own stylesheet declares it on. */
	function tokenReader(element: Element, prefix: string) {
		return (name: string) => {
			const value = getComputedStyle(element).getPropertyValue(`${prefix}${name}`);
			expect(value, `${prefix}${name} is not declared`).not.toBe('');
			return glyphOf(value);
		};
	}

	function expectMirror(read: (name: string) => { d: string }, [up, down, kind]: readonly [string, string, Reflection]) {
		const source = pointsOf(read(up).d);
		const target = pointsOf(read(down).d);

		expect(target.length, `${up} and ${down} are not the same shape`).toBe(source.length);

		const expected = reflect(source, target, kind);
		const index = firstDisagreement(expected, target);

		expect(
			index === -1 ? null : { at: index, expected: expected[index], found: target[index] },
			`${down} is not the ${kind} reflection of ${up}`
		).toBeNull();
	}

	describe('table', () => {
		let read: (name: string) => { d: string; viewBox: number[] };

		beforeEach(async () => {
			await TestBed.configureTestingModule({
				imports: [HubTableComponent, BrowserAnimationsModule],
				providers: [
					{ provide: HubTranslationService, useClass: MockHubTranslationService },
					{ provide: HubPaginableService, useClass: MockPaginableService },
					{ provide: PaginableConfigService, useValue: { language: 'en', mapping: {} } }
				]
			}).compileComponents();

			// Instantiating the component is what loads its stylesheet into the document.
			const fixture = TestBed.createComponent(HubTableComponent);
			fixture.detectChanges();
			read = tokenReader(fixture.nativeElement, '--hub-table-icon-');
		});

		for (const pair of PAIRS) {
			it(`draws ${pair[1]} as the ${pair[2]} reflection of ${pair[0]}`, () => expectMirror(read, pair));
		}
	});

	describe('paginator', () => {
		let read: (name: string) => { d: string; viewBox: number[] };

		beforeEach(async () => {
			await TestBed.configureTestingModule({
				imports: [HubPaginatorComponent],
				providers: [{ provide: HubTranslationService, useClass: MockHubTranslationService }]
			}).compileComponents();

			const fixture = TestBed.createComponent(HubPaginatorComponent);
			fixture.detectChanges();
			// The paginator ships unencapsulated, so its declarations land on `:root`.
			read = tokenReader(document.documentElement, '--hub-paginator-icon-');
		});

		for (const pair of PAGINATOR_PAIRS) {
			it(`draws ${pair[1]} as the ${pair[2]} reflection of ${pair[0]}`, () => expectMirror(read, pair));
		}
	});
});
