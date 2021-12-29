//=== UqApp builder created on Wed Mar 10 2021 16:02:48 GMT-0500 (GMT-05:00) ===//
//import { nav } from "tonwa-view";
import { tonwa } from 'tonwa-core';
import { appConfig } from './appConfig';

export const App: React.FC = () => {
	tonwa.setSettings(appConfig);
	const onLogined = async (isUserLogin?: boolean) => {
		// await start(CApp, appConfig, isUserLogin);
	}
	tonwa.appStart();
	return tonwa.nav.renderNavView(onLogined);
	//return <NavView onLogined={onLogined} />;
}
