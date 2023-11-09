import type {Prettify} from "../../../../Prettify"
import type {JSONPrimitives} from "../../../JSON"
import {
  type ExtensionConstraintType,
  type TypedConstraint,
  type ExtensionConstraintValuesType,
  type UnaryConstraintArity,
  type ConstraintWithArity,
  BuiltinBaseConstraint,
} from "../Base"
import {getVariableByName, type Variable} from "../../../CSP/Variable"
import type {UnaryConstraint} from "."

export type ExtensionUnaryConstraintJson<T extends JSONPrimitives = JSONPrimitives> = Prettify<
  TypedConstraint<ExtensionConstraintType> &
    ConstraintWithArity<UnaryConstraintArity> & {
      readonly variable: string
      readonly values: T[]
      readonly valuesType: ExtensionConstraintValuesType
    }
>

export type ExtensionUnaryConstraintProps<T extends JSONPrimitives = JSONPrimitives> =
  ExtensionUnaryConstraintJson<T>

export class BuiltinExtensionUnaryConstraint<T extends JSONPrimitives = JSONPrimitives>
  extends BuiltinBaseConstraint<ExtensionConstraintType, UnaryConstraintArity>
  implements UnaryConstraint<ExtensionConstraintType>
{
  static readonly type: ExtensionConstraintType = "extension"
  static readonly arity: UnaryConstraintArity = 1

  private readonly _index: Set<T>
  private readonly _areSupports: boolean
  private readonly _areConflicts: boolean

  private constructor(
    name: string,
    private readonly _v: Variable<T>,
    _values: T[],
    _valuesType: ExtensionConstraintValuesType,
  ) {
    super(name)
    this._index = new Set<T>(_values.filter((v: T) => _v.domain.has(v)))
    this._areSupports = _valuesType === "supports"
    this._areConflicts = _valuesType === "conflicts"
  }

  get type() {
    return BuiltinExtensionUnaryConstraint.type
  }
  get arity() {
    return BuiltinExtensionUnaryConstraint.arity
  }
  get variableName() {
    return this._v.name
  }

  checkConsistency(): boolean {
    if (!this._v.isSet()) {
      return false
    }
    return this._index.has(this._v.value!) ? this._areSupports : this._areConflicts
  }

  toJSON(): ExtensionUnaryConstraintJson<T> {
    const values: T[] = []
    for (const v of this._index.values()) {
      values.push(v)
    }
    return {
      type: BuiltinExtensionUnaryConstraint.type,
      arity: BuiltinExtensionUnaryConstraint.arity,
      variable: this._v.name,
      values,
      valuesType: this._areSupports ? "supports" : "conflicts",
    }
  }

  static create<T extends JSONPrimitives = JSONPrimitives>(
    name: string,
    props: ExtensionUnaryConstraintProps<T>,
  ): UnaryConstraint<ExtensionConstraintType> {
    const variable = getVariableByName(props.variable) as Variable<T> | undefined
    if (!variable) {
      throw new Error(`The constraint "${name}" refer to an unknown variable "${props.variable}"`)
    }
    const c = new BuiltinExtensionUnaryConstraint<T>(name, variable, props.values, props.valuesType)
    BuiltinBaseConstraint.constraints.set(name, c)
    return c
  }

  static fromJSON<T extends JSONPrimitives = JSONPrimitives>(
    name: string,
    json: ExtensionUnaryConstraintJson<T>,
  ): UnaryConstraint<ExtensionConstraintType> {
    return BuiltinExtensionUnaryConstraint.create<T>(name, json)
  }
}
