import { FieldItem } from "./fieldItem";

export type Render<T> = (item: T) => JSX.Element;
export interface UI {
	label: string|JSX.Element;
	fieldArr: FieldItem[];
	fields: {[name:string]:FieldItem};
}
