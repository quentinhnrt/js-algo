export type AppElementsIds = {
  readonly canvasId: string
  readonly solutionSpaceSizePId: string
  readonly resetBtnId: string
  readonly gtBtnId: string
  readonly btBtnId: string
  readonly ncCheckboxId: string
  readonly acNoneRadioId: string
  readonly ac1RadioId: string
  readonly ac3RadioId: string
  readonly testedSolutionsPId: string
  readonly prunedSolutionsPId: string
  readonly progressPId: string
  readonly timeleftPId: string
}

export type AppElements = {
  readonly canvas: HTMLCanvasElement
  readonly solutionSpaceSizeP: HTMLParagraphElement
  readonly resetBtn: HTMLButtonElement
  readonly gtBtn: HTMLButtonElement
  readonly btBtn: HTMLButtonElement
  readonly ncCheckbox: HTMLInputElement
  readonly acNoneRadio: HTMLInputElement
  readonly ac1Radio: HTMLInputElement
  readonly ac3Radio: HTMLInputElement
  readonly testedSolutionsP: HTMLParagraphElement
  readonly prunedSolutionsP: HTMLParagraphElement
  readonly progressP: HTMLParagraphElement
  readonly timeleftP: HTMLParagraphElement
}

export function getElements(...ids: string[]): HTMLElement[] | null {
  const elements: HTMLElement[] = []
  for (const id of ids) {
    const element = document.getElementById(id)
    if (element === null) {
      console.error(`Cannot get any HTML Element given the "${id}" id`)
      return null
    }
    elements.push(element)
  }
  return elements
}

export function getAppElements(ids: AppElementsIds): AppElements | null {
  const elts = getElements(
    ids.canvasId,
    ids.solutionSpaceSizePId,
    ids.resetBtnId,
    ids.gtBtnId,
    ids.btBtnId,
    ids.ncCheckboxId,
    ids.acNoneRadioId,
    ids.ac1RadioId,
    ids.ac3RadioId,
    ids.testedSolutionsPId,
    ids.prunedSolutionsPId,
    ids.progressPId,
    ids.timeleftPId,
  )
  if (elts === null) {
    return null
  }
  return {
    canvas: elts[0] as HTMLCanvasElement,
    solutionSpaceSizeP: elts[1] as HTMLParagraphElement,
    resetBtn: elts[2] as HTMLButtonElement,
    gtBtn: elts[3] as HTMLButtonElement,
    btBtn: elts[4] as HTMLButtonElement,
    ncCheckbox: elts[5] as HTMLInputElement,
    acNoneRadio: elts[6] as HTMLInputElement,
    ac1Radio: elts[7] as HTMLInputElement,
    ac3Radio: elts[8] as HTMLInputElement,
    testedSolutionsP: elts[9] as HTMLParagraphElement,
    prunedSolutionsP: elts[10] as HTMLParagraphElement,
    progressP: elts[11] as HTMLParagraphElement,
    timeleftP: elts[12] as HTMLParagraphElement,
  }
}
