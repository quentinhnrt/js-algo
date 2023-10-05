/// <reference lib="dom" />

const ws = new WebSocket(`ws://${location.host}`);

ws.onopen = () => setInterval(() => ws.send("ping"), 5000);

ws.onmessage = (event) => {
    if (event.data === "reload") {
        location.reload();
    }
}

const canvas = document.getElementById("sudokuCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;


const width = canvas.width;
const height = canvas.height;
const cellSize = Math.round(Math.min(width, height) / 9);
const bgColor = "#777";
const boldColor = "#000";
const thinColor = "#aaa";

const cellDomains: number[][][] = [];
let cellValues: (number | null)[][] = [];

for (let j = 0; j < 9; j++) {
    cellDomains.push([])
    cellValues.push([])
    for (let i = 0; i < 9; i++) {
        cellDomains[j].push([1, 2, 3, 4, 5, 6, 7, 8, 9])
        cellValues[j].push(null)
    }
}


function clearCanvas() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
}

clearCanvas();

function drawCell(
    i: number,
    j: number,
    cellSize: number,
    borderColor: string,
    fillColor?: string,
) {
    const x = i * cellSize;
    const y = j * cellSize;

    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, cellSize, cellSize);
    }

    ctx.strokeStyle = borderColor;
    ctx.strokeRect(x, y, cellSize, cellSize);
}

function drawEmptyGrid() {
    clearCanvas()
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            drawCell(i, j, cellSize, thinColor);
        }
    }

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            drawGroup(i, j, boldColor);
        }
    }
}

drawEmptyGrid();

function drawGroup(
    i: number,
    j: number,
    fillColor?: string,
) {
    drawCell(i, j, cellSize * 3, boldColor);

    /*for (let k = 0; k < 3; k++) {
        for (let l = 0; l < 3; l++) {
            drawCell(i*3 + l, j * 3 + k, cellSize, thinColor);
        }
    }*/
}

function drawDomain(i: number, j: number, cellValue: number|null) {
    ctx.textBaseline = "top";
    ctx.fillStyle = "#000";
    ctx.textAlign = "left";
    ctx.font = `16px Arial`;
    const domains = cellDomains[j][i];

    const areaSize = Math.max(cellSize - 2, Math.floor(cellSize * 0.8));
    const valueStep = Math.floor(areaSize / 3);
    const cellPadding = Math.max(1, Math.floor(cellSize * 0.1))

    const x = i * cellSize + cellPadding;
    const y = j * cellSize + cellPadding;
    const miniCellSize = cellSize / 3;

    for (let k = 0; k <= 9; k++) {
        const vk = domains.includes(k) ? k : null;
        const vi = (k - 1) % 3;
        const vj = Math.floor((k - 1) / 3);

        const vx = x + vi * valueStep;
        const vy = y + vj * valueStep;

        ctx.fillText(cellValue ? cellValue.toString() : "", vx, vy, valueStep);
    }
}

function drawDomains() {
    cellValues.forEach((row, j) => {
        row.forEach((_, i) => {
            console.log(i, j, cellValues)
            drawDomain(i, j, cellValues[j][i]);
        })
    })
}

drawDomains();

let selectedCell: [number, number] | null = null;

canvas.addEventListener("mousemove", (event: MouseEvent) => {
    event.stopPropagation()
    const x = event.offsetX;
    const y = event.offsetY;

    const i = Math.min(Math.floor(x / cellSize), 8);
    const j = Math.min(Math.floor(y / cellSize), 8);
    // check if cell is selected
    if (selectedCell !== null) {
        const [si, sj] = selectedCell;
        if (si === i && sj === j) {
            return;
        }
    }
    console.log(i, j)
    selectedCell = [i, j];
});

canvas.addEventListener("mouseout", (event: MouseEvent) => {
    event.stopPropagation()
    if (selectedCell !== null) {
        selectedCell = null;
    }
})

window.addEventListener("keydown", (event: KeyboardEvent) => {
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


    // check if cell is empty
    if (cellValues[j][i] === key) {
        cellValues[j][i] = null;
    }

    cellValues[j][i] = key;
    drawDomains()
})