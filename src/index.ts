Bun.serve({
    port: 3000,
    fetch(req: Request): Response | Promise<Response> {
        const url = new URL(req.url);
        if (url.pathname === "/") return new Response("Home page!");
        if (url.pathname === "/blog") return new Response("Blog!");
        throw new Error("Not found!")
    }
})


console.log("Hello world!")