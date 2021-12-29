import { Entity } from "./entity";
import { Uq } from "./uqMan";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class UqID<M extends {id:number}> extends Entity {
	get typeName() {return 'id'}
	create: boolean;
	update: boolean;
	owner: boolean;
	async NO(): Promise<string> {
		let ret = await this.uqApi.post('id-no', {ID:this.name});
		return ret;
	};
	getIdFromObj(value: any): number {return value['id'];}
	cacheTuids(defer: number): void {}
	async loadValuesFromIds(divName: string, ids:number[]): Promise<M[]> {
		let ret = await (this.uq as unknown as Uq).QueryID<M>({
			IDX: [this],
			id: ids
		});
        return ret;
	}
	cacheTuidFieldValues(value: any): void {}
	unpackTuidIds(values:string[]): any[] {return;}
}

export class ID extends UqID<any> {	
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class UqIDX<M> extends Entity {
	get typeName() {return 'idx'}
}

export class IDX extends UqIDX<any> {
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class UqIX<M> extends Entity {
	get typeName() {return 'ix'}
}

export class IX extends UqIX<any> {
}

/* eslint-enable no-unused-vars */
