import { UQsBuildingLoader } from "../uqCore";
import { TsTemplate } from "./TsTemplate";

export abstract class UqBuildContext {
	readonly uqsLoader: UQsBuildingLoader;
	readonly uqTsSrcPath: string;
	readonly tsTemplate: TsTemplate;

	constructor(uqsLoader: UQsBuildingLoader, uqTsSrcPath: string) {
		this.uqsLoader = uqsLoader;
		this.uqTsSrcPath = uqTsSrcPath;
		this.tsTemplate = new TsTemplate(this);
	}

	abstract get uiPlatform():string;
	abstract get uiPlatformUpper():string;
	abstract get uiPlatformCamel():string;
	abstract get element(): string;
}
