import { ComponentFixture, TestBed } from '@angular/core/testing';

import { locale as anLocale } from '../../assets/i18n/an';
import { locale as arLocale } from '../../assets/i18n/ar';
import { locale as astLocale } from '../../assets/i18n/ast';
import { locale as caLocale } from '../../assets/i18n/ca';
import { locale as deLocale } from '../../assets/i18n/de';
import { locale as enLocale } from '../../assets/i18n/en';
import { locale as euLocale } from '../../assets/i18n/eu';
import { locale as glLocale } from '../../assets/i18n/gl';
import { locale as ruLocale } from '../../assets/i18n/ru';
import { locale as zhLocale } from '../../assets/i18n/zh';
import { providePaginable } from '../../paginable.providers';
import { HubPaginatorComponent } from './paginator.component';

/**
 * The paginator's first/previous/next/last controls are icon-only: their `aria-label` is
 * the whole accessible name a screen reader gets. These specs pin that name to the shipped
 * dictionary of the configured language, so a paginator can never again announce itself in
 * English to someone browsing in Catalan or German.
 */
describe('HubPaginatorComponent i18n', () => {
	/** The five keys that carry every accessible name the paginator exposes. */
	const PAGINATOR_KEYS = ['PAGINATION', 'FIRST', 'PREVIOUS', 'NEXT', 'LAST'] as const;

	type PaginatorKey = (typeof PAGINATOR_KEYS)[number];
	type PaginatorLabels = { data: Record<PaginatorKey, string> };

	/** Renders a paginator with the library configured for `language`. */
	function renderIn(language: string): ComponentFixture<HubPaginatorComponent> {
		TestBed.resetTestingModule();
		TestBed.configureTestingModule({
			imports: [HubPaginatorComponent],
			providers: [providePaginable({ language })]
		});

		const fixture = TestBed.createComponent(HubPaginatorComponent);
		fixture.componentRef.setInput('numberOfPages', 10);
		fixture.componentInstance.page.set(5);
		fixture.detectChanges();

		return fixture;
	}

	/** Reads the accessible name of every labelled paginator control, in template order. */
	function accessibleNames(fixture: ComponentFixture<HubPaginatorComponent>): Record<string, string | null> {
		const host: HTMLElement = fixture.nativeElement;
		const nav = host.querySelector('nav.hub-paginator-container');
		const [first, previous, next, last] = Array.from(host.querySelectorAll('a.hub-paginator__link[aria-label]'));

		return {
			PAGINATION: nav?.getAttribute('aria-label') ?? null,
			FIRST: first?.getAttribute('aria-label') ?? null,
			PREVIOUS: previous?.getAttribute('aria-label') ?? null,
			NEXT: next?.getAttribute('aria-label') ?? null,
			LAST: last?.getAttribute('aria-label') ?? null
		};
	}

	/** Applies the `ucfirst` pipe the template pipes every label through. */
	const ucfirst = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

	it('announces the paginator in Catalan when the library is configured in Catalan', () => {
		const names = accessibleNames(renderIn('ca'));

		expect(names).toEqual({
			PAGINATION: 'Paginació',
			FIRST: 'Primera',
			PREVIOUS: 'Anterior',
			NEXT: 'Següent',
			LAST: 'Última'
		});
	});

	it('announces the paginator in German when the library is configured in German', () => {
		const names = accessibleNames(renderIn('de'));

		expect(names).toEqual({
			PAGINATION: 'Seitennummerierung',
			FIRST: 'Erste',
			PREVIOUS: 'Vorherige',
			NEXT: 'Nächste',
			LAST: 'Letzte'
		});
	});

	describe('every shipped dictionary', () => {
		const translated: Record<string, PaginatorLabels> = {
			an: anLocale,
			ar: arLocale,
			ast: astLocale,
			ca: caLocale,
			de: deLocale,
			eu: euLocale,
			gl: glLocale,
			ru: ruLocale,
			zh: zhLocale
		};
		const english: PaginatorLabels = enLocale;

		for (const [lang, locale] of Object.entries(translated)) {
			it(`renders its own paginator labels in ${lang}, never the English ones`, () => {
				const names = accessibleNames(renderIn(lang));

				for (const key of PAGINATOR_KEYS) {
					const own = locale.data[key];

					expect(own).not.toBe(english.data[key]);
					expect(names[key]).toBe(ucfirst(own));
				}
			});
		}
	});
});
