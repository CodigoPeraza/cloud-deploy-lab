# Guía de despliegue

## Opción local sin Docker

```bash
npm ci
npm start
```

La aplicación escucha en `http://localhost:3000`.

## Opción local con Docker

```bash
docker compose up --build
```

La aplicación queda disponible en `http://localhost:3000` y el contenedor incluye un health check contra `/health`.

## Despliegue en Render

El repositorio incluye `render.yaml` para crear el servicio desde un Blueprint.

1. Crear una cuenta en Render y conectar GitHub.
2. Elegir **New > Blueprint** y seleccionar el repositorio `cloud-deploy-lab`.
3. Render detecta `render.yaml`, construye el `Dockerfile` y publica el servicio.
4. Confirmar la variable `APP_VERSION` y el health check `/health`.
5. Esperar el primer despliegue y abrir la URL pública.
6. Verificar:

```bash
curl https://<servicio>.onrender.com/health
curl https://<servicio>.onrender.com/
```

### Alternativa manual

Si no se usa el Blueprint:

1. **New > Web Service**.
2. Conectar el repositorio.
3. Runtime: **Docker**.
4. Health check path: `/health`.
5. Variable de entorno: `APP_VERSION=1.0.0`.
6. Crear el servicio.

Render proporciona TLS y asigna la variable `PORT`; la aplicación la respeta.

## Variables de entorno

| Variable | Valor por defecto | Uso |
| --- | --- | --- |
| `PORT` | `3000` | Puerto de escucha. En Render lo asigna la plataforma. |
| `APP_VERSION` | `1.0.0` | Versión mostrada en `/` y `/health`. |

No se requieren secretos para el laboratorio. Si se agregan, deben configurarse en el panel del proveedor y nunca en el repositorio.

## Verificación posterior al despliegue

- [ ] `/health` responde `200` con `status: ok`.
- [ ] `/` responde con el nombre del servicio y la versión.
- [ ] Una ruta desconocida responde `404` sin detalles internos.
- [ ] La URL pública usa HTTPS.
- [ ] Los logs muestran solicitudes JSON con `requestId`.
- [ ] El servicio se reinicia correctamente al recibir `SIGTERM`.

## Rollback

En Render, abrir **Events** o **Deploys**, seleccionar un despliegue anterior y volver a desplegarlo. El repositorio no guarda credenciales ni estado, así que el rollback es solo de imagen y variables de entorno.

## Limitaciones del plan gratuito

- Las instancias pueden suspenderse por inactividad y tardar en despertar.
- No hay garantía de disponibilidad ni escalado automático.
- El health check no sustituye monitoreo, alertas ni observabilidad centralizada.
- El laboratorio no incluye base de datos, autenticación ni límite de solicitudes.
