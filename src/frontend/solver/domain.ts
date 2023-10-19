import {JSONArray} from "./types.ts";

export type DomainType<T> = Array<T> | JSONArray3332313

export class Domain<T> {
    private _values: DomainType<T>;
    constructor(v) {
        this._values = v
    }
    del<T>(v: T) {
        const valueIndex = this._values.indexOf(v)
        if (valueIndex !== -1) {
            this._values.splice(valueIndex, 1)
        }
    }

    add<T>(v: T) {
        if (!this._values.includes(v)) {
            this._values.push(v)
        }
    }

    has<T>(v: T) {
        return this._values.includes(v)
    }

    copy() {
        return new Domain(this._values)
    }

    toJSON() {
        return JSON.stringify(this._values)
    }

    fromJSON(json: JSONArray) {
        this._values = json
    }
}