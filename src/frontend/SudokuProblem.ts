import {
  type Domain,
  type Variable,
  type Constraint,
  BuiltinProblem,
  createDomain,
  createVariable,
  createConstraint,
  type ConstraintProps,
} from "./CSP"
import type {SudokuValues} from "./SudokuTypes"
import type {SudokuUI} from "./io"

export type SudokuProblemProps = {
  readonly name: string
  readonly ui: SudokuUI
}

export class SudokuProblem extends BuiltinProblem {
  static readonly baseCellDomain = createDomain<SudokuValues>(
    "baseCellDomain",
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
  )
  static readonly mustBeDifferent = (v1: SudokuValues, v2: SudokuValues) => v1 !== v2

  private constructor(
    name: string,
    domains: Map<string, Domain>,
    variables: Map<string, Variable>,
    constraints: Map<string, Constraint>,
    private readonly _ui: SudokuUI,
  ) {
    super(name, domains, variables, constraints)
  }

  private static prepareDomains(): [Map<string, Domain<SudokuValues>>, string[][]] {
    5
    const domains = new Map<string, Domain<SudokuValues>>()
    const domainNames: string[][] = []
    for (let j = 0; j < 9; j++) {
      const names: string[] = []
      for (let i = 0; i < 9; i++) {
        const dName = `d:${i}x${j}`
        const domain = SudokuProblem.baseCellDomain.copy(dName)
        domains.set(dName, domain)
        names.push(dName)
      }
      domainNames.push(names)
    }
    return [domains, domainNames]
  }

  private static vName(i: number, j: number): string {
    return `cell${i}x${j}`
  }

  private static prepareVariables(domainNames: string[][]): [Map<string, Variable>, string[][]] {
    const variableNames: string[][] = []
    const variables = new Map<string, Variable>()
    for (let j = 0; j < 9; j++) {
      const names: string[] = []
      for (let i = 0; i < 9; i++) {
        const domainName = domainNames[j][i]
        const cellName = SudokuProblem.vName(i, j)
        const variable = createVariable<SudokuValues>(cellName, {domain: domainName})
        variables.set(cellName, variable)
        names.push(cellName)
      }
      variableNames.push(names)
    }
    return [variables, variableNames]
  }

  private static rule(v1Name: string, v2Name: string): ConstraintProps<SudokuValues> {
    return {
      type: "intension",
      arity: 2,
      variables: [v1Name, v2Name],
      valuesConsistency: SudokuProblem.mustBeDifferent,
    }
  }

  private static prepareConstraints(variablesNames: string[][]): Map<string, Constraint> {
    const constraints = new Map<string, Constraint>()
    /**
     * Crée les contraintes des lignes horizontales et verticales
     */
    for (let j = 0; j < 9; j++) {
      for (let i1 = 0; i1 < 9; i1++) {
        for (let i2 = i1 + 1; i2 < 9; i2++) {
          let cName = `c:${i1}x${j}->${i2}x${j}`
          let rule = SudokuProblem.rule(variablesNames[j][i1], variablesNames[j][i2])
          let constraint = createConstraint(cName, rule)
          constraints.set(cName, constraint)
          cName = `c:${j}x${i1}->${j}x${i2}`
          rule = SudokuProblem.rule(variablesNames[i1][j], variablesNames[i2][j])
          constraint = createConstraint(cName, rule)
          constraints.set(cName, constraint)
        }
      }
    }
    /**
     * Crée les contraintes des groupes
     */
    for (let grp = 0; grp < 9; grp++) {
      const grpi = grp % 3
      const grpj = ((grp - grpi) / 3) % 3
      for (let j = 0; j < 9; j++) {
        const d1i = j % 3
        const v1i = grpi + d1i
        const d1j = ((j - d1i) / 3) % 3
        const v1j = grpj + d1j
        for (let i = j; i < 9; i++) {
          const d2i = i % 3
          const v2i = grpi + d2i
          const d2j = ((i - d2i) / 3) % 3
          const v2j = grpj + d2j
          const cName = `c:${v1i}x${v1j}->${v2i}x${v2j}`
          const rule = SudokuProblem.rule(variablesNames[v1j][v1i], variablesNames[v2j][v2i])
          const constraint = createConstraint(cName, rule)
          constraints.set(cName, constraint)
        }
      }
    }
    return constraints
  }

  static create(props: SudokuProblemProps): SudokuProblem {
    const [domains, domainNames] = SudokuProblem.prepareDomains()
    const [variables, variablesNames] = SudokuProblem.prepareVariables(domainNames)
    const constraints = SudokuProblem.prepareConstraints(variablesNames)
    return new SudokuProblem(props.name, domains, variables, constraints, props.ui)
  }

  private _getVariable(i: number, j: number): Variable<SudokuValues> | undefined {
    const vName = SudokuProblem.vName(i, j)
    return this._variables.get(vName) as Variable<SudokuValues> | undefined
  }

  private _drawCellContent(i: number, j: number) {
    const variable = this._getVariable(i, j)
    if (variable) {
      if (variable.isSet()) {
        this._ui.drawCellValue(i, j, variable.value!)
      } else {
        this._ui.drawCellDomain(i, j, variable.domain)
      }
    }
  }

  cellIsSet(i: number, j: number): boolean {
    return this._getVariable(i, j)?.isSet() ?? false
  }

  domainHas(i: number, j: number, v: SudokuValues): boolean {
    return this._getVariable(i, j)?.domain.has(v) ?? false
  }

  drawCellsContent() {
    for (let j = 0; j < 9; j++) {
      for (let i = 0; i < 9; i++) {
        this._drawCellContent(i, j)
      }
    }
  }

  setCellValue(i: number, j: number, v: SudokuValues) {
    this._getVariable(i, j)?.set(v)
  }

  unsetCellValue(i: number, j: number) {
    this._getVariable(i, j)?.unset()
  }

  getCellValue(i: number, j: number): SudokuValues | undefined {
    return this._getVariable(i, j)?.value
  }

  private _removeValue(i: number, j: number, v: SudokuValues) {
    this._getVariable(i, j)?.domain.del(v)
  }

  private _addValue(i: number, j: number, v: SudokuValues) {
    this._getVariable(i, j)?.domain.add(v)
  }

  maintainImpactedCellsDomain(i: number, j: number, v: SudokuValues, remove: boolean) {
    const action = remove ? this._removeValue.bind(this) : this._addValue.bind(this)
    for (let k = 0; k < 9; k++) {
      if (k !== i) {
        action && action(k, j, v)
      }
      if (k !== j) {
        action && action(i, k, v)
      }
    }
    const iGroup = Math.floor(i / 3)
    const jGroup = Math.floor(j / 3)
    for (let j2 = 0; j2 < 3; j2++) {
      for (let i2 = 0; i2 < 3; i2++) {
        const iCell = iGroup * 3 + i2
        const jCell = jGroup * 3 + j2
        if (iCell !== i && jCell !== j) {
          action && action(iCell, jCell, v)
        }
      }
    }
  }
}
