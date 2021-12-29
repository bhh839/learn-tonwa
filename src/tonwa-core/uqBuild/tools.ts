import fs from 'fs';
import { capitalCase } from "../tool";
import { UqMan } from "../uqCore";
import { UqBuildContext } from './UqBuildContext';

export const red = '\x1b[41m%s\x1b[0m';
export let lastBuildTime:number = 0;
//export const uqTsSrcPath = 'src/UqApp';

export function saveSrcTsFileIfNotExists(context:UqBuildContext, fileName:string, suffix:string, content:string) {
	let tsFilePath = `${context.uqTsSrcPath}/${fileName}.${suffix}`;
	saveTsFileIfNotExists(tsFilePath, content);
	//if (fs.existsSync(tsFile) === true) return;
	//saveTsFile(fileName, content, suffix);
}
export function saveTsFile(context:UqBuildContext, fileName:string, content:string, suffix:string = 'ts') {
	let {uqTsSrcPath} = context;
	let srcFile = `${uqTsSrcPath}/${fileName}.${suffix}.txt`;
	let tsFile = `${uqTsSrcPath}/${fileName}.${suffix}`;
	if (!fs.existsSync(srcFile)) {
		if (fs.existsSync(tsFile)) {
			fs.renameSync(tsFile, srcFile);
		}
	}
	fs.writeFileSync(tsFile, content);
	lastBuildTime = Date.now();
	console.log(red, `${tsFile} is built`);
}
export function overrideTsFile(path:string, content:string) {
	//let tsFile = `${path}/${fileName}.${suffix}`;
	fs.writeFileSync(path, content);
	lastBuildTime = Date.now();
	console.log(red, `${path} is built`);
}
//fileName:string, 
//, suffix:string = 'ts'
export function saveTsFileIfNotExists(tsFilePath:string, content:string) {
	//let tsFilePath = `${path}/${fileName}.${suffix}`;
	if (fs.existsSync(tsFilePath) === true) return;
	overrideTsFile(tsFilePath, content);
}

/*
function createTsFile(path:string, fileName:string, content:string, suffix:string = 'ts') {
	let tsFile = `${path}/${fileName}.${suffix}`;
	if (fs.existsSync(tsFile) === true) return;
	fs.writeFileSync(tsFile, content);
	lastBuildTime = Date.now();
	console.log(red, `${tsFile} is built`);
}
*/
export function entityName(s:string):string {
	return capitalCase(s);
}

export function getNameFromUq(uqMan:UqMan):{devName:string; uqName:string} {
	let {config} = uqMan;
	let devPart:string, uqPart:string;
	if (config) {
		let {dev, name, alias} = config;
		let {name:devName, alias:devAlias} = dev;
		devPart = devAlias || devName;
		uqPart = alias || name;
	}
	else {
		let {uqOwner, uqName} = uqMan;
		devPart = uqOwner;
		uqPart = uqName;
	}
	return {
		devName: capitalCase(devPart),
		uqName: capitalCase(uqPart),
	};
}
