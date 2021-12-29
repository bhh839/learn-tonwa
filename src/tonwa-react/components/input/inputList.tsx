import { computed, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { InputForm  } from "./inputForm";

export class InputList<T, F extends InputForm<T>> {
    private readonly keyFromItem: (item:T) => number|string;
    private readonly createInputForm: (item:T) => F;
    readonly itemForms: F[];
    readonly valuesArr: T[];

    constructor(valuesArr: T[]
        , keyFromItem: (item:T) => number|string
        , createInputForm: (item:T) => F)
    {
        this.valuesArr = [...valuesArr];
        this.keyFromItem = keyFromItem;
        this.createInputForm = createInputForm;
        this.itemForms = valuesArr.map(item => createInputForm(item));
        makeObservable(this, {
            itemForms: observable.shallow,
            valuesArr: observable.shallow,
            hasError: computed,
        });
    }

    protected renderItemContainer(itemElement: JSX.Element): JSX.Element {
        return itemElement;
    }

    addItem(item: T, index?: number) {
        let form = this.createInputForm(item);
        if (index === undefined) this.itemForms.push(form);
        else this.itemForms.splice(index, 0, form);
    }

    getValuesArr(): any[] {
        return this.itemForms.map(v => v.getValues());
    }

    render(): JSX.Element {
        return React.createElement(observer(() => <>{this.itemForms.map(v => {
            let key = this.keyFromItem(v.values);
            let element:JSX.Element = v.render();
            return <React.Fragment key={key}>{this.renderItemContainer(element)}</React.Fragment>;
        })}</>));
    }

    get hasError(): boolean {
        for (let itemForm of this.itemForms) {
            if (itemForm.hasError === true) return true;
        }
        return false;
    }

    setEachValue<T>(name:string, value: T) {
        this.itemForms.forEach(v => v.setValue(name, value));
    }
}
