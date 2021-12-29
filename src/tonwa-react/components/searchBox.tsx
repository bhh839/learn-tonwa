import * as React from 'react';
import classNames from 'classnames';
import { env } from 'tonwa-core';

export interface SearchBoxProps {
    className?: string;
    label?: string;
    initKey?: string;
    placeholder?: string;
    buttonText?: string;
    maxLength?: number;
    size?: 'sm' | 'md' | 'lg';
    inputClassName?: string;
    onSearch: (key: string) => Promise<void>;
    onFocus?: () => void;
    allowEmptySearch?: boolean;
}

/*
export interface SearchBoxState {
    disabled: boolean;
}*/

export class SearchBox extends React.Component<SearchBoxProps> { //}, SearchBoxState> {
    private input: HTMLInputElement;
    private button: HTMLButtonElement;
    private key: string = null;

    private onChange = (evt: React.ChangeEvent<any>) => {
        this.key = evt.target.value;
        if (this.key !== undefined) {
            this.key = this.key.trim();
            if (this.key === '') this.key = undefined;
        }
        console.log('key = ' + this.key);
        if (this.props.allowEmptySearch === true) {
        }
        else {
            this.button.disabled = this.key === undefined || this.key.length === 0;
        }
    }
    private onSubmit = async (evt: React.FormEvent<any>) => {
        evt.preventDefault();
        if (this.key === null) this.key = this.props.initKey || '';
        if (this.props.allowEmptySearch !== true) {
            if (!this.key) return;
            if (this.input) this.input.disabled = true;
            if (this.button) this.button.disabled = true;
        }
        await this.props.onSearch(this.key);
        if (this.input) this.input.disabled = false;
        if (this.button) this.button.disabled = false;
    }
    clear() {
        if (this.input) this.input.value = '';
    }
    render() {
        let { className, inputClassName, onFocus,
            label, placeholder, buttonText, maxLength, size } = this.props;
        let inputSize: string;
        switch (size) {
            default:
            case 'sm': inputSize = 'input-group-sm'; break;
            case 'md': inputSize = 'input-group-md'; break;
            case 'lg': inputSize = 'input-group-lg'; break;
        }
        let autoComplete: string;
        if (env.isMobile === true) autoComplete = 'off';
        return <form className={className} onSubmit={this.onSubmit} autoComplete={autoComplete}>
            <div className={classNames("input-group", inputSize)}>
                {label && <div className="input-group-addon align-self-center me-2">{label}</div>}
                <input ref={v => this.input = v} onChange={this.onChange}
                    type="text"
                    name="key"
                    onFocus={onFocus}
                    className={classNames('form-control', inputClassName || 'border-primary')}
                    placeholder={placeholder}
                    defaultValue={this.props.initKey}
                    maxLength={maxLength} />
                <div className="input-group-append">
                    <button ref={v => this.button = v} className="btn btn-primary"
                        type="submit"
                        disabled={this.props.allowEmptySearch !== true}>
                        <i className='fa fa-search' />
                        <i className="fa" />
                        {buttonText}
                    </button>
                </div>
            </div>
        </form>;
    }
}
