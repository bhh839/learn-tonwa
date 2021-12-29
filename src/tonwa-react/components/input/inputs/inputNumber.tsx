import { RuleInt, RuleNum } from "../../inputRules";
import { Input, InputProps } from "../input";

interface InputNumberProps extends InputProps {
    placeholder?: string;
    max?: number;
    min?: number;
}

export class InputNumber<P extends InputNumberProps> extends Input<P, number> {
    static defaultClassName = 'form-control w-8c d-inline text-right';

    protected get type(): 'text' | 'number' | 'checkbox' | 'radio' { return 'number' }
    protected get max(): number { return this.props.max; }
    protected get min(): number { return this.props.min; }
    protected get className(): string {
        let { className } = this.props;
        if (className === null) return null;
        if (!className) return InputNumber.defaultClassName;
        return className;
    }

    protected buildRules() {
        let { max, min } = this.props;
        this.rules.push(new RuleNum(undefined, min, max));
    }

    protected parseValue(): number {
        return Number.parseFloat(this.input.value);
    }

    protected valueFromInput(): number {
        let v = this.parseValue();
        if (isNaN(v) === true) return undefined;
        return v;
    }
}

export interface InputIntegerProps extends InputNumberProps {
}

export class InputInteger<P extends InputIntegerProps> extends InputNumber<P> {
    protected buildRules() {
        let { max, min } = this.props;
        this.rules.push(new RuleInt(undefined, min, max));
    }

    protected parseValue(): number {
        return Number.parseInt(this.input.value);
    }
}
