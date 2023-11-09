import type {SudokuDomain, SudokuValues} from "../SudokuTypes"

export class SudokuUI {
  private static readonly _uis: WeakMap<HTMLCanvasElement, SudokuUI> = new WeakMap()
  static bgColor = "#DDD"
  static thinLineColor = "#AAA"
  static boldLineColor = "#000"
  static impactedColor = "#eec"
  static selectedColor = "#ff6"

  static get(canvas: HTMLCanvasElement): SudokuUI | false {
    if (SudokuUI._uis.has(canvas)) {
      return SudokuUI._uis.get(canvas)!
    }
    const ctx = canvas.getContext("2d")
    if (ctx === null) {
      return false
    }
    const ui = new SudokuUI(canvas, ctx)
    SudokuUI._uis.set(canvas, ui)
    return ui
  }

  private readonly _cellSize: number

  private constructor(
    private readonly _canvas: HTMLCanvasElement,
    private readonly _ctx: CanvasRenderingContext2D,
  ) {
    this._cellSize = Math.round(Math.min(_canvas.width, _canvas.height) / 9)
  }

  get width() {
    return this._canvas.width
  }
  get height() {
    return this._canvas.height
  }
  get cellSize() {
    return this._cellSize
  }

  clearCanvas(): SudokuUI {
    this._ctx.fillStyle = SudokuUI.bgColor
    this._ctx.fillRect(0, 0, this.width, this.height)
    return this
  }

  drawCell(
    i: number,
    j: number,
    cellSize: number = this._cellSize,
    borderColor: string = SudokuUI.thinLineColor,
    fillColor?: string,
  ): SudokuUI {
    const x = i * cellSize
    const y = j * cellSize
    if (fillColor) {
      this._ctx.fillStyle = fillColor
      this._ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2)
    }
    this._ctx.strokeStyle = borderColor
    this._ctx.strokeRect(x, y, cellSize, cellSize)
    return this
  }

  drawRow(j: number, fillColor?: string): SudokuUI {
    for (let i = 0; i < 9; i++) {
      this.drawCell(i, j, this._cellSize, SudokuUI.thinLineColor, fillColor)
    }
    return this
  }

  drawColumn(i: number, fillColor?: string): SudokuUI {
    for (let j = 0; j < 9; j++) {
      this.drawCell(i, j, this._cellSize, SudokuUI.thinLineColor, fillColor)
    }
    return this
  }

  drawGroup(groupI: number, groupJ: number, fillColor?: string): SudokuUI {
    this.drawCell(groupI, groupJ, this._cellSize * 3, SudokuUI.boldLineColor, fillColor)
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 3; i++) {
        this.drawCell(groupI * 3 + i, groupJ * 3 + j, this._cellSize, SudokuUI.thinLineColor)
      }
    }
    return this
  }

  drawCellValue(i: number, j: number, value: SudokuValues): SudokuUI {
    this._ctx.fillStyle = "#000"
    this._ctx.font = "bold 60px Arial"
    this._ctx.textBaseline = "middle"
    this._ctx.textAlign = "center"
    const x = i * this._cellSize + Math.floor(this._cellSize * 0.5)
    const y = j * this._cellSize + Math.floor(this._cellSize * 0.575)
    this._ctx.fillText(value.toString(), x, y)
    return this
  }

  drawCellDomain(i: number, j: number, domain: SudokuDomain): SudokuUI {
    this._ctx.fillStyle = "#000"
    this._ctx.font = "16px Arial"
    this._ctx.textBaseline = "top"
    this._ctx.textAlign = "start"
    const areaSize = Math.max(this._cellSize - 2, Math.floor(this._cellSize * 0.8))
    const valueStep = Math.floor(areaSize / 3)
    const cellPadding = Math.max(1, Math.floor(this._cellSize * 0.1))
    const x = i * this._cellSize + cellPadding
    const y = j * this._cellSize + cellPadding
    for (let k = 1; k <= 9; k++) {
      const vk = domain.has(k as SudokuValues) ? k : null
      const vi = (k - 1) % 3
      const vj = Math.floor((k - 1) / 3)
      const vx = x + valueStep * vi
      const vy = y + valueStep * vj
      this._ctx.fillText(vk !== null ? vk.toString() : "", vx, vy)
    }
    return this
  }

  drawEmptyGrid(): SudokuUI {
    this.clearCanvas()
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 3; i++) {
        this.drawGroup(i, j)
      }
    }
    return this
  }

  colorizeSelectedStuff(selectedCell: [number, number] | null): SudokuUI {
    if (selectedCell === null) {
      return this
    }
    const selectedGroup = [Math.floor(selectedCell[0] / 3), Math.floor(selectedCell[1] / 3)]
    this.drawRow(selectedCell[1], SudokuUI.impactedColor)
      .drawColumn(selectedCell[0], SudokuUI.impactedColor)
      .drawGroup(selectedGroup[0], selectedGroup[1], SudokuUI.impactedColor)
      .drawCell(
        selectedCell[0],
        selectedCell[1],
        this._cellSize,
        SudokuUI.thinLineColor,
        SudokuUI.selectedColor,
      )
    return this
  }
}
