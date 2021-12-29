export interface KeyValueRes {
    [key:string]: any;
}

export interface Res<T extends KeyValueRes> {
    [lang:string]: T | {[district:string]: T};
}

export const resOptions:{
	lang: string;
	$lang: string;
	district: string;
	$district: string;
} = {
	lang: undefined,
	$lang: undefined,
	district: undefined,
	$district: undefined,
}

export function setResOptions(lang:string, district:string) {
	resOptions.lang = lang;
	resOptions.$lang = '$' + lang;
    resOptions.district = district;
    resOptions.$district = '$' + district;
}

(function() {
    let lang: string, district: string;
    let language = (navigator.languages && navigator.languages[0])  // Chrome / Firefox
        || navigator.language; // ||   // All browsers
    //navigator.userLanguage; // IE <= 10
    if (!language) {
        lang = 'zh';
        district = 'CN';
    }
    else {
        let parts = language.split('-');
        lang = parts[0];
        if (parts.length > 1) district = parts[1].toUpperCase();
    }
    setResOptions(lang, district);
}());

export function resLang<T extends KeyValueRes>(res:Res<T>):T {
    let {lang, district} = resOptions;
    let ret:T = {} as T;
    if (res === undefined) return ret;
    Object.assign(ret, res._);
    let l = res[lang];
    if (l === undefined) return ret;
    Object.assign(ret, l._);
    let d = l[district];
    if (d === undefined) return ret;
    Object.assign(ret, d);
    let {entity} = ret;
    if (entity !== undefined) {
        for (let i in entity) {
            entity[i.toLowerCase()] = entity[i];
        }
    }
    return ret;
}

export const resGlobal:any = {};
export function setRes(target: any, res: any):(str:string)=>any {
	if (res === undefined) return;
	let {$lang, $district} = resOptions;
	Object.assign(target, res);
	if ($lang !== undefined) {
		let l = res[$lang];
		if (l !== undefined) {
			Object.assign(target, l);
			let d = l[$district];
			if (d !== undefined) {
				Object.assign(target, d);
			}
		}
	}
	return function(str:string) {
		return target[str] || str;
	}
}
export function setGlobalRes(res: any) {
	setRes(resGlobal, res);
}
/*
export function t(str:string):string|JSX.Element {
	return resGlobal[str] || str;
}
export type TFunc = (str:string|JSX.Element) => string|JSX.Element;
*/

