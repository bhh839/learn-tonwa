import { Render, UI, TFunc } from '../ui';

export interface IDXEntity<M> {
	readonly ui: UI;
	readonly render: Render<M>;
	readonly t: TFunc;
}
