import { tonwa } from 'tonwa-core';
import { AppConfig, CAppBase } from './CAppBase';
//import { nav } from '../components';

export async function startPage(CApp: new (config: AppConfig) => CAppBase<any>, appConfig: AppConfig) {
	tonwa.setSettings(appConfig);

	let cApp = new CApp(appConfig);
	cApp.internalInit();
	await cApp.start();
}
