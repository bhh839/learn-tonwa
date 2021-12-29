import * as React from 'react';
import classNames from 'classnames';
import { makeObservable, observable, runInAction } from 'mobx';
import { UiTextItem, StringSchema, ItemSchema } from '../../schema';
import { Context } from '../context';
import { FieldProps } from '../field';
import { Widget } from './widget';

export class TextWidget extends Widget {
    protected inputType = 'text';
    protected get ui(): UiTextItem {return this._ui as UiTextItem};
    protected input: HTMLInputElement;
    hasFocus: boolean = false;

	constructor(context:Context, itemSchema:ItemSchema, fieldProps:FieldProps, children: React.ReactNode) {
		super(context, itemSchema, fieldProps, children);
		makeObservable(this, {
			hasFocus: observable,
		})
	}

    protected setElementValue(value:any) {
        if (this.input === null) return;
        this.input.value = value;
    }
    protected get placeholder() {
		if (this.ui) {
			let {placeholder} = this.ui;
			if (placeholder) return placeholder;
			let {label} = this.ui;
			if (label) return label;
		}
		return this.name
	}
    protected onKeyDown = async (evt:React.KeyboardEvent<HTMLInputElement>) => {
        this.internalOnKeyDown(evt);
        if (evt.keyCode !== 13) return;
        let {onEnter} = this.context.form.props;
        if (onEnter === undefined) return;

        this.changeValue(evt.currentTarget.value, true);

        //this.checkRules();
        //this.context.checkContextRules();
        this.input.blur();

        let ret = await onEnter(this.name, this.context);
        if (ret !== undefined) {
            this.context.setError(this.name, ret);
        }
    }

    protected internalOnKeyDown(evt:React.KeyboardEvent<HTMLInputElement>) {
    }

    protected onBlur = (evt: React.FocusEvent<any>) => {
		runInAction(() => {
			this.onInputChange(evt);
			this.checkRules();
			this.context.checkContextRules();
			this.hasFocus = false;
		});
    }
    protected onFocus = (evt: React.FocusEvent<any>) => {
		runInAction(() => {
			this.clearError();
			this.context.removeErrorWidget(this);
			this.context.clearErrors();
			this.hasFocus = true;
		});
		setTimeout(() => {
			console.log('focus and select');
			this.input.focus();
			this.input.select();
		}, 10)
    }
    protected onChange(evt: React.ChangeEvent<any>) {
		this.onInputChange(evt);
    }

    setReadOnly(value:boolean) {
        if (this.input === null) return;
        this.input.readOnly = this.readOnly = value;
    }
    setDisabled(value:boolean) {
        if (this.input === null) return;
        this.input.disabled = this.disabled = value;
    }

    render() {
        let renderTemplet = this.renderTemplet();
        if (renderTemplet !== undefined) return renderTemplet;
        let cn:any = {
            //'form-control': true,
        };
        if (this.hasError === true) {
            cn['is-invalid'] = true;
        }
        else {
            cn['required-item'] = this.itemSchema.required === true;
        }
        return <><input ref={input=>this.input = input}
            className={classNames(this.className, cn)}
            type={this.inputType}
            defaultValue={this.value}
            onChange={(evt: React.ChangeEvent<any>) => this.onChange(evt)}
            placeholder={typeof this.placeholder === 'string'? this.placeholder : undefined}
            readOnly={this.readOnly}
            disabled={this.disabled}
            onKeyDown = {this.onKeyDown}
            onFocus = {this.onFocus}
            onBlur={this.onBlur}
            maxLength={(this.itemSchema as StringSchema).maxLength} />
            {this.renderErrors()}
        </>;
    }
}
