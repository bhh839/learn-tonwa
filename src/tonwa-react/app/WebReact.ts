import { FetchError, Web } from "tonwa-core";
import { TonwaReact } from "../TonwaReact";
//import { nav } from '../nav';

export class WebReact extends Web {
    private readonly tonwaReact: TonwaReact;
    constructor(tonwaReact: TonwaReact) {
        super();
        this.tonwaReact = tonwaReact;
    }
    /*
    async navInit(): Promise<void> {
        await nav.init();
    }
    */
    async onError(error: FetchError) {
        this.tonwaReact.setFetchError(error);
    }
}
