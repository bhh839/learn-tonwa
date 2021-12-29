import React from 'react';
import ReactDOM from 'react-dom';
import { NavView, start, TonwaReact } from "tonwa";
import { CApp } from './CApp';
import { appConfig } from './appConfig';
// import { App } from './App';

export async function startApp() {
    let tonwa = new TonwaReact();
    //initNav(tonwa);
    tonwa.setSettings(appConfig);
    const onLogined = async (isUserLogin?: boolean) => {
        await start(CApp, tonwa, appConfig, isUserLogin);
    }
    const notLogined: () => Promise<void> = undefined;
    const userPassword: () => Promise<{ user: string; password: string }> = undefined;
    tonwa.appStart();
    ReactDOM.render(
        <React.StrictMode>
            <NavView ref={navView => tonwa.set(navView)}
                onLogined={onLogined}
                notLogined={notLogined}
                userPassword={userPassword} />
        </React.StrictMode>,
        document.getElementById('root')
    );
}
