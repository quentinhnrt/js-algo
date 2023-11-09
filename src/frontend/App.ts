import {
  SudokuUI,
  eventHandlersInit,
  eventHandlerClear,
  type AppElementsIds,
  getAppElements,
  AppElements,
  StatsDisplay,
} from "./io"
import type {SudokuValues} from "./SudokuTypes"
import {SudokuProblem} from "./SudokuProblem"
import {Solver, Affectation} from "./CSP"

export type AppProps = AppElementsIds

export class App {
  selectedCell: [number, number] | null = null
  private _problem?: SudokuProblem
  private _statsDisplay?: StatsDisplay
  private _solver?: Solver
  private _iterationsMin: number = 0
  private _iterationsMax: number = 0
  private _lastTime: number = 0
  private _startTime: number = 0
  private _minDt: number = Number.MAX_SAFE_INTEGER
  private _handleRefreshStats: Timer | null = null
  private _solverSteps?: (iterationsToPerform: number) => void
  private _testedSolutions: bigint = 0n
  private _prunedSolutions: bigint = 0n
  private _gtIterator: Generator<[Affectation<SudokuValues>, boolean]> | null = null

  private constructor(private readonly _ui: SudokuUI, private readonly _elements: AppElements) {}

  get solutionSpaceSize(): bigint | undefined {
    return this._problem?.solutionsSpaceSize
  }
  get stats() {
    return {
      start: this._startTime,
      tested: this._testedSolutions,
      pruned: this._prunedSolutions,
    }
  }

  private _refreshGrid() {
    this._ui.drawEmptyGrid().colorizeSelectedStuff(this.selectedCell)
    this._problem?.drawCellsContent()
  }

  private _toggle(v: SudokuValues) {
    if (!this._problem) {
      return
    }
    const [i, j] = this.selectedCell!
    if (!this._problem.cellIsSet(i, j)) {
      if (this._problem?.domainHas(i, j, v) ?? false) {
        this._problem?.setCellValue(i, j, v)
        this._problem?.maintainImpactedCellsDomain(i, j, v, true)
        this._refreshGrid()
      }
    } else if (this._problem?.getCellValue(i, j) === v) {
      this._problem?.unsetCellValue(i, j)
      this._problem?.maintainImpactedCellsDomain(i, j, v, false)
      for (let j2 = 0; j2 < 9; j2++) {
        for (let i2 = 0; i2 < 9; i2++) {
          if (this._problem?.getCellValue(i2, j2) === v) {
            this._problem?.maintainImpactedCellsDomain(i2, j2, v, true)
          }
        }
      }
      this._refreshGrid()
    }
  }

  start() {
    eventHandlersInit({
      app: this,
      elements: this._elements,
      ui: this._ui,
      refreshGrid: this._refreshGrid.bind(this),
      toggle: this._toggle.bind(this),
      getSelectedCell: () => this.selectedCell,
      setSelectedCell: (newCell: [number, number] | null) => (this.selectedCell = newCell),
    })
    this._problem = SudokuProblem.create({
      name: `sudoku-${Date.now()}`,
      ui: this._ui,
    })
    //console.log(this._problem.toJSON())
    this._refreshGrid()
    if (!this._solver) {
      this._solver = Solver.create({
        problem: this._problem!,
      })
    }
    if (typeof this._statsDisplay === "undefined") {
      this._statsDisplay = StatsDisplay.create({
        app: this,
        solutionSpaceSizeP: this._elements.solutionSpaceSizeP,
        testedSolutionsP: this._elements.testedSolutionsP,
        prunedSolutionsP: this._elements.prunedSolutionsP,
        progressP: this._elements.progressP,
        timeleftP: this._elements.timeleftP,
      })
    }
    this._statsDisplay.display()
  }

  stop() {
    this._solver?.stop()
    this._gtIterator = null
    this._lastTime = 0
    this._solverSteps = undefined
    eventHandlerClear(this._elements)
    this._elements.ncCheckbox.checked = false
    this._elements.acNoneRadio.checked = true
    if (this._handleRefreshStats !== null) {
      clearInterval(this._handleRefreshStats)
      this._handleRefreshStats = null
    }
  }

  reset() {
    this.stop()
    this.start()
  }

  private _computeSolvingIterations(t: number): number {
    const dt = t - this._lastTime
    if (dt * 0.9 <= this._minDt / 2) {
      this._iterationsMax *= 2
      this._iterationsMin *= 2
    } else if (dt * 0.9 <= this._minDt) {
      this._iterationsMin = Math.floor(this._iterationsMin * 1.5)
      this._iterationsMax = Math.max(this._iterationsMin + 1, this._iterationsMax)
    } else if (dt * 1.1 >= this._minDt * 2) {
      this._iterationsMin = Math.max(Math.floor(this._iterationsMin / 2), 1)
      this._iterationsMax = Math.max(Math.floor(this._iterationsMax / 2), 2)
    } else if (dt * 1.1 >= this._minDt) {
      this._iterationsMax = Math.ceil(this._iterationsMax * 0.67)
      this._iterationsMin = Math.min(this._iterationsMax - 1, this._iterationsMin)
    }
    this._minDt = Math.min(this._minDt, dt)
    this._lastTime = t
    return Math.max(Math.floor((this._iterationsMax + this._iterationsMin) / 2), 1)
  }

  launchGTSolve() {
    if (!this._solver || this._solver.solving || !this._problem) {
      return
    }
    this._startTime = Date.now()
    this._testedSolutions = 0n
    this._prunedSolutions = 0n
    this._minDt = Number.MAX_SAFE_INTEGER
    this._iterationsMin = 1
    this._iterationsMax = 1000
    if (this._handleRefreshStats === null) {
      this._handleRefreshStats = setInterval(() => {
        this._statsDisplay?.display()
      }, 500)
    }
    this._solverSteps = (iterationsToPerform: number) => {
      let affectation: Affectation<SudokuValues> | null = null
      for (let i = 0; i < iterationsToPerform; i++) {
        const [a, consistent] = this._gtIterator!.next().value
        affectation = a
        this._testedSolutions++
        if (consistent) {
          this._gtIterator = null
          break
        }
      }
      if (affectation) {
        this._problem!.setAffectation(affectation)
      }
    }
    if (this._gtIterator === null) {
      this._gtIterator = this._solver.gt(true, true) as Generator<
        [Affectation<SudokuValues>, boolean]
      >
    }
    this._animateSolve(1000)
  }

  private _animateSolve(t: number) {
    if (this._solverSteps) {
      this._solverSteps(this._computeSolvingIterations(t))
      this._refreshGrid()
      if (this._solver?.solving) {
        requestAnimationFrame(this._animateSolve.bind(this))
      }
    }
  }

  static create(props: AppProps): App | null {
    const elements = getAppElements(props)
    if (elements === null) {
      return null
    }
    const ui = SudokuUI.get(elements.canvas)
    if (!ui) {
      return null
    }
    return new App(ui, elements)
  }
}
