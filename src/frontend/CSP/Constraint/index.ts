export * from "./Base"
export * from "./Unary"
export * from "./Binary"
import type {JSONPrimitives} from "../../JSON"
import {BuiltinBaseConstraint, type ConstraintType} from "./Base"
import {
  type UnaryConstraintJSON,
  type UnaryConstraintProps,
  type UnaryConstraint,
  unaryConstraintType,
  createUnaryConstraint,
  unaryConstraintFromJSON,
} from "./Unary"
import {
  type BinaryConstraintJSON,
  type BinaryConstraintProps,
  type BinaryConstraint,
  binaryConstraintType,
  createBinaryConstraint,
  binaryConstraintFromJSON,
} from "./Binary"

export type ConstraintJSON<T extends JSONPrimitives = JSONPrimitives> =
  | UnaryConstraintJSON<T>
  | BinaryConstraintJSON<T>

export type ConstraintProps<T extends JSONPrimitives = JSONPrimitives> =
  | UnaryConstraintProps<T>
  | BinaryConstraintProps<T>

export type Constraint<Type extends ConstraintType = ConstraintType> =
  | UnaryConstraint<Type>
  | BinaryConstraint<Type>

export function isUnaryConstraintJSON<T extends JSONPrimitives = JSONPrimitives>(
  json: ConstraintJSON<T>,
): json is UnaryConstraintJSON<T> {
  return json.arity === unaryConstraintType
}

export function isUnaryConstraintProps<T extends JSONPrimitives = JSONPrimitives>(
  props: ConstraintProps<T>,
): props is UnaryConstraintProps<T> {
  return props.arity === unaryConstraintType
}

export function isBinaryConstraintJSON<T extends JSONPrimitives = JSONPrimitives>(
  json: ConstraintJSON<T>,
): json is BinaryConstraintJSON<T> {
  return json.arity === binaryConstraintType
}

export function isBinaryConstraintProps<T extends JSONPrimitives = JSONPrimitives>(
  props: ConstraintProps<T>,
): props is BinaryConstraintProps<T> {
  return props.arity === binaryConstraintType
}

export function constraintFromJSON<T extends JSONPrimitives = JSONPrimitives>(
  name: string,
  json: ConstraintJSON<T>,
): Constraint {
  return isUnaryConstraintJSON<T>(json)
    ? unaryConstraintFromJSON<T>(name, json)
    : binaryConstraintFromJSON<T>(name, json)
}

export function createConstraint<T extends JSONPrimitives = JSONPrimitives>(
  name: string,
  props: ConstraintProps<T>,
): Constraint {
  return isUnaryConstraintProps<T>(props)
    ? createUnaryConstraint<T>(name, props)
    : createBinaryConstraint<T>(name, props)
}

export function getConstraintByName(name: string): Constraint | undefined {
  return BuiltinBaseConstraint.getByName(name)
}

export function getOrCreateConstraint(name: string, props: ConstraintProps): Constraint {
  return BuiltinBaseConstraint.getByName(name) ?? createConstraint(name, props)
}
