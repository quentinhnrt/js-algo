import type {JSONPrimitives} from "../JSON"
import {type Affectation, BuiltinProblem} from "./Problem"

export type SolverProps = {
  readonly problem: BuiltinProblem
}

export class Solver<T extends JSONPrimitives = JSONPrimitives> {
  private _workingProblem?: BuiltinProblem
  private _solving: boolean = false

  private constructor(private readonly _initialProblem: BuiltinProblem) {}

  get solving() {
    return this._solving
  }

  private copyProblem(pb: BuiltinProblem): BuiltinProblem {
    const json = pb.toJSON()
    return BuiltinProblem.fromJSON(json)
  }

  private *_gtAffectation(): Generator<Affectation<T>> {
    const variableNames: string[] = []
    for (const vName of this._workingProblem!.variables.keys()) {
      variableNames.push(vName)
    }
    const state: [string, number, T[]][] = []
    for (const vName of variableNames) {
      const v = this._workingProblem!.variables.get(vName)!
      const domainValues = v.domain.toJSON() as T[]
      if (domainValues.length === 0) {
        return
      }
      state.push([vName, 0, domainValues])
    }
    const maxIdxSum = state.reduce((acc: number, [_, __, values]) => acc + values.length, 0)
    let idxSum = 0
    while (idxSum < maxIdxSum && this._solving) {
      const affectation: Affectation<T> = {}
      for (const [vName, idx, values] of state) {
        affectation[vName] = values[idx]
      }
      yield affectation
      idxSum = 0
      for (let i = state.length - 1; i >= 0; i--) {
        const [_, idx, values] = state[i]
        if (idx < values.length - 1) {
          state[i][1]++
          idxSum += state[i][1]
          break
        } else {
          state[i][1] = 0
        }
      }
    }
  }

  *gt(
    onlyFirstSolution: boolean = true,
    returnInconsistentAffectations: boolean = false,
  ): Generator<[Affectation<T>, boolean]> {
    this._solving = true
    this._workingProblem = this.copyProblem(this._initialProblem)
    for (const affectation of this._gtAffectation()) {
      if (!this._solving) {
        return
      }
      const consistent = this._gtIsConsistent(affectation)
      if (consistent || returnInconsistentAffectations) {
        yield [affectation, consistent]
      }
      if (consistent && onlyFirstSolution) {
        return
      }
    }
  }

  private _gtIsConsistent(affectation: Affectation<T>): boolean {
    if (!this._workingProblem) {
      return false
    }
    this._workingProblem.setAffectation(affectation)
    for (const c of this._workingProblem.constraints.values()) {
      if (!c.checkConsistency()) {
        return false
      }
    }
    this._workingProblem.unsetAffectation(affectation)
    return true
  }

  stop() {
    this._solving = false
  }

  static create(props: SolverProps): Solver {
    return new Solver(props.problem)
  }
}
