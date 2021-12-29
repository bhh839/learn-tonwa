import { observer } from "mobx-react";
import { UQsMan, TuidInner, uqStringify, TuidImport, Web } from "tonwa-core";
import { Render } from "../ui";
import { Uq } from "./Uq";

export function createUQsProxy(web: Web, uqsMan: UQsMan) {
    buildTuidTv();
    const uqReacts: { [key: string]: any } = {};
    function setUq(uqKey: string, proxy: any): void {
        if (!uqKey) return;
        let lower = uqKey.toLowerCase();
        uqReacts[uqKey] = proxy;
        if (lower !== uqKey) uqReacts[lower] = proxy;
    }
    for (let uqMan of uqsMan.uqMans) {
        let uqReact = new Uq(web, uqMan);
        let proxy = uqReact.$_createProxy();
        setUq(uqMan.getUqKey(), proxy);
        setUq(uqMan.getUqKeyWithConfig(), proxy);
    }
    function onUqProxyError(key: string) {
        for (let i in uqReacts) {
            let uqReact = uqReacts[i];
            uqReact.localMap.removeAll();
        }
        //this.web.showReloadPage(msg);
        console.error(`uq proxy ${key} error`);
    }
    return new Proxy(uqReacts, {
        get: (target, key, receiver) => {
            let lk = (key as string).toLowerCase();
            let ret = target[lk];
            if (ret !== undefined) return ret;
            debugger;
            console.error(`controller.uqs.${String(key)} undefined`);
            onUqProxyError(String(key));
            return undefined;
        },
    });
}

function buildTuidTv() {
    (TuidInner.prototype as any).tv = function (this: any, id: number, render?: Render<any>): JSX.Element {
        const TuidView = observer(() => {
            let obj = this.valueFromId(id);
            if (obj === undefined) {
                this.useId(id);
                return <>{this.sName}:{id}</>;
            }
            let r: Render<any>;
            if (render) {
                r = render;
            }
            else if (this.render) {
                r = this.render;
            }
            else {
                console.log('render', render, 'this.render', this.render);
                r = (item: any) => {
                    return <>{this.sName}:{uqStringify(item)}</>;
                };
            }
            return r(obj);
        });
        return <><TuidView /></>;
    };

    (TuidImport.prototype as any).tv = function (this: any, id: number, render?: Render<any>): JSX.Element {
        return this.tuidLocal?.tv(id, render);
    };
}
