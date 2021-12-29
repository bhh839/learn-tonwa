import { UqBuildContext } from "tonwa-core";

export class UqBuildContextUI extends UqBuildContext {
	get uiPlatform(): string { return 'react' };
	get uiPlatformUpper(): string { return 'REACT' };
	get uiPlatformCamel(): string { return 'React' }
	get element(): string { return 'JSX.Element' }
}
