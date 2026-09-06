/**
 * @file icon.component.ts
 * @description Angular component for rendering icons with support for different icon libraries.
 */

import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from '../../interfaces/paginable-table-header';
import { containsFontAwesomeClass } from '../../utils/icons';

/**
 * Defines the supported icon types.
 * @typedef {'font-awesome' | 'material' | 'bootstrap'} IconType
 */
export type IconType = 'font-awesome' | 'material' | 'bootstrap';

/** The `config` input once normalized: a bare string is the icon value on its own. */
interface ResolvedIcon {
	type: IconType | null;
	value: string;
	variant: string;
}

/**
 * @component HubIconComponent
 * @selector hub-icon
 * @description A versatile icon component that supports multiple icon libraries.
 *
 * @example
 * <hub-icon [config]="iconConfig"></hub-icon>
 */
@Component({
	selector: 'hub-icon, ng-hub-ui-icon',
	standalone: true,
	imports: [NgClass],
	templateUrl: './icon.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class HubIconComponent {
	/**
	 * @input config
	 * @description Sets the icon configuration. Can be a string or an Icon object.
	 * @type {string | Icon}
	 */
	readonly config = input.required<string | Icon | undefined>();

	/** The two shapes `config` accepts, reduced to the one the rest of the class reads. */
	readonly #resolved = computed<ResolvedIcon>(() => {
		const value = this.config();

		if (!value || typeof value === 'string') {
			return { type: null, value: value ?? '', variant: '' };
		}

		return {
			type: value.type ?? null,
			value: value.value ?? '',
			variant: value.variant ?? ''
		};
	});

	/**
	 * @description The type of icon (font-awesome, material, or bootstrap).
	 * @type {IconType}
	 */
	readonly type = computed<IconType | null>(() => this.#resolved().type);

	/**
	 * @description The icon value or class name.
	 * @type {string}
	 */
	readonly value = computed<string>(() => this.#resolved().value);

	/**
	 * @description The variant of the icon (if applicable).
	 * @type {string}
	 */
	readonly variant = computed<string>(() => this.#resolved().variant);

	/**
	 * @description Computes the CSS classes for the icon based on its type and value.
	 * @returns {string | null} The computed CSS class string or null if no value is set.
	 */
	readonly classlist = computed<string | null>(() => {
		const value = this.value();
		if (!value) {
			return null;
		}

		const type = this.type();
		if (!type) {
			return value;
		}

		const classlist: Array<string> = [];
		if (['font-awesome', 'bootstrap'].includes(type)) {
			if (Array.isArray(value)) {
				classlist.push(...value);
			} else {
				classlist.push(...value.split(' '));
			}
		}

		switch (type) {
			case 'font-awesome':
				if (!containsFontAwesomeClass(classlist.join(' '))) {
					classlist.push('fa');
				}
				break;
			case 'bootstrap':
				if (!containsFontAwesomeClass(classlist.join(' '))) {
					classlist.push('bs');
				}
				break;
			case 'material':
				classlist.push('material-symbols-outlined');
				break;
		}

		return classlist.join(' ');
	});

	/**
	 * @description Gets the content for material icons.
	 * @returns {string | null} The icon content for material icons, or null for other types.
	 */
	readonly content = computed<string | null>(() => (this.type() === 'material' ? this.value() : null));
}
