import { VPage } from "tonwa";
import { CMe } from "./CMe";

export class VAccountant extends VPage<CMe> {
	header() { return '会计' }
	content() {
		return <div className="p-3">
			会计
		</div>
	}
}
