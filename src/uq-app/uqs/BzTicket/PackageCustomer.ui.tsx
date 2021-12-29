// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FieldItem, FieldItemNumber, FieldItemString, FieldItemId, FieldItemInt, UI, TFunc } from 'tonwa-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Res, uqStringify, setRes } from "tonwa-core";
import { PackageCustomer } from "./BzTicket";

/*--fields--*/
const fields = {
	id: {
		"name": "id",
		"type": "id",
		"isKey": false,
		"label": "Id"
	} as FieldItemId,
	packageVersion: {
		"name": "packageVersion",
		"type": "id",
		"isKey": true,
		"label": "PackageVersion"
	} as FieldItemId,
	customer: {
		"name": "customer",
		"type": "id",
		"isKey": true,
		"label": "Customer"
	} as FieldItemId,
};
/*==fields==*/

const fieldArr: FieldItem[] = [
	fields.packageVersion, fields.customer, 
];

export const ui: UI = {
	label: "PackageCustomer",
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

export function render(item: PackageCustomer):JSX.Element {
	return <>{uqStringify(item)}</>;
};
