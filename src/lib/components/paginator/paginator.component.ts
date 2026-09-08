import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model } from '@angular/core';
import { HUB_TRANSLATION_PREFIX, TranslatePipe, UcfirstPipe } from 'ng-hub-ui-utils';

/** Where a paginator sits relative to the rows it pages, when that has to be said out loud. */
export type PaginatorPlacement = 'top' | 'bottom';

/**
 * Component for handling pagination controls in a table or list throughout the library.
 * It provides a user interface for navigating through pages of data.
 *
 * @export
 * @class HubPaginatorComponent
 */
@Component({
	selector: 'hub-paginator, hub-ui-paginator, paginable-table-paginator',
	standalone: true,
	templateUrl: './paginator.component.html',
	styleUrl: './paginator.component.scss',
	// Reason 3 of CODING_RULES.md — the sheet also dresses elements that are not in this
	// component's view. `<hub-table>` and `<hub-list>` draw the bottom bar beside the
	// paginator and reuse its skin for it: `.hub-paginator__settings`, `__label`,
	// `__select` and `__info` live in *their* templates, so an encapsulated rule would
	// carry this component's marker and never reach them. The `:root` block is part of the
	// same exception: `table-icon-symmetry.spec.ts` reads the `--hub-paginator-icon-*`
	// tokens off `document.documentElement`, which only a global sheet can declare (under
	// `ViewEncapsulation.None` Angular leaves `:host` untransformed, and it matches
	// nothing). Every selector stays namespaced under `.hub-paginator*`.
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [TranslatePipe, UcfirstPipe],
	providers: [{ provide: HUB_TRANSLATION_PREFIX, useValue: 'HUBUI.PAGINABLE' }]
})
export class HubPaginatorComponent {
	/**
	 * Enables right-to-left behavior for paginator controls.
	 * Icons keep their visual direction while actions are mirrored.
	 */
	readonly rtl = input<boolean>(false);

	/**
	 * The current page number.
	 *
	 * @type {(number)}
	 * @memberof HubPaginatorComponent
	 */
	readonly page = model<number>(1);
	/**
	 * The total number of pages available.
	 *
	 * @type {(number | null)}
	 * @memberof HubPaginatorComponent
	 */
	readonly numberOfPages = input<number | null>();

	/**
	 * Where this paginator sits, when a host draws more than one of them for the same collection.
	 * A `<nav>` is a landmark, and two landmarks answering to the same name are indistinguishable
	 * in a screen reader's landmark list — so the placement, when given, goes into the name.
	 * Left `null` for the ordinary case of a single paginator, which needs no disambiguation.
	 */
	readonly placement = input<PaginatorPlacement | null>(null);

	/**
	 * Translation key for the navigation landmark's accessible name.
	 */
	readonly ariaLabelKey = computed<string>(() => {
		switch (this.placement()) {
			case 'top':
				return 'PAGINATION_TOP';
			case 'bottom':
				return 'PAGINATION_BOTTOM';
			default:
				return 'PAGINATION';
		}
	});

	/**
	 * Returns whether paginator should behave in right-to-left mode.
	 *
	 * @returns `true` when RTL behavior is enabled.
	 */
	isRtl(): boolean {
		return this.rtl() === true;
	}

	/**
	 * Returns whether there is a bounded last page.
	 *
	 * @returns `true` when total number of pages is known.
	 */
	hasKnownLastPage(): boolean {
		return typeof this.numberOfPages() === 'number' && (this.numberOfPages() ?? 0) > 0;
	}

	/**
	 * Returns the page that should be selected when the double-left control is clicked.
	 *
	 * @returns Target page for the first control.
	 */
	getFirstControlTarget(): number {
		if (this.isRtl()) {
			return this.hasKnownLastPage() ? (this.numberOfPages() ?? this.page()) : this.page() + 1;
		}
		return 1;
	}

	/**
	 * Returns the page that should be selected when the single-left control is clicked.
	 *
	 * @returns Target page for previous/forward mirrored control.
	 */
	getPreviousControlTarget(): number {
		if (this.isRtl()) {
			if (!this.hasKnownLastPage()) {
				return this.page() + 1;
			}
			return Math.min(this.page() + 1, this.numberOfPages() ?? this.page());
		}
		return Math.max(1, this.page() - 1);
	}

	/**
	 * Returns the page that should be selected when the single-right control is clicked.
	 *
	 * @returns Target page for next/backward mirrored control.
	 */
	getNextControlTarget(): number {
		if (this.isRtl()) {
			return Math.max(1, this.page() - 1);
		}
		return this.page() + 1;
	}

	/**
	 * Returns the page that should be selected when the double-right control is clicked.
	 *
	 * @returns Target page for the last control.
	 */
	getLastControlTarget(): number {
		if (this.isRtl()) {
			return 1;
		}
		return this.numberOfPages() ?? 1;
	}

	/**
	 * Returns whether the double-left control must be disabled.
	 */
	isFirstControlDisabled(): boolean {
		if (this.isRtl()) {
			return this.hasKnownLastPage() ? this.page() >= (this.numberOfPages() ?? this.page()) : false;
		}
		return this.page() <= 1;
	}

	/**
	 * Returns whether the single-left control must be disabled.
	 */
	isPreviousControlDisabled(): boolean {
		if (this.isRtl()) {
			return this.hasKnownLastPage() ? this.page() >= (this.numberOfPages() ?? this.page()) : false;
		}
		return this.page() <= 1;
	}

	/**
	 * Returns whether the single-right control must be disabled.
	 */
	isNextControlDisabled(): boolean {
		if (this.isRtl()) {
			return this.page() <= 1;
		}
		return this.hasKnownLastPage() ? this.page() >= (this.numberOfPages() ?? this.page()) : false;
	}

	/**
	 * Returns whether the double-right control must be disabled.
	 */
	isLastControlDisabled(): boolean {
		if (this.isRtl()) {
			return this.page() <= 1;
		}
		return this.hasKnownLastPage() ? this.page() >= (this.numberOfPages() ?? this.page()) : false;
	}
}
