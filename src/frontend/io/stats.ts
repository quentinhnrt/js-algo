import type {App} from "../App"
import {BuiltinProblem} from "../CSP"

export type StatsDisplayProps = {
  readonly app: App
  readonly solutionSpaceSizeP: HTMLParagraphElement
  readonly testedSolutionsP: HTMLParagraphElement
  readonly prunedSolutionsP: HTMLParagraphElement
  readonly progressP: HTMLParagraphElement
  readonly timeleftP: HTMLParagraphElement
}

export class StatsDisplay {
  private constructor(
    private readonly _app: App,
    private readonly _solutionSpaceSizeP: HTMLParagraphElement,
    private readonly _testedSolutionsP: HTMLParagraphElement,
    private readonly _prunedSolutionsP: HTMLParagraphElement,
    private readonly _progressP: HTMLParagraphElement,
    private readonly _timeleftP: HTMLParagraphElement,
  ) {}

  display() {
    const spaceSize = this._app.solutionSpaceSize
    if (typeof spaceSize === "undefined") {
      return
    }
    this._solutionSpaceSizeP.innerText = `${spaceSize} solutions possibles.`
    const {start, tested, pruned} = this._app.stats
    this._testedSolutionsP.innerText = `${tested} solutions testées.`
    this._prunedSolutionsP.innerText = `${pruned} solutions élaguées.`
    /*const ratio = BuiltinProblem.bigintRatio(tested + pruned, spaceSize)
    this._progressP.innerText = `${
      typeof ratio === "number"
        ? `${Math.round(ratio * 10000) / 100}%`
        : `${ratio[0]} / ${ratio[1]}`
    } de l'espace de solutions exploré.`*/
  }

  static create(props: StatsDisplayProps): StatsDisplay {
    return new StatsDisplay(
      props.app,
      props.solutionSpaceSizeP,
      props.testedSolutionsP,
      props.prunedSolutionsP,
      props.progressP,
      props.timeleftP,
    )
  }
}
