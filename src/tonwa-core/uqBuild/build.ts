import fs from 'fs';
import { env } from '../tool';
import { lastBuildTime, red, saveTsFile, saveSrcTsFileIfNotExists } from './tools';
import { buildUqsFolder } from './uqsFolder';
import { UqBuildContext } from './UqBuildContext';

export async function build(buildContext: UqBuildContext) {
	//let buildContext = new BuildContext(uqSrcPath);
	// 只从test 数据库构建uq ts
	env.testing = true;
	env.buildingUq = true;

	if (lastBuildTime > 0) {
		console.log(red, 'quit !');
		return;
	}

	let {tsTemplate} = buildContext;

	let {uqTsSrcPath} = buildContext;
	if (!fs.existsSync(uqTsSrcPath)) {
		fs.mkdirSync(uqTsSrcPath);
	}
	let tsIndex = tsTemplate.tsIndex;
	saveTsFile(buildContext, 'index', tsIndex);
	let tsCApp = tsTemplate.tsCApp;
	saveSrcTsFileIfNotExists(buildContext, 'CApp', 'ts', tsCApp);
	let tsCBase = tsTemplate.tsCBase;
	saveTsFile(buildContext, 'CBase', tsCBase);
	let tsVMain = tsTemplate.tsVMain;
	saveSrcTsFileIfNotExists(buildContext, 'VMain', 'tsx', tsVMain);
	let tsApp = tsTemplate.tsApp;
	saveSrcTsFileIfNotExists(buildContext, 'App', 'tsx', tsApp);

	saveTsFile(buildContext, 'uqs', '');
	fs.unlinkSync(uqTsSrcPath + '/uqs.ts');
	await buildUqsFolder(buildContext);
};
