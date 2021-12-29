import { /*Field, */ArrFields } from './uqMan';
import { Entity } from './entity';
import { QueryQueryCaller, QueryPageCaller } from './caller';

export type QueryPageApi = (name:string, pageStart:any, pageSize:number, params:any) => Promise<string>;

export class UqQuery<P, R> extends Entity {
    get typeName(): string { return 'query';}
    /*
    private pageStart: any;
    private pageSize:number;
    private params:any;
    private more: boolean;
    private startField: Field;
    */
    //list:IObservableArray; 
    returns: ArrFields[];
	isPaged: boolean;
	
    setSchema(schema:any) {
        super.setSchema(schema);
        let {returns} = schema;
        this.returns = returns;
        this.isPaged = returns && (returns as any[]).find(v => v.name === '$page') !== undefined;
    }
    /*
    resetPage(size:number, params:any) {
        this.pageStart = undefined;
        this.pageSize = size;
        this.params = params;
        this.more = false;
        //this.list = undefined;
    }
    */
    //get hasMore() {return this.more;}
    /*
    async loadPage():Promise<void> {
        if (this.pageSize === undefined) {
            throw new Error('call resetPage(size:number, params:any) first');
        }
        let pageStart:any;
        if (this.pageStart !== undefined) {
            switch (this.startField.type) {
                default: pageStart = this.pageStart; break;
                case 'date':
                case 'time':
                case 'datetime': pageStart = (this.pageStart as Date).getTime(); break;
            }
        }
		let ret = await this.page(this.params, pageStart, this.pageSize+1);
		let page = (ret as any).$page;
        this.list = observable.array([], {deep: false});
        if (page !== undefined) {
            if (page.length > this.pageSize) {
                this.more = true;
                page.pop();
                let ret = this.returns.find(r => r.name === '$page');
                this.startField = ret.fields[0];
                this.pageStart = page[page.length-1][this.startField.name];
            }
            else {
                this.more = false;
            }
            this.list.push(...page);
        }
    }
    */
    protected pageCaller(params: any, $$user:number = undefined, showWaiting: boolean = true): QueryPageCaller {
        return new QueryPageCaller(this, params, $$user, showWaiting);
    }

    async page(params:P, pageStart:any, pageSize:number, $$user:number = undefined, showWaiting: boolean = true):Promise<R> {
        let p = {pageStart, pageSize, params};
        let res = await this.pageCaller(p, $$user, showWaiting).request();
        return res;
    }
    protected queryCaller(params: P, $$user:number = undefined, showWaiting: boolean = true): QueryQueryCaller {
        return new QueryQueryCaller(this, params, $$user, showWaiting);
    }
    async query(params:P, $$user:number = undefined, showWaiting:boolean = true):Promise<R> {
        let res = await this.queryCaller(params, $$user, showWaiting).request();
        return res;
    }
    async table(params:P, $$user:number = undefined, showWaiting:boolean = true): Promise<any[]> {
        let ret = await this.query(params, $$user, showWaiting);
        for (let i in ret) {
            return (ret as any)[i];
        }
    }
    async obj(params:P, $$user:number = undefined, showWaiting:boolean = true):Promise<any> {
        let ret = await this.table(params, $$user,showWaiting);
        if (ret.length > 0) return ret[0];
    }
    async scalar(params:P, $$user:number = undefined, showWaiting:boolean = true):Promise<any> {
        let ret = await this.obj(params, $$user, showWaiting);
        for (let i in ret) return ret[i];
    }
}

export class Query extends UqQuery<any, any> {
}
