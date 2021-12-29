import { UqMan } from '../uqMan';

const maxCacheSize = 1000;
const delayLoad = 30; 	// 延迟loading的时间
export class IDCache {
	protected uqMan: UqMan;
	private queue: number[] = [];               							// 每次使用，都排到队头
	private cache: Map<number, object | number>;    // 已经缓冲的, 如果是数值，则是重复取的次数
	private waitingIds: number[] = [];          							// 等待loading的
	private timeoutHandler: any;

	constructor(uqMan: UqMan) {
		this.uqMan = uqMan;
		this.cache = uqMan.tonwa.createObservableMap<number, object | number>();
	}

	getValue(id: number): object {
		let ret = this.cache.get(id);
		if (ret === null) return;
		if (ret === undefined) {
			this.useId(id);
			return;
		}
		if (typeof ret === 'number') return;
		return ret;
	}

	protected async TvIdValues(waitingIds: number[]) {
		return await this.uqMan.IDTv(waitingIds);
	}

	private timeOut = async () => {
		let waitingIds = this.waitingIds;
		this.waitingIds = [];
		if (waitingIds.length === 0) return;
		let values = await this.TvIdValues(waitingIds);
		for (let val of values) {
			let { id } = val;
			if (waitingIds[0] < 0) id = -id;
			this.cache.set(id, val);
			let index = waitingIds.findIndex(v => v === id);
			if (index >= 0) waitingIds.splice(index, 1);
		}
		for (let id of waitingIds) {
			this.cache.set(id, null);
		}
	}

	private useId(id: number) {
		if (!id) return;
		if (typeof id !== 'number') {
			console.error('id cache ' + id + ' is not number');
			return;
		}
		if (this.cache.has(id) === true) {
			this.moveToHead(id);
			return;
		}
		clearTimeout(this.timeoutHandler);
		this.timeoutHandler = setTimeout(this.timeOut, delayLoad);
		//this.cache.set(id, 0);
		if (this.waitingIds.findIndex(v => v === id) >= 0) {
			this.moveToHead(id);
			return;
		}

		if (this.queue.length >= maxCacheSize) {
			// 缓冲已满，先去掉最不常用的
			let r = this.queue.shift();
			if (r === id) {
				// 如果移除的，正好是现在用的，则插入
				this.queue.push(r);
				return;
			}

			//let rKey = String(r);
			if (this.cache.has(r) === true) {
				// 如果移除r已经缓存
				this.cache.delete(r);
			}
			else {
				// 如果移除r还没有缓存
				let index = this.waitingIds.findIndex(v => v === r);
				this.waitingIds.splice(index, 1);
			}
		}
		this.waitingIds.push(id);
		this.queue.push(id);
		return;
	}

	private moveToHead(id: number) {
		let index = this.queue.findIndex(v => v === id);
		this.queue.splice(index, 1);
		this.queue.push(id);
	}

	remove(id: number) {
		this.cache.delete(id);
		let index = this.queue.findIndex(v => v === id);
		this.queue.splice(index, 1);
		//this.localArr.removeItem(id);
	}

	resetCache(id: number) {
		this.remove(id);
		this.useId(id);
	}
}
