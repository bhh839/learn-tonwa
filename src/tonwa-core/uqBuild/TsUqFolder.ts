import fs from "fs";
import { capitalCase } from "../tool";
import { Entity, ID, IDX, IX, UqMan } from "../uqCore";
import { TsUQ } from "./TsUQ";
import { buildFieldItem } from "./buildFieldItem";
import { overrideTsFile, saveTsFileIfNotExists } from "./tools";
import { UqBuildContext } from "./UqBuildContext";

interface FieldItem {
	name: string;
};

interface ReplaceSection {
	begin: string;
	end: string;
	content: string;
};

const fieldItemReplaceProps = ['label', 'placeholder', 'widget', 'type'];

export class TsUqFolder {
	private buildContext: UqBuildContext;
	private readonly uq: UqMan;
	private readonly uqsFolder: string;
	private readonly uqAlias: string;

	constructor(buildContext: UqBuildContext, uq: UqMan, uqsFolder: string, uqAlias: string) {
		this.buildContext = buildContext;
		this.uq = uq;
		this.uqsFolder = uqsFolder;
		this.uqAlias = uqAlias;
	}

	build() {
		let uqFolder = this.uqsFolder + '/' + this.uqAlias;
		if (fs.existsSync(uqFolder) === false) {
			fs.mkdirSync(uqFolder);
		}
		let tsUq = this.buildContext.tsTemplate.tsHeader;
		let tsUqBuilder = new TsUQ(this.buildContext, this.uq, this.uqAlias);
		//tsUq += buildUQ(this.uq, this.uqAlias);
		tsUq += tsUqBuilder.build();
		overrideTsFile(`${uqFolder}/${this.uqAlias}.ts`, tsUq);
		this.saveTuidAndIDTsIndexAndRender(uqFolder);
	}

	private saveTuidAndIDTsIndexAndRender(uqFolder: string) {
		let imports = '', sets = '';
		let { idArr, idxArr, ixArr, tuidArr } = this.uq;
		let coll: { [name: string]: Entity } = {};

		for (let i of tuidArr) {
			let { sName } = i;
			coll[sName.toLowerCase()] = i;
			let cName = capitalCase(sName);
			if (cName[0] === '$') continue;
			imports += `\nimport * as ${cName} from './${cName}.ui';`;
			sets += `\n	assign(uq, '${cName}', ${cName});`;

			let tsUI = `/* eslint-disable */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FieldItem, FieldItemNumber, FieldItemString, FieldItemId, FieldItemInt, UI, TFunc } from 'tonwa-${this.buildContext.uiPlatform}';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Res, uqStringify, setRes } from "tonwa-core";
import { Tuid${cName} } from "./${this.uqAlias}";

const resRaw: Res<any> = {
	$zh: {
	},
	$en: {
	}
};
const res: any = {};
setRes(res, resRaw);

export const t:TFunc = (str:string|${this.buildContext.element}): string|${this.buildContext.element} => {
	return res[str as string] ?? str;
}

export function render(item: Tuid${cName}):${this.buildContext.element} {
	return <>{uqStringify(item)}</>;
};
`;

			let path = `${uqFolder}/${cName}.ui.tsx`;
			saveTsFileIfNotExists(path, tsUI);
		}

		for (let i of [...idArr, ...idxArr, ...ixArr]) {
			let { sName } = i;
			//coll[sName.toLowerCase()] = i;
			let cName = capitalCase(sName);
			if (cName[0] === '$') continue;
			coll[cName.toLocaleLowerCase()] = i;
			imports += `\nimport * as ${cName} from './${cName}.ui';`;
			sets += `\n	assign(uq, '${cName}', ${cName});`;

			let tsUI = `// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FieldItem, FieldItemNumber, FieldItemString, FieldItemId, FieldItemInt, UI, TFunc } from 'tonwa-${this.buildContext.uiPlatform}';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Res, uqStringify, setRes } from "tonwa-core";
import { ${cName} } from "./${this.uqAlias}";

/*--fields--*/
const fields = {
};
/*==fields==*/

const fieldArr: FieldItem[] = [
];

export const ui: UI = {
	label: "${cName}",
	fieldArr,
	fields,
};

const resRaw: Res<any> = {
	$zh: {
	},
	$en: {
	}
};
const res: any = {};
setRes(res, resRaw);

export const t:TFunc = (str:string|${this.buildContext.element}): string|${this.buildContext.element} => {
	return res[str as string] ?? str;
}

export function render(item: ${cName}):${this.buildContext.element} {
	return <>{uqStringify(item)}</>;
};
`;

			let path = `${uqFolder}/${cName}.ui.tsx`;
			saveTsFileIfNotExists(path, tsUI);

			let fields = this.buildFields(i);
			let tsFieldArr: string = this.buildFieldArr(i);

			this.replaceTsFileFields(path, fields);
			let tsImportFieldItemsBegin = 'import { FieldItem, ';
			let tsImportFieldItemsEnd = ` } from "tonwa-${this.buildContext.uiPlatform}";`;
			let tsImportFieldItems = 'FieldItemInt, FieldItemNumber, FieldItemString, FieldItemId';
			this.replaceTsFileString(path,
				{
					begin: tsImportFieldItemsBegin,
					end: tsImportFieldItemsEnd,
					content: tsImportFieldItemsBegin + tsImportFieldItems + tsImportFieldItemsEnd,
				}
			);
			this.replaceTsFileString(path,
				{ begin: '\nconst fieldArr: FieldItem[] = [\n', end: '\n];\n', content: tsFieldArr }
			);
		}

		let tsIndex = `import { UqExt as Uq, assign } from './${this.uqAlias}';${imports}
	
export function setUI(uq: Uq) {${sets}
}
export * from './${this.uqAlias}';
`;
		overrideTsFile(`${uqFolder}/index.ts`, tsIndex);

		let files = fs.readdirSync(uqFolder);
		const suffix = '.ui.tsx';
		for (let file of files) {
			if (file.endsWith(suffix) === false) continue;
			let from = file.length - suffix.length;
			let fileEntityName = file.substring(0, from);
			let entity = coll[fileEntityName.toLocaleLowerCase()];
			if (entity === undefined || fileEntityName[0] === '$') {
				let unFile = `${uqFolder}/${file}`;
				fs.unlinkSync(unFile);
			}
		}
	}

	private buildFields(i: ID | IDX | IX): { [name: string]: FieldItem } {
		switch (i.typeName) {
			case 'id': return this.buildIDFields(i as ID);
			case 'idx': return this.buildIDXFields(i);
			case 'ix': return this.buildIXFields(i);
		}
	};

	private buildIDFields(ID: ID): { [name: string]: FieldItem } {
		let ret: { [name: string]: FieldItem } = {};
		let { schema } = ID;
		let { keys, fields } = schema;
		for (let f of fields) {
			let { name } = f;
			let isKey = (keys as any[])?.findIndex(v => v.name === name) >= 0;
			ret[name] = buildFieldItem(f, isKey);
		}
		return ret;
	}

	private buildIDXFields(IDX: IDX): { [name: string]: FieldItem } {
		let ret: { [name: string]: FieldItem } = {};
		let { schema } = IDX;
		let { keys, fields } = schema;
		for (let f of fields) {
			let { name } = f;
			let isKey = (keys as any[])?.findIndex(v => v.name === name) >= 0;
			ret[name] = buildFieldItem(f, isKey);
		}
		return ret;
	};

	private buildIXFields(IX: IX): { [name: string]: FieldItem } {
		let ret: { [name: string]: FieldItem } = {};
		let { schema } = IX;
		let { keys, fields } = schema;
		for (let f of fields) {
			let { name } = f;
			let isKey = (keys as any[])?.findIndex(v => v.name === name) >= 0;
			ret[name] = buildFieldItem(f, isKey);
		}
		return ret;
	};

	private buildFieldArr(i: ID | IDX | IX): string {
		let ts = '\nconst fieldArr: FieldItem[] = [\n\t';
		switch (i.typeName) {
			case 'id': ts += this.buildIDFieldArr(i as ID); break;
			case 'idx': ts += this.buildIDXFieldArr(i); break;
			case 'ix': ts += this.buildIXFieldArr(i); break;
		}
		return ts += '\n];\n';
	}

	private buildIDFieldArr(i: ID): string {
		let { schema } = i;
		let ts = '';
		for (let f of schema.fields) {
			let { name } = f;
			if (name === 'id') continue;
			ts += `fields.${name}, `;
		}
		return ts;
	}

	private buildIDXFieldArr(i: IDX): string {
		let { schema } = i;
		let ts = '';
		for (let f of schema.fields) {
			let { name } = f;
			if (name === 'id') continue;
			ts += `fields.${name}, `;
		}
		return ts;
	}

	private buildIXFieldArr(i: IX): string {
		let { schema } = i;
		let ts = '';
		for (let f of schema.fields) {
			let { name } = f;
			if (name === 'ix') continue;
			if (name === 'id') continue;
			ts += `fields.${name}, `;
		}
		return ts;
	}

	private replaceTsFileFields(path: string, fields: { [name: string]: FieldItem }) {
		let text = fs.readFileSync(path).toString();
		let startStr = '\n/*--fields--*/';
		let endStr = '\n/*==fields==*/\n';
		let start = text.indexOf(startStr);
		if (start > 0) {
			let end = text.indexOf(endStr, start + startStr.length);
			if (end > 0) {
				let lBrace = text.indexOf('{', start + startStr.length);
				let rBrace = text.lastIndexOf('}', end);
				let oldText = text.substring(lBrace, rBrace + 1);
				let fieldsText = this.buildFieldsFromOldText(fields, oldText);
				text = text.substring(0, start)
					+ startStr + '\nconst fields = {'
					+ fieldsText
					+ '\n};'
					+ text.substring(end);
				fs.writeFileSync(path, text);
			}
		}
	}

	private buildFieldsFromOldText(fields: { [name: string]: FieldItem }, oldText: string): string {
		let ret = '';
		for (let i in fields) {
			let field = fields[i];
			this.setFieldOldProp(field, oldText);
			ret += this.buildFieldText(field);
		}
		return ret;
	}

	private setFieldOldProp(field: FieldItem, text: string) {
		let fieldStart = field.name + ':';
		let start = text.indexOf('\t' + fieldStart);
		if (start < 0) start = text.indexOf('\n' + fieldStart);
		if (start < 0) start = text.indexOf(' ' + fieldStart);
		if (start < 0) return;
		++start;
		let end = text.indexOf('}', start + fieldStart.length);
		if (end < 0) return;
		let fieldText = text.substring(start + fieldStart.length, end + 1);
		/* eslint no-eval: 0 */
		let obj = eval('(' + fieldText + ')');
		fieldItemReplaceProps.forEach(v => {
			let prop = obj[v];
			if (!prop) return;
			if (v === 'type') return; // 这个是由新的schema决定的
			(field as any)[v] = prop;
		});
	}

	private buildFieldText(field: FieldItem): string {
		let { $FieldItemType } = field as any;
		delete (field as any).$FieldItemType;
		let ret = '\n\t' + field.name + ': ';
		let json = JSON.stringify(field, null, '\t\t');
		json = json.replace('}', '\t}');
		ret += json;
		return ret + ' as ' + $FieldItemType + ',';
	}

	private replaceTsFileString(path: string, sec: ReplaceSection) {
		let text = fs.readFileSync(path).toString();
		let { begin, end, content } = sec;
		let b = text.indexOf(begin);
		if (b < 0) return;
		let e = text.indexOf(end, b + begin.length - 1);
		if (e < 0) return;
		text = text.substring(0, b) + content + text.substr(e + end.length);
		fs.writeFileSync(path, text);
	}
}
