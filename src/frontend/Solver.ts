import Constraint from "./Constraint.ts";
import {Variable} from "./Variable.ts";

export default class Solver {
    constructor(
        private readonly constraints: Constraint[],
        private readonly variables: Variable<T>[]

    ) {
    }
}