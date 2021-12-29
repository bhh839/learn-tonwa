import { Input, InputProps } from "../input";

export interface InputCheckBoxProps extends InputProps {
}

export class InputCheckBox extends Input<InputCheckBoxProps, boolean> {
    static defaultClassName = 'form-check-input p-2';

    protected get type(): 'text' | 'number' | 'checkbox' | 'radio' {return 'checkbox'}
    protected get className(): string {
        let {className} = this.props;
        if (className === null) return null;
        if (!className) return InputCheckBox.defaultClassName;
        return className;
    }

    protected valueFromInput(): boolean {
        return this.input.checked;
    }
    onBlur() {}
    onFocus() {}
    setValue(v: boolean) {
        super.setValue(v);
        this.input.checked = v;
    }
}
