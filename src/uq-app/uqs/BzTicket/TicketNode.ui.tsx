// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FieldItem, FieldItemNumber, FieldItemString, FieldItemId, FieldItemInt, UI, TFunc } from 'tonwa-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Res, uqStringify, setRes } from "tonwa-core";
import { TicketNode } from "./BzTicket";

/*--fields--*/
const fields = {
	id: {
		"name": "id",
		"type": "id",
		"isKey": false,
		"label": "Id"
	} as FieldItemId,
	ticket: {
		"name": "ticket",
		"type": "id",
		"isKey": false,
		"label": "Ticket"
	} as FieldItemId,
	prev: {
		"name": "prev",
		"type": "id",
		"isKey": false,
		"label": "Prev"
	} as FieldItemId,
	state: {
		"name": "state",
		"type": "id",
		"isKey": false,
		"label": "State"
	} as FieldItemId,
	operator: {
		"name": "operator",
		"type": "id",
		"isKey": false,
		"label": "Operator"
	} as FieldItemId,
};
/*==fields==*/

const fieldArr: FieldItem[] = [
	fields.ticket, fields.prev, fields.state, fields.operator, 
];

export const ui: UI = {
	label: "TicketNode",
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

export function render(item: TicketNode):JSX.Element {
	return <>{uqStringify(item)}</>;
};
