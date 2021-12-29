import { FA, LMR, VPage } from "tonwa";
import { CTester, UIItem } from "./CTest";

export class VTester extends VPage<CTester> {
	header() {
		return <div className="px-3">
			UI
			<small className="text-muted"> - 本页仅调试状态可见</small>
		</div>
	}
	content() {
		return <div>
			<div>
				{this.controller.uiItems.map(this.renderItem)}
			</div>
		</div>;
	}

	private renderItem = (item: UIItem, index: number): JSX.Element => {
		let { name, discription, click } = item;
		let right = <FA name="angle-right" />;
		return <LMR key={index} className="px-3 py-2 cursor-pointer mt-1 bg-white"
			onClick={click}
			right={right}>
			<div>{name} <small className="text-muted">{discription}</small></div>
		</LMR>;
	}
}
