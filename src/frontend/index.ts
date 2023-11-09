/// <reference lib="dom" />

import { wsInit, SudokuUI, eventHandlersInit } from "./io"
import type { SudokuDomain, SudokuValues, SudokuCell } from "./SudokuTypes"
import { DomainImpl } from "./Domain"
import { Variable, VariableImpl } from "./Variable"

type InitialState = {
	readonly canvas: HTMLCanvasElement
	readonly ui: SudokuUI
	readonly cellValues: SudokuCell[][]
}

function init(canvasId: string): InitialState | false {
	const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
	if (canvas === null) {
		console.error("Cannot get the given Canvas 2D rendering context")
		return false
	}
	const ui = SudokuUI.get(canvas)
	if (!ui) {
		return false
	}
	const cellValues: SudokuCell[][] = []
	const sudokuDomain = new DomainImpl<SudokuValues>([1, 2, 3, 4, 5, 6, 7, 8, 9])
	for (let j = 0; j < 9; j++) {
		cellValues.push([])
		for (let i = 0; i < 9; i++) {
			cellValues[j].push(new VariableImpl<SudokuValues>(sudokuDomain.copy()))
		}
	}
	return { canvas, ui, cellValues }
}

function start(initialState: InitialState) {
	const {canvas, ui, cellValues} = initialState
	let selectedCell: [number, number] | null = null

	function drawCellContent(i: number, j: number) {
		if (cellValues[j][i].isSet()) {
			ui.drawCellValue(i, j, cellValues[j][i].value!)
		} else {
			ui.drawCellDomain(i, j, cellValues[j][i].domain)
		}
	}

	function drawCellsContent() {
		for (let j = 0; j < 9; j++) {
			for (let i = 0; i < 9; i++) {
				drawCellContent(i, j)
			}
		}
	}

	function removeValueFromCellDomain(i: number, j: number, v: SudokuValues) {
		cellValues[j][i].domain.del(v)
	}

	function addValueToCellDomain(i: number, j: number, v: SudokuValues) {
		cellValues[j][i].domain.add(v)
	}

	function maintainImpactedCellsDomain(
		i: number,
		j: number,
		v: SudokuValues,
		remove: boolean
	) {
		const action = remove ? removeValueFromCellDomain : addValueToCellDomain
		for (let k = 0; k < 9; k++) {
			if (k !== i) {
				action(k, j, v)
			}
			if (k !== j) {
				action(i, k, v)
			}
		}
		const iGroup = Math.floor(i / 3)
		const jGroup = Math.floor(j / 3)
		for (let j2 = 0; j2 < 3 ; j2++) {
			for (let i2 = 0; i2 < 3; i2++) {
				const iCell = iGroup * 3 + i2
				const jCell = jGroup * 3 + j2
				if (iCell !== i && jCell !== j) {
					action(iCell, jCell, v)
				}
			}
		}
	}

	function toggle(v: SudokuValues) {
		const i = selectedCell![0]
		const j = selectedCell![1]
		if (!cellValues[j][i].isSet()) {
			if (cellValues[j][i].domain.has(v)) {
				cellValues[j][i].set(v)
				maintainImpactedCellsDomain(i, j, v, true)
				refreshGrid()
			}
		} else if (cellValues[j][i].value === v) {
			cellValues[j][i].unset()
			maintainImpactedCellsDomain(i, j, v, false)
			for (let j2 = 0; j2 < 9; j2++) {
				for (let i2 = 0; i2 < 9; i2++) {
					if (cellValues[j2][i2].value === v) {
						maintainImpactedCellsDomain(i2, j2, v, true)
					}
				}
			}
			refreshGrid()
		}
	}

	function refreshGrid() {
		ui.drawEmptyGrid()
			.colorizeSelectedStuff(selectedCell)
		drawCellsContent()
	}

	eventHandlersInit({	canvas,	ui,	refreshGrid, toggle,
		getSelectedCell: () => selectedCell,
		setSelectedCell: (newCell: [number, number] | null) => selectedCell = newCell,
	})
	wsInit()
	refreshGrid()
}

const retInit = init("sudokuCanvas")
if (retInit) {
	start(retInit)
}
