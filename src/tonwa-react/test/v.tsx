import { action, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";

export class VTestMobx {
    map = new Map();
    constructor() {
        makeObservable(this, {
            map: observable.shallow,
            mapAdd: action,
        });
    }

    mapAdd = () => {
		let v = this.map.get(1);
		if (!v) {
			v = 1;
		}
		else {
			v = {v};
		}
		this.map.set(1, v);
	}

    render() {
        let VTest = observer(() => <div>
            test: {JSON.stringify(this.map.get(1))}
        </div>);
        return <>
            <VTest />
            <button onClick={this.mapAdd}>click</button>
        </>;
    }
}