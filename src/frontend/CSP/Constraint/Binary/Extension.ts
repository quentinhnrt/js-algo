import type {Prettify} from "../../../../Prettify"
import type {JSONPrimitives} from "../../../JSON"
import {
  type ExtensionConstraintType,
  type TypedConstraint,
  type ExtensionConstraintValuesType,
  type BinaryConstraintArity,
  type ConstraintWithArity,
  BuiltinBaseConstraint,
} from "../Base"
import {getVariableByName, type Variable} from "../../../CSP/Variable"
import type {BinaryConstraint} from "./index"

export type ExtensionBinaryConstraintJSON<T extends JSONPrimitives = JSONPrimitives> = Prettify<
  TypedConstraint<ExtensionConstraintType> &
    ConstraintWithArity<BinaryConstraintArity> & {
      readonly variables: [string, string]
      readonly tuples: [T, T][]
      readonly tuplesType: ExtensionConstraintValuesType
    }
>

export type ExtensionBinaryConstraintProps<T extends JSONPrimitives = JSONPrimitives> =
  ExtensionBinaryConstraintJSON<T>

export class BuiltinExtensionBinaryConstraint<T extends JSONPrimitives = JSONPrimitives>
  extends BuiltinBaseConstraint<ExtensionConstraintType, BinaryConstraintArity>
  implements BinaryConstraint<ExtensionConstraintType>
{
  static readonly type: ExtensionConstraintType = "extension"
  static readonly arity: BinaryConstraintArity = 2

  private readonly _index: Map<T, Set<T>>
  private readonly _areSupports: boolean
  private readonly _areConflicts: boolean

  private constructor(
    name: string,
    private readonly _v: [Variable<T>, Variable<T>],
    tuples: [T, T][],
    valuesType: ExtensionConstraintValuesType,
  ) {
    super(name)
    const filteredTuples = tuples.filter(
      (t: [T, T]) => _v[0].domain.has(t[0]) && _v[1].domain.has(t[1]),
    )
    this._index = new Map<T, Set<T>>()
    for (let i = 0; i < filteredTuples.length; i++) {
      const [v1, v2] = filteredTuples[i]
      if (!this._index.has(v1)) {
        this._index.set(v1, new Set<T>())
      }
      this._index.get(v1)!.add(v2)
    }
    this._areSupports = valuesType === "supports"
    this._areConflicts = valuesType === "conflicts"
  }

  get type() {
    return BuiltinExtensionBinaryConstraint.type
  }
  get arity() {
    return BuiltinExtensionBinaryConstraint.arity
  }
  get variableNames() {
    return [this._v[0].name, this._v[1].name] as [string, string]
  }

  checkConsistency(): boolean {
    const [v1, v2] = this._v
    if (!(v1.isSet() && v2.isSet())) {
      return false
    }
    const vv1 = this._index.get(v1.value!)
    const tuplePresent = vv1 && vv1.has(v2.value!)
    return tuplePresent ? this._areSupports : this._areConflicts
  }

  toJSON(): ExtensionBinaryConstraintJSON<T> {
    const tuples: [T, T][] = []
    for (const v1 of this._index.keys()) {
      for (const v2 of this._index.get(v1)!.values()) {
        tuples.push([v1, v2])
      }
    }
    return {
      type: BuiltinExtensionBinaryConstraint.type,
      arity: BuiltinExtensionBinaryConstraint.arity,
      variables: this.variableNames,
      tuples,
      tuplesType: this._areSupports ? "supports" : "conflicts",
    }
  }

  static create<T extends JSONPrimitives = JSONPrimitives>(
    name: string,
    props: ExtensionBinaryConstraintProps<T>,
  ): BinaryConstraint<ExtensionConstraintType> {
    const [v1Name, v2Name] = props.variables
    const v1 = getVariableByName(v1Name) as Variable<T> | undefined
    const v2 = getVariableByName(v2Name) as Variable<T> | undefined
    if (!(v1 && v2)) {
      throw new Error(
        `The constraint "${name}" refers to the variables "${v1Name}" and "${v2Name}" but one of them is unknown`,
      )
    }
    const c = new BuiltinExtensionBinaryConstraint(name, [v1, v2], props.tuples, props.tuplesType)
    BuiltinBaseConstraint.constraints.set(name, c)
    return c
  }

  static fromJSON<T extends JSONPrimitives = JSONPrimitives>(
    name: string,
    json: ExtensionBinaryConstraintJSON<T>,
  ): BinaryConstraint<ExtensionConstraintType> {
    return BuiltinExtensionBinaryConstraint.create<T>(name, json)
  }
}
