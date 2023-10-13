export type VariableType<Variable> = Variable

export class Variable<T> {
    private _value: T | null

    set(v) {
        this._value = v;
    }

    unset() {
        this._value = null;
    }

    toJson() {
        return JSON.stringify(this._value)
    }

    get() {
        return this._value
    }
}