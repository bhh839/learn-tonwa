import { Web } from './Web';
import { FetchError } from './fetchError';

export interface HttpChannelUI {
    startWait(): void;
    endWait(): void;
    showError(error: FetchError): Promise<void>;
    // showUpgradeUq(uq:string, version:number):Promise<void>;
}

export class HttpChannelNavUI implements HttpChannelUI {
    protected readonly web: Web;

    constructor(web: Web) {
        this.web = web;
    }

    startWait() {
        this.web.startWait();
    }
    endWait() {
        this.web.endWait();
    }
    async showError(error: FetchError): Promise<void> {
        this.web.endWait();
        /*
        if (error.name === 'SyntaxError') {
            error = {
                name: error.name,
                message: error.message,
            }
        }*/
        await this.web.onError(error);
    }
    /*
    async showUpgradeUq(uq:string, version:number):Promise<void> {
        await this.web.tonwa.nav.showUpgradeUq(uq, version);
    }
    */
}
