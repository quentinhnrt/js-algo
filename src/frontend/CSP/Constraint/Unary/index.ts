export * from "./Intension"
export * from "./Extension"
import type {Prettify} from "../../../../Prettify"
import type {JSONPrimitives} from "../../../JSON"
import type {ConstraintType, BaseConstraint, UnaryConstraintArity} from "../Base"
import {
  type IntensionUnaryConstraintProps,
  type IntensionUnaryConstraintJSON,
  BuiltinIntensionUnaryConstraint,
} from "./Intension"
import {
  type ExtensionUnaryConstraintProps,
  type ExtensionUnaryConstraintJson,
  BuiltinExtensionUnaryConstraint,
} from "./Extension"

export type UnaryConstraintJSON<T extends JSONPrimitives = JSONPrimitives> =
  | IntensionUnaryConstraintJSON
  | ExtensionUnaryConstraintJson<T>

export type UnaryConstraintProps<T extends JSONPrimitives = JSONPrimitives> =
  | IntensionUnaryConstraintProps<T>
  | ExtensionUnaryConstraintProps<T>

export type UnaryConstraint<Type extends ConstraintType = ConstraintType> = Prettify<
  BaseConstraint<Type, UnaryConstraintArity> & {
    readonly variableName: string
  }
>

export const unaryConstraintType: UnaryConstraintArity = 1

export function isIntensionUnaryConstraintJSON<T extends JSONPrimitives = JSONPrimitives>(
  json: UnaryConstraintJSON<T>,
): json is IntensionUnaryConstraintJSON {
  return json.type === BuiltinIntensionUnaryConstraint.type
}

export function isIntensionUnaryConstraintProps<T extends JSONPrimitives = JSONPrimitives>(
  props: UnaryConstraintProps<T>,
): props is IntensionUnaryConstraintProps<T> {
  return props.type === BuiltinIntensionUnaryConstraint.type
}

export function isExtensionUnaryConstraintJSON<T extends JSONPrimitives = JSONPrimitives>(
  json: UnaryConstraintJSON<T>,
): json is ExtensionUnaryConstraintJson<T> {
  return json.type === BuiltinExtensionUnaryConstraint.type
}

export function isExtensionUnaryConstraintProps<T extends JSONPrimitives = JSONPrimitives>(
  props: UnaryConstraintProps<T>,
): props is ExtensionUnaryConstraintProps<T> {
  return props.type === BuiltinExtensionUnaryConstraint.type
}

export function unaryConstraintFromJSON<T extends JSONPrimitives = JSONPrimitives>(
  name: string,
  json: UnaryConstraintJSON<T>,
): UnaryConstraint {
  return isIntensionUnaryConstraintJSON<T>(json)
    ? BuiltinIntensionUnaryConstraint.fromJSON<T>(name, json)
    : BuiltinExtensionUnaryConstraint.fromJSON<T>(name, json)
}

export function createUnaryConstraint<T extends JSONPrimitives = JSONPrimitives>(
  name: string,
  props: UnaryConstraintProps<T>,
): UnaryConstraint {
  return isIntensionUnaryConstraintProps<T>(props)
    ? BuiltinIntensionUnaryConstraint.create<T>(name, props)
    : BuiltinExtensionUnaryConstraint.create<T>(name, props)
}
