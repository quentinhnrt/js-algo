export * from "./Intension"
export * from "./Extension"
import type {Prettify} from "../../../../Prettify"
import type {JSONPrimitives} from "../../../JSON"
import type {ConstraintType, BaseConstraint, BinaryConstraintArity} from "../Base"
import {
  type IntensionBinaryConstraintProps,
  type IntensionBinaryConstraintJSON,
  BuiltinIntensionBinaryConstraint,
} from "./Intension"
import {
  type ExtensionBinaryConstraintProps,
  type ExtensionBinaryConstraintJSON,
  BuiltinExtensionBinaryConstraint,
} from "./Extension"

export type BinaryConstraintJSON<T extends JSONPrimitives = JSONPrimitives> =
  | IntensionBinaryConstraintJSON
  | ExtensionBinaryConstraintJSON<T>

export type BinaryConstraintProps<T extends JSONPrimitives = JSONPrimitives> =
  | IntensionBinaryConstraintProps<T>
  | ExtensionBinaryConstraintProps<T>

export type BinaryConstraint<Type extends ConstraintType = ConstraintType> = Prettify<
  BaseConstraint<Type, BinaryConstraintArity> & {
    readonly variableNames: [string, string]
  }
>

export const binaryConstraintType: BinaryConstraintArity = 2

export function isIntensionBinaryConstraintJSON<T extends JSONPrimitives = JSONPrimitives>(
  json: BinaryConstraintJSON<T>,
): json is IntensionBinaryConstraintJSON {
  return json.type === BuiltinIntensionBinaryConstraint.type
}

export function isIntensionBinaryConstraintProps<T extends JSONPrimitives = JSONPrimitives>(
  props: BinaryConstraintProps<T>,
): props is IntensionBinaryConstraintProps<T> {
  return props.type === BuiltinIntensionBinaryConstraint.type
}

export function isExtensionBinaryConstraintJSON<T extends JSONPrimitives = JSONPrimitives>(
  json: BinaryConstraintJSON<T>,
): json is ExtensionBinaryConstraintJSON<T> {
  return json.type === BuiltinExtensionBinaryConstraint.type
}

export function isExtensionBinaryConstraintProps<T extends JSONPrimitives = JSONPrimitives>(
  props: BinaryConstraintProps<T>,
): props is ExtensionBinaryConstraintProps<T> {
  return props.type === BuiltinExtensionBinaryConstraint.type
}

export function binaryConstraintFromJSON<T extends JSONPrimitives = JSONPrimitives>(
  name: string,
  json: BinaryConstraintJSON<T>,
): BinaryConstraint {
  return isIntensionBinaryConstraintJSON<T>(json)
    ? BuiltinIntensionBinaryConstraint.fromJSON<T>(name, json)
    : BuiltinExtensionBinaryConstraint.fromJSON<T>(name, json)
}

export function createBinaryConstraint<T extends JSONPrimitives = JSONPrimitives>(
  name: string,
  props: BinaryConstraintProps<T>,
): BinaryConstraint {
  return isIntensionBinaryConstraintProps<T>(props)
    ? BuiltinIntensionBinaryConstraint.create<T>(name, props)
    : BuiltinExtensionBinaryConstraint.create<T>(name, props)
}
