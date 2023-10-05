import {join} from "node:path";
import {watch} from "node:fs";
import {Server, ServerWebSocket} from "bun";

const baseDir = join(import.meta.dir, "..", "..", "www")
const port: number = parseInt(process.argv[2]) || 3000;

const wsClients: Set<ServerWebSocket<T>> = new Set()

const watcher = watch(baseDir,
    {recursive: true},
    (event, filename) => {
    wsClients.forEach(ws => ws.send("reload"))
})


const server = Bun.serve({
    port: port,
    async fetch(req: Request, srv: Server) {
        if (srv.upgrade(req)) {
            return
        }
        const url = new URL(req.url);
        const filename = url.pathname === "/" ? "/index.html" : url.pathname;
        const filePath = join(baseDir, filename)
        const file = Bun.file(filePath)

        if (!(await file.exists())) {
            return new Response(`Unknown file ${filename}`, {status: 404})
        }

        //const text= await file.text()

        return new Response(file)
    },
    websocket: {
        message(ws: ServerWebSocket<T>, message: string): void | Promise<void> {
            console.log(`Message received from ${ws.remoteAddress} : ${message}`)
            ws.send(`You said: ${message}`)
        },
        open(ws: ServerWebSocket<T>): void | Promise<void> {
            wsClients.add(ws)
        },
        close(ws: ServerWebSocket<T>): void | Promise<void> {
        }
    }
})

console.log(`Listening on port ${server.hostname}:${server.port}`)
