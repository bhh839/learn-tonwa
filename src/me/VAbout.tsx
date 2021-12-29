import { VPage } from "tonwa";
import { appConfig } from "../uq-app/appConfig";
import { CMe } from "./CMe";

export class VAbout extends VPage<CMe> {
	header() { return '关于APP'; }
	content() {
		return <div className="py-5 px-3 my-3 w-max-30c mx-auto bg-white">
			<div className="text-center mb-5 position-relative">
				<small className="text-muted position-absolute"
					style={{ right: '0', top: '-2.8rem' }}>
					版本: {appConfig.version}
				</small>
				<b className="text-danger h5 mb-0">About</b>
			</div>
		</div>;
	}
}
