import { UqQuery} from './query';
import { QueryQueryCaller } from './caller';

export class UqBook<P, R> extends UqQuery<P, R> {
    get typeName(): string { return 'book';}
    protected queryApiName = 'book';

    protected queryCaller(params: any): QueryQueryCaller {
        return new BookQueryCaller(this, params);
    }
}

export class Book extends UqBook<any, any> {
}

export class BookQueryCaller extends QueryQueryCaller {
    get path():string {return `book/${this.entity.name}`;}
}
