import { Hono } from "hono";
import { serveStatic } from "hono/deno";

const app = new Hono();

// serve index.html
app.get("/", serveStatic({ path: "./static/indexjs.html" }));

// serve all other static files
app.get("*", serveStatic({ root: "./static" }));

Deno.serve(app.fetch);