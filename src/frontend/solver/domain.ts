import {Variable} from "./variable.ts";

export type DomainType<Domain> = Array<Domain>

export class Domain<T> {
    private _values: DomainType<Variable<T>>;
    constructor(v) {
        this._values = v
    }
    remove<Variable>(v: Variable) {
        const valueIndex = this._values.findIndex((value) => value.get() === v)
        if (valueIndex !== -1) {
            this._values[valueIndex].unset()
        }
    }

    add<T>(v: T) {
        const nullIndex = this._values.findIndex((v) => v.get() === null)
        if (nullIndex !== -1) {
            this._values[nullIndex].set(v)
        }
    }

    contains<T>(v: T) {
        return this._values.some((value) => value.get() === v)
    }

    copy() {
        return new Domain(this._values)
    }

    toJSON() {
        // use toJson in value
        let values = []
        for (let i = 0; i < this._values.length; i++) {
            values.push(this._values[i].toJson())
        }
        return JSON.stringify(values)
    }
}