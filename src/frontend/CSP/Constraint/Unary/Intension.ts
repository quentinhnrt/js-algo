import type {Prettify} from "../../../../Prettify"
import type {JSONPrimitives} from "../../../JSON"
import {
  type IntensionConstraintType,
  type TypedConstraint,
  type UnaryConstraintArity,
  type ConstraintWithArity,
  BuiltinBaseConstraint,
} from "../Base"
import {getVariableByName, type Variable} from "../../../CSP/Variable"
import type {UnaryConstraint} from "."

export type IntensionUnaryConstraintJSON = Prettify<
  TypedConstraint<IntensionConstraintType> &
    ConstraintWithArity<UnaryConstraintArity> & {
      readonly variable: string
      readonly valueConsistency: string
    }
>

export type IntensionUnaryConstraintProps<T extends JSONPrimitives = JSONPrimitives> = Prettify<
  Omit<IntensionUnaryConstraintJSON, "valueConsistency"> & {
    readonly valueConsistency: (value: T) => boolean
  }
>

export class BuiltinIntensionUnaryConstraint<T extends JSONPrimitives = JSONPrimitives>
  extends BuiltinBaseConstraint<IntensionConstraintType, UnaryConstraintArity>
  implements UnaryConstraint<IntensionConstraintType>
{
  static readonly type: IntensionConstraintType = "intension"
  static readonly arity: UnaryConstraintArity = 1

  private constructor(
    name: string,
    private readonly _v: Variable<T>,
    private readonly _checkConsistency: (value: T) => boolean,
  ) {
    super(name)
  }

  get type() {
    return BuiltinIntensionUnaryConstraint.type
  }
  get arity() {
    return BuiltinIntensionUnaryConstraint.arity
  }
  get variableName() {
    return this._v.name
  }

  checkConsistency(): boolean {
    return this._v.isSet() && this._checkConsistency(this._v.value!)
  }

  toJSON(): IntensionUnaryConstraintJSON {
    return {
      type: BuiltinIntensionUnaryConstraint.type,
      arity: BuiltinIntensionUnaryConstraint.arity,
      variable: this._v.name,
      valueConsistency: this._checkConsistency.toString(),
    }
  }

  static create<T extends JSONPrimitives = JSONPrimitives>(
    name: string,
    props: IntensionUnaryConstraintProps<T>,
  ): UnaryConstraint<IntensionConstraintType> {
    const variable = getVariableByName(props.variable) as Variable<T> | undefined
    if (!variable) {
      throw new Error(`The constraint "${name}" refer to an unknown variable "${props.variable}"`)
    }
    const c = new BuiltinIntensionUnaryConstraint<T>(name, variable, props.valueConsistency)
    BuiltinBaseConstraint.constraints.set(name, c)
    return c
  }

  static fromJSON<T extends JSONPrimitives = JSONPrimitives>(
    name: string,
    json: IntensionUnaryConstraintJSON,
  ): UnaryConstraint<IntensionConstraintType> {
    const f: (v: T) => boolean = new Function(`return ${json.valueConsistency}`)()
    const props: IntensionUnaryConstraintProps<T> = {...json, valueConsistency: f}
    return BuiltinIntensionUnaryConstraint.create<T>(name, props)
  }
}
