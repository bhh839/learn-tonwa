import { UqQuery } from './query';

export class UqPending<P,R> extends UqQuery<P,R>  {
    get typeName(): string { return 'pending';}
    protected queryApiName = 'pending';
}

export class Pending extends UqPending<any, any> {
}
