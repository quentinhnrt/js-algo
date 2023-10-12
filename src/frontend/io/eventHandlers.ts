import type { SudokuUI } from "./ui"

type EventHandlersParams = {
	readonly canvas: HTMLCanvasElement
	readonly ui: SudokuUI
	readonly refreshGrid: () => void
	readonly getSelectedCell: () => [number, number] | null
	readonly setSelectedCell: (newCell: [number, number] | null) => void
	readonly toggle: (v: number) => void
}

export function eventHandlersInit(params: EventHandlersParams) {
	function canvasMouseMove(event: MouseEvent) {
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
	
	function canvasMouseOut (event: MouseEvent) {
		event.stopPropagation()
		if (params.getSelectedCell() !== null) {
			params.setSelectedCell(null)
			params.refreshGrid()
		}
	}
	
	function keyUp (event: KeyboardEvent) {
		event.stopPropagation()
		if (event.key >= "1" && event.key <= "9" && params.getSelectedCell() !== null) {
			params.toggle(parseInt(event.key))
		}
	}

	params.canvas.addEventListener("mousemove", canvasMouseMove)
	params.canvas.addEventListener("mouseout", canvasMouseOut)
	document.onkeyup = keyUp
}