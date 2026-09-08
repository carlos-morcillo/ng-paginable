import { EnvironmentProviders, makeEnvironmentProviders, Provider, provideAppInitializer, inject } from '@angular/core';
import { HUB_TRANSLATION_CONFIG, HubTranslationService } from 'ng-hub-ui-utils';
import { locale as anLocale } from './assets/i18n/an';
import { locale as arLocale } from './assets/i18n/ar';
import { locale as astLocale } from './assets/i18n/ast';
import { locale as caLocale } from './assets/i18n/ca';
import { locale as deLocale } from './assets/i18n/de';
import { locale as enLocale } from './assets/i18n/en';
import { locale as esLocale } from './assets/i18n/es';
import { locale as euLocale } from './assets/i18n/eu';
import { locale as glLocale } from './assets/i18n/gl';
import { locale as ruLocale } from './assets/i18n/ru';
import { locale as zhLocale } from './assets/i18n/zh';
import { PaginableTableConfig } from './interfaces/paginable-table-config';
import { HubPaginableDefaultsService } from './services/paginable-defaults.service';
import { HubPaginableService } from './services/paginable.service';
import { PaginableConfigService } from './services/paginate-config.service';

/** Bundled translation dictionaries shared by every provisioning entry point. */
export const PAGINABLE_DICTIONARIES = {
	[enLocale.lang]: enLocale.data,
	[esLocale.lang]: esLocale.data,
	[caLocale.lang]: caLocale.data,
	[euLocale.lang]: euLocale.data,
	[glLocale.lang]: glLocale.data,
	[astLocale.lang]: astLocale.data,
	[anLocale.lang]: anLocale.data,
	[deLocale.lang]: deLocale.data,
	[zhLocale.lang]: zhLocale.data,
	[arLocale.lang]: arLocale.data,
	[ruLocale.lang]: ruLocale.data
};

/**
 * Core provider set shared by {@link providePaginable} and the legacy
 * `HubUITableModule.forRoot`. Includes the config token, services, translation
 * wiring, and an app initializer that pre-resolves lazy default-state
 * components so their chunks are loaded before first render.
 *
 * @param config Optional paginable configuration.
 * @returns A flat array of providers.
 */
export function paginableCoreProviders(config?: PaginableTableConfig): (Provider | EnvironmentProviders)[] {
	return [
		{ provide: PaginableConfigService, useValue: config ?? {} },
		HubPaginableService,
		HubPaginableDefaultsService,
		{
			provide: HUB_TRANSLATION_CONFIG,
			useFactory: (paginableService: HubPaginableService) => ({
				dictionaries: PAGINABLE_DICTIONARIES,
				language: paginableService.config.language ?? 'en',
				fallbackLanguage: 'en'
			}),
			deps: [HubPaginableService]
		},
		HubTranslationService,
		provideAppInitializer(() => inject(HubPaginableDefaultsService).preload())
	];
}

/**
 * Standalone-friendly entry point. Register in `bootstrapApplication` providers
 * (or a route's `providers`) to configure the paginable library, including
 * application-wide default state components.
 *
 * @param config Optional paginable configuration.
 * @returns Environment providers for the paginable library.
 */
export function providePaginable(config?: PaginableTableConfig): EnvironmentProviders {
	return makeEnvironmentProviders(paginableCoreProviders(config));
}
