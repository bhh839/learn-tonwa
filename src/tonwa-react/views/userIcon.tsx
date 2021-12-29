import * as React from 'react';
import classNames from 'classnames';
//import { nav } from '../nav';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { tonwa, User, Web } from 'tonwa-core';

export type UserLoader = (userId: number) => Promise<any>;

export class UserCache<T> {
	private readonly web: Web;
	private readonly loader: UserLoader;
	private onLoaded: (user: User) => void;
	private map = observable(new Map<number, T | number>());

	constructor(web: Web, loader: UserLoader) {
		this.web = web;
		if (loader === undefined) loader = (userId: number) => this.web.userApi.user(userId);
		this.loader = loader;
	}

	use(id: number | any, onLoaded?: (user: User) => void) {
		if (!id) return;
		if (typeof id === 'object') id = id.id;
		if (!id) return;
		this.onLoaded = onLoaded;
		id = Number(id);
		let ret = this.map.get(id);
		if (ret === undefined) {
			this.map.set(id, id);
		}
	}

	getValue(id: number | any): any {
		if (!id) return;
		switch (typeof (id)) {
			case 'object':
				id = id.id;
				if (!id) return;
				break;
		}
		let ret = this.map.get(id);
		if (!ret) return;
		switch (typeof (ret)) {
			default:
				return ret;
			case 'number':
				if (ret < 0) return id;
				this.map.set(id, -id);
				this.loader(id).then(v => {
					if (!v) v = null;
					this.map.set(id, v);
					if (this.onLoaded) this.onLoaded(v);
				}).catch(reason => {
					console.error(reason);
				});
				return id;
		}
	}
}

let staticUserCache: UserCache<any>;
function getUserCache(web: Web) {
	if (staticUserCache === undefined) {
		staticUserCache = new UserCache(web, undefined);
	}
	return staticUserCache;
}

export interface UserIconProps {
	web: Web;
	id: number;
	className?: string;
	style?: React.CSSProperties;
	altImage?: string;
	noneImage?: any;
}

export const UserIcon = observer((props: UserIconProps): JSX.Element => {
	let { className, style, id, altImage, noneImage } = props;
	let userCache = getUserCache(props.web);
	let user = userCache.getValue(id);
	switch (typeof user) {
		case 'undefined':
		case 'number':
			return <div className={classNames(className, 'image-none')} style={style}>
				{noneImage || <i className="fa fa-file-o" />}
			</div>;
	}
	let { icon } = user;
	if (!icon) {
		return <div className={classNames(className, 'image-none')} style={style}>
			<i className="fa fa-file-o" />
		</div>;
	}
	if (icon.startsWith(':') === true) {
		icon = tonwa.resUrl + icon.substr(1);
	}
	return <img src={icon} className={className} alt="img"
		style={style}
		onError={evt => {
			if (altImage) evt.currentTarget.src = altImage;
			else evt.currentTarget.src = 'https://tv.jkchemical.com/imgs/0001.png';
		}} />;
});

export interface UserViewProps {
	web: Web;
	id?: number;
	user?: number | User;
	render: (user: User) => JSX.Element;
	onLoaded?: (user: User) => void
}

export const UserView = observer((props: UserViewProps): JSX.Element => {
	let { web, id: idProp, user, render, onLoaded } = props;
	if (user === null) return <>null</>;
	let userCache = getUserCache(web);
	switch (typeof user) {
		case 'undefined':
			user = userCache.getValue(idProp);
			break;
		case 'object':
			let {/*obj, */id } = user as any;
			//if (typeof obj !== 'object') {
			useUser(web, id, onLoaded);
			user = userCache.getValue(id);
			//}
			break;
		case 'number':
			useUser(web, user as number, onLoaded);
			user = userCache.getValue(user as number);
			break;
		case 'string':
			useUser(web, Number(user), onLoaded);
			user = userCache.getValue(Number(user));
			break;
		default:
			user = undefined;
			break;
	}
	switch (typeof user) {
		case 'undefined':
		case 'number':
			return <>{user}</>;
	}
	return render(user);
});

export function useUser(web: Web, id: number | object, onLoaded?: (user: User) => void) {
	if (!id) return;
	if (typeof (id) === 'object') {
		id = (id as any).id;
	}
	let userCache = getUserCache(web);
	userCache.use(id, onLoaded);
}
