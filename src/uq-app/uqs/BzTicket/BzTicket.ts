//=== UqApp builder created on Mon Dec 27 2021 16:14:30 GMT+0800 (中国标准时间) ===//
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IDXValue, Uq, UqTuid, UqAction, UqQuery, UqID } from "tonwa-core";
import { Render, IDXEntity } from "tonwa-react";


//===============================
//======= UQ jksoft/ticket ========
//===============================

export enum SourceType {
	customer = 1,
	ticket = 2
}

export enum TicketBox {
	todo = 1,
	toAssess = 2
}

export interface Tuid$sheet {
	id?: number;
	no: string;
	user: number;
	date: any;
	sheet: number;
	version: number;
	flow: number;
	app: number;
	state: number;
	discription: string;
	data: string;
	processing: number;
}

export interface Tuid$user {
	id?: number;
	name: string;
	nick: string;
	icon: string;
	assigned: string;
	poke: number;
	timezone: number;
}

export interface Param$setMyTimezone {
	_timezone: number;
}
export interface Result$setMyTimezone {
}

export interface ParamSaveTicket {
	to: number;
	discription: string;
}
export interface ResultSaveTicket {
}

export interface ParamSaveTicketType {
	typeName: string;
	typeVice: string;
	states: {
		stateName: string;
		stateVice: string;
	}[];

}
export interface ReturnSaveTicketTypeRet {
	id: number;
}
export interface ResultSaveTicketType {
	ret: ReturnSaveTicketTypeRet[];
}

export interface ParamUpdateCustomer1 {
	id: number;
	no: string;
	name: string;
	tel: string;
	address: string;
	vice: string;
	status: number;
}
export interface ResultUpdateCustomer1 {
}

export interface ParamUpdateCustomer {
	id: number;
	name: string;
	tel: string;
	address: string;
	vice: string;
	status: number;
}
export interface ResultUpdateCustomer {
}

export interface ParamUpdateProduct1 {
	id: number;
	no: string;
	name: string;
	version: string;
	desc: string;
	preNo: string;
	isbackend: number;
	backVersionNo: string;
	status: number;
}
export interface ResultUpdateProduct1 {
}

export interface ParamUpdateProduct {
	id: number;
	name: string;
	version: string;
	desc: string;
	preNo: string;
	isbackend: number;
	backVersionNo: string;
	status: number;
}
export interface ResultUpdateProduct {
}

export interface Param$poked {
}
export interface Return$pokedRet {
	poke: number;
}
export interface Result$poked {
	ret: Return$pokedRet[];
}

export interface ParamMyTickets {
}
export interface ReturnMyTicketsRet {
	ticket: number;
	discription: string;
	node: number;
	prev: number;
	state: number;
	operator: number;
	from: number;
}
export interface ResultMyTickets {
	ret: ReturnMyTicketsRet[];
}

export interface ParamQueryCustomerByID1 {
	id: number;
}
export interface ReturnQueryCustomerByID1Ret {
	id: number;
	no: string;
	name: string;
	tel: string;
	address: string;
	vice: string;
	status: number;
}
export interface ResultQueryCustomerByID1 {
	ret: ReturnQueryCustomerByID1Ret[];
}

export interface ParamQueryProductByID {
	id: number;
}
export interface ReturnQueryProductByIDRet {
	id: number;
	no: string;
	name: string;
	version: string;
	desc: string;
	preNo: string;
	isbackend: number;
	backVersionNo: string;
	status: number;
}
export interface ResultQueryProductByID {
	ret: ReturnQueryProductByIDRet[];
}

export interface ParamQueryCustomerByID {
	id: number;
}
export interface ReturnQueryCustomerByIDRet {
	id: number;
	no: string;
	name: string;
	tel: string;
	address: string;
	vice: string;
	status: number;
}
export interface ResultQueryCustomerByID {
	ret: ReturnQueryCustomerByIDRet[];
}

export interface Param$getUnitTime {
}
export interface Return$getUnitTimeRet {
	timezone: number;
	unitTimeZone: number;
	unitBizMonth: number;
	unitBizDate: number;
}
export interface Result$getUnitTime {
	ret: Return$getUnitTimeRet[];
}

export interface ParamQueryProductByID1 {
	id: number;
}
export interface ReturnQueryProductByID1Ret {
	id: number;
	no: string;
	name: string;
	version: string;
	desc: string;
	preNo: string;
	isbackend: number;
	backVersionNo: string;
	status: number;
}
export interface ResultQueryProductByID1 {
	ret: ReturnQueryProductByID1Ret[];
}

export interface Customer {
	id?: number;
	no?: string;
	name: string;
	tel: string;
	address: string;
	vice: string;
	status: number;
}

export interface ProductPackage {
	id?: number;
	name: string;
	vice: string;
}

export interface Market {
	id?: number;
	no?: string;
	name: string;
	vice: string;
	icon: string;
}

export interface PackageVersion {
	id?: number;
	package: number;
	version: string;
}

export interface Project {
	id?: number;
	no?: string;
	name: string;
	vice: string;
}

export interface Ticket {
	id?: number;
	discription: string;
	creator: number;
}

export interface TicketType {
	id?: number;
	name: string;
	vice: string;
	firstState: number;
}

export interface Source {
	id?: number;
	name: string;
	vice: string;
	type: any;
}

export interface PackageCustomer {
	id?: number;
	packageVersion: number;
	customer: number;
}

export interface TicketSheet {
	id?: number;
	creator: number;
}

export interface SourceCustomer {
	id?: number;
	main?: number;
}

export interface TicketNode {
	id?: number;
	ticket: number;
	prev: number;
	state: number;
	operator: number;
}

export interface Staff {
	id?: number;
	no?: string;
	name: string;
}

export interface SourceCustomerSheet {
	id?: number;
	no?: string;
	customer: number;
}

export interface TicketState {
	id?: number;
	main?: number;
	name: string;
	vice: string;
}

export interface TicketAssess {
	id?: number;
	name: string;
	vice: string;
	min: number;
	max: number;
}

export interface Product {
	id?: number;
	no?: string;
	name: string;
	version: string;
	desc: string;
	preNo: string;
	isbackend: number;
	backVersionNo: string;
	status: number;
}

export interface ParamActs {
	customer?: Customer[];
	productPackage?: ProductPackage[];
	market?: Market[];
	packageVersion?: PackageVersion[];
	project?: Project[];
	ticket?: Ticket[];
	ticketType?: TicketType[];
	source?: Source[];
	packageCustomer?: PackageCustomer[];
	ticketSheet?: TicketSheet[];
	sourceCustomer?: SourceCustomer[];
	ticketNode?: TicketNode[];
	staff?: Staff[];
	sourceCustomerSheet?: SourceCustomerSheet[];
	ticketState?: TicketState[];
	ticketAssess?: TicketAssess[];
	product?: Product[];
}


export interface UqExt extends Uq {
	Acts(param:ParamActs): Promise<any>;
	SQL: Uq;
	IDRender(id:number):JSX.Element;
	IDLocalRender(id:number):JSX.Element;

	$sheet: UqTuid<Tuid$sheet>&{tv:(id:number, render?:Render<any>)=>JSX.Element};
	$user: UqTuid<Tuid$user>&{tv:(id:number, render?:Render<any>)=>JSX.Element};
	$setMyTimezone: UqAction<Param$setMyTimezone, Result$setMyTimezone>;
	SaveTicket: UqAction<ParamSaveTicket, ResultSaveTicket>;
	SaveTicketType: UqAction<ParamSaveTicketType, ResultSaveTicketType>;
	UpdateCustomer1: UqAction<ParamUpdateCustomer1, ResultUpdateCustomer1>;
	UpdateCustomer: UqAction<ParamUpdateCustomer, ResultUpdateCustomer>;
	UpdateProduct1: UqAction<ParamUpdateProduct1, ResultUpdateProduct1>;
	UpdateProduct: UqAction<ParamUpdateProduct, ResultUpdateProduct>;
	$poked: UqQuery<Param$poked, Result$poked>;
	MyTickets: UqQuery<ParamMyTickets, ResultMyTickets>;
	QueryCustomerByID1: UqQuery<ParamQueryCustomerByID1, ResultQueryCustomerByID1>;
	QueryProductByID: UqQuery<ParamQueryProductByID, ResultQueryProductByID>;
	QueryCustomerByID: UqQuery<ParamQueryCustomerByID, ResultQueryCustomerByID>;
	$getUnitTime: UqQuery<Param$getUnitTime, Result$getUnitTime>;
	QueryProductByID1: UqQuery<ParamQueryProductByID1, ResultQueryProductByID1>;
	Customer: UqID<any> & IDXEntity<any>;
	ProductPackage: UqID<any> & IDXEntity<any>;
	Market: UqID<any> & IDXEntity<any>;
	PackageVersion: UqID<any> & IDXEntity<any>;
	Project: UqID<any> & IDXEntity<any>;
	Ticket: UqID<any> & IDXEntity<any>;
	TicketType: UqID<any> & IDXEntity<any>;
	Source: UqID<any> & IDXEntity<any>;
	PackageCustomer: UqID<any> & IDXEntity<any>;
	TicketSheet: UqID<any> & IDXEntity<any>;
	SourceCustomer: UqID<any> & IDXEntity<any>;
	TicketNode: UqID<any> & IDXEntity<any>;
	Staff: UqID<any> & IDXEntity<any>;
	SourceCustomerSheet: UqID<any> & IDXEntity<any>;
	TicketState: UqID<any> & IDXEntity<any>;
	TicketAssess: UqID<any> & IDXEntity<any>;
	Product: UqID<any> & IDXEntity<any>;
}

export function assign(uq: any, to:string, from:any): void {
	let hasEntity = uq.hasEntity(to);
	if (hasEntity === false) {
		return;
	}
	Object.assign((uq as any)[to], from);
}
