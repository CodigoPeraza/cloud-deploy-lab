const { createApp } = require("./app");

const port = Number(process.env.PORT || 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("PORT debe ser un número entre 1 y 65535.");
    process.exit(1);
}

const server = createApp();
let shuttingDown = false;

server.listen(port, "0.0.0.0", () => {
    console.log(`cloud-deploy-lab escuchando en el puerto ${port}`);
});

function shutdown(signal) {
    if (shuttingDown) {
        return;
    }
    shuttingDown = true;
    console.log(`Recibido ${signal}; cerrando el servidor.`);

    const forceExit = setTimeout(() => {
        console.error("Cierre forzado por tiempo de espera.");
        server.closeAllConnections();
        process.exit(1);
    }, 10000);
    forceExit.unref();

    server.close((error) => {
        clearTimeout(forceExit);
        if (error) {
            console.error("Error al cerrar el servidor:", error.message);
            process.exit(1);
        }
        process.exit(0);
    });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
