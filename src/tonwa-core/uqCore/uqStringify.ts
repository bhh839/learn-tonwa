export function uqStringify(values: any): string {
    let s = '{';
    if (values === undefined) return 'undefined';
    for (let i in values) {
        let v = values[i];
        s += i + ': ';
        if (v === undefined) {
            s += 'undefined';
        }
        else if (v === null) {
            s += 'null';
        }
        else {
            switch (typeof v) {
                default:
                    s += v;
                    break;
                case 'function':
                    s += 'function';
                    break;
                case 'object':
                    s += '{obj}';
                    break;
            }
        }
        s += ', ';
    }
    return s + '}';
}
