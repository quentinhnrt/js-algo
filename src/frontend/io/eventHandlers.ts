import type {AppElements} from "./htmlElements"
import type {SudokuUI} from "./ui"
import type {SudokuValues} from "../SudokuTypes"
import type {App} from "../App"

type EventHandlersParams = {
  readonly app: App
  readonly elements: AppElements
  readonly ui: SudokuUI
  readonly refreshGrid: () => void
  readonly getSelectedCell: () => [number, number] | null
  readonly setSelectedCell: (newCell: [number, number] | null) => void
  readonly toggle: (v: SudokuValues) => void
}

export function eventHandlersInit(params: EventHandlersParams) {
  params.elements.canvas.onmousemove = (event: MouseEvent) => {
    event.stopPropagation()
    const x = event.offsetX
    const y = event.offsetY
    const i = Math.min(Math.floor(x / params.ui.cellSize), 8)
    const j = Math.min(Math.floor(y / params.ui.cellSize), 8)
    const selectedCell = params.getSelectedCell()
    if (selectedCell === null || selectedCell[0] !== i || selectedCell[1] !== j) {
      params.setSelectedCell([i, j])
      params.refreshGrid()
    }
  }
  params.elements.canvas.onmouseout = (event: MouseEvent) => {
    event.stopPropagation()
    if (params.getSelectedCell() !== null) {
      params.setSelectedCell(null)
      params.refreshGrid()
    }
  }
  document.onkeyup = (event: KeyboardEvent) => {
    event.stopPropagation()
    if (event.key >= "1" && event.key <= "9" && params.getSelectedCell() !== null) {
      const value: number = parseInt(event.key)
      if (value % 1 === 0) {
        params.toggle(value as SudokuValues)
      }
    }
  }
  params.elements.resetBtn.onclick = (evt: MouseEvent) => {
    params.app.reset()
  }
  params.elements.gtBtn.onclick = (evt: MouseEvent) => {
    params.app.reset()
    params.app.launchGTSolve()
  }
}

export function eventHandlerClear(elements: AppElements) {
  elements.canvas.onmousemove = null
  elements.canvas.onmouseout = null
  document.onkeyup = null
}
