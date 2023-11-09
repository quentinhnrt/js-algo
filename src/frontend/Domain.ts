import type {JSONArray, JSONPrimitives} from "./JSON"

export interface Domain<T extends JSONPrimitives> {
    add(v: T): void
    del(v: T): void
    has(v: T): boolean
    copy(): Domain<T>
    toJSON(): T[]
    // static fromJSON(j: JSON): Domain<T>
}

export class DomainImpl<T extends JSONPrimitives> implements Domain<T> {
    private readonly _values: Set<T>
    
    constructor(values: T[] = []) {
        this._values = new Set(values)
    }

    add(v: T) {
        this._values.add(v)
    }

    del(v: T) {
        this._values.delete(v)
    }

    has(v: T): boolean {
        return this._values.has(v)
    }

    copy(): Domain<T> {
        return new DomainImpl<T>(this.toJSON())
    }

    toJSON(): T[] {
        const result: T[] = []
        for (const v of this._values) {
            result.push(v)
        }
        return result
    }

    static validateJSON(json: unknown): json is JSONPrimitives[] {
        if (Array.isArray(json) && json.length > 0) {
            const type = typeof json[0]
            const validationOk: boolean = json.reduce(
                (acc: boolean, element: unknown) => acc && typeof element !== type,
                true
            )
            if (!validationOk) {
                return false
            }
        }
        return true
    }

    static fromJSON<T extends JSONPrimitives>(json: JSONArray): Domain<T> {
        if (DomainImpl.validateJSON(json)) {
            return new DomainImpl<T>(json as T[])
        }
        throw new Error(`At least one element do not have the same type as the other`)
    }
}