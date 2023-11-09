import type { JSONPrimitives, JSONObject, JSONArray } from "./JSON"
import {DomainImpl, type Domain} from "./Domain"

export type JSONVariable = {
    domain: JSONArray
    value?: JSONPrimitives
}

export type Variable<T extends JSONPrimitives> = {
    readonly domain: Domain<T>
    readonly value?: T
    set(v: T): void
    unset(): void
    isSet(): boolean
    toJSON(): JSONVariable
    // static fromJSON<T>(json: JSONObject): Variable<T>
}

export class VariableImpl<T extends JSONPrimitives> implements Variable<T> {
    private _value?: T
    
    constructor(
        private readonly _domain: Domain<T>
    ) {}

    get domain() { return this._domain}
    get value() {return this._value}

    set(v: T) {
        if (this._domain.has(v)) {
            this._value = v
        }
    }

    unset() {
        this._value = undefined
    }

    isSet(): boolean {
        return typeof this._value !== "undefined"
    }

    toJSON(): JSONVariable {
        const result: JSONVariable = {
            domain: this._domain.toJSON(),
        }
        if (this.isSet()) {
            result.value = this._value
        }
        return result
    }

    static fromJSON<T extends JSONPrimitives>(json: JSONVariable): Variable<T> {
        let validationOk = typeof json === "object" && "domain" in json
        if (validationOk && DomainImpl.validateJSON(json.domain)) {
            const domain = new DomainImpl(json.domain) as unknown as Domain<T>
            return new VariableImpl(domain)
        }
        throw new Error(`Unexpected JSONVariable object: ${JSON.stringify(json)}`)
    }
}