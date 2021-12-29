import { UqQuery } from './query';

export class UqHistory<P,R> extends UqQuery<P,R>  {
    get typeName(): string { return 'history';}
    protected queryApiName = 'history';
}

export class History extends UqHistory<any, any> {
}
