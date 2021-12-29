import { UqBuildContext } from "./UqBuildContext";
import { camelCase, capitalCase } from "../tool";
import {
	UqMan, Action, Book, Query, Sheet
	, Tuid, UqEnum, Map, History, Pending
	, Entity, ID, IX, IDX, ArrFields, Field
} from '../uqCore';
import { entityName } from "./tools";

const fieldTypeMap: { [type: string]: string } = {
	"char": "string",
	"text": "string",
	"id": "number",
	"textid": "string",
	"int": "number",
	"bigint": "number",
	"smallint": "number",
	"tinyint": "number",
	"dec": "number",
	"float": "number",
	"double": "number",
};
const sysFields = ['id', 'main', 'row', 'no', '$create', '$update', '$owner'];

export class TsUQ {
	private buildContext: UqBuildContext;
	private readonly uq: UqMan;
	private readonly uqAlias: string;

	constructor(buildContext: UqBuildContext, uq: UqMan, uqAlias: string) {
		this.buildContext = buildContext;
		this.uq = uq;
		this.uqAlias = uqAlias;
	}

	build() {
		let tsImport = `
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IDXValue, Uq`;
		let ts: string = `\n\n`;
		ts += '\n//===============================';
		ts += `\n//======= UQ ${this.uq.name} ========`;
		ts += '\n//===============================';
		ts += '\n';

		let { enumArr, tuidArr, actionArr, sheetArr
			, queryArr, bookArr, mapArr, historyArr
			, pendingArr, idArr, idxArr, ixArr
		} = this.uq;
		enumArr.forEach(v => ts += this.uqEntityInterface<UqEnum>(v, this.buildEnumInterface));
		tuidArr.forEach(v => ts += this.uqEntityInterface<Tuid>(v, this.buildTuidInterface));
		actionArr.forEach(v => ts += this.uqEntityInterface<Action>(v, this.buildActionInterface));
		sheetArr.forEach(v => ts += this.uqEntityInterface<Sheet>(v, this.buildSheetInterface));
		queryArr.forEach(v => ts += this.uqEntityInterface<Query>(v, this.buildQueryInterface));
		bookArr.forEach(v => ts += this.uqEntityInterface<Book>(v, this.buildBookInterface));
		mapArr.forEach(v => ts += this.uqEntityInterface<Map>(v, this.buildMapInterface));
		historyArr.forEach(v => ts += this.uqEntityInterface<History>(v, this.buildHistoryInterface));
		pendingArr.forEach(v => ts += this.uqEntityInterface<Pending>(v, this.buildPendingInterface));
		idArr.forEach(v => ts += this.uqEntityInterface<ID>(v, this.buildIDInterface));
		idxArr.forEach(v => ts += this.uqEntityInterface<IDX>(v, this.buildIDXInterface));
		idxArr.forEach(v => ts += this.uqEntityInterface<IDX>(v, this.buildIDXActParamInterface));
		ixArr.forEach(v => ts += this.uqEntityInterface<IX>(v, this.buildIXInterface));

		ts += this.buildActsInterface(this.uq);

		ts += `

export interface UqExt extends Uq {
	Acts(param:ParamActs): Promise<any>;
	SQL: Uq;
	IDRender(id:number):${this.buildContext.element};
	IDLocalRender(id:number):${this.buildContext.element};
`;
		function appendArr<T extends Entity>(arr: T[], type: string, tsBuild: (v: T) => string) {
			if (arr.length === 0) return;
			let tsLen = ts.length;
			arr.forEach(v => ts += tsBuild(v));
			if (ts.length - tsLen > 0) {
				tsImport += ', Uq' + type;
			}
		}
		appendArr<Tuid>(tuidArr, 'Tuid', v => this.uqBlock<Tuid>(v, this.buildTuid));
		appendArr<Action>(actionArr, 'Action', v => this.uqBlock<Action>(v, this.buildAction));
		appendArr<Sheet>(sheetArr, 'Sheet', v => this.uqBlock<Sheet>(v, this.buildSheet));
		appendArr<Book>(bookArr, 'Book', v => this.uqBlock<Book>(v, this.buildBook));
		appendArr<Query>(queryArr, 'Query', v => this.uqBlock<Query>(v, this.buildQuery));
		appendArr<Map>(mapArr, 'Map', v => this.uqBlock<Map>(v, this.buildMap));
		appendArr<History>(historyArr, 'History', v => this.uqBlock<History>(v, this.buildHistory));
		appendArr<Pending>(pendingArr, 'Pending', v => this.uqBlock<Pending>(v, this.buildPending));
		appendArr<ID>(idArr, 'ID', v => this.uqBlock<ID>(v, this.buildID));
		appendArr<IDX>(idxArr, 'IDX', v => this.uqBlock<IDX>(v, this.buildIDX));
		appendArr<IX>(ixArr, 'IX', v => this.uqBlock<IX>(v, this.buildIX));
		ts += '\n}\n';
		ts += `
export function assign(uq: any, to:string, from:any): void {
	let hasEntity = uq.hasEntity(to);
	if (hasEntity === false) {
		return;
	}
	Object.assign((uq as any)[to], from);
}
`;

		tsImport += ` } from "tonwa-core";
import { Render, IDXEntity } from "tonwa-${this.buildContext.uiPlatform}";`;

		return tsImport + ts;
	}

	private uqEntityInterface<T extends Entity>(entity: T, buildInterface: (entity: T) => string) {
		let { name } = entity;
		if (name.indexOf('$') > 0) return '';
		let entityCode = buildInterface(entity);
		if (!entityCode) return '';
		return '\n' + entityCode + '\n';
	}

	private uqBlock<T extends Entity>(entity: T, build: (entity: T) => string) {
		let { name } = entity;
		if (name.indexOf('$') > 0) return '';
		let entityCode = build(entity);
		if (!entityCode) return '';
		return '\n' + entityCode;
	}

	private buildFields(fields: Field[], isInID: boolean = false, indent: number = 1) {
		if (!fields) return '';
		let ts = '';
		for (let f of fields) {
			ts += this.buildField(f, isInID, indent);
		}
		return ts;
	}

	private buildField(field: Field, isInID: boolean, indent: number = 1) {
		let { name, type } = field;
		let s = fieldTypeMap[type];
		if (!s) s = 'any';
		let q: string = (isInID === true && sysFields.indexOf(name) >= 0) ? '?' : '';
		return `\n${'\t'.repeat(indent)}${name}${q}: ${s};`;
	}

	private buildArrs(arrFields: ArrFields[]): string {
		if (!arrFields) return '';
		let ts = '\n';
		for (let af of arrFields) {
			ts += `\t${camelCase(af.name)}: {`;
			ts += this.buildFields(af.fields, false, 2);
			ts += '\n\t}[];\n';
		}
		return ts;
	}

	private buildReturns(entity: Entity, returns: ArrFields[]): string {
		if (!returns) return;
		//let {typeName} = entity;
		//let type = typeMap[typeName] || typeName;
		let { sName } = entity;
		sName = capitalCase(sName);
		let ts = '';
		for (let ret of returns) {
			let retName = capitalCase(ret.name);
			ts += `export interface Return${sName}${retName} {`;
			ts += this.buildFields(ret.fields);
			ts += '\n}\n';
		}

		ts += `export interface Result${sName} {\n`;
		for (let ret of returns) {
			let retName = capitalCase(ret.name);
			ts += `\t${ret.name}: Return${sName}${retName}[];\n`;
		}
		ts += '}';
		return ts;
	}

	private buildTuid = (tuid: Tuid) => {
		let ts = `\t${entityName(tuid.sName)}: UqTuid<Tuid${capitalCase(tuid.sName)}>&{tv:(id:number, render?:Render<any>)=>${this.buildContext.element}};`;
		return ts;
	}

	private buildTuidInterface = (tuid: Tuid) => {
		let ts = `export interface Tuid${capitalCase(tuid.sName)} {`;
		ts += `\n\tid?: number;`;
		ts += this.buildFields(tuid.fields);
		ts += '\n}';
		return ts;
	}

	private buildAction = (action: Action) => {
		let ts = `\t${entityName(action.sName)}: UqAction<Param${capitalCase(action.sName)}, Result${capitalCase(action.sName)}>;`;
		return ts;
	}

	private buildActionInterface = (action: Action) => {
		let ts = `export interface Param${capitalCase(action.sName)} {`;
		ts += this.buildFields(action.fields);
		ts += this.buildArrs(action.arrFields);
		ts += '\n}\n';
		ts += this.buildReturns(action, action.returns);
		return ts;
	}

	private buildEnumInterface = (enm: UqEnum) => {
		let { schema } = enm;
		if (!schema) return;
		let { values } = schema;
		let ts = `export enum ${capitalCase(enm.sName)} {`;
		let first: boolean = true;
		for (let i in values) {
			if (first === false) {
				ts += ',';
			}
			else {
				first = false;
			}
			let v = values[i];
			ts += '\n\t' + i + ' = ';
			if (typeof v === 'string') {
				ts += '"' + v + '"';
			}
			else {
				ts += v;
			}
		}
		return ts += '\n}'
	}

	private buildQuery = (query: Query) => {
		let { sName } = query;
		let ts = `\t${entityName(sName)}: UqQuery<Param${capitalCase(sName)}, Result${capitalCase(sName)}>;`;
		return ts;
	}

	private buildQueryInterface = (query: Query) => {
		let ts = `export interface Param${capitalCase(query.sName)} {`;
		ts += this.buildFields(query.fields);
		ts += '\n}\n';
		ts += this.buildReturns(query, query.returns);
		return ts;
	}

	private buildSheet = (sheet: Sheet) => {
		let { sName, verify } = sheet;
		let cName = capitalCase(sName);
		let v = verify ? `Verify${cName}` : 'any';
		let ts = `\t${entityName(sName)}: UqSheet<Sheet${cName}, ${v}>;`;
		return ts;
	}

	private buildSheetInterface = (sheet: Sheet) => {
		let { sName, fields, arrFields, verify } = sheet;
		let ts = `export interface Sheet${capitalCase(sName)} {`;
		ts += this.buildFields(fields);
		ts += this.buildArrs(arrFields);
		ts += '}';

		if (verify) {
			let { returns } = verify;
			ts += `\nexport interface Verify${capitalCase(sName)} {`;
			for (let item of returns) {
				let { name: arrName, fields } = item;
				ts += '\n\t' + arrName + ': {';
				ts += this.buildFields(fields, false, 2);
				ts += '\n\t}[];';
			}
			ts += '\n}';
		}
		return ts;
	}

	private buildBook = (book: Book): string => {
		let { sName } = book;
		let ts = `\t${entityName(sName)}: UqBook<Param${capitalCase(sName)}, Result${capitalCase(sName)}>;`;
		return ts;
	}

	private buildBookInterface = (book: Book): string => {
		let { sName, fields, returns } = book;
		let ts = `export interface Param${capitalCase(sName)} {`;
		ts += this.buildFields(fields);
		ts += '\n}\n';
		ts += this.buildReturns(book, returns);
		return ts;
	}

	private buildMap = (map: Map): string => {
		let { sName } = map;
		let ts = `\t${entityName(sName)}: UqMap;`;
		return ts;
	}

	private buildMapInterface = (map: Map): string => {
		/*
		let {sName, fields, returns} = map;
		let ts = `export interface Param${capitalCaseString(sName)} {`;
		ts += this.buildFields(fields);
		ts += '\n}\n';
		ts += buildReturns(map, returns);
		return ts;
		*/
		return '';
	}

	private buildHistory = (history: History): string => {
		let { sName } = history;
		let ts = `\t${entityName(sName)}: UqHistory<Param${capitalCase(sName)}, Result${capitalCase(sName)}>;`;
		return ts;
	}

	private buildHistoryInterface = (history: History): string => {
		let { sName, fields, returns } = history;
		let ts = `export interface Param${capitalCase(sName)} {`;
		ts += this.buildFields(fields);
		ts += '\n}\n';
		ts += this.buildReturns(history, returns);
		return ts;
	}

	private buildPending = (pending: Pending): string => {
		let { sName } = pending;
		let ts = `\t${entityName(sName)}: UqPending<any, any>;`;
		return ts;
	}

	private buildPendingInterface = (pending: Pending): string => {
		/*
		let {sName, fields, returns} = pending;
		let ts = `export interface Param${capitalCaseString(sName)} {`;
		ts += this.buildFields(fields);
		ts += '\n}\n';
		ts += buildReturns(pending, returns);
		return ts;
		*/
		return '';
	}

	private buildID = (id: ID): string => {
		let { sName } = id;
		let ts = `\t${entityName(sName)}: UqID<any> & IDXEntity<any>;`;
		return ts;
	}

	private buildIDX = (idx: IDX): string => {
		let { sName } = idx;
		let ts = `\t${entityName(sName)}: UqIDX<any>;`;
		return ts;
	}

	private buildIX = (ix: IX): string => {
		let { sName } = ix;
		let ts = `\t${entityName(sName)}: UqIX<any>;`;
		return ts;
	}

	private buildIDInterface = (idEntity: ID): string => {
		let { sName, fields, schema } = idEntity;
		let { keys: schemaKeys } = schema;
		let keys: Field[] = [], others: Field[] = [];
		for (let f of fields) {
			let { name } = f;
			if (name === 'id') continue;
			if ((schemaKeys as any[]).find(v => v.name === name)) keys.push(f);
			else others.push(f);
		}
		let ts = `export interface ${capitalCase(sName)} {`;
		ts += `\n\tid?: number;`;
		ts += this.buildFields(keys, true);
		ts += this.buildFields(others, true);
		ts += '\n}';
		return ts;
	}

	private buildIDXInterface = (idx: IDX): string => {
		let { sName, fields, schema } = idx;
		let { exFields } = schema;
		let ts = `export interface ${capitalCase(sName)} {`;
		let indent = 1;
		for (let field of fields) {
			let { name, type } = field;
			let s = fieldTypeMap[type];
			if (!s) s = 'any';
			ts += `\n${'\t'.repeat(indent)}${name}`;
			if (name !== 'id') ts += '?';
			ts += `: ${s};`;
		}

		ts += `\n\t$act?: number;`;

		let hasTrack: boolean = false;
		let hasMemo: boolean = false;
		if (exFields) {
			for (let exField of exFields) {
				let { track, memo } = exField;
				if (track === true) hasTrack = true;
				if (memo === true) hasMemo = true;
			}
		}
		if (hasTrack === true) {
			ts += `\n\t$track?: number;`;
		}
		if (hasMemo === true) {
			ts += `\n\t$memo?: string;`;
		}
		ts += '\n}';
		return ts;
	}

	private buildIDXActParamInterface = (idx: IDX): string => {
		let { sName, fields, schema } = idx;
		let { exFields } = schema;
		let ts = `export interface ActParam${capitalCase(sName)} {`;
		let indent = 1;
		for (let field of fields) {
			let { name, type } = field;
			let s = fieldTypeMap[type];
			if (!s) s = 'any';
			ts += `\n${'\t'.repeat(indent)}${name}`;
			if (name !== 'id') ts += '?';
			ts += `: ${s}|IDXValue;`;
		}

		ts += `\n\t$act?: number;`;

		let hasTrack: boolean = false;
		let hasMemo: boolean = false;
		if (exFields) {
			for (let exField of exFields) {
				let { track, memo } = exField;
				if (track === true) hasTrack = true;
				if (memo === true) hasMemo = true;
			}
		}
		if (hasTrack === true) {
			ts += `\n\t$track?: number;`;
		}
		if (hasMemo === true) {
			ts += `\n\t$memo?: string;`;
		}
		ts += '\n}';
		return ts;
	}

	private buildIXInterface = (ix: IX): string => {
		let { sName, fields } = ix;
		let ts = `export interface ${capitalCase(sName)} {`;
		ts += this.buildFields(fields);
		ts += '\n}';
		return ts;
	}

	private buildActsInterface(uq: UqMan) {
		let ts = `\nexport interface ParamActs {`;
		uq.idArr.forEach(v => {
			let { sName } = v;
			ts += `\n\t${camelCase(sName)}?: ${capitalCase(sName)}[];`;
		});
		uq.idxArr.forEach(v => {
			let { sName } = v;
			ts += `\n\t${camelCase(sName)}?: ActParam${capitalCase(sName)}[];`;
		});
		uq.ixArr.forEach(v => {
			let { sName } = v;
			ts += `\n\t${camelCase(sName)}?: ${capitalCase(sName)}[];`;
		});
		ts += '\n}\n';
		return ts;
	}
}