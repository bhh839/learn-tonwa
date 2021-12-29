import React from 'react';
import { observer } from "mobx-react";
import { IObservableValue } from 'mobx';

export function autoHideTips(
	tips: IObservableValue<boolean|string|JSX.Element>, 
	templet?:string|JSX.Element|((v:string|JSX.Element)=>JSX.Element), 
	timeout?:number):React.FunctionComponentElement<any> 
{
	let timer:any;
	return React.createElement(observer(():JSX.Element => {
		if (timer) {
			clearTimeout(timer);
			timer = undefined;
		}
		let t = tips.get();
		if (!t) return null;
		if (timeout === undefined) timeout = 3000;

		if (timeout > 0) {
			timer = setTimeout(() => {
				tips.set(null);
			}, timeout);
		}
		switch (typeof templet) {
			case 'undefined': return <>{t}</>;
			case 'function': return templet(t as string);
			case 'string': return <>{templet}</>;
			default: return templet;
		}
	}));
};
