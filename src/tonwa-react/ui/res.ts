import { resGlobal } from 'tonwa-core';

export function t(str: string): string | JSX.Element {
	return resGlobal[str] || str;
}
export type TFunc = (str: string | JSX.Element) => string | JSX.Element;
