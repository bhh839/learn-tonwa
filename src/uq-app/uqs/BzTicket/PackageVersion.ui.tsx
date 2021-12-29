// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FieldItem, FieldItemNumber, FieldItemString, FieldItemId, FieldItemInt, UI, TFunc } from 'tonwa-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Res, uqStringify, setRes } from "tonwa-core";
import { PackageVersion } from "./BzTicket";

/*--fields--*/
const fields = {
	id: {
		"name": "id",
		"type": "id",
		"isKey": false,
		"label": "Id"
	} as FieldItemId,
	package: {
		"name": "package",
		"type": "id",
		"isKey": true,
		"label": "Package"
	} as FieldItemId,
	version: {
		"name": "version",
		"type": "string",
		"isKey": true,
		"widget": "string",
		"label": "Version"
	} as FieldItemString,
};
/*==fields==*/

const fieldArr: FieldItem[] = [
	fields.package, fields.version, 
];

export const ui: UI = {
	label: "PackageVersion",
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

export function render(item: PackageVersion):JSX.Element {
	return <>{uqStringify(item)}</>;
};
