import type {Prettify} from "../../../../Prettify"
import type {JSONPrimitives} from "../../../JSON"
import {
  type IntensionConstraintType,
  type TypedConstraint,
  type BinaryConstraintArity,
  type ConstraintWithArity,
  BuiltinBaseConstraint,
} from "../Base"
import {getVariableByName, type Variable} from "../../../CSP/Variable"
import type {BinaryConstraint} from "./index"

export type IntensionBinaryConstraintJSON = Prettify<
  TypedConstraint<IntensionConstraintType> &
    ConstraintWithArity<BinaryConstraintArity> & {
      readonly variables: [string, string]
      readonly valuesConsistency: string
    }
>

export type IntensionBinaryConstraintProps<T extends JSONPrimitives = JSONPrimitives> = Prettify<
  Omit<IntensionBinaryConstraintJSON, "valuesConsistency"> & {
    readonly variables: [string, string]
    readonly valuesConsistency: (v1: T, v2: T) => boolean
  }
>

export class BuiltinIntensionBinaryConstraint<T extends JSONPrimitives = JSONPrimitives>
  extends BuiltinBaseConstraint<IntensionConstraintType, BinaryConstraintArity>
  implements BinaryConstraint<IntensionConstraintType>
{
  static readonly type: IntensionConstraintType = "intension"
  static readonly arity: BinaryConstraintArity = 2

  private constructor(
    name: string,
    private readonly _v: [Variable<T>, Variable<T>],
    private readonly _checkConsistency: (v1: T, v2: T) => boolean,
  ) {
    super(name)
  }

  get type() {
    return BuiltinIntensionBinaryConstraint.type
  }
  get arity() {
    return BuiltinIntensionBinaryConstraint.arity
  }
  get variableNames() {
    return [this._v[0].name, this._v[1].name] as [string, string]
  }

  checkConsistency(): boolean {
    const [v1, v2] = this._v
    return v1.isSet() && v2.isSet() && this._checkConsistency(v1.value!, v2.value!)
  }

  toJSON(): IntensionBinaryConstraintJSON {
    return {
      type: BuiltinIntensionBinaryConstraint.type,
      arity: BuiltinIntensionBinaryConstraint.arity,
      variables: this.variableNames,
      valuesConsistency: this._checkConsistency.toString(),
    }
  }

  static create<T extends JSONPrimitives = JSONPrimitives>(
    name: string,
    props: IntensionBinaryConstraintProps<T>,
  ): BinaryConstraint<IntensionConstraintType> {
    const [v1Name, v2Name] = props.variables
    const v1 = getVariableByName(v1Name) as Variable<T> | undefined
    const v2 = getVariableByName(v2Name) as Variable<T> | undefined
    if (!(v1 && v2)) {
      throw new Error(
        `The constraint "${name}" refers to the variables "${v1Name}" and "${v2Name}" but one of them is unknown`,
      )
    }
    const c = new BuiltinIntensionBinaryConstraint<T>(name, [v1, v2], props.valuesConsistency)
    BuiltinBaseConstraint.constraints.set(name, c)
    return c
  }

  static fromJSON<T extends JSONPrimitives = JSONPrimitives>(
    name: string,
    json: IntensionBinaryConstraintJSON,
  ): BinaryConstraint<IntensionConstraintType> {
    const f: (v1: T, v2: T) => boolean = new Function(`return ${json.valuesConsistency}`)()
    const props: IntensionBinaryConstraintProps<T> = {...json, valuesConsistency: f}
    return BuiltinIntensionBinaryConstraint.create<T>(name, props)
  }
}
