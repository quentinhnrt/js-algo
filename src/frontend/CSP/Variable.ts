import type {JSONPrimitives} from "../JSON"
import {type Domain, getDomainByName} from "./Domain"

export type JSONVariable<T extends JSONPrimitives = JSONPrimitives> = {
  domain: string
  value?: T
}

export type Variable<T extends JSONPrimitives = JSONPrimitives> = {
  readonly name: string
  readonly domain: Domain<T>
  readonly value?: T
  set(v: T): void
  unset(): void
  isSet(): boolean
  toJSON(): JSONVariable<T>
  // static fromJSON<T>(json: JSONObject): Variable<T>
}

export class BuiltinVariable<T extends JSONPrimitives = JSONPrimitives> implements Variable<T> {
  private static readonly variables: Map<string, Variable> = new Map<string, Variable>()

  private _value?: T

  constructor(
    private readonly _name: string,
    private readonly _domainName: string,
    private readonly _domain: Domain<T>,
  ) {}

  get name() {
    return this._name
  }
  get domain() {
    return this._domain
  }
  get value() {
    return this._value
  }

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

  toJSON(): JSONVariable<T> {
    const result: JSONVariable<T> = {
      domain: this._domainName,
    }
    if (this.isSet()) {
      result.value = this._value
    }
    return result
  }

  static fromJSON<T extends JSONPrimitives = JSONPrimitives>(
    name: string,
    json: JSONVariable<T>,
  ): Variable<T> {
    const domain = getDomainByName(json.domain) as Domain<T>
    if (typeof domain === "undefined") {
      throw new Error(`The variable "${name}" reference an unknown domain "${json.domain}"`)
    }
    const v = new BuiltinVariable(name, json.domain, domain.copy(`${name}-domain`))
    BuiltinVariable.variables.set(name, v)
    return v
  }

  static getByName(name: string): Variable | undefined {
    return BuiltinVariable.variables.get(name)
  }
}

export function createVariable<T extends JSONPrimitives = JSONPrimitives>(
  name: string,
  json: JSONVariable<T>,
): Variable<T> {
  return BuiltinVariable.fromJSON<T>(name, json)
}

export function getVariableByName(name: string): Variable | undefined {
  return BuiltinVariable.getByName(name)
}

export function getOrCreateVariable(name: string, json: JSONVariable): Variable {
  return BuiltinVariable.getByName(name) ?? BuiltinVariable.fromJSON(name, json)
}
