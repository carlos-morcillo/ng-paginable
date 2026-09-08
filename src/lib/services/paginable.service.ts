import { Inject, Injectable, Optional } from '@angular/core';
import { DEFAULT_PAGINABLE_CONFIG } from '../constants/defaults';
import { PaginableTableConfig } from '../interfaces/paginable-table-config';
import { mergeDeep } from 'ng-hub-ui-utils';
import { PaginableConfigService } from './paginate-config.service';

@Injectable({ providedIn: 'root' })
export class HubPaginableService {
	config!: Required<PaginableTableConfig>;

	get mapping(): any {
		return this.config.mapping;
	}

	constructor(
		@Optional()
		@Inject(PaginableConfigService)
		private _config = DEFAULT_PAGINABLE_CONFIG
	) {
		this.initialize();
	}

	initialize() {
		this.config = mergeDeep(DEFAULT_PAGINABLE_CONFIG, this._config);
	}
}
