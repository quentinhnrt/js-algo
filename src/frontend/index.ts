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
const cellValues: (number | null)[][][] = []
// Initialisation des deux structure de données précédentes
for (let j = 0; j < 9; j++) {
    cellDomains.push([])
    cellValues.push([])
    for (let i = 0; i < 9; i++) {
        cellDomains[j].push([1, 2, 3, 4, 5, 6, 7, 8, 9])
        cellValues[j].push([1, 2, 3, 4, 5, 6, 7, 8, 9])
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
    ctx.fillStyle = "#000"
    ctx.font = "16px Arial"
    ctx.textBaseline = "top"
    ctx.textAlign = "start"
    // Taille de la zone à l'intérieure de laquelle je veux écrire
    const areaSize = Math.max(cellSize - 2, Math.floor(cellSize * 0.8))
    // Pixels à sauter pour passer d'un texte à l'autre de la même ligne
    const valueStep = Math.floor(areaSize / 3)
    // Taille de l'espace blanc à laisser entre le bord de la cellule et le texte
    const cellPadding = Math.max(1, Math.floor(cellSize * 0.1))

    const domain = cellDomains[j][i]
    // check if all cellValues are null
    let allNull = true;

    for (let k = 0; k < 9; k++) {
        if (cellValues[j][i][k] !== null) {
            allNull = false;
        }
    }

    if (!allNull) {
        const x = i * cellSize + cellPadding
        const y = j * cellSize + cellPadding
        for (let k = 0; k < 9; k++) {
            // k-ième valeur du domaine, ou null si la valeur n'est plus permise
            const vk = cellValues[j][i][k];
            // Numéro de colonne de cette k-ième valeur
            const vi = (k) % 3
            // Numéro de ligne de cette k-ième valeur
            const vj = Math.floor((k) / 3)
            // Coordonnées en pixel de la valeur
            const vx = x + valueStep * vi
            const vy = y + valueStep * vj
            ctx.fillText(vk !== null ? vk.toString() : "", vx, vy)
        }
    } else {
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
let currentMousePos: { x: number, y: number } | null = null

canvas.addEventListener("mousemove", (event: MouseEvent) => {
    event.stopPropagation()
    const x = event.offsetX
    const y = event.offsetY
    const i = Math.min(Math.floor(x / cellSize), 8)
    const j = Math.min(Math.floor(y / cellSize), 8)
    currentMousePos = {x, y}
    if (selectedCell === null || selectedCell[0] !== i || selectedCell[1] !== j) {
        selectedCell = [i, j]
    }
})

canvas.addEventListener("mouseout", (event: MouseEvent) => {
    event.stopPropagation()
    selectedCell = null
    console.log("Celulle sélectionnée:", selectedCell)
})

window.addEventListener("keyup", toggle)

function toggle(event: KeyboardEvent) {
    event.stopPropagation()

    if (selectedCell === null) {
        return;
    }

    // check if key is a number between 1 and 9
    const key = parseInt(event.key);

    if (isNaN(key) || key < 1 || key > 9) {
        return;
    }

    const [i, j] = selectedCell;

    const miniCellX = Math.floor((currentMousePos!.x - i * cellSize) / (cellSize / 3));
    const miniCellY = Math.floor((currentMousePos!.y - j * cellSize) / (cellSize / 3));

    const miniCellIndex = miniCellX + miniCellY * 3;

    let wasSame = false;

    if (cellValues[j][i].includes(key)) {
        for (let k = 0; k < 9; k++) {
            let value = cellValues[j][i][k];
            if (value === key) {
                wasSame = true;
                cellValues[j][i][k] = null;
            }
        }
    }

    removeFromLine(j, miniCellY, key);
    removeFromColumn(i, miniCellY, key);

    if (!wasSame) {
        cellValues[j][i][miniCellIndex] = key;
    }




    drawEmptyGrid();
    drawDomains();
}

function removeFromLine(y, miniCellY, value) {
    for (let i = 0; i < 9; i++) {
        let range = null
        switch (miniCellY) {
            case 0:
                range = [0, 1, 2];
                break;
            case 1:
                range = [3, 4, 5];
                break;
            case 2:
                range = [6, 7, 8];
                break;
        }

        // check if value is in range
        range.forEach((index) => {
            if (cellValues[y][i][index] === value) {
                cellValues[y][i][index] = null;
            }
        })
    }
}

function removeFromColumn(x, miniCellX, value) {
    for (let j = 0; j < 9; j++) {
        let range = null
        switch (miniCellX) {
            case 0:
                range = [0, 1, 2];
                break;
            case 1:
                range = [3, 4, 5];
                break;
            case 2:
                range = [6, 7, 8];
                break;
        }

        // check if value is in range
        range.forEach((index) => {
            if (cellValues[j][x][index] === value) {
                cellValues[j][x][index] = null;
            }
        })
    }
}

console.log("Frontend chargé")