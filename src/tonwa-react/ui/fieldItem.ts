//import { ChangedHandler, ChangingHandler, PickId } from "../components";
import { ID } from "tonwa-core";
import { FieldUIType } from "./fieldUI";

export type FieldItemType = 'id' | 'integer' | 'number' | 'string' | 'image' | 'date' | 'boolean'
    | 'object' | 'arr' | 'button' | 'submit';

type Context = {};
export type ChangingHandler = (context: Context, value: any, prev: any) => boolean;
export type ChangedHandler = (context: Context, value: any, prev: any) => Promise<void>;
export interface FieldItem {
    name: string;
    type: FieldItemType;
    ID?: ID;
    label?: string | JSX.Element;
    isKey?: boolean;
    required?: boolean;
    widget?: FieldUIType;
    className?: string;
    defaultValue?: string | number;
    onChanging?: ChangingHandler;
    onChanged?: ChangedHandler;
    readOnly?: boolean;
    hiden?: boolean;
}

export interface FieldItemObject extends FieldItem {
    type: 'object';
}

export type PickId = (context: Context, name: string, value: number) => Promise<any>;
export interface FieldItemId extends FieldItem {
    type: 'id';
    pickId: PickId;
    render: (values: any) => JSX.Element;
}

export interface FieldItemNumBase extends FieldItem {
    type: 'integer' | 'number';
    min?: number;
    max?: number;
    readOnly?: true;
}

export interface FieldItemInt extends FieldItemNumBase {
    type: 'integer';
}

export interface FieldItemNum extends FieldItemNumBase {
    type: 'number';
}

export type FieldItemNumber = FieldItemNum;

export interface FieldItemBool extends FieldItem {
    type: 'boolean';
}

export interface FieldItemString extends FieldItem {
    type: 'string';
    maxLength?: number;
    readOnly?: true;
}

export interface FieldItemImage extends FieldItem {
    type: 'image';
}

export interface FieldItemDate extends FieldItem {
    type: 'date';
}

export interface FieldItemArr extends FieldItem {
    type: 'arr';
    arr: FieldItem[];
    FieldItems: { [name: string]: FieldItem };
}

export interface FieldItemButton extends FieldItem {
    type: 'button' | 'submit';
}

export type FieldItems = FieldItem[];
export type FieldCustoms = { [name: string]: Partial<FieldItem> };
