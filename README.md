# FaztCom

Sistema integral de gestión para restaurantes con toma de comandas en tiempo real, control de mesas, reportes de ventas y operación multi-rol. Construido con Ionic/Angular en el frontend y Node.js/Express/Prisma en el backend.

---

## Tabla de contenido

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Stack tecnológico](#stack-tecnológico)
- [Roles y flujos](#roles-y-flujos)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)
- [Ejecución](#ejecución)
- [Scripts disponibles](#scripts-disponibles)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Eventos de Socket.IO](#eventos-de-socketio)
- [Tareas programadas (cron)](#tareas-programadas-cron)
- [Despliegue](#despliegue)

---

## Características

- **Roles múltiples**: admin, mesero, cocinero, bartender, cada uno con su propia vista y permisos.
- **Tiempo real**: las comandas, cambios de estado y notificaciones se propagan instantáneamente por Socket.IO sin recargar la página.
- **Gestión de mesas**: flujo completo `libre → abierta → cerrada → limpiar → libre`, con sección PM/Sala, Terraza y Periqueras.
- **Comandas divididas**: cada pedido se divide automáticamente en comandas de cocina y barra según el tipo de producto.
- **Pedidos "para llevar"**: comandas sin mesa asignada para pedidos para llevar.
- **Vista agrupada (ronda)**: cocina y barra ven los productos repetidos agrupados para preparar en lote.
- **Productos agotados**: cocinero/bartender pueden marcar productos como agotados; el mesero no puede ordenarlos.
- **Notificaciones**: el mesero recibe alertas cuando un pedido está listo.
- **Historial automático**: comandas finalizadas se mueven a la sección de historial con auto-ocultado de 10s.
- **Cierre de caja automático**: a medianoche se cierran automáticamente las notas abiertas.
- **Reportes de ventas**: filtros por día, semana, mes, año y ventas totales; con desglose por sección (PM, Terraza, Para Llevar).
- **Gestión de usuarios**: alta/baja de usuarios con envío de credenciales por email y cambio de contraseña forzado en primer login.
- **Menú dinámico**: categorías de productos dinámicas creadas desde el panel admin.

---

## Arquitectura

```
┌─────────────────────┐        HTTP/REST         ┌─────────────────────┐
│   Ionic / Angular   │ ───────────────────────▶ │    Express API      │
│     (frontend)      │                           │   (Node.js + TS)    │
│                     │ ◀───── Socket.IO ─────▶  │                     │
└─────────────────────┘   (eventos en tiempo     └──────────┬──────────┘
                               real)                        │
                                                            │ Prisma
                                                            ▼
                                                 ┌─────────────────────┐
                                                 │ PostgreSQL (Aiven)  │
                                                 └─────────────────────┘
```

---

## Stack tecnológico

**Frontend**
- Ionic 8 + Angular 20
- TypeScript
- RxJS
- Socket.IO client
- Capacitor (para despliegue móvil)

**Backend**
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Socket.IO
- JSON Web Tokens (JWT)
- bcryptjs
- node-cron (cierre automático de notas)
- nodemailer (envío de credenciales)

---

## Roles y flujos

### Admin
- Dashboard con métricas de ventas y gastos.
- Gestión de ventas, gastos, menú y usuarios.
- Vista consolidada de todas las comandas.
- **Vistas Operativas**: acceso a las funciones de mesero, cocinero y bartender dentro de un `ion-accordion`.

### Mesero
- Tablero de mesas con estados visuales.
- Creación de comandas (por mesa o para llevar).
- Seguimiento en tiempo real del estado de sus pedidos.
- Cancelación de productos con notificación automática a cocina/barra.
- Marcar mesas como "limpias" tras cerrar una cuenta.
- Recepción de notificaciones cuando un pedido está listo.

### Cocinero
- Vista de comandas de comida en cola.
- Agrupación automática de productos repetidos para preparar en lote ("ronda").
- Marcado de items individuales o grupos como listos.
- Gestión del menú de comidas (marcar como agotado).

### Bartender
- Mismo flujo que cocinero, pero para bebidas.
- Gestión del menú de bebidas.

---

## Requisitos previos

- Node.js ≥ 18
- npm ≥ 9
- PostgreSQL (local o en la nube, por ejemplo [Aiven](https://aiven.io/))
- Ionic CLI (opcional, recomendado):
  ```bash
  npm install -g @ionic/cli
  ```

---

## Instalación

Clona el repositorio e instala dependencias en el frontend y backend:

```bash
git clone https://github.com/antonio4-89/FaztCom.git
cd FaztCom

# Frontend
npm install

# Backend
cd backend
npm install
```

---

## Variables de entorno

Crea un archivo `backend/.env` con las siguientes variables:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@host:puerto/database?sslmode=require"

# Autenticación
JWT_SECRET="tu_secreto_jwt_aleatorio_y_largo"

# Servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8100

# SMTP (envío de credenciales a nuevos usuarios)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
```

> **Importante:** Este archivo está en `.gitignore` y nunca debe subirse al repositorio.

Para el frontend, los entornos se definen en `src/environments/`:

```ts
// environment.ts (desarrollo)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  socketUrl: 'http://localhost:3000',
};
```

---

## Base de datos

Genera el cliente de Prisma y aplica el esquema a la base de datos:

```bash
cd backend
npx prisma generate
npx prisma db push
```

Para ver los datos con la UI de Prisma Studio:

```bash
npm run db:studio
```

---

## Ejecución

En dos terminales separadas:

**Terminal 1 — Backend**
```bash
cd backend
npm run dev
```
El API quedará escuchando en `http://localhost:3000` y los eventos de Socket.IO en el mismo puerto.

**Terminal 2 — Frontend**
```bash
ionic serve
```
La aplicación abrirá en `http://localhost:8100`.

---

## Scripts disponibles

### Frontend (raíz del proyecto)

| Script         | Descripción                                  |
|----------------|----------------------------------------------|
| `npm start`    | Inicia el servidor de desarrollo de Angular. |
| `npm run build`| Construye la aplicación para producción.     |
| `npm test`     | Ejecuta las pruebas unitarias.               |
| `ionic serve`  | Sirve la app con hot reload (recomendado).   |

### Backend (`backend/`)

| Script            | Descripción                                              |
|-------------------|----------------------------------------------------------|
| `npm run dev`     | Inicia el backend en modo desarrollo con recarga.        |
| `npm run build`   | Compila TypeScript a JavaScript.                         |
| `npm start`       | Inicia el backend compilado (producción).                |
| `npm run db:push` | Sincroniza el esquema de Prisma con la base de datos.    |
| `npm run db:seed` | Ejecuta el script de seed inicial.                       |
| `npm run db:studio` | Abre Prisma Studio para inspeccionar la base de datos. |

---

## Estructura del proyecto

```
faztcom/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Modelos y enums de la base de datos
│   │   └── seed.ts              # Datos iniciales
│   └── src/
│       ├── controllers/         # Lógica de negocio (auth, comandas, notas, etc.)
│       ├── middleware/          # Auth y role guards
│       ├── routes/              # Definición de rutas REST
│       ├── lib/                 # Cliente Prisma
│       ├── socket.ts            # Configuración de Socket.IO y helpers
│       ├── cron.ts              # Tareas programadas (cierre de notas a medianoche)
│       └── index.ts             # Punto de entrada del servidor
│
├── src/                          # Frontend Ionic/Angular
│   └── app/
│       ├── core/
│       │   ├── services/        # Servicios de datos (HTTP + Socket)
│       │   ├── models/          # Interfaces TypeScript
│       │   └── guards/          # Guards de rutas
│       └── pages/
│           ├── admin/           # Dashboard, ventas, gastos, menú, usuarios, vistas
│           ├── mesero/          # Mesas, nueva comanda, mis pedidos, notificaciones
│           ├── cocina/          # Comandas, menú, historial
│           └── barra/           # Bebidas, menú, historial
│
└── README.md
```

---

## Eventos de Socket.IO

El backend emite los siguientes eventos para mantener a los clientes sincronizados:

| Evento                  | Destinatarios             | Descripción                                    |
|-------------------------|---------------------------|------------------------------------------------|
| `nueva-comanda-cocina`  | Room `cocina` + admin     | Se creó una comanda con items de comida.       |
| `nueva-comanda-barra`   | Room `barra` + admin      | Se creó una comanda con items de bebida.       |
| `comanda-actualizada`   | Broadcast (todos)         | Cambio de estado o edición de una comanda.    |
| `pedido-listo`          | Room `mesero-{id}`        | Notifica al mesero que su pedido está listo.   |
| `mesa-actualizada`      | Broadcast (todos)         | Cambio de estado de mesa.                      |
| `menu-actualizado`      | Broadcast (todos)         | Un producto cambió su estado (agotado).        |

En el frontend, `SocketService` expone observables para cada evento y se encarga de ejecutar los callbacks dentro de `NgZone` para que Angular detecte los cambios.

---

## Tareas programadas (cron)

- **Cierre automático de notas a medianoche** (`0 0 * * *`): todas las notas abiertas se cierran automáticamente, se calculan los totales, las comandas pendientes se marcan como entregadas y las mesas se ponen en estado `limpiar`. Esto garantiza un corte de caja diario limpio.

---

## Despliegue

### Backend

1. Compila TypeScript:
   ```bash
   cd backend && npm run build
   ```
2. Configura las variables de entorno en el servidor (ver [Variables de entorno](#variables-de-entorno)).
3. Inicia con `npm start` o usando un proceso manager como PM2:
   ```bash
   pm2 start dist/index.js --name faztcom-api
   ```

### Frontend

Producción web:
```bash
npm run build -- --configuration=production
```

Despliegue móvil con Capacitor:
```bash
ionic capacitor add android
ionic capacitor add ios
ionic capacitor build android
ionic capacitor build ios
```

---

## Licencia

Proyecto privado. Todos los derechos reservados.

---

## Autor

**antonio4-89** — [GitHub](https://github.com/antonio4-89)
