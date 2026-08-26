import { Injectable } from '@angular/core';
import { PaginableTablePagination } from '../interfaces/paginable-table-pagination';

@Injectable({
	providedIn: 'root'
})
export class PaginationService {
	generate(items: any[] | ReadonlyArray<any>, params: any): any {
		let filtered: Array<any> = [];
		if (items && items.length) {
			filtered = items.concat();
			if (params.searchText && params.searchKeys) {
				const searchText = params.searchText;
				if (searchText && searchText.trim() !== '') {
					filtered = filtered.filter((item) => {
						return params.searchKeys.some(
							(o: string) => this.get(item, o).toString().toLowerCase().indexOf(searchText) > -1
						);
					});
				}
			}

			if (params.ordination) {
				filtered = this.orderBy(filtered, params.ordination.property, params.ordination.direction);
			}
		}
		const page = params.page || 1;

		// Si la paginación viene del servidor y no está establecida, establecer a true
		if (params.paginate === undefined) {
			params.paginate = true;
		}
		const perPage = params.paginate ? params.perPage || 20 : filtered.length;

		const pagination: PaginableTablePagination = {
			currentPage: page,
			lastPage: Math.ceil(filtered.length / perPage),
			perPage,
			from: (page - 1) * perPage,
			to: page * perPage,
			total: filtered.length,
			data: filtered.slice((page - 1) * perPage, page * perPage)
		};

		return pagination;
	}

	/**
	 * Creates an array of elements, sorted in ascending or descending order by the results of running each element
	 * in a collection thru each iteratee. This method performs a stable sort, that is, it preserves the original s
	 * ort order of equal elements. The iteratees are invoked with one argument: (value).
	 *
	 * @param collection
	 * @param iteratee
	 * @param direction
	 */
	orderBy(collection: any[], iteratee: string, direction: string = 'ASC'): any[] {
		return collection.sort((b, a) => {
			const aSort = this.get(a, iteratee);
			const bSort = this.get(b, iteratee);
			if (direction === 'DESC') {
				return aSort > bSort ? 1 : bSort > aSort ? -1 : 0;
			} else {
				return aSort < bSort ? 1 : bSort < aSort ? -1 : 0;
			}
		});
	}

	get(object: any, path: string | any[]) {
		if (path.constructor.name === 'String') {
			path = (path as string).split('.');
		}
		return (path as any[]).reduce((o, k) => (o && o[k] !== 'undefined' ? o[k] : undefined), object);
	}
}
