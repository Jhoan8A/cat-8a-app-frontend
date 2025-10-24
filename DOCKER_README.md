# 🐳 Docker Setup - Cat Breeds Frontend

Este documento explica cómo ejecutar el frontend de Cat Breeds App usando Docker con NGINX.

## 📋 Tabla de Contenidos

- [Prerrequisitos](#prerrequisitos)
- [Construcción de la Imagen](#construcción-de-la-imagen)
- [Ejecución con Docker](#ejecución-con-docker)
- [Ejecución con Docker Compose](#ejecución-con-docker-compose)
- [Configuración NGINX](#configuración-nginx)
- [Verificación](#verificación)
- [Comandos Útiles](#comandos-útiles)
- [Arquitectura Multi-Stage](#arquitectura-multi-stage)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerrequisitos

- **Docker**: versión 20.10 o superior
- **Docker Compose**: versión 2.0 o superior (opcional)
- **Backend ejecutándose**: El frontend necesita conectarse al backend

Verificar instalación:
```bash
docker --version
docker-compose --version
```

## 🏗️ Construcción de la Imagen

### Opción 1: Build Simple

```bash
docker build -t cat-frontend:latest .
```

### Opción 2: Build con Nombre Personalizado

```bash
docker build -t cat-app-frontend:v1.0.0 .
```

La imagen resultante tendrá aproximadamente **55MB** gracias al multi-stage build con NGINX Alpine.

## 🚀 Ejecución con Docker

### Paso 1: Asegurar que el Backend está Corriendo

El frontend necesita comunicarse con el backend. Verifica que estos contenedores estén corriendo:

```bash
docker ps | grep -E "cat-backend|cat-mongodb"
```

Deberías ver:
- `cat-backend-container` (puerto 3000)
- `cat-mongodb` (puerto 27017)

Si no están corriendo, consulta el [DOCKER_README.md del backend](../cat-8a-app-backend/DOCKER_README.md).

### Paso 2: Verificar la Red Docker

Asegúrate de que existe la red `cat-network`:

```bash
docker network ls | grep cat-network
```

Si no existe, créala:

```bash
docker network create cat-network
```

### Paso 3: Ejecutar Frontend

```bash
docker run -d \
  --name cat-frontend-container \
  --network cat-network \
  -p 80:80 \
  cat-frontend:latest
```

**Explicación de parámetros:**
- `-d`: Ejecuta en modo detached (background)
- `--name`: Nombre del contenedor
- `--network`: Red Docker para comunicarse con el backend
- `-p 80:80`: Mapeo de puertos (host:container)

**Nota:** Si el puerto 80 está ocupado, usa otro puerto:
```bash
docker run -d --name cat-frontend-container --network cat-network -p 8080:80 cat-frontend:latest
```

## 🐳 Ejecución con Docker Compose (Aplicación Completa)

### Archivo docker-compose.yml

Crea un archivo `docker-compose.yml` en la raíz del proyecto monorepo:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    container_name: cat-mongodb
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=cat-api
    volumes:
      - cat-mongo-data:/data/db
    networks:
      - cat-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/cat-api --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./cat-8a-app-backend
      dockerfile: Dockerfile
    container_name: cat-backend-container
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - MONGODB_URI=mongodb://mongodb:27017/cat-api
      - CAT_API_KEY=${CAT_API_KEY}
      - CAT_API_URL=https://api.thecatapi.com/v1
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - cat-network
    restart: unless-stopped

  frontend:
    build:
      context: ./cat-8a-app-frontend
      dockerfile: Dockerfile
    container_name: cat-frontend-container
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - cat-network
    restart: unless-stopped

volumes:
  cat-mongo-data:

networks:
  cat-network:
    driver: bridge
```

### Archivo .env

Crea un archivo `.env` en la raíz del monorepo:

```env
CAT_API_KEY=your_cat_api_key_here
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Ejecutar Aplicación Completa

```bash
# Construir y ejecutar todos los servicios
docker-compose up -d

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs solo del frontend
docker-compose logs -f frontend

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

## 🔧 Configuración NGINX

El archivo `nginx.conf` configura NGINX como servidor web y proxy reverso:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Servir archivos estáticos de Angular
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy reverso para el backend
    location /api {
        proxy_pass http://cat-backend-container:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Características:**

✅ **SPA Routing**: `try_files` redirige todas las rutas a `index.html` para que Angular Router funcione
✅ **Proxy Reverso**: `/api` se redirige automáticamente al backend
✅ **Headers**: Configuración correcta para WebSockets y proxies
✅ **Performance**: NGINX optimizado para servir archivos estáticos

## ✅ Verificación

### 1. Verificar que el contenedor está corriendo

```bash
docker ps | grep cat-frontend
```

Deberías ver:
```
cat-frontend-container   Up X minutes   0.0.0.0:80->80/tcp
```

### 2. Ver logs del frontend

```bash
docker logs cat-frontend-container
```

Salida esperada:
```
nginx/1.29.2
start worker processes
```

### 3. Probar la Aplicación Web

Abre tu navegador en:
```
http://localhost
```

Deberías ver la aplicación Cat Breeds funcionando.

### 4. Probar el Proxy API

```bash
curl http://localhost/api/breeds
```

Respuesta esperada:
```json
{
  "success": true,
  "data": [...],
  "count": 67
}
```

### 5. Verificar Archivos Estáticos

```bash
curl -I http://localhost
```

Deberías ver:
```
HTTP/1.1 200 OK
Server: nginx
Content-Type: text/html
```

## 📊 Comandos Útiles

### Ver logs en tiempo real

```bash
docker logs -f cat-frontend-container
```

### Ver estadísticas de recursos

```bash
docker stats cat-frontend-container
```

Resultado típico:
```
CONTAINER ID   NAME                     CPU %     MEM USAGE / LIMIT    MEM %
4de5e4d41431   cat-frontend-container   0.00%     7.582MiB / 10.2GiB   0.07%
```

### Ejecutar comandos dentro del contenedor

```bash
# Shell interactivo
docker exec -it cat-frontend-container sh

# Ver configuración de NGINX
docker exec cat-frontend-container cat /etc/nginx/conf.d/default.conf

# Ver archivos servidos
docker exec cat-frontend-container ls -la /usr/share/nginx/html
```

### Reiniciar NGINX dentro del contenedor

```bash
docker exec cat-frontend-container nginx -s reload
```

### Verificar configuración de NGINX

```bash
docker exec cat-frontend-container nginx -t
```

### Inspeccionar la imagen

```bash
docker inspect cat-frontend:latest
```

### Ver capas de la imagen

```bash
docker history cat-frontend:latest
```

## 🏛️ Arquitectura Multi-Stage

El Dockerfile utiliza **multi-stage build** para optimizar el tamaño:

```dockerfile
# Stage 1: Build (Angular compilation)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Production (NGINX serving static files)
FROM nginx:alpine
COPY --from=build /app/dist/cat-8a-app-frontend-temp/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Beneficios:**

- ✅ Imagen final: **55MB** (vs ~1.2GB con Node incluido)
- ✅ Solo incluye archivos compilados (HTML, CSS, JS)
- ✅ NGINX Alpine extremadamente ligero
- ✅ No incluye código fuente TypeScript
- ✅ No incluye node_modules
- ✅ Arranque instantáneo

## 🧹 Limpieza

### Detener contenedor

```bash
docker stop cat-frontend-container
```

### Eliminar contenedor

```bash
docker rm cat-frontend-container
```

### Eliminar imagen

```bash
docker rmi cat-frontend:latest
```

### Limpieza completa del frontend

```bash
docker stop cat-frontend-container
docker rm cat-frontend-container
docker rmi cat-frontend:latest
```

### Limpieza completa de la aplicación

```bash
# Detener todos los contenedores
docker stop cat-frontend-container cat-backend-container cat-mongodb

# Eliminar contenedores
docker rm cat-frontend-container cat-backend-container cat-mongodb

# Eliminar red
docker network rm cat-network

# Eliminar volumen (⚠️ perderás los datos de MongoDB)
docker volume rm cat-mongo-data

# Eliminar imágenes
docker rmi cat-frontend:latest cat-backend:latest

# O con Docker Compose
docker-compose down -v --rmi all
```

## 🔍 Troubleshooting

### El frontend no carga en el navegador

**Problema:** `ERR_CONNECTION_REFUSED` o página en blanco

**Solución:**
1. Verifica que el contenedor esté corriendo: `docker ps | grep frontend`
2. Verifica los logs: `docker logs cat-frontend-container`
3. Verifica que el puerto 80 no esté ocupado: `lsof -ti:80`

### El frontend carga pero no puede conectarse al backend

**Problema:** Errores 502 o 504 en las llamadas API

**Solución:**
1. Verifica que el backend esté corriendo: `docker ps | grep backend`
2. Verifica que estén en la misma red: `docker network inspect cat-network`
3. Prueba el backend directamente: `curl http://localhost:3000/api/breeds`
4. Verifica el nginx.conf tenga el nombre correcto del contenedor

### Error: "host not found in upstream"

**Problema:**
```
nginx: [emerg] host not found in upstream "backend"
```

**Solución:** Verifica que `nginx.conf` use el nombre correcto del contenedor:
```nginx
proxy_pass http://cat-backend-container:3000;  # ✅ Correcto
proxy_pass http://backend:3000;                # ❌ Incorrecto
```

### Puerto 80 ya está en uso

**Problema:** `Error: bind: address already in use`

**Solución:**
```bash
# Opción 1: Detener el proceso que usa el puerto
lsof -ti:80 | xargs sudo kill -9

# Opción 2: Usar otro puerto
docker run -p 8080:80 cat-frontend:latest
# Luego accede a http://localhost:8080
```

### La aplicación Angular no encuentra las rutas

**Problema:** Error 404 al recargar en rutas como `/breeds` o `/search`

**Solución:** Verifica que `nginx.conf` tenga configurado `try_files`:
```nginx
location / {
    try_files $uri $uri/ /index.html;  # Esto es esencial para Angular Router
}
```

### Imagen muy grande

**Problema:** La imagen pesa más de 200MB

**Solución:** Verifica que:
1. Estés usando el Dockerfile correcto con multi-stage build
2. El `.dockerignore` excluya `node_modules`, `dist`, y `.angular`
3. La etapa de build no esté en la imagen final

### Cambios en el código no se reflejan

**Problema:** Hiciste cambios pero no se ven en la aplicación

**Solución:** Debes reconstruir la imagen:
```bash
docker stop cat-frontend-container
docker rm cat-frontend-container
docker build -t cat-frontend:latest .
docker run -d --name cat-frontend-container --network cat-network -p 80:80 cat-frontend:latest
```

### Error de presupuesto al construir

**Problema:**
```
ERROR src/app/components/breeds-list/breeds-list.component.scss exceeded maximum budget
```

**Solución:** Ya está configurado en `angular.json` con límites más altos:
```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "1MB",
    "maximumError": "2MB"
  }
]
```

## 📝 Notas Adicionales

### Puertos Expuestos

- **Frontend (NGINX):** 80

### Entornos

El frontend usa diferentes archivos de entorno:

- **Development:** `environment.ts` → `apiUrl: 'http://localhost:3000/api'`
- **Production:** `environment.prod.ts` → `apiUrl: '/api'` (usa proxy de NGINX)

### Performance

**Optimizaciones de NGINX:**

```nginx
# Agregar al nginx.conf para mejor performance
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;

# Cache de archivos estáticos
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Seguridad

⚠️ **IMPORTANTE para producción:**

1. Usa **HTTPS** con certificados SSL
2. Configura **headers de seguridad** en NGINX:
```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
```
3. Implementa **rate limiting** en NGINX
4. No expongas MongoDB directamente
5. Usa variables de entorno para URLs sensibles

### Desarrollo vs Producción

| Característica | Desarrollo | Producción (Docker) |
|----------------|-----------|---------------------|
| Servidor | Angular CLI (ng serve) | NGINX |
| Puerto | 4200 | 80 |
| API URL | http://localhost:3000/api | /api (proxy) |
| Hot Reload | ✅ Sí | ❌ No |
| Optimización | ❌ No | ✅ Sí |
| Tamaño | ~500MB | 55MB |

## 📚 Recursos

- [Docker Documentation](https://docs.docker.com/)
- [NGINX Documentation](https://nginx.org/en/docs/)
- [Angular Deployment Guide](https://angular.io/guide/deployment)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)

## 🤝 Soporte

Si tienes problemas:
1. Revisa los logs: `docker logs cat-frontend-container`
2. Verifica que el backend esté funcionando
3. Consulta la sección de Troubleshooting
4. Verifica la documentación principal del proyecto

## 🎯 Próximos Pasos

Una vez que tengas el frontend corriendo:

1. ✅ Accede a la aplicación en http://localhost
2. ✅ Regístrate como usuario nuevo
3. ✅ Explora las razas de gatos
4. ✅ Busca razas específicas
5. ✅ Verifica que el login/logout funcione correctamente

---

**Desarrollado con 🐱 para el proyecto Cat Breeds App**
