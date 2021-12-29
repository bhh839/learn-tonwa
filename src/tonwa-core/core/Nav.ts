export interface PageHeaderProps<T> {
    back?: 'back' | 'close' | 'none';
    center: string | T;
    right?: T;
    logout?: boolean | (()=>Promise<void>);
    className?: string;
	afterBack?: () => void;
	ex?: T;
}

export interface PageWebNav<T=any> {
	navHeader?: T; 
	navRawHeader?: T; 
	navFooter?: T; 
	navRawFooter?: T; 
	renderPageHeader?: (props:PageHeaderProps<T>)=>T;
}

export interface Nav<T=any> {
    level: number;
    startWait():void;
    endWait():void;
    show(view: T, disposer?: ()=>void): number;
    push(view: T, disposer?: ()=>void): number;
    replace(view: T, disposer?: ()=>void): number;
    ceaseTop(level:number): void;
    pop(level:number): void;
    popTo(key: number): void;
    topKey():number;
    removeCeased():void;
    clear():void
    regConfirmClose(confirmClose:()=>Promise<boolean>):void;
    navBack: () => void;
    back: (confirm:boolean) => Promise<void>;
    confirmBox(message?:string): boolean;
    clearError: () => void;
	backIcon: T;
	closeIcon: T;
	setIsWebNav(): void;
    pageWebNav: PageWebNav<T>;
    isWebNav: boolean;
    renderNavView(onLogined:any, onNotLogined?:any): T;
}

export type NavPage = (params:any) => Promise<void>;
