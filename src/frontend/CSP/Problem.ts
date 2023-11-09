import type {JSONArray, JSONPrimitives} from "../JSON"
import {createDomain, type Domain} from "./Domain"
import {createVariable, type JSONVariable, type Variable} from "./Variable"
import {type ConstraintJSON, type Constraint, constraintFromJSON} from "./Constraint"

type ProblemJSON = {
  readonly name: string
  readonly domains: {[name: string]: JSONArray}
  readonly variables: {[name: string]: JSONVariable}
  readonly constraints: {[name: string]: ConstraintJSON}
}

type ProblemProps = ProblemJSON

type Problem = {
  readonly name: string
  readonly solutionsSpaceSize: bigint
  toJSON(): ProblemJSON
}

export type Affectation<T extends JSONPrimitives = JSONPrimitives> = {[variable: string]: T}

export class BuiltinProblem implements Problem {
  protected readonly _solutionSpaceSize: bigint

  protected constructor(
    protected readonly _name: string,
    protected readonly _domains: Map<string, Domain>,
    protected readonly _variables: Map<string, Variable>,
    protected readonly _constraints: Map<string, Constraint>,
  ) {
    this._solutionSpaceSize = this.computeSolutionSpaceSize()
  }

  get name() {
    return this._name
  }
  get solutionsSpaceSize() {
    return this._solutionSpaceSize
  }
  get domains() {
    return this._domains
  }
  get variables() {
    return this._variables
  }
  get constraints() {
    return this._constraints
  }

  static bigintRatio(n1: bigint, n2: bigint): [bigint, bigint] | number {
    const res = this.simplifyFraction(n1, n2)
    return res[0] <= Number.MAX_SAFE_INTEGER && res[1] <= Number.MAX_SAFE_INTEGER
      ? Number(res[0]) / Number(res[1])
      : res
  }

  private computeSolutionSpaceSize(): bigint {
    let coef: bigint = 1n
    let size: bigint = 0n
    for (const v of this._variables.values()) {
      size = coef * BigInt(v.domain.getSize())
      coef = size
    }
    return size
  }

  private static pgcd(n1: bigint, n2: bigint): bigint {
    if (n1 === 0n || n2 === 0n) {
      return 1n
    }
    const num = n1 > n2 ? n1 : n2
    const den = n1 <= n2 ? n1 : n2
    const div = num / den
    const res = num % den
    return res === 0n ? div : this.pgcd(div, res)
  }

  private static simplifyFraction(n1: bigint, n2: bigint): [bigint, bigint] {
    let n = n1
    let d = n2
    let pgcd: bigint = this.pgcd(n, d)
    while (pgcd > 1n) {
      n = n / pgcd
      d = d / pgcd
      pgcd = this.pgcd(n, d)
    }
    return [n, d]
  }

  toJSON(): ProblemJSON {
    const domains: {[nom: string]: JSONArray} = {}
    for (const [nom, d] of this._domains.entries()) {
      domains[nom] = d.toJSON()
    }
    const variables: {[nom: string]: JSONVariable} = {}
    for (const [nom, v] of this._variables.entries()) {
      variables[nom] = v.toJSON()
    }
    const constraints: {[nom: string]: ConstraintJSON} = {}
    for (const [nom, c] of this._constraints.entries()) {
      constraints[nom] = c.toJSON()
    }
    return {
      name: this._name,
      domains,
      variables,
      constraints,
    }
  }

  setAffectation(affectation: Affectation) {
    for (const vName in affectation) {
      const v = this._variables.get(vName)
      const value = affectation[vName]
      if (v?.domain.has(value)) {
        v.set(value)
      }
    }
  }

  unsetAffectation(affectation: Affectation) {
    for (const vName in affectation) {
      const v = this._variables.get(vName)
      if (v?.isSet()) {
        v.unset()
      }
    }
  }

  protected static propsToDomains(props: ProblemProps): Map<string, Domain> {
    const domains: Map<string, Domain> = new Map<string, Domain>()
    for (const name in props.domains) {
      domains.set(name, createDomain(name, props.domains[name]))
    }
    return domains
  }

  protected static propsToVariables(props: ProblemProps): Map<string, Variable> {
    const variables: Map<string, Variable> = new Map<string, Variable>()
    for (const name in props.variables) {
      variables.set(name, createVariable(name, props.variables[name]))
    }
    return variables
  }

  protected static propsToConstraints(props: ProblemProps): Map<string, Constraint> {
    const constraints: Map<string, Constraint> = new Map<string, Constraint>()
    for (const name in props.constraints) {
      constraints.set(name, constraintFromJSON(name, props.constraints[name]))
    }
    return constraints
  }

  static fromJSON(json: ProblemJSON): BuiltinProblem {
    return new BuiltinProblem(
      json.name,
      BuiltinProblem.propsToDomains(json),
      BuiltinProblem.propsToVariables(json),
      BuiltinProblem.propsToConstraints(json),
    )
  }
}
