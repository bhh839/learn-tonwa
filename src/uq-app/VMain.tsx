//=== UqApp builder created on Tue Jan 05 2021 18:41:24 GMT-0500 (GMT-05:00) ===//
import { PageWebNav } from 'tonwa-core';
import { VPage, TabProp, TabCaptionComponent, TabsProps, t } from "tonwa";
import { CApp } from './CApp';

const color = (selected: boolean) => selected === true ? 'text-primary' : 'text-muted';
function caption(label: string | JSX.Element, icon: string) {
	return (selected: boolean) => TabCaptionComponent(label, icon, color(selected));
}

export class VMain extends VPage<CApp> {
	protected get tabsProps(): TabsProps {
		let { cHome, cMe } = this.controller;
		let tabs: TabProp[] = [
			{ name: 'home', caption: caption(t('home'), 'home'), content: cHome.tab },
		]
		tabs.push(
			{ name: 'me', caption: caption(t('me'), 'user-o'), content: cMe.tab, load: cMe.load },
		);
		return { tabs };
	}

	protected get webNav(): PageWebNav<JSX.Element> {
		return {
			navHeader: <div>webNav header</div>,
			navFooter: <div>webNav footer</div>,
		};
	}
}
