const { afterEach, beforeEach, test } = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");

let server;
let baseUrl;

beforeEach(async () => {
    server = createApp({ version: "test", logger: { log() {} } });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
});

afterEach(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
});

test("GET / devuelve la información del servicio", async () => {
    const response = await fetch(`${baseUrl}/`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.service, "cloud-deploy-lab");
    assert.equal(body.version, "test");
    assert.equal(body.status, "running");
});

test("GET /health devuelve el estado y la versión", async () => {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(body.version, "test");
    assert.equal(typeof body.uptimeSeconds, "number");
});

test("GET /ready confirma que la aplicación está lista", async () => {
    const response = await fetch(`${baseUrl}/ready`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, { status: "ready" });
});

test("una ruta desconocida devuelve 404 sin filtrar detalles", async () => {
    const response = await fetch(`${baseUrl}/no-existe`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.deepEqual(body, { error: "not_found" });
});

test("un método no permitido devuelve 405 y Allow", async () => {
    const response = await fetch(`${baseUrl}/`, { method: "POST" });
    const body = await response.json();

    assert.equal(response.status, 405);
    assert.equal(response.headers.get("allow"), "GET, HEAD");
    assert.deepEqual(body, { error: "method_not_allowed" });
});

test("las respuestas incluyen cabeceras de seguridad", async () => {
    const response = await fetch(`${baseUrl}/`);

    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("x-frame-options"), "DENY");
    assert.equal(response.headers.get("referrer-policy"), "no-referrer");
    assert.match(response.headers.get("content-security-policy"), /default-src 'none'/);
    assert.equal(response.headers.get("cache-control"), "no-store");
});

test("X-Request-Id se conserva si el cliente lo envía", async () => {
    const response = await fetch(`${baseUrl}/health`, {
        headers: { "X-Request-Id": "prueba-123" }
    });

    assert.equal(response.headers.get("x-request-id"), "prueba-123");
});

test("X-Request-Id se genera si el cliente no lo envía", async () => {
    const response = await fetch(`${baseUrl}/health`);
    const requestId = response.headers.get("x-request-id");

    assert.ok(requestId);
    assert.notEqual(requestId, "");
});

test("HEAD devuelve las cabeceras sin cuerpo", async () => {
    const response = await fetch(`${baseUrl}/`, { method: "HEAD" });
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.equal(body, "");
    assert.ok(Number(response.headers.get("content-length")) > 0);
});
