import { action, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import React, { Component } from "react";
import { Rule, RuleCustom, RuleRequired } from "../inputRules";

export interface InputProps {
    className?: string;
    defaultValue?: any;
    disabled?: boolean;
    onValueChange?: (newValue:any, preValue:any, ruleMessage:string) => void;
    required?: boolean;
    containerClassName?: string;
    ruleClassName?: string;
    requiredFlagElement?: JSX.Element;
    rules?: ((value:any) => string[] | string)[];
}

export abstract class Input<P extends InputProps, V> extends Component<P> {
    static defaultRequiredFlagElement = <span className="mx-2 text-danger">*</span>;
    static defaultRuleClassName = ' mx-2 text-danger ';
    protected readonly rules: Rule[] = [];
    protected value: V = null;
    protected input: HTMLInputElement;
    protected abstract get type(): 'text' | 'number' | 'checkbox' | 'radio';
    protected get placeholder(): string {return undefined;}
    protected get max(): number {return undefined;}
    protected get min(): number {return undefined;}
    protected get maxLength(): number {return undefined;}
    protected get className(): string {return this.props.className}
    protected requiredFlagElement?: JSX.Element;
    ruleMessage: string = null;
    constructor(props: P) {
        super(props);
        makeObservable(this, {
            ruleMessage: observable,
            onChange: action,
            onFocus: action,
            onBlur: action,
        });
        this.init();
    }

    private init() {
        let {required, rules, requiredFlagElement, defaultValue} = this.props;
        if (required === true) {
            if (requiredFlagElement === undefined) requiredFlagElement = Input.defaultRequiredFlagElement;
            this.requiredFlagElement = requiredFlagElement;
            this.rules.push(new RuleRequired());
        }
        this.buildRules();
        if (rules) {
            for (let rule of rules) {this.rules.push(new RuleCustom(rule))};
        }
        this.value = defaultValue;
    }

    protected buildRules() {
    }

    getValue(): V {return this.value;}
    setValue(v: V) {
        let p = this.value;
        this.value = v;
        this.checkRules();
        let {onValueChange} = this.props;
        if (!onValueChange) return;
        if (v !== p) onValueChange(v, p, this.ruleMessage);
    }

    render(): JSX.Element {
        let {defaultValue, disabled, required} = this.props;
        let content = <input ref={inp => this.input = inp}
            className={this.className} type={this.type}
            placeholder={this.placeholder}
            defaultValue={defaultValue}
            defaultChecked={defaultValue}
            maxLength={this.maxLength}
            max={this.max}
            min={this.min}
            disabled={disabled}
            onChange={() => this.onChange()}
            onBlur={() => this.onBlur()}
            onFocus={() => this.onFocus()} />;
        if (this.rules.length === 0) return content;
        let {containerClassName, ruleClassName} = this.props;
        return <span className={containerClassName}>
            {required===true && this.requiredFlagElement}
            {content}
            {
                React.createElement(observer(() => {
                    return <span className={ruleClassName ?? Input.defaultRuleClassName}>{this.ruleMessage}</span>
                }))
            }
        </span>;
    }

    onChange() {
        let preValue = this.value;
        let value = this.value = this.valueFromInput();
        this.checkRules();
        let {onValueChange} = this.props;
        if (!onValueChange) return;
        if (value !== preValue) onValueChange(value, preValue, this.ruleMessage);
    }

    protected valueFromInput():V {return;}

    protected checkRules() {
        let defy:string[] = [];
        for (let rule of this.rules) {
            rule.check(defy, this.value);
        }
        if (defy.length === 0) {
            this.ruleMessage = null;
        }
        else {
            this.ruleMessage = defy[0];
        }
    }

    onBlur() {
        this.checkRules();
    }

    onFocus() {
        this.ruleMessage = null;
    }
}
