/// <reference lib="dom" />

const ws = new WebSocket(`ws://${location.host}`)
ws.onopen = () => setInterval(() => ws.send("ping"), 5000)
ws.onmessage = (event: MessageEvent) => {
    if (event.data !== "Well received") {
        console.log(event.data)
    }
    if (event.data === "reload") {
        location.reload()
    }
}

const bgColor = "#DDD"
const thinLineColor = "#AAA"
const boldLineColor = "#000"

const canvas = document.getElementById("sudokuCanvas") as HTMLCanvasElement
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
const width = canvas.width
const height = canvas.height
const cellSize = Math.round(Math.min(width, height) / 9)

// Domaines des valeurs possibles pour chaques cellules de la grille
const cellDomains: number[][][] = []
// Eventuelles valeurs choisie par le joueur
const cellValues: (number | null)[][] = []
// Initialisation des deux structure de données précédentes
for (let j = 0; j < 9; j++) {
    cellDomains.push([])
    cellValues.push([])
    for (let i = 0; i < 9; i++) {
        cellDomains[j].push([1, 2, 3, 4, 5, 6, 7, 8, 9])
        cellValues[j].push(null)
    }
}

function clearCanvas() {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)
}

function drawCell(
    i: number,
    j: number,
    cellSize: number,
    borderColor: string,
    fillColor?: string
) {
    const x = i * cellSize
    const y = j * cellSize
    if (fillColor) {
        ctx.fillStyle = fillColor
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2)
    }
    ctx.strokeStyle = borderColor
    ctx.strokeRect(x, y, cellSize, cellSize)
}

function drawGroup(groupI: number, groupJ: number, fillColor?: string) {
    drawCell(groupI, groupJ, cellSize * 3, boldLineColor, fillColor)
    for (let j = 0; j < 3; j++) {
        for (let i = 0; i < 3; i++) {
            drawCell(groupI * 3 + i, groupJ * 3 + j, cellSize, thinLineColor)
        }
    }
}

function drawDomain(i: number, j: number) {
    if (cellValues[j][i] !== null) {
        ctx!.font = "bold 60px Arial"
        ctx!.textBaseline = "middle"
        ctx!.textAlign = "center"
        const x = i * cellSize + Math.floor(cellSize * 0.5)
        const y = j * cellSize + Math.floor(cellSize * 0.575)
        ctx.fillText(cellValues[j][i]!.toString(), x, y)
    } else {
        ctx.fillStyle = "#000"
        ctx.font = "16px Arial"
        ctx.textBaseline = "top"
        ctx.textAlign = "start"
        const domain = cellDomains[j][i]
        // Taille de la zone à l'intérieure de laquelle je veux écrire
        const areaSize = Math.max(cellSize - 2, Math.floor(cellSize * 0.8))
        // Pixels à sauter pour passer d'un texte à l'autre de la même ligne
        const valueStep = Math.floor(areaSize / 3)
        // Taille de l'espace blanc à laisser entre le bord de la cellule et le texte
        const cellPadding = Math.max(1, Math.floor(cellSize * 0.1))
        // Coordonnées en pixel de ma zone de texte
        const x = i * cellSize + cellPadding
        const y = j * cellSize + cellPadding
        for (let k = 1; k <= 9; k++) {
            // k-ième valeur du domaine, ou null si la valeur n'est plus permise
            const vk = domain.includes(k) ? k : null
            // Numéro de colonne de cette k-ième valeur
            const vi = (k - 1) % 3
            // Numéro de ligne de cette k-ième valeur
            const vj = Math.floor((k - 1) / 3)
            // Coordonnées en pixel de la valeur
            const vx = x + valueStep * vi
            const vy = y + valueStep * vj
            // Ecriture de la valeur ou rien si null
            ctx.fillText(vk !== null ? vk.toString() : "", vx, vy)
        }
    }
}

function drawDomains() {

    for (let j = 0; j < 9; j++) {
        for (let i = 0; i < 9; i++) {
            drawDomain(i, j)
        }
    }
}

function drawEmptyGrid() {
    clearCanvas()
    /*for (let j = 0; j < 9; j++) {
        for (let i = 0; i < 9; i++) {
            drawCell(i, j, cellSize, thinLineColor, bgColor)
        }
    }*/
    for (let j = 0; j < 3; j++) {
        for (let i = 0; i < 3; i++) {
            drawGroup(i, j)
        }
    }
}

drawEmptyGrid()
drawDomains()


let selectedCell: [number, number] | null = null

canvas.addEventListener("mousemove", (event: MouseEvent) => {
    event.stopPropagation()
    const x = event.offsetX
    const y = event.offsetY
    const i = Math.min(Math.floor(x / cellSize), 8)
    const j = Math.min(Math.floor(y / cellSize), 8)
    if (selectedCell === null || selectedCell[0] !== i || selectedCell[1] !== j) {
        selectedCell = [i, j]
    }
})

canvas.addEventListener("mouseout", (event: MouseEvent) => {
    event.stopPropagation()
    selectedCell = null
})

window.addEventListener("keyup", toggle);

function addValueToOldPos(key: number, x: number, y: number) {
    for (let j = 0; j < 9; j++) {
        if (j !== x && cellValues[y][j] === key) {
            addValueToLine(key, j)
        }
        if (j !== y && cellValues[j][x] === key) {
            addValueToColumn(key, j)
        }

        if (j !== x && j !== y && cellValues[Math.floor(y / 3) * 3 + Math.floor(j / 3)][Math.floor(x / 3) * 3 + j % 3] === key) {
            addValueToGroup(key, j, j)
        }
    }
}

function toggle(event: KeyboardEvent) {
    event.stopPropagation()

    if (selectedCell === null) {
        return
    }

    const x = selectedCell[0]
    const y = selectedCell[1]

    let key = parseInt(event.key)

    if (isNaN(key) || key < 1 || key > 9) {
        return
    }

    if (cellValues[y][x] === key) {
        cellValues[y][x] = null
        addValueToLine(key, y)
        addValueToColumn(key, x)
        addValueToGroup(key, x, y)
    } else {
        addValueToOldPos(key, x, y)
        removeValueFromLine(key, x, y)
        removeValueFromColumn(key, x, y)
        removeValueFromGroup(key, x, y)
        cellValues[y][x] = key
    }

    drawEmptyGrid()
    drawDomains()

}

function removeValueFromLine(value: number, x: number, y: number) {
    for (let i = 0; i < 9; i++) {
        if (cellValues[y][i] === value) {
            cellValues[y][i] = null;
        }

        if (cellDomains[y][i].includes(value)) {
            cellDomains[y][i].splice(cellDomains[y][i].indexOf(value), 1)
        }

        /*
        if (i !== x) {
            addValueToColumn(value, i)
        }
         */
    }
}

function removeValueFromColumn(value: number, x: number, y: number) {
    for (let j = 0; j < 9; j++) {
        if (cellValues[j][x] === value) {
            cellValues[j][x] = null;
        }

        if (cellDomains[j][x].includes(value)) {
            cellDomains[j][x].splice(cellDomains[j][x].indexOf(value), 1)
        }

        /*
        if (j !== y) {
            addValueToLine(value, j)
        }
         */

    }
}

function removeValueFromGroup(value: number, x: number, y: number) {
    const groupX = Math.floor(x / 3)
    const groupY = Math.floor(y / 3)
    for (let j = 0; j < 3; j++) {
        for (let i = 0; i < 3; i++) {

            if (cellValues[groupY * 3 + j][groupX * 3 + i] === value) {
                cellValues[groupY * 3 + j][groupX * 3 + i] = null;
            }

            if (cellDomains[groupY * 3 + j][groupX * 3 + i].includes(value)) {
                cellDomains[groupY * 3 + j][groupX * 3 + i].splice(cellDomains[groupY * 3 + j][groupX * 3 + i].indexOf(value), 1)
            }

        }
    }
}

function addValueToLine(value: number, y: number) {
    for (let i = 0; i < 9; i++) {
        if (!cellDomains[y][i].includes(value)) {
            cellDomains[y][i].push(value)
        }
    }
}

function addValueToColumn(value: number, x: number) {
    for (let j = 0; j < 9; j++) {
        if (!cellDomains[j][x].includes(value)) {
            cellDomains[j][x].push(value)
        }
    }
}

function addValueToGroup(value: number, x: number, y: number) {
    const groupX = Math.floor(x / 3)
    const groupY = Math.floor(y / 3)
    for (let j = 0; j < 3; j++) {
        for (let i = 0; i < 3; i++) {

            if (!cellDomains[groupY * 3 + j][groupX * 3 + i].includes(value)) {
                cellDomains[groupY * 3 + j][groupX * 3 + i].push(value)
            }

        }
    }
}

console.log("Frontend chargé")
