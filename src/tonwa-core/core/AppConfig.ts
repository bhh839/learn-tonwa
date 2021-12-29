
export interface DevConfig {
	name: string;
	alias?: string;
	memo?: string;
}

export interface UqConfig {
	dev: DevConfig;
	name: string;
	alias?: string;	
	version?: string;
	memo?: string;
}

export interface UqsConfig {
	app?: {
		dev: DevConfig;
		name: string;
		version?: string;
	};
	uqs?: UqConfig[];
}

export interface AppConfig extends UqsConfig {
    version: string;        // 版本变化，缓存的uqs才会重载
    /*
    tvs?: TVs;
    //uqNameMap?: {[uqName:string]: string};      // uqName='owner/uq' 映射到内存简单名字：uq, 可以注明映射，也可以自动。有可能重
    loginTop?: JSX.Element;
    oem?: string;               // 用户注册发送验证码的oem厂家，默认同花
	privacy?: string;
	noUnit?: boolean;			// app的运行，不跟unit绑定
	htmlTitle?: string;
    */
}

//export type { UqsConfig, AppConfigCore };