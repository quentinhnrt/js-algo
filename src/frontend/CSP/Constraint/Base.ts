import type {Prettify} from "../../../Prettify"
import type {JSONObject} from "../../JSON"
import type {ConstraintJSON, Constraint} from "./index"

export type IntensionConstraintType = "intension"
export type ExtensionConstraintType = "extension"
export type ConstraintType = IntensionConstraintType | ExtensionConstraintType

export type UnaryConstraintArity = 1
export type BinaryConstraintArity = 2
export type ConstraintArity = UnaryConstraintArity | BinaryConstraintArity

export type TypedConstraint<T extends ConstraintType = ConstraintType> = {
  readonly type: T
}

export type ConstraintWithArity<A extends ConstraintArity = ConstraintArity> = {
  readonly arity: A
}

export type ExtensionConstraintSupportsType = "supports"
export type ExtensionConstraintConflictsType = "conflicts"
export type ExtensionConstraintValuesType =
  | ExtensionConstraintSupportsType
  | ExtensionConstraintConflictsType

export type BaseConstraint<
  T extends ConstraintType = ConstraintType,
  A extends ConstraintArity = ConstraintArity,
> = Prettify<
  TypedConstraint<T> &
    ConstraintWithArity<A> & {
      readonly name: string
      checkConsistency(): boolean
      toJSON(): ConstraintJSON
    }
>

export abstract class BuiltinBaseConstraint<
  T extends ConstraintType = ConstraintType,
  A extends ConstraintArity = ConstraintArity,
> implements BaseConstraint<T, A>
{
  protected static constraints: Map<string, Constraint> = new Map<string, Constraint>()

  protected constructor(private readonly _name: string) {}

  abstract type: T
  abstract arity: A

  get name() {
    return this._name
  }

  abstract checkConsistency(): boolean
  abstract toJSON(): ConstraintJSON

  static getByName(name: string): Constraint | undefined {
    return BuiltinBaseConstraint.constraints.get(name)
  }
}
