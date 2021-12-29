//import { computed, makeObservable, observable } from "mobx";
import { computed, makeObservable, observable } from "mobx";
import { Input, InputProps } from "./input";
import { InputList } from "./inputList";
import { InputCheckBox, InputInteger, InputNumber } from "./inputs";

export interface WidgetProps extends InputProps {
    widgetType?: 'text' | 'number' | 'integer' | 'boolean';
}

export abstract class InputForm<T> {
    protected widgets: {[name: string]: WidgetProps} = null;
    protected inputLists: {[name: string]: InputList<any, any>} = null;
    readonly widgetViews: {[name:string]: Input<any, any>};
    readonly values: T;

    constructor(values: T) {
        this.values = values;
        this.widgetViews = {};
        makeObservable(this, {
            hasError: computed,
            widgetViews: observable.shallow,
        });
    }

    protected initWidgets():{[name: string]: WidgetProps} {return;}
    protected initInputLists():{[name: string]: InputList<any, any>} {return;}

    abstract render(): JSX.Element;

    get hasError(): boolean {
        for (let i in this.widgetViews) {
            let widget = this.widgetViews[i];
            if (widget?.ruleMessage) return true;
        }
        if (!this.inputLists) return false;
        for (let i in this.inputLists) {
            let list = this.inputLists[i];
            if (list.hasError === true) return true;
        }
        return false;
    }

    protected renderList(name: string): JSX.Element {
        if (this.inputLists === null) {
            this.inputLists = this.initInputLists();
        }
        if (this.inputLists === undefined) return null;
        let inputList = this.inputLists[name];
        if (inputList === undefined) return null;
        return inputList.render();
    }

    protected renderInput(name: string): JSX.Element {
        if (this.widgets === null) {
            this.widgets = this.initWidgets();
        }
        if (this.widgets === undefined) return null;
        let widgetProps = this.widgets[name];
        if (widgetProps === undefined) return null;
        let {widgetType} = widgetProps;
        switch (widgetType) {
            default: throw new Error('undefined widget');
            case 'boolean': return this.renderInputBoolean(name, widgetProps);
            case 'integer': return this.renderInputInteger(name, widgetProps);
            case 'number': return this.renderInputNumber(name, widgetProps);;
        }
    }

    protected renderInputBoolean(name: string, widgetProps: WidgetProps): JSX.Element {
        return <InputCheckBox ref={w => this.widgetViews[name] = w} {...widgetProps} />
    }

    protected renderInputInteger(name: string, widgetProps: WidgetProps): JSX.Element {
        return <InputInteger ref={w => this.widgetViews[name] = w} {...widgetProps} />
    }

    protected renderInputNumber(name: string, widgetProps: WidgetProps): JSX.Element {
        return <InputNumber ref={w => this.widgetViews[name] = w} {...widgetProps} />
    }

    getValues(): T {
        let data = {...this.values};
        for (let i in this.widgetViews) {
            (data as any)[i] = this.widgetViews[i].getValue();
        }
        if (this.inputLists) {
            for (let i in this.inputLists) {
                let list = this.inputLists[i];
                (data as any)[i] = list.getValuesArr();
            }
        }
        return data;
    }
    
    setValue(name:string, v:any) {
        let widgetView = this.widgetViews[name];
        if (widgetView) widgetView.setValue(v);
        (this.values as any)[name] = v;
    }

    getInputList(name:string): InputList<any, any> {
        return this.inputLists?.[name];
    }
}
