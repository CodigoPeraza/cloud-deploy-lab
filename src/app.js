const http = require("node:http");
const { randomUUID } = require("node:crypto");

const DEFAULT_VERSION = process.env.APP_VERSION || "1.0.0";

function sendJson(req, res, statusCode, payload, extraHeaders = {}) {
    const body = JSON.stringify(payload);
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(body),
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "no-referrer",
        "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
        ...extraHeaders
    });

    if (req.method === "HEAD") {
        res.end();
        return;
    }

    res.end(body);
}

function createRequestHandler({ version = DEFAULT_VERSION, logger = console } = {}) {
    return (req, res) => {
        const requestId = req.headers["x-request-id"] || randomUUID();
        const startedAt = process.hrtime.bigint();

        res.setHeader("X-Request-Id", requestId);
        res.on("finish", () => {
            const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
            logger.log(JSON.stringify({
                level: "info",
                requestId,
                method: req.method,
                path: req.url,
                status: res.statusCode,
                durationMs: Number(durationMs.toFixed(1))
            }));
        });

        if (req.method !== "GET" && req.method !== "HEAD") {
            sendJson(req, res, 405, { error: "method_not_allowed" }, { Allow: "GET, HEAD" });
            return;
        }

        const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

        if (url.pathname === "/") {
            sendJson(req, res, 200, {
                service: "cloud-deploy-lab",
                version,
                status: "running"
            });
            return;
        }

        if (url.pathname === "/health") {
            sendJson(req, res, 200, {
                status: "ok",
                uptimeSeconds: Math.floor(process.uptime()),
                version
            });
            return;
        }

        if (url.pathname === "/ready") {
            sendJson(req, res, 200, { status: "ready" });
            return;
        }

        sendJson(req, res, 404, { error: "not_found" });
    };
}

function createApp(options) {
    return http.createServer(createRequestHandler(options));
}

module.exports = { createApp, createRequestHandler };
