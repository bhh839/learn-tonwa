import { Query } from "tonwa-core";
import { PageItems } from "./PageItems";

export class QueryPager<T extends any> extends PageItems<T> {
	private query: Query;
	private $page: any;
	protected idFieldName: any;
	constructor(query: Query, pageSize?: number, firstSize?: number, itemObservable?: boolean) {
		super(itemObservable);
		this.query = query;
		if (pageSize !== undefined) this.pageSize = pageSize;
		if (firstSize !== undefined) this.firstSize = firstSize;
	}

	setReverse() {
		this.appendPosition = 'head';
	}

	protected async onLoad() {
		if (this.$page) return;
		let { schema } = this.query;
		if (schema === undefined) {
			await this.query.loadSchema();
			schema = this.query.schema;
		}
		if (schema === undefined) return;
		let $page = this.$page = (schema.returns as any[]).find(v => v.name === '$page');
		if ($page === undefined) return;
		this.sortOrder = $page.order;
		let fields = $page.fields;
		if (fields !== undefined) {
			let field = fields[0];
			if (field) this.idFieldName = field.name;
		}
	}

	protected async loadResults(param: any, pageStart: number, pageSize: number, $$user: number = undefined): Promise<{ [name: string]: any[] }> {
		let ret = await this.query.page(param, pageStart, pageSize, $$user);
		return ret;
	}
	protected getPageId(item: T) {
		if (item === undefined) return;
		if (typeof item === 'number') return item;
		let start = (item as any)[this.idFieldName];
		if (start === null) return;
		if (start === undefined) return;
		if (typeof start === 'object') {
			let id = start.id;
			if (id !== undefined) return id;
		}
		return start;
	}
	async refreshItems(item: T) {
		let index = this._items.indexOf(item);
		if (index < 0) return;
		let startIndex: number;
		if (this.appendPosition === 'tail') {
			startIndex = index - 1;
		}
		else {
			startIndex = index + 1;
		}
		let pageStart = this.getPageId(this._items[startIndex]);
		let pageSize = 1;
		let ret = await this.load(
			this.param,
			pageStart,
			pageSize);
		let len = ret.length;
		if (len === 0) {
			this._items.splice(index, 1);
			return;
		}
		for (let i = 0; i < len; i++) {
			let newItem = ret[i];
			if (!newItem) continue;
			let newId = newItem[this.idFieldName];
			if (newId === undefined || newId === null) continue;
			if (typeof newId === 'object') newId = newId.id;
			let oldItem = this._items.find(v => {
				let oldId = (v as any)[this.idFieldName];
				if (oldId === undefined || oldId === null) return false;
				if (typeof oldId === 'object') oldId = oldId.id;
				return oldId = newId;
			});
			if (oldItem) {
				Object.assign(oldItem, newItem);
			}
		}
	}
}
