import type {JSONArray, JSONPrimitives} from "../JSON"

export interface Domain<T extends JSONPrimitives = JSONPrimitives> {
  add(v: T): void
  del(v: T): void
  has(v: T): boolean
  copy(newName: string): Domain<T>
  toJSON(): T[]
  getSize(): number
  // static fromJSON(j: JSON): Domain<T>
}

export class BuiltinDomain<T extends JSONPrimitives = JSONPrimitives> implements Domain<T> {
  private static readonly domains: Map<string, Domain> = new Map<string, Domain>()

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

  copy(newName: string): Domain<T> {
    const result: Domain<T> = new BuiltinDomain<T>(this.toJSON())
    BuiltinDomain.domains.set(newName, result)
    return result
  }

  toJSON(): T[] {
    const result: T[] = []
    for (const v of this._values) {
      result.push(v)
    }
    return result
  }

  getSize(): number {
    return this._values.size
  }

  static validateJSON(json: unknown): json is JSONPrimitives[] {
    if (Array.isArray(json) && json.length > 0) {
      const type = typeof json[0]
      const validationOk: boolean = json.reduce(
        (acc: boolean, element: unknown) => acc && typeof element === type,
        true,
      )
      if (!validationOk) {
        return false
      }
    }
    return true
  }

  static fromJSON<T extends JSONPrimitives = JSONPrimitives>(
    name: string,
    json: JSONArray,
  ): Domain<T> {
    if (BuiltinDomain.validateJSON(json)) {
      const d = new BuiltinDomain<T>(json as T[])
      BuiltinDomain.domains.set(name, d)
      return d
    }
    throw new Error(`At least one element do not have the same type as the other`)
  }

  static getByName(name: string): Domain | undefined {
    return BuiltinDomain.domains.get(name)
  }
}

export function createDomain<T extends JSONPrimitives = JSONPrimitives>(
  name: string,
  json: JSONArray,
): Domain<T> {
  return BuiltinDomain.fromJSON<T>(name, json)
}

export function getDomainByName(name: string): Domain | undefined {
  return BuiltinDomain.getByName(name)
}

export function getOrCreateDomain(name: string, json: JSONArray): Domain {
  return BuiltinDomain.getByName(name) ?? BuiltinDomain.fromJSON(name, json)
}
