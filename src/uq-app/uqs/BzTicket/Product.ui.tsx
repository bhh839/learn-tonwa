// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FieldItem, FieldItemNumber, FieldItemString, FieldItemId, FieldItemInt, UI, TFunc } from 'tonwa-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Res, uqStringify, setRes } from "tonwa-core";
import { Product } from "./BzTicket";

/*--fields--*/
const fields = {
	id: {
		"name": "id",
		"type": "id",
		"isKey": false,
		"label": "Id"
	} as FieldItemId,
	no: {
		"name": "no",
		"type": "string",
		"isKey": true,
		"widget": "string",
		"label": "No"
	} as FieldItemString,
	name: {
		"name": "name",
		"type": "string",
		"isKey": false,
		"widget": "string",
		"label": "Name"
	} as FieldItemString,
	version: {
		"name": "version",
		"type": "string",
		"isKey": false,
		"widget": "string",
		"label": "Version"
	} as FieldItemString,
	desc: {
		"name": "desc",
		"type": "string",
		"isKey": false,
		"widget": "string",
		"label": "Desc"
	} as FieldItemString,
	preNo: {
		"name": "preNo",
		"type": "string",
		"isKey": false,
		"widget": "string",
		"label": "PreNo"
	} as FieldItemString,
	isbackend: {
		"name": "isbackend",
		"type": "integer",
		"isKey": false,
		"widget": "updown",
		"label": "Isbackend"
	} as FieldItemInt,
	backVersionNo: {
		"name": "backVersionNo",
		"type": "string",
		"isKey": false,
		"widget": "string",
		"label": "BackVersionNo"
	} as FieldItemString,
	status: {
		"name": "status",
		"type": "integer",
		"isKey": false,
		"widget": "updown",
		"label": "Status"
	} as FieldItemInt,
};
/*==fields==*/

const fieldArr: FieldItem[] = [
	fields.no, fields.name, fields.version, fields.desc, fields.preNo, fields.isbackend, fields.backVersionNo, fields.status, 
];

export const ui: UI = {
	label: "Product",
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

export const t:TFunc = (str:string|JSX.Element): string|JSX.Element => {
	return res[str as string] ?? str;
}

export function render(item: Product):JSX.Element {
	return <>{uqStringify(item)}</>;
};
