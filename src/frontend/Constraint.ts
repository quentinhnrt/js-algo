import {JSONPrimitives} from "./JSON.ts";

type ConstraintCallback = (...params) => boolean
type CallbackParams = JSONPrimitives[]
export default class Constraint {
    constructor(private readonly callback: ConstraintCallback) {}

    check(params: CallbackParams): boolean {
        return this.callback(...params)
    }
}