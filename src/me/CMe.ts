import { makeObservable, observable } from "mobx";
import { User } from "tonwa-core";
import { QueryPager } from "tonwa";
import { CUqBase } from "uq-app";
import { VMe } from "./VMe";
import { VEditMe } from "./VEditMe";

export interface RootUnitItem {
	id: number;					// root unit id
	owner: any;
	name: string;				// 唯一
	content: string;
	tonwaUnit: number;			// 跟tonwa机构对应的值
	x: number;
}

export class CMe extends CUqBase {
	role: number;
	unitOwner: User;
	rootUnits: QueryPager<any>;
	roles: string[] = null;
	//uq: Uq;

	constructor(res: any) {
		super(res);
		makeObservable(this, {
			roles: observable,
		});
		//this.uq = this.uqs.BzTimesChange;
	}

	protected async internalStart() {
	}

	tab = () => {
		return this.renderView(VMe);
	}

	showEditMe = async () => {
		//let result = await this.uqs.Notes.GetSystemRole.query({});
		//this.role = result.ret[0]?.role;
		this.openVPage(VEditMe);
	}

	load = async () => {
		//this.roles = await this.getUqRoles(this.uq.name);
	}

	backend = async () => {
		//let cRoles = new CRoles(this.uq, this.res);
		//await cRoles.start();
	}

	private myRolesChanged = (roles: string[]) => {
		//this.roles = roles;
		//this.user.roles[this.uq.name] = roles;
		//nav.saveLocalUser();
	}
}
