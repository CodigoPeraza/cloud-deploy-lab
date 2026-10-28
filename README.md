<div align="center">

# Cloud Deploy Lab

**Aplicación HTTP sin dependencias, lista para Docker y despliegue en la nube.**

![Node.js](https://img.shields.io/badge/Node.js_22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![CI](https://img.shields.io/badge/GitHub_Actions-CI-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

</div>

## Descripción

Laboratorio de despliegue de una aplicación Node.js construida solo con módulos nativos. Incluye endpoints de salud y readiness, cabeceras de seguridad, logs JSON, cierre ordenado, `Dockerfile`, `compose.yaml`, configuración de Render y CI en GitHub Actions.

El objetivo es practicar el ciclo de vida de un servicio: desarrollo local, pruebas, imagen de contenedor, health checks, despliegue y verificación posterior.

## Funcionalidades

- Servidor HTTP con `node:http`, sin dependencias externas.
- `GET /` con información del servicio y versión.
- `GET /health` para health checks.
- `GET /ready` para readiness.
- Respuestas 404 y 405 controladas.
- Cabeceras de seguridad en todas las respuestas.
- `X-Request-Id` para seguimiento de solicitudes.
- Logs JSON con método, ruta, estado y duración.
- Cierre ordenado con `SIGTERM` y `SIGINT`.
- Imagen Docker con usuario no root y health check.
- Configuración de despliegue en Render.
- CI que ejecuta pruebas y construye la imagen.

## Endpoints

| Método | Ruta | Respuesta |
| --- | --- | --- |
| `GET` / `HEAD` | `/` | Información del servicio. |
| `GET` / `HEAD` | `/health` | Estado, uptime y versión. |
| `GET` / `HEAD` | `/ready` | Estado de readiness. |
| Otros métodos | Cualquiera | `405` con cabecera `Allow`. |
| `GET` / `HEAD` | Ruta desconocida | `404` con error genérico. |

## Stack

- Node.js 22
- Módulos nativos `http`, `crypto` y `node:test`
- Docker
- Docker Compose
- Render
- GitHub Actions

## Estructura

```text
cloud-deploy-lab/
├── src/
│   ├── app.js
│   └── index.js
├── test/app.test.js
├── docs/deployment.md
├── .github/workflows/ci.yml
├── Dockerfile
├── compose.yaml
├── render.yaml
├── package.json
└── package-lock.json
```

## Ejecución local

```bash
npm ci
npm start
```

La aplicación escucha en `http://localhost:3000`.

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

Salida esperada:

```json
{"service":"cloud-deploy-lab","version":"1.0.0","status":"running"}
{"status":"ok","uptimeSeconds":2,"version":"1.0.0"}
{"status":"ready"}
```

Para desarrollo con recarga automática:

```bash
npm run dev
```

## Pruebas

```bash
npm test
npm run check
```

Las pruebas usan `node:test` y cubren:

- Información del servicio y versión.
- Health y readiness.
- Rutas desconocidas y métodos no permitidos.
- Cabeceras de seguridad.
- Propagación y generación de `X-Request-Id`.
- Respuestas `HEAD` sin cuerpo.

## Docker

```bash
docker compose up --build
```

La imagen final:

- Usa `node:22-alpine`.
- Ejecuta como usuario `node`, no como `root`.
- Expone el puerto `3000`.
- Define un `HEALTHCHECK` contra `/health`.
- No copia pruebas, documentación ni `.git`.

## Despliegue

La guía paso a paso para Render está en [docs/deployment.md](docs/deployment.md).

Resumen:

1. Conectar el repositorio en Render.
2. Crear el servicio desde `render.yaml` o configurar runtime Docker y health check `/health`.
3. Definir `APP_VERSION` si se desea otra versión.
4. Verificar `/health` y `/` en la URL pública.

`render.yaml` no contiene secretos. Render proporciona TLS y la variable `PORT`.

## Operación y seguridad

- Health check y readiness separados.
- Logs JSON con `requestId` para correlación.
- Cierre ordenado con límite de 10 segundos antes de forzar la salida.
- Cabeceras `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` y CSP.
- Sin secretos en el repositorio.
- Sin dependencias de terceros que auditar.
- Contenedor con usuario no root.

## Integración continua

GitHub Actions ejecuta dos trabajos:

- **test:** `npm ci`, validación de sintaxis y pruebas.
- **docker:** construcción de la imagen.

## Limitaciones

- Una sola instancia, sin estado compartido ni escalado.
- No incluye base de datos, autenticación ni límite de solicitudes.
- Los logs se escriben en la salida estándar; no hay agregación ni alertas.
- El despliegue real requiere una cuenta del proveedor.
- El plan gratuito de Render puede suspender instancias inactivas.
- La aplicación no configura TLS; lo hace la plataforma.

## Materias que respalda

- Computación en la Nube.
- DevOps y CI/CD.
- Arquitectura Web.
- Ingeniería de Software.
- Administración de Servidores.

## Autor

**Francisco Javier Peraza** · [GitHub](https://github.com/CodigoPeraza) · [contacto.peraza@gmail.com](mailto:contacto.peraza@gmail.com)
