/// <reference lib="dom" />

import { wsInit, SudokuUI, eventHandlersInit } from "./io"
import {Domain} from "./solver/domain.ts";
import {Variable} from "./solver/variable.ts";


type InitialState = {
	readonly canvas: HTMLCanvasElement
	readonly ui: SudokuUI
	readonly cellDomains: Array<Array<Domain<number>>>
	readonly cellValues: (number | null)[][]
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
	const cellDomains: Array<Array<Domain<Variable<number>>>> = []
	const cellValues: (number | null)[][] = []
	for (let j = 0; j < 9; j++) {
		cellDomains.push([])
		cellValues.push([])
		for (let i = 0; i < 9; i++) {
			let variables = []

			for (let k = 1; k <= 9; k++) {
				let variable = new Variable();
				variable.set(k)
				variables.push(variable)
			}

			let domain = new Domain<Variable<number>>(variables)
			cellDomains[j].push(domain)
			cellValues[j].push(null)
		}
	}
	return { canvas, ui, cellDomains, cellValues }
}

function start(initialState: InitialState) {
	const {canvas, ui, cellDomains, cellValues} = initialState
	let selectedCell: [number, number] | null = null


	function drawCellContent(i: number, j: number) {
		if (cellValues[j][i] !== null) {
			ui.drawCellValue(i, j, cellValues[j][i]!)
		} else {
			ui.drawCellDomain(i, j, cellDomains[j][i])
		}
	}

	function drawCellsContent() {
		for (let j = 0; j < 9; j++) {
			for (let i = 0; i < 9; i++) {
				drawCellContent(i, j)
			}
		}
	}

	function removeValueFromCellDomain(i: number, j: number, v: number) {
		const domain = cellDomains[j][i]
		domain.remove(v)
	}

	function addValueToCellDomain(i: number, j: number, v: number) {
		const domain = cellDomains[j][i]
		domain.add(v)
	}

	function maintainImpactedCellsDomain(
		i: number,
		j: number,
		v: number,
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

	function toggle(v: number) {
		const i = selectedCell![0]
		const j = selectedCell![1]
		if (cellValues[j][i] === null) {
			if (cellDomains[j][i].contains(v)) {
				cellValues[j][i] = v
				maintainImpactedCellsDomain(i, j, v, true)
				refreshGrid()
			}
		} else if (cellValues[j][i] === v) {
			cellValues[j][i] = null
			maintainImpactedCellsDomain(i, j, v, false)
			for (let j2 = 0; j2 < 9; j2++) {
				for (let i2 = 0; i2 < 9; i2++) {
					if (cellValues[j2][i2] === v) {
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

	document.getElementById("debugButton").addEventListener("click", (e) => {
		e.stopPropagation()
		e.preventDefault()

		console.log(cellDomains[0][0].toJSON())
	})
}

const retInit = init("sudokuCanvas")
if (retInit) {
	start(retInit)
}
