import { env } from '../tool';

/*
.env
#REACT_APP_CENTER_HOST=101.200.46.56
#REACT_APP_CENTER_HOST=47.92.87.6
REACT_APP_CENTER_HOST=https://tv.jkchemical.com
REACT_APP_RES_HOST=https://tv.jkchemical.com
REACT_APP_UNIT=24
*/

const centerHost = 'https://tv.jkchemical.com'; // process.env['REACT_APP_CENTER_HOST'];
const centerDebugHost = 'localhost:3000'; //'192.168.86.64';
const resHost = 'https://tv.jkchemical.com' || centerHost;
const resDebugHost = 'localhost:3015'; //'192.168.86.63';
const uqDebugHost = 'localhost:3015'; //'192.168.86.63';
const uqDebugBuilderHost = 'localhost:3009';
interface HostValue {
    value: string;
	local: boolean;
}
const hosts:{[name:string]:HostValue} = {
    centerhost: {
        value: /*process.env['REACT_APP_CENTER_DEBUG_HOST']*/ undefined || centerDebugHost, 
		local: false,
    },
    reshost: {
        value: /*process.env['REACT_APP_RES_DEBUG_HOST']*/ undefined || resDebugHost,
		local: false,
    },
    uqhost: {
        value: /*process.env['REACT_APP_UQ_DEBUG_HOST']*/ undefined || uqDebugHost, 
		local: false,
    },
    unitxhost: {
        value: /*process.env['REACT_APP_UQ_DEBUG_HOST']*/ undefined || uqDebugHost, 
		local: false,
    },
    "uq-build": {
        value: /*process.env['REACT_APP_UQ_DEBUG_BUILDER_HOST']*/ undefined || uqDebugBuilderHost, 
		local: false,
    }
}

const httpArr = ['https://', 'http://'];
function isAbsoluteUrl(url:string):boolean {
    for (let str of httpArr) {
        if (url.startsWith(str) === true) return true;
    }
    return false;
}

function urlFromHost(host:string):string {
    if (isAbsoluteUrl(host) === true) {
        if (host.endsWith('/')) return host;
        return host + '/';
    }
    return `http://${host}/`;
}

function centerUrlFromHost(host:string):string {
    return urlFromHost(host);
}
function centerWsFromHost(host:string) {
    let https = 'https://';
    if (host.startsWith(https) === true) {
        host = host.substr(https.length);
        if (host.endsWith('/') === true) host = host.substr(0, host.length-1);
        return 'wss://' + host + '/tv/';
    }
    return `ws://${host}/tv/`
}
export function resUrlFromHost(host:string) {
	if (!host) return;
    let url = urlFromHost(host);
    return url + 'res/';
}

const fetchOptions = {
    method: "GET",
    mode: "no-cors", // no-cors, cors, *same-origin
    headers: {
        "Content-Type": "text/plain"
    },
};

export class Host {
    testing: boolean;
    url: string;
    ws: string;
    resHost: string;

    async start(testing:boolean) {
		if (!centerHost) debugger;
        this.testing = testing;
        if (env.isDevelopment === true) {
            await this.tryLocal();
        }
        let host = this.getCenterHost();
        this.url = centerUrlFromHost(host);
        this.ws = centerWsFromHost(host);
		this.resHost = this.getResHost();
    }

    private debugHostUrl(host:string) {return `http://${host}/hello`}
    private async tryLocal() {
        let promises:PromiseLike<any>[] = [];
        let hostArr:string[] = [];
        for (let i in hosts) {
            let hostValue = hosts[i];
            let {value} = hostValue;
            if (hostArr.findIndex(v => v === value) < 0) hostArr.push(value);
        }

        for (let host of hostArr) {
            let fetchUrl = this.debugHostUrl(host);
            promises.push(localCheck(fetchUrl));
        }
        let results = await Promise.all(promises);
        let len = hostArr.length;
        for (let i=0; i<len; i++) {
            let local = results[i];
            let host = hostArr[i];
            for (let j in hosts) {
                let hostValue = hosts[j];
                if (hostValue.value === host) {
                    hostValue.local = local;
                }
            }
        }
    }

    private getCenterHost():string {
        let {value, local} = hosts.centerhost;
        let hash = document.location.hash;
        if (hash.includes('sheet_debug') === true) {
            return value;
        }
        if (env.isDevelopment === true) {
            if (local === true) return value;
        }
        return centerHost;
    }

    private getResHost():string {
        let {value, local} = hosts.reshost;
        let hash = document.location.hash;
        if (hash.includes('sheet_debug') === true) {
            return value;
        }
        if (env.isDevelopment === true) {
            if (local === true) return value;
        }
        return resHost;
    }

    getUrlOrDebug(url:string, debugHost:string = 'uqhost'):string {
        if (env.isDevelopment === false) return url;
        let host = hosts[debugHost];
        if (host === undefined) return url;
        let {value, local} = host;
        if (local === false) return url;
        return `http://${value}/`;
    }
    getUrlOrTest(db:string, url:string, urlTest:string):string {
		if (!urlTest) {
			urlTest = url;
			if (!urlTest) {
				console.error('no server set for ' + db);
				debugger;				
			}
		}
		else if (!url) {
			url = urlTest;
		}
		let testProd:string;
        if (this.testing === true) {
			if (urlTest !== '-') url = urlTest;
			testProd = 'test';
        }
        else {
			testProd = 'prod';
        }
		url = this.getUrlOrDebug(url);
		if (url.endsWith('/') === false) {
			url += '/';
		}
        return `${url}uq/${testProd}/${db}/`;
    }

    async localCheck(urlDebug: string):Promise<boolean> {
        return await localCheck(urlDebug);
    }
}

//export const host:Host = new Host();

// 因为测试的都是局域网服务器，甚至本机服务器，所以一秒足够了
// 网上找了上面的fetch timeout代码。
// 尽管timeout了，fetch仍然继续，没有cancel

// 实际上，一秒钟不够。web服务器会自动停。重启的时候，可能会比较长时间。也许两秒甚至更多。
//const timeout = 2000;
const timeout = 2000;

function fetchLocalCheck(url:string):Promise<any> {
    return new Promise((resolve, reject) => {
      fetch(url, fetchOptions as any)
      .then(v => {
          v.text().then(resolve).catch(reject);
      })
      .catch(reject);
      const e = new Error("Connection timed out");
      env.setTimeout('fetchLocalCheck', reject, timeout, e);
    });
}

async function localCheck(url:string):Promise<boolean> {
    try {
		await fetchLocalCheck(url);
        return true;
    }
    catch (err) {
        return false;
    }
}

/*
export interface IUqForChannel {
    uq: string;
    uqVersion: number;
}
*/