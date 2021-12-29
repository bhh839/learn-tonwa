/* eslint-disable */
//import { UqApi, UqData, UnitxApi } from '../net';
import { UqApi, UqData, UnitxApi } from '../web';
import { Tonwa, UqConfig } from '../core';
import { Tuid, TuidDiv, TuidImport, TuidInner, TuidBox, TuidsCache } from './tuid';
import { Action } from './action';
import { Sheet } from './sheet';
import { Query } from './query';
import { Book } from './book';
import { History } from './history';
import { Map } from './map';
import { Pending } from './pending';
//import { CreateBoxId, BoxId } from './tuid';
import { LocalMap, LocalCache, env, capitalCase } from '../tool';
//import { ReactBoxId } from './tuid/reactBoxId';
import { UqEnum } from './enum';
import { Entity } from './entity';
import { ID, IX, IDX } from './ID';
import { IDCache } from './IDCache';
import { Web } from '../web';

export type FieldType = 'id' | 'tinyint' | 'smallint' | 'int' | 'bigint' | 'dec' | 'float' | 'double' | 'char' | 'text'
	| 'datetime' | 'date' | 'time' | 'timestamp' | 'enum';

export function fieldDefaultValue(type: FieldType) {
	switch (type) {
		case 'tinyint':
		case 'smallint':
		case 'int':
		case 'bigint':
		case 'dec':
		case 'float':
		case 'double':
		case 'enum':
			return 0;
		case 'char':
		case 'text':
			return '';
		case 'datetime':
		case 'date':
			return '2000-1-1';
		case 'time':
			return '0:00';
	}
}

export interface Field {
	name: string;
	type: FieldType;
	tuid?: string;
	arr?: string;
	null?: boolean;
	size?: number;
	owner?: string;
	_tuid?: TuidBox;
}
export interface ArrFields {
	name: string;
	fields: Field[];
	id?: string;
	order?: string;
}
export interface FieldMap {
	[name: string]: Field;
}
export interface SchemaFrom {
	owner: string;
	uq: string;
}
export interface TuidModify {
	max: number;
	seconds: number;
}

interface ParamPage {
	start: number;
	end?: number;
	size: number;
}

export interface ParamActIX<T> {
	IX: IX;
	ID?: ID;
	IXs?: { IX: IX, ix: number }[];				// 一次写入多个IX
	values: { ix: number, xi: number | T }[];
}

export interface ParamActIXSort {
	IX: IX;
	ix: number;
	id: number;					// id to be moved
	after: number;				// insert after id. if before first, then 0
}

export interface ParamActDetail<M, D> {
	main: {
		ID: ID;
		value: M;
	};
	detail: {
		ID: ID;
		values: D[];
	};
}

export interface RetActDetail {
	main: number;
	detail: number[];
}

export interface ParamActDetail2<M, D, D2> extends ParamActDetail<M, D> {
	detail2: {
		ID: ID;
		values: D2[];
	};
}

export interface RetActDetail2 extends RetActDetail {
	detail2: number[];
}

export interface ParamActDetail3<M, D, D2, D3> extends ParamActDetail2<M, D, D2> {
	detail3: {
		ID: ID;
		values: D3[];
	};
}

export interface RetActDetail3 extends RetActDetail2 {
	detail3: number[];
}

export interface ParamQueryID {
	ID?: ID;
	IX?: (IX | string)[];
	IDX?: (ID | IDX)[];
	id?: number | number[];
	key?: { [key: string]: string | number };
	ix?: number;
	idx?: number | number[];
	keyx?: { [key: string]: string | number };
	page?: ParamPage;
	order?: 'desc' | 'asc';
}

export interface ParamIDNO {
	ID: ID;
	stamp?: undefined,
}

export interface ParamIDDetailGet {
	id: number;
	main: ID;
	detail: ID;
	detail2?: ID;
	detail3?: ID;
}

export interface ParamID {
	IDX: (ID | IDX) | (ID | IDX)[];
	id: number | number[];
	order?: 'asc' | 'desc',
	page?: ParamPage;
}

export interface ParamKeyID {
	ID: ID;
	IDX?: (ID | IDX)[];
	IX?: IX[];
	key: { [key: string]: string | number };
	ix?: number;
	page?: ParamPage;
}

export interface ParamIX {
	IX: IX;
	IX1?: IX;
	ix: number | number[];
	IDX?: (ID | IDX)[];
	page?: ParamPage;
}

export interface ParamKeyIX {
	ID: ID;
	key: { [key: string]: string | number };
	IX: IX;
	IDX?: (ID | IDX)[];
	page?: ParamPage;
}

export interface ParamIDLog {
	IDX: (ID | IDX);
	field: string;
	id: number;
	log: 'each' | 'day' | 'week' | 'month' | 'year';
	timeZone?: number;
	far?: number;
	near?: number;
	page: ParamPage;
}

export interface ParamIDSum {
	IDX: IDX;
	field: string[];
	id: number | number[];
	far?: number;				// 以前
	near?: number;				// 最近
}

export interface ParamIDxID {
	ID: ID;
	IX: IX;
	ID2: ID;
	page?: ParamPage;
}

export interface IDXValue {
	value: number;
	time?: number | Date;
	setAdd: '=' | '+';
}

export interface ParamIDinIX {
	ID: ID;
	id: number;
	IX: IX;
	page?: ParamPage;
}

export interface ParamIDTree {
	ID: ID;
	parent: number;
	key: string | number;
	level?: number;				// 无值，默认1一级
	page?: ParamPage;
}

function IDPath(path: string): string { return path; }
enum EnumResultType { data, sql };

export interface Uq {
	getAdmins(): Promise<{ id: number; role: number }[]>;
	$: UqMan;
	Acts(param: any): Promise<any>;
	ActIX<T>(param: ParamActIX<T>): Promise<number[]>;
	ActIXSort(param: ParamActIXSort): Promise<void>;
	ActDetail<M, D>(param: ParamActDetail<M, D>): Promise<RetActDetail>;
	ActDetail<M, D, D2>(param: ParamActDetail2<M, D, D2>): Promise<RetActDetail2>;
	ActDetail<M, D, D2, D3>(param: ParamActDetail3<M, D, D2, D3>): Promise<RetActDetail3>;
	QueryID<T>(param: ParamQueryID): Promise<T[]>;
	IDNO(param: ParamIDNO): Promise<string>;
	IDDetailGet<M, D>(param: ParamIDDetailGet): Promise<[M[], D[]]>;
	IDDetailGet<M, D, D2>(param: ParamIDDetailGet): Promise<[M[], D[], D2[]]>;
	IDDetailGet<M, D, D2, D3>(param: ParamIDDetailGet): Promise<[M[], D[], D2[], D3[]]>;
	ID<T>(param: ParamID): Promise<T[]>;
	IXr<T>(param: ParamIX): Promise<T[]>; // IX id 反查IX list
	KeyID<T>(param: ParamKeyID): Promise<T[]>;
	IX<T>(param: ParamIX): Promise<T[]>;
	KeyIX<T>(param: ParamKeyIX): Promise<T[]>;
	IDLog<T>(param: ParamIDLog): Promise<T[]>;
	IDSum<T>(param: ParamIDSum): Promise<T[]>;
	IDxID<T, T2>(param: ParamIDxID): Promise<[T[], T2[]]>; // ID list with IX 对应的子集
	IDinIX<T>(param: ParamIDinIX): Promise<T & { $in: boolean }[]>;
	IDTree<T>(param: ParamIDTree): Promise<T[]>;

	IDTv(ids: number[]): Promise<any[]>;
}

export class UqMan {
	readonly entities: { [name: string]: Entity } = {};
	private readonly enums: { [name: string]: UqEnum } = {};
	private readonly actions: { [name: string]: Action } = {};
	private readonly queries: { [name: string]: Query } = {};
	readonly ids: { [name: string]: ID } = {};
	private readonly idxs: { [name: string]: IDX } = {};
	private readonly ixs: { [name: string]: IX } = {};

	private readonly sheets: { [name: string]: Sheet } = {};
	private readonly books: { [name: string]: Book } = {};
	private readonly maps: { [name: string]: Map } = {};
	private readonly histories: { [name: string]: History } = {};
	private readonly pendings: { [name: string]: Pending } = {};
	private readonly tuidsCache: TuidsCache;
	private readonly localEntities: LocalCache;
	//private readonly tvs:{[entity:string]:(values:any)=>JSX.Element};
	idCache: IDCache;
	proxy: any;
	readonly localMap: LocalMap;
	readonly localModifyMax: LocalCache;
	readonly tuids: { [name: string]: Tuid } = {};
	//readonly createBoxId: CreateBoxId;
	readonly newVersion: boolean;
	readonly uqOwner: string;
	readonly uqName: string;
	readonly name: string;
	readonly uqApi: UqApi;
	readonly id: number;
	readonly tonwa: Tonwa;
	readonly web: Web;

	uqVersion: number;
	config: UqConfig;

	constructor(tonwa: Tonwa, uqData: UqData/*, createBoxId:CreateBoxId, tvs:{[entity:string]:(values:any)=>JSX.Element}*/) {
		this.tonwa = tonwa;
		this.web = tonwa.web;
		//this.createBoxId = createBoxId;
		/*
		if (createBoxId === undefined) {
			this.createBoxId = this.createBoxIdFromTVs;
			this.tvs = tvs || {};
		}
		*/
		let { id, uqOwner, uqName, /*access, */newVersion } = uqData;
		this.newVersion = newVersion;
		this.uqOwner = uqOwner;
		this.uqName = uqName;
		this.id = id;
		this.name = uqOwner + '/' + uqName;
		this.uqVersion = 0;
		this.localMap = env.localDb.map(this.name);
		this.localModifyMax = this.localMap.child('$modifyMax');
		this.localEntities = this.localMap.child('$access');
		let baseUrl = 'tv/';

		if (this.name === '$$$/$unitx') {
			// 这里假定，点击home link之后，已经设置unit了
			// 调用 UnitxApi会自动搜索绑定 unitx service
			this.uqApi = new UnitxApi(this.web, env.unit);
		}
		else {
			this.uqApi = new UqApi(this.web, baseUrl, uqOwner, uqName, true);
		}
		this.tuidsCache = new TuidsCache(this);
	}

	getID(name: string): ID { return this.ids[name.toLowerCase()]; };
	getIDX(name: string): IDX { return this.idxs[name.toLowerCase()]; };
	getIX(name: string): IX { return this.ixs[name.toLowerCase()]; };

	/*
	private createBoxIdFromTVs:CreateBoxId = (tuid:Tuid, id:number):BoxId =>{
		let {name} = tuid;
		return new ReactBoxId(id, tuid, this.tvs[name]);
	}
	*/

	private roles: string[];
	async getRoles(): Promise<string[]> {
		if (this.roles !== undefined) return this.roles;
		this.roles = await this.uqApi.getRoles();
		return this.roles;
	}

	tuid(name: string): Tuid { return this.tuids[name.toLowerCase()] }
	tuidDiv(name: string, div: string): TuidDiv {
		let tuid = this.tuids[name.toLowerCase()]
		return tuid && tuid.div(div.toLowerCase());
	}
	action(name: string): Action { return this.actions[name.toLowerCase()] }
	sheet(name: string): Sheet { return this.sheets[name.toLowerCase()] }
	query(name: string): Query { return this.queries[name.toLowerCase()] }
	book(name: string): Book { return this.books[name.toLowerCase()] }
	map(name: string): Map { return this.maps[name.toLowerCase()] }
	history(name: string): History { return this.histories[name.toLowerCase()] }
	pending(name: string): Pending { return this.pendings[name.toLowerCase()] }

	sheetFromTypeId(typeId: number): Sheet {
		for (let i in this.sheets) {
			let sheet = this.sheets[i];
			if (sheet.typeId === typeId) return sheet;
		}
	}

	allRoles: string[];
	readonly tuidArr: Tuid[] = [];
	readonly actionArr: Action[] = [];
	readonly queryArr: Query[] = [];
	readonly idArr: ID[] = [];
	readonly idxArr: IDX[] = [];
	readonly ixArr: IX[] = [];
	readonly enumArr: UqEnum[] = [];
	readonly sheetArr: Sheet[] = [];
	readonly bookArr: Book[] = [];
	readonly mapArr: Map[] = [];
	readonly historyArr: History[] = [];
	readonly pendingArr: Pending[] = [];

	async init() {
		await this.uqApi.init();
	}

	async loadEntities(): Promise<string> {
		try {
			let entities = this.localEntities.get();
			if (!entities) {
				entities = await this.uqApi.loadEntities();
			}
			if (!entities) return;
			this.buildEntities(entities);
		}
		catch (err) {
			return err as any;
		}
	}

	buildEntities(entities: any) {
		if (entities === undefined) {
			debugger;
		}
		this.localEntities.set(entities);
		let { access, tuids, role, version } = entities;
		this.uqVersion = version;
		this.allRoles = role?.names;
		this.buildTuids(tuids);
		this.buildAccess(access);
	}

	private buildTuids(tuids: any) {
		for (let i in tuids) {
			let schema = tuids[i];
			let { typeId, from } = schema;
			let tuid = this.newTuid(i, typeId, from);
			tuid.sys = true;
		}
		for (let i in tuids) {
			let schema = tuids[i];
			let tuid = this.getTuid(i);
			tuid.setSchema(schema);
		}
		for (let i in this.tuids) {
			let tuid = this.tuids[i];
			tuid.buildFieldsTuid();
		}
	}

	async loadEntitySchema(entityName: string): Promise<any> {
		return await this.uqApi.schema(entityName);
	}

	async loadAllSchemas(): Promise<void> {
		let ret = await this.uqApi.allSchemas();
		let entities: Entity[][] = [
			this.actionArr,
			this.enumArr,
			this.sheetArr,
			this.queryArr,
			this.bookArr,
			this.mapArr,
			this.historyArr,
			this.pendingArr,
			this.idArr,
			this.idxArr,
			this.ixArr,
		];
		entities.forEach(arr => {
			arr.forEach(v => {
				let entity = ret[v.name.toLowerCase()];
				if (!entity) return;
				let schema = entity.call;
				if (!schema) return;
				v.buildSchema(schema);
			});
		});
	}

	getTuid(name: string): Tuid {
		return this.tuids[name];
	}

	private buildAccess(access: any) {
		for (let a in access) {
			let v = access[a];
			switch (typeof v) {
				case 'string': this.fromType(a, v); break;
				case 'object': this.fromObj(a, v); break;
			}
		}
	}

	cacheTuids(defer: number) {
		this.tuidsCache.cacheTuids(defer);
	}

	private setEntity(name: string, entity: Entity) {
		this.entities[name] = entity;
		this.entities[name.toLowerCase()] = entity;
	}

	newEnum(name: string, id: number): UqEnum {
		let enm = this.enums[name];
		if (enm !== undefined) return enm;
		enm = this.enums[name] = new UqEnum(this, name, id);
		this.setEntity(name, enm);
		this.enumArr.push(enm);
		return enm;
	}
	newAction(name: string, id: number): Action {
		let action = this.actions[name];
		if (action !== undefined) return action;
		action = this.actions[name] = new Action(this, name, id);
		this.setEntity(name, action);
		this.actionArr.push(action);
		return action;
	}
	private newTuid(name: string, id: number, from: SchemaFrom): Tuid {
		let tuid = this.tuids[name];
		if (tuid !== undefined) return tuid;
		if (from !== undefined)
			tuid = new TuidImport(this, name, id, from);
		else
			tuid = new TuidInner(this, name, id);
		this.tuids[name] = tuid;
		this.setEntity(name, tuid);
		this.tuidArr.push(tuid);
		return tuid;
	}
	newQuery(name: string, id: number): Query {
		let query = this.queries[name];
		if (query !== undefined) return query;
		query = this.queries[name] = new Query(this, name, id)
		this.setEntity(name, query);
		this.queryArr.push(query);
		return query;
	}
	private newBook(name: string, id: number): Book {
		let book = this.books[name];
		if (book !== undefined) return book;
		book = this.books[name] = new Book(this, name, id);
		this.setEntity(name, book);
		this.bookArr.push(book);
		return book;
	}
	private newMap(name: string, id: number): Map {
		let map = this.maps[name];
		if (map !== undefined) return map;
		map = this.maps[name] = new Map(this, name, id)
		this.setEntity(name, map);
		this.mapArr.push(map);
		return map;
	}
	private newHistory(name: string, id: number): History {
		let history = this.histories[name];
		if (history !== undefined) return;
		history = this.histories[name] = new History(this, name, id)
		this.setEntity(name, history);
		this.historyArr.push(history);
		return history;
	}
	private newPending(name: string, id: number): Pending {
		let pending = this.pendings[name];
		if (pending !== undefined) return;
		pending = this.pendings[name] = new Pending(this, name, id)
		this.setEntity(name, pending);
		this.pendingArr.push(pending);
		return pending;
	}
	private newSheet(name: string, id: number): Sheet {
		let sheet = this.sheets[name];
		if (sheet !== undefined) return sheet;
		sheet = this.sheets[name] = new Sheet(this, name, id);
		this.setEntity(name, sheet);
		this.sheetArr.push(sheet);
		return sheet;
	}
	private newID(name: string, id: number): ID {
		let lName = name.toLowerCase();
		let idEntity = this.ids[lName];
		if (idEntity !== undefined) return idEntity;
		idEntity = this.ids[lName] = new ID(this, name, id);
		this.setEntity(name, idEntity);
		this.idArr.push(idEntity);
		return idEntity;
	}
	private newIDX(name: string, id: number): IDX {
		let lName = name.toLowerCase();
		let idx = this.idxs[lName];
		if (idx !== undefined) return idx;
		idx = this.idxs[lName] = new IDX(this, name, id);
		this.setEntity(name, idx);
		this.idxArr.push(idx);
		return idx;
	}
	private newIX(name: string, id: number): IX {
		let lName = name.toLowerCase();
		let ix = this.ixs[lName];
		if (ix !== undefined) return ix;
		ix = this.ixs[lName] = new IX(this, name, id);
		this.setEntity(name, ix);
		this.ixArr.push(ix);
		return ix;
	}
	private fromType(name: string, type: string) {
		let parts = type.split('|');
		type = parts[0];
		let id = Number(parts[1]);
		switch (type) {
			//case 'uq': this.id = id; break;
			case 'tuid':
				// Tuid should not be created here!;
				//let tuid = this.newTuid(name, id);
				//tuid.sys = false;
				break;
			case 'id': this.newID(name, id); break;
			case 'idx': this.newIDX(name, id); break;
			case 'ix': this.newIX(name, id); break;
			case 'action': this.newAction(name, id); break;
			case 'query': this.newQuery(name, id); break;
			case 'book': this.newBook(name, id); break;
			case 'map': this.newMap(name, id); break;
			case 'history': this.newHistory(name, id); break;
			case 'sheet': this.newSheet(name, id); break;
			case 'pending': this.newPending(name, id); break;
			case 'enum': this.newEnum(name, id); break;
		}
	}
	private fromObj(name: string, obj: any) {
		switch (obj['$']) {
			case 'sheet': this.buildSheet(name, obj); break;
		}
	}
	private buildSheet(name: string, obj: any) {
		let sheet = this.sheets[name];
		if (sheet === undefined) sheet = this.newSheet(name, obj.id);
		sheet.build(obj);
	}
	buildFieldTuid(fields: Field[], mainFields?: Field[]) {
		if (fields === undefined) return;
		for (let f of fields) {
			let { tuid } = f;
			if (tuid === undefined) continue;
			let t = this.getTuid(tuid);
			if (t === undefined) continue;
			f._tuid = t.buildTuidBox();
		}
		for (let f of fields) {
			let { owner } = f;
			if (owner === undefined) continue;
			let ownerField = fields.find(v => v.name === owner);
			if (ownerField === undefined) {
				if (mainFields !== undefined) {
					ownerField = mainFields.find(v => v.name === owner);
				}
				if (ownerField === undefined) {
					debugger;
					throw new Error(`owner field ${owner} is undefined`);
				}
			}
			let { arr, tuid } = f;
			let t = this.getTuid(ownerField._tuid.tuid.name);
			if (t === undefined) continue;
			let div = t.div(arr || tuid);
			f._tuid = div && div.buildTuidDivBox(ownerField);
			/*
			if (f._tuid === undefined) {
				debugger;
				throw new Error(`owner field ${owner} is not tuid`);
			}
			*/
		}
	}
	buildArrFieldsTuid(arrFields: ArrFields[], mainFields: Field[]) {
		if (arrFields === undefined) return;
		for (let af of arrFields) {
			let { fields } = af;
			if (fields === undefined) continue;
			this.buildFieldTuid(fields, mainFields);
		}
	}

	pullModify(modifyMax: number) {
		this.tuidsCache.pullModify(modifyMax);
	}

	getUqKey() {
		let uqKey: string = this.uqName.split(/[-._]/).join('').toLowerCase();
		return uqKey;
	}

	getUqKeyWithConfig() {
		if (!this.config) return;
		let uqKey: string = this.uqName.split(/[-._]/).join('').toLowerCase();
		let { dev, alias } = this.config;
		uqKey = capitalCase(dev.alias || dev.name) + capitalCase(alias ?? uqKey);
		return uqKey;
	}

	hasEntity(name: string): boolean {
		return this.entities[name] !== undefined
			|| this.entities[name.toLowerCase()] !== undefined;
	}

	createProxy(): any {
		let ret = new Proxy(this.entities, {
			get: (target, key, receiver) => {
				let lk = (key as string).toLowerCase();
				if (lk === '$') {
					return this;
				}
				let ret = target[lk];
				if (ret !== undefined) return ret;
				let func = (this as any)[key];
				if (func !== undefined) return func;
				let err = `entity ${this.name}.${String(key)} not defined`;
				console.error('UQ错误：' + err);
				this.showReload('服务器正在更新');
				return undefined;
			}
		});
		this.proxy = ret;
		this.idCache = new IDCache(this);
		return ret;
	}

	showReload(msg: string) {
		let cache = this.localMap.child('$reload-tick');
		let reloadTick = cache.get();
		if (!reloadTick) reloadTick = 0;
		console.error(msg);
		this.localMap.removeAll();
		let tick = Date.now();
		cache.set(tick);
		if (tick - reloadTick < 10 * 1000) {
			this.web.showReloadPage(msg);
		}
		else {
			this.web.reload();
		}
	}

	private async apiPost(api: string, resultType: EnumResultType, apiParam: any): Promise<any> {
		if (resultType === EnumResultType.sql) api = 'sql-' + api;
		let ret = await this.uqApi.post(IDPath(api), apiParam);
		return ret;
	}

	private async apiActs(param: any, resultType: EnumResultType): Promise<any> {
		// 这边的obj属性序列，也许会不一样
		let arr: string[] = [];
		let apiParam: any = {};
		for (let i in param) {
			arr.push(i);
			apiParam[i] = (param[i] as any[]).map(v => {
				let obj: any = {};
				for (let j in v) {
					let val = v[j];
					if (typeof val === 'object') {
						let nv: any = {};
						for (let n in val) {
							let tv = val[n];
							if (tv && typeof tv === 'object') {
								if (n === 'time') {
									if (Object.prototype.toString.call(tv) === '[object Date]') {
										tv = (tv as Date).getTime();
									}
								}
								else {
									let id = tv['id'];
									tv = id;
								}
							}
							nv[n] = tv;
						}
						obj[j] = nv;
					}
					else {
						obj[j] = val;
					}
				}
				return obj;
			});
		}
		apiParam['$'] = arr;
		let ret = await this.apiPost('acts', resultType, apiParam);
		return ret;
	}

	protected Acts = async (param: any): Promise<any> => {
		//let apiParam = this.ActsApiParam(param);
		let ret = await this.apiActs(param, EnumResultType.data); // await this.apiPost('acts', apiParam);
		let retArr = (ret[0].ret as string).split('\n');
		let arr: string[] = [];
		for (let i in param) arr.push(i);
		let retActs: { [key: string]: number[] } = {};
		for (let i = 0; i < arr.length; i++) {
			retActs[arr[i]] = ids(retArr[i].split('\t'));
		}
		return retActs;
	}

	protected getAdmins = async (): Promise<{ id: number; role: number }[]> => {
		return await this.uqApi.getAdmins();
	}

	protected $Acts = async (param: any): Promise<any> => {
		return await this.apiActs(param, EnumResultType.sql);
	}

	private async apiActIX(param: any, resultType: EnumResultType): Promise<any> {
		let { IX, ID, values, IXs } = param;
		let apiParam: any = {
			IX: entityName(IX),
			ID: entityName(ID),
			IXs: IXs?.map((v: any) => ({ IX: entityName(v.IX), ix: v.ix })),
			values,
		};
		let ret = await this.apiPost('act-ix', resultType, apiParam);
		return ret;
	}

	protected ActIX = async (param: ParamActIX<any>): Promise<number[]> => {
		/*
		let {IX, ID, values, IXs} = param;
		let apiParam:any = {
			IX: entityName(IX),
			ID: entityName(ID),
			IXs: IXs?.map(v => ({IX:entityName(v.IX), ix:v.ix})),
			values,
		};
		let ret = await this.apiPost('act-ix'), apiParam);
		*/
		let ret = await this.apiActIX(param, EnumResultType.data);
		return (ret[0].ret as string).split('\t').map(v => Number(v));
	}

	protected $ActIX = async (param: ParamActIX<any>): Promise<string> => {
		let ret = await this.apiActIX(param, EnumResultType.sql);
		return ret;
	}

	private async apiActIxSort(param: ParamActIXSort, resultType: EnumResultType): Promise<any> {
		let { IX, ix, id, after } = param;
		let apiParam: any = {
			IX: entityName(IX),
			ix,
			id,
			after,
		};
		return await this.apiPost('act-ix-sort', resultType, apiParam);
	}

	protected ActIXSort = async (param: ParamActIXSort): Promise<void> => {
		/*
		let {IX, ix, id, after} = param;
		let apiParam:any = {
			IX: entityName(IX),
			ix,
			id,
			after,
		};
		await this.apiPost('act-ix-sort'), apiParam);
		*/
		return await this.apiActIxSort(param, EnumResultType.data);
	}

	protected $ActIXSort = async (param: ParamActIXSort): Promise<string> => {
		return await this.apiActIxSort(param, EnumResultType.sql);
	}

	private async apiActDetail(param: ParamActDetail<any, any>, resultType: EnumResultType): Promise<any> {
		let { main, detail, detail2, detail3 } = param as unknown as ParamActDetail3<any, any, any, any>;
		let postParam: any = {
			main: {
				name: entityName(main.ID),
				value: toScalars(main.value),
			},
			detail: {
				name: entityName(detail.ID),
				values: detail.values?.map(v => toScalars(v)),
			},
		}
		if (detail2) {
			postParam.detail2 = {
				name: entityName(detail2.ID),
				values: detail2.values?.map(v => toScalars(v)),
			}
		}
		if (detail3) {
			postParam.detail3 = {
				name: entityName(detail3.ID),
				values: detail3.values?.map(v => toScalars(v)),
			}
		}
		let ret = await this.apiPost('act-detail', resultType, postParam);
	}

	protected ActDetail = async (param: ParamActDetail<any, any>) => {
		let ret = await this.apiActDetail(param, EnumResultType.data);
		let val: string = ret[0].ret;
		let parts = val.split('\n');
		let items = parts.map(v => v.split('\t'));
		ret = {
			main: ids(items[0])[0],
			detail: ids(items[1]),
			detail2: ids(items[2]),
			detail3: ids(items[3]),
		};
		return ret;
	}

	protected $ActDetail = async (param: ParamActDetail<any, any>) => {
		return await this.apiActDetail(param, EnumResultType.sql);
	}

	private async apiQueryID(param: ParamQueryID, resultType: EnumResultType): Promise<any[]> {
		let { ID, IX, IDX } = param;
		if (!IDX) {
			IDX = [ID];
		}
		let ret = await this.apiPost('query-id', resultType, {
			...param,
			ID: entityName(ID),
			IX: IX?.map(v => entityName(v)),
			IDX: this.IDXToString(IDX),
		});
		return ret;
	}

	protected QueryID = async (param: ParamQueryID) => {
		return await this.apiQueryID(param, EnumResultType.data);
	}

	protected $QueryID = async (param: ParamQueryID) => {
		return await this.apiQueryID(param, EnumResultType.sql);
	}

	private async apiIDTv(ids: number[], resultType: EnumResultType): Promise<any[]> {
		let ret = await this.apiPost('id-tv', resultType, ids);
		return ret;
	}

	IDTv = async (ids: number[]): Promise<any[]> => {
		let ret = await this.apiIDTv(ids, EnumResultType.data);
		let retValues: any[] = [];
		for (let row of ret) {
			let { $type, $tv } = row;
			if (!$tv) continue;
			let ID = this.ids[$type];
			if (!ID) continue;
			let { schema } = ID;
			if (!schema) {
				await ID.loadSchema();
				schema = ID.schema;
			}
			let { nameNoVice } = schema;
			if (!nameNoVice) continue;
			let values = ($tv as string).split('\n');
			let len = nameNoVice.length;
			for (let i = 0; i < len; i++) {
				let p = nameNoVice[i];
				row[p] = values[i];
			}
			delete row.$tv;
			retValues.push(row);
		}
		return retValues;
	}

	protected $IDTv = async (ids: number[]): Promise<any> => {
		return await this.apiIDTv(ids, EnumResultType.sql);
	}

	private async apiIDNO(param: ParamIDNO, resultType: EnumResultType): Promise<string> {
		let { ID, stamp } = param;
		let ret = await this.apiPost('id-no', resultType, { ID: entityName(ID), stamp });
		return ret;
	}

	protected IDNO = async (param: ParamIDNO): Promise<string> => {
		return await this.apiIDNO(param, EnumResultType.data);
	}

	protected $IDNO = async (param: ParamIDNO): Promise<string> => {
		return await this.apiIDNO(param, EnumResultType.sql);
	}

	private async apiIDDetailGet(param: ParamIDDetailGet, resultType: EnumResultType): Promise<any> {
		let { id, main, detail, detail2, detail3 } = param;
		let ret = await this.apiPost('id-detail-get', resultType, {
			id,
			main: entityName(main),
			detail: entityName(detail),
			detail2: entityName(detail2),
			detail3: entityName(detail3),
		});
		return ret;
	}

	IDDetailGet = async (param: ParamIDDetailGet): Promise<any> => {
		return await this.apiIDDetailGet(param, EnumResultType.data);
	}

	protected $IDDetailGet = async (param: ParamIDDetailGet): Promise<any> => {
		return await this.apiIDDetailGet(param, EnumResultType.sql);
	}

	//private checkParam(ID:ID, IDX:(ID|IDX)|(ID|IDX)[], IX:IX, id:number|number[], key:{[key:string]:string|number}, page: ParamPage) {
	//}
	private IDXToString(p: ID | IDX | ((ID | IDX)[])): string | string[] {
		if (Array.isArray(p) === true) return (p as (ID | IDX)[]).map(v => entityName(v));
		return entityName(p as ID | IDX);
	}
	private async apiID(param: ParamID, resultType: EnumResultType): Promise<any> {
		let { IDX } = param;
		//this.checkParam(null, IDX, null, id, null, page);
		let ret = await this.apiPost('id', resultType, {
			...param,
			IDX: this.IDXToString(IDX),
		});
		return ret;
	}
	protected ID = async (param: ParamID): Promise<any[]> => {
		return await this.apiID(param, EnumResultType.data);
	}
	protected $ID = async (param: ParamID): Promise<string> => {
		return await this.apiID(param, EnumResultType.sql);
	}

	private async apiKeyID(param: ParamKeyID, resultType: EnumResultType): Promise<any> {
		let { ID, IDX } = param;
		//this.checkParam(null, IDX, null, null, key, page);
		let ret = await this.apiPost('key-id', resultType, {
			...param,
			ID: entityName(ID),
			IDX: IDX?.map(v => entityName(v)),
		});
		return ret;
	}
	protected KeyID = async (param: ParamKeyID): Promise<any[]> => {
		return await this.apiKeyID(param, EnumResultType.data);
	}
	protected $KeyID = async (param: ParamKeyID): Promise<string> => {
		return await this.apiKeyID(param, EnumResultType.sql);
	}

	private async apiIX(param: ParamIX, resultType: EnumResultType): Promise<any> {
		let { IX, IX1, IDX } = param;
		//this.checkParam(null, IDX, IX, id, null, page);
		let ret = await this.apiPost('ix', resultType, {
			...param,
			IX: entityName(IX),
			IX1: entityName(IX1),
			IDX: IDX?.map(v => entityName(v)),
		});
		return ret;
	}
	protected IX = async (param: ParamIX): Promise<any[]> => {
		return await this.apiIX(param, EnumResultType.data);
	}
	protected $IX = async (param: ParamIX): Promise<string> => {
		return await this.apiIX(param, EnumResultType.sql);
	}

	private async apiIXr(param: ParamIX, resultType: EnumResultType): Promise<any> {
		let { IX, IX1, IDX } = param;
		//this.checkParam(null, IDX, IX, id, null, page);
		let ret = await this.apiPost('ixr', resultType, {
			...param,
			IX: entityName(IX),
			IX1: entityName(IX1),
			IDX: IDX?.map(v => entityName(v)),
		});
		return ret;
	}
	protected IXr = async (param: ParamIX): Promise<any[]> => {
		return await this.apiIXr(param, EnumResultType.data);
	}
	protected $IXr = async (param: ParamIX): Promise<any[]> => {
		return await this.apiIXr(param, EnumResultType.sql);
	}

	private async apiKeyIX(param: ParamKeyIX, resultType: EnumResultType): Promise<any> {
		let { ID, IX, IDX } = param;
		//this.checkParam(ID, IDX, IX, null, key, page);
		let ret = await this.apiPost('key-ix', resultType, {
			...param,
			ID: entityName(ID),
			IX: entityName(IX),
			IDX: IDX?.map(v => entityName(v)),
		});
		return ret;
	}
	protected KeyIX = async (param: ParamKeyIX): Promise<any[]> => {
		return await this.apiKeyIX(param, EnumResultType.data);
	}
	protected $KeyIX = async (param: ParamKeyIX): Promise<any[]> => {
		return await this.apiKeyIX(param, EnumResultType.sql);
	}

	private async apiIDLog(param: ParamIDLog, resultType: EnumResultType): Promise<any> {
		let { IDX } = param;
		//this.checkParam(null, IDX, null, id, null, page);
		let ret = await this.apiPost('id-log', resultType, {
			...param,
			IDX: entityName(IDX),
		});
		return ret;
	}
	protected IDLog = async (param: ParamIDLog): Promise<any[]> => {
		return await this.apiIDLog(param, EnumResultType.data);
	}
	protected $IDLog = async (param: ParamIDLog): Promise<string> => {
		return await this.apiIDLog(param, EnumResultType.sql);
	}

	private async apiIDSum(param: ParamIDSum, resultType: EnumResultType): Promise<any> {
		let { IDX } = param;
		//this.checkParam(null, IDX, null, id, null, page);
		let ret = await this.apiPost('id-sum', resultType, {
			...param,
			IDX: entityName(IDX),
		});
		return ret;
	}
	protected IDSum = async (param: ParamIDSum): Promise<any[]> => {
		return await this.apiIDSum(param, EnumResultType.data);
	}
	protected $IDSum = async (param: ParamIDSum): Promise<string> => {
		return await this.apiIDSum(param, EnumResultType.sql);
	}

	private async apiIDinIX(param: ParamIDinIX, resultType: EnumResultType): Promise<any> {
		let { ID, IX } = param;
		//this.checkParam(null, IDX, null, id, null, page);
		let ret = await this.apiPost('id-in-ix', resultType, {
			...param,
			ID: entityName(ID),
			IX: entityName(IX),
		});
		return ret;
	}
	protected IDinIX = async (param: ParamIDinIX): Promise<any | { $in: boolean }[]> => {
		return await this.apiIDinIX(param, EnumResultType.data);
	}
	protected $IDinIX = async (param: ParamIDinIX): Promise<string> => {
		return await this.apiIDinIX(param, EnumResultType.sql);
	}

	private async apiIDxID(param: ParamIDxID, resultType: EnumResultType): Promise<any> {
		let { ID, IX, ID2 } = param;
		//this.checkParam(null, IDX, null, id, null, page);
		let ret = await this.apiPost('id-x-id', resultType, {
			...param,
			ID: entityName(ID),
			IX: entityName(IX),
			ID2: entityName(ID2),
		});
		return ret;
	}
	protected IDxID = async (param: ParamIDxID): Promise<any[]> => {
		return await this.apiIDxID(param, EnumResultType.data);
	}
	protected $IDxID = async (param: ParamIDxID): Promise<string> => {
		return await this.apiIDxID(param, EnumResultType.sql);
	}

	private async apiIDTree(param: ParamIDTree, resultType: EnumResultType): Promise<any> {
		let { ID } = param;
		let ret = await this.apiPost('id-tree', resultType, {
			...param,
			ID: entityName(ID),
		});
		return ret;
	}
	protected IDTree = async (param: ParamIDTree): Promise<any[]> => {
		return await this.apiIDTree(param, EnumResultType.data);
	}
	protected $IDTree = async (param: ParamIDTree): Promise<string> => {
		return await this.apiIDTree(param, EnumResultType.sql);
	}
}

function ids(item: string[]): number[] {
	if (!item) return;
	let len = item.length;
	if (len <= 1) return;
	let ret: number[] = [];
	for (let i = 0; i < len - 1; i++) ret.push(Number(item[i]));
	return ret;
}

function entityName(entity: Entity | string): string {
	if (!entity) return;
	if (typeof entity === 'string') return entity;
	return entity.name;
}

function toScalars(value: any): any {
	if (!value) return value;
	let ret: any = {};
	for (let i in value) {
		let v = value[i];
		if (typeof v === 'object') v = v['id'];
		ret[i] = v;
	}
	return ret;
}
