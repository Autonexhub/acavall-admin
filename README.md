# Acavall Harmony - Sistema de Gestión de Terapias

Sistema completo de gestión para terapias asistidas con animales de la Fundación Acavall.

![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![PHP](https://img.shields.io/badge/PHP-8.2+-purple?logo=php)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql)

---

## 📋 Tabla de Contenidos

- [Stack Tecnológico](#-stack-tecnológico)
- [Características](#-características)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Ejecución en Desarrollo](#-ejecución-en-desarrollo)
- [Despliegue en Hostinger](#-despliegue-en-hostinger)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Credenciales por Defecto](#-credenciales-por-defecto)
- [Roles y Permisos](#-roles-y-permisos)
- [Solución de Problemas](#-solución-de-problemas)

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 15.1 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5.7
- **Styling**: TailwindCSS 3.4 + shadcn/ui
- **State Management**: TanStack Query v5 (React Query)
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Package Manager**: Bun 1.1+

### Backend
- **Framework**: Slim Framework 4.12 (PHP)
- **Language**: PHP 8.2+
- **Authentication**: Firebase PHP-JWT 6.10
- **Database**: PDO (MySQL 8.0+)
- **Environment**: vlucas/phpdotenv 5.6
- **Dependency Manager**: Composer 2.0+

### Database
- **DBMS**: MySQL 8.0+ / MariaDB 10.6+
- **Charset**: UTF8MB4
- **Schema**: 11 tablas con relaciones
- **Migrations**: Scripts PHP automatizados

### Deployment
- **Frontend**: Vercel / Netlify / Hostinger
- **Backend**: Hostinger (cPanel + PHP)
- **Database**: MySQL en Hostinger

---

## ✨ Características

### Gestión Completa
- ✅ **Centros de Terapia** - CRUD completo con asignación de terapeutas
- ✅ **Terapeutas** - Gestión con seguimiento de horas trabajadas
- ✅ **Sesiones** - Calendario interactivo, planificación y registro
- ✅ **Residencias** - Seguimiento de programas residenciales
- ✅ **Programas** - Métricas de impacto y resultados

### Dashboard & Reportes
- 📊 Dashboard con calendario mensual
- 📈 Estadísticas en tiempo real
- 📑 Reportes de horas por terapeuta
- 📑 Reportes de sesiones por centro
- 🎯 Panel de impacto con métricas anuales

### Seguridad & Permisos
- 🔐 Autenticación JWT con cookies HttpOnly
- 👥 Sistema de roles (Admin, Coordinator, Therapist)
- 🛡️ Permisos granulares por recurso y acción
- 🔒 Protección contra SQL injection (prepared statements)
- 🚫 CORS configurado para dominios específicos

### UX/UI
- 🎨 Diseño moderno con TailwindCSS
- 📱 Completamente responsive (mobile, tablet, desktop)
- 🌙 Soporte para modo oscuro (preparado)
- ⚡ Carga rápida con Next.js optimizations
- 🔔 Notificaciones toast para feedback

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18.0 o superior ([Descargar](https://nodejs.org/))
- **Bun** 1.1.0 o superior ([Descargar](https://bun.sh/))
- **PHP** 8.1 o superior ([Descargar](https://www.php.net/downloads))
- **Composer** 2.0 o superior ([Descargar](https://getcomposer.org/))
- **MySQL** 8.0 o superior ([Descargar](https://dev.mysql.com/downloads/))
- **Git** ([Descargar](https://git-scm.com/))

### Verificar instalaciones

```bash
node --version    # v18.0.0 o superior
bun --version     # 1.1.0 o superior
php --version     # 8.1.0 o superior
composer --version # 2.0.0 o superior
mysql --version   # 8.0.0 o superior
```

---

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd acavall-harmony-next
```

### 2. Instalar Dependencias del Frontend

```bash
# En la raíz del proyecto
bun install
```

### 3. Configurar Variables de Entorno del Frontend

```bash
# Copiar archivo de ejemplo
cp .env.local.example .env.local
```

Editar `.env.local`:

```env
# URL de la API (desarrollo local)
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# JWT Secret (debe coincidir con el backend)
JWT_SECRET=tu-secret-super-seguro-de-al-menos-32-caracteres
```

### 4. Instalar Dependencias del Backend

```bash
cd backend
composer install
cd ..
```

### 5. Configurar Variables de Entorno del Backend

```bash
cd backend

# Copiar archivo de ejemplo
cp .env.example .env
```

Editar `backend/.env`:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=acavall_harmony
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql

# JWT (debe coincidir con el frontend)
JWT_SECRET=tu-secret-super-seguro-de-al-menos-32-caracteres
JWT_EXPIRATION=3600
JWT_ISSUER=acavall-harmony

# CORS (URL del frontend)
CORS_ORIGIN=http://localhost:3000

# Aplicación
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8000
```

### 6. Crear y Configurar la Base de Datos

```bash
cd backend

# Opción A: Script automatizado (Recomendado)
php migrations/run_migrations.php

# Opción B: Manual con MySQL
# mysql -u root -p
# CREATE DATABASE acavall_harmony CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
# USE acavall_harmony;
# SOURCE migrations/001_create_tables.sql;
# SOURCE migrations/002_seed_data.sql;
# EXIT;
```

El script creará:
- Base de datos `acavall_harmony`
- 11 tablas con relaciones
- Usuario administrador por defecto
- Datos de ejemplo (centros, terapeutas, sesiones)

---

## 💻 Ejecución en Desarrollo

### Iniciar Backend (PHP)

Abre una terminal y ejecuta:

```bash
cd backend
php -S localhost:8000 -t public
```

Verás: `PHP 8.x Development Server (http://localhost:8000) started`

### Iniciar Frontend (Next.js)

Abre **otra terminal** y ejecuta:

```bash
cd /ruta/al/proyecto/acavall-harmony-next
bun run dev
```

Verás: `Ready on http://localhost:3000`

### Acceder a la Aplicación

🌐 **Frontend**: http://localhost:3000
🔌 **API Backend**: http://localhost:8000/api
❤️ **Health Check**: http://localhost:8000/api/health

### Iniciar Sesión

```
Email: admin@acavall.org
Contraseña: password
```

⚠️ **Importante**: Cambia estas credenciales después del primer login en producción.

---

## 🌍 Despliegue en Hostinger

### Arquitectura de Despliegue

```
yourdomain.com/
├── (root)              → Next.js Frontend
├── /api/*              → PHP Backend (vía .htaccess rewrite)
└── /public_html/
    ├── ...frontend     → Build de Next.js
    └── api/
        └── ...backend  → Código PHP
```

### Preparación Pre-Despliegue

#### 1. Generar JWT Secret Seguro

```bash
# Generar un secret aleatorio de 64 caracteres
php -r "echo bin2hex(random_bytes(32)) . PHP_EOL;"
```

Copia el resultado y úsalo en ambos `.env` (frontend y backend).

#### 2. Build del Frontend

```bash
# En local
cd acavall-harmony-next
bun run build
```

Esto genera la carpeta `.next/` con el build optimizado.

---

### Paso 1: Configurar Base de Datos en Hostinger

1. **Accede a cPanel** de Hostinger
2. Ve a **MySQL® Databases**
3. **Crear nueva base de datos**:
   - Nombre: `u123456_acavall` (ejemplo)
   - Charset: `utf8mb4_unicode_ci`
4. **Crear usuario MySQL**:
   - Usuario: `u123456_admin` (ejemplo)
   - Contraseña: (genera una segura)
5. **Asignar usuario a la base de datos** con todos los privilegios
6. **Anotar**:
   - Host: `localhost` (normalmente)
   - Database name
   - Username
   - Password

---

### Paso 2: Desplegar Backend en Hostinger

#### 2.1. Subir Archivos PHP

**Opción A: Via FTP (FileZilla, etc.)**

```
Local: backend/*
Remoto: public_html/api/

Subir:
- public/
- src/
- vendor/ (o regenerar con composer)
- migrations/
- .htaccess
- composer.json
- composer.lock
```

**Opción B: Via Git (si Hostinger lo soporta)**

```bash
# SSH en el servidor
cd public_html
git clone <tu-repo> temp
mv temp/backend api
rm -rf temp
```

#### 2.2. Instalar Dependencias PHP

Conecta por **SSH** o usa **Terminal en cPanel**:

```bash
cd public_html/api
composer install --no-dev --optimize-autoloader
```

#### 2.3. Configurar `.env` en Producción

Crea `public_html/api/.env`:

```env
# Base de Datos (credenciales de cPanel)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u123456_acavall
DB_USER=u123456_admin
DB_PASSWORD=tu_contraseña_mysql_de_cpanel

# JWT Secret (el generado previamente)
JWT_SECRET=abc123...tu_secret_de_64_caracteres

JWT_EXPIRATION=3600
JWT_ISSUER=acavall-harmony

# CORS (dominio del frontend)
CORS_ORIGIN=https://yourdomain.com

# Producción
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com
```

#### 2.4. Ejecutar Migraciones

```bash
cd public_html/api
php migrations/run_migrations.php
```

Esto creará todas las tablas y datos iniciales.

#### 2.5. Verificar `.htaccess`

Asegúrate que `public_html/api/public/.htaccess` existe:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.php [QSA,L]
```

#### 2.6. Configurar `.htaccess` Principal (Opcional)

Si quieres que `/api/*` redirija a `api/public/`, crea `public_html/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On

    # API routes
    RewriteRule ^api/(.*)$ api/public/$1 [L,QSA]
</IfModule>
```

#### 2.7. Verificar Permisos

```bash
chmod 755 public_html/api
chmod 644 public_html/api/.env
chmod -R 755 public_html/api/public
```

#### 2.8. Probar API

Visita: `https://yourdomain.com/api/health`

Deberías ver:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected",
    "timestamp": "..."
  }
}
```

---

### Paso 3: Desplegar Frontend en Hostinger

#### Opción A: Desplegar con Vercel (Recomendado)

Vercel es la opción más fácil y optimizada para Next.js:

1. **Conecta tu repositorio** a Vercel
2. **Configurar variables de entorno** en Vercel:
   ```
   NEXT_PUBLIC_API_URL=https://yourdomain.com/api
   JWT_SECRET=tu_secret_de_64_caracteres
   ```
3. **Deploy automático** - Vercel detecta Next.js y lo despliega
4. **Conectar dominio personalizado** (opcional)

**Ventajas**:
- CDN global automático
- HTTPS automático
- Rebuilds automáticos en cada push
- Optimizaciones de Next.js out-of-the-box

#### Opción B: Desplegar en Hostinger (Avanzado)

Si prefieres alojar todo en Hostinger:

1. **Build en local**:
   ```bash
   bun run build
   ```

2. **Subir archivos** a `public_html/`:
   ```
   .next/
   public/
   node_modules/ (si Node.js está disponible)
   package.json
   next.config.js
   ```

3. **Configurar Node.js** en cPanel (si está disponible):
   - Versión: Node.js 18+
   - Application Root: `/public_html`
   - Application Startup File: `node_modules/next/dist/bin/next`
   - Arguments: `start`

4. **Configurar variables de entorno** en cPanel:
   ```
   NEXT_PUBLIC_API_URL=https://yourdomain.com/api
   ```

5. **Reiniciar aplicación** Node.js

**Nota**: No todos los planes de Hostinger soportan Node.js. Verifica tu plan.

---

### Paso 4: Configuración SSL

1. En **cPanel** → **SSL/TLS Status**
2. Activa **AutoSSL** o instala **Let's Encrypt**
3. Fuerza HTTPS con `.htaccess`:

```apache
# En public_html/.htaccess
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

### Paso 5: Verificación Post-Despliegue

✅ **Checklist**:

- [ ] Frontend accesible en `https://yourdomain.com`
- [ ] API Health check funciona: `https://yourdomain.com/api/health`
- [ ] Login funciona correctamente
- [ ] HTTPS forzado (candado verde en navegador)
- [ ] No hay errores en consola del navegador
- [ ] CORS permite peticiones del frontend
- [ ] Base de datos tiene datos de prueba

**Probar Login**:
```
URL: https://yourdomain.com/login
Email: admin@acavall.org
Password: password
```

---

## 📁 Estructura del Proyecto

```
acavall-harmony-next/
├── src/                           # Frontend (Next.js)
│   ├── app/                       # App Router
│   │   ├── (auth)/               # Rutas de autenticación
│   │   │   └── login/
│   │   └── (dashboard)/          # Rutas protegidas
│   │       ├── dashboard/        # Dashboard principal
│   │       ├── centros/          # Gestión de centros
│   │       ├── terapeutas/       # Gestión de terapeutas
│   │       ├── sesiones/         # Gestión de sesiones
│   │       ├── residencias/      # Residencias
│   │       ├── administracion/   # Reportes
│   │       └── impacto/          # Métricas de impacto
│   ├── components/               # Componentes React
│   │   ├── forms/               # Formularios
│   │   ├── shared/              # Componentes compartidos
│   │   ├── ui/                  # shadcn/ui components
│   │   └── providers/           # Context providers
│   ├── lib/                      # Librerías y utilidades
│   │   ├── api/                 # Cliente API y hooks
│   │   ├── auth/                # Autenticación
│   │   ├── validations/         # Schemas Zod
│   │   └── utils.ts             # Utilidades
│   └── types/                    # Definiciones TypeScript
│       ├── models.ts            # Modelos de datos
│       ├── auth.ts              # Tipos de autenticación
│       ├── api.ts               # Tipos de API
│       └── permissions.ts       # Tipos de permisos
├── backend/                       # Backend (PHP)
│   ├── public/                   # Punto de entrada
│   │   └── index.php            # Bootstrap Slim
│   ├── src/                      # Código fuente
│   │   ├── Controllers/         # Controladores HTTP
│   │   ├── Infrastructure/      # Database, config
│   │   ├── Middleware/          # Auth, CORS, Role
│   │   ├── Repositories/        # Acceso a datos
│   │   ├── Routes/              # Definición de rutas
│   │   └── Services/            # Lógica de negocio
│   └── migrations/               # Migraciones DB
│       ├── 001_create_tables.sql
│       ├── 002_seed_data.sql
│       └── run_migrations.php
├── .env.local.example            # Variables frontend (ejemplo)
├── backend/.env.example          # Variables backend (ejemplo)
├── package.json                  # Dependencias frontend
├── backend/composer.json         # Dependencias backend
├── next.config.js                # Configuración Next.js
├── tailwind.config.ts            # Configuración Tailwind
├── README.md                     # Este archivo
└── SETUP.md                      # Guía detallada de setup
```

---

## 🔌 API Endpoints

### Autenticación
```
POST   /api/auth/login      - Iniciar sesión (público)
POST   /api/auth/logout     - Cerrar sesión (protegido)
GET    /api/auth/me         - Usuario actual (protegido)
```

### Centros
```
GET    /api/centers         - Listar centros
GET    /api/centers/:id     - Obtener centro
POST   /api/centers         - Crear centro (admin/coordinator)
PUT    /api/centers/:id     - Actualizar centro (admin/coordinator)
DELETE /api/centers/:id     - Eliminar centro (admin)
```

### Terapeutas
```
GET    /api/therapists      - Listar terapeutas
GET    /api/therapists/:id  - Obtener terapeuta
POST   /api/therapists      - Crear terapeuta (admin/coordinator)
PUT    /api/therapists/:id  - Actualizar terapeuta (admin/coordinator)
DELETE /api/therapists/:id  - Eliminar terapeuta (admin)
```

### Sesiones
```
GET    /api/sessions        - Listar sesiones (filtros: start_date, end_date, center_id)
GET    /api/sessions/:id    - Obtener sesión
POST   /api/sessions        - Crear sesión (admin/coordinator)
PUT    /api/sessions/:id    - Actualizar sesión (admin/coordinator)
DELETE /api/sessions/:id    - Eliminar sesión (admin)
GET    /api/sessions/stats  - Estadísticas de sesiones
```

### Residencias
```
GET    /api/residences      - Listar residencias
GET    /api/residences/:id  - Obtener residencia
```

### Programas
```
GET    /api/programs        - Listar programas
GET    /api/programs/:id    - Obtener programa
GET    /api/programs/stats  - Estadísticas de programas
```

### Reportes
```
GET    /api/reports/therapist-hours   - Horas por terapeuta
GET    /api/reports/center-sessions   - Sesiones por centro
GET    /api/reports/impact            - Métricas de impacto
```

### Health Check
```
GET    /api/health          - Estado del sistema y BD
```

**Formato de respuesta**:
```json
{
  "success": true|false,
  "data": { ... },
  "error": "mensaje de error" // solo si success = false
}
```

---

## 🔐 Credenciales por Defecto

Después de ejecutar las migraciones, usa estas credenciales:

**Administrador**:
```
Email: admin@acavall.org
Password: password
```

**Coordinador**:
```
Email: coordinator@acavall.org
Password: password
```

⚠️ **IMPORTANTE**:
- Cambia estas contraseñas inmediatamente después del primer login en producción
- Elimina el usuario coordinador si no lo necesitas
- Crea usuarios reales con emails válidos

---

## 👥 Roles y Permisos

### Admin
- ✅ Acceso completo a todas las funciones
- ✅ Crear, editar, eliminar centros, terapeutas, sesiones
- ✅ Ver todos los reportes
- ✅ Gestionar usuarios (Fase 2)

### Coordinator
- ✅ Crear y editar centros y terapeutas
- ✅ Gestión completa de sesiones
- ✅ Ver reportes
- ❌ No puede eliminar centros ni terapeutas

### Therapist
- ✅ Ver centros y terapeutas
- ✅ Crear y editar sesiones
- ✅ Ver sus propias estadísticas
- ❌ No puede gestionar centros ni terapeutas

**Nota**: En **Fase 1**, los permisos están hardcoded. En **Fase 2** (futuro), se podrán personalizar desde la UI.

---

## 🐛 Solución de Problemas

### Error: "Database connection failed"

**Causa**: Credenciales incorrectas o MySQL no está corriendo.

**Solución**:
```bash
# Verificar MySQL
mysql -u root -p

# En backend/.env, verifica:
DB_HOST=localhost
DB_NAME=acavall_harmony
DB_USER=root
DB_PASSWORD=tu_contraseña
```

---

### Error: "CORS policy blocked"

**Causa**: `CORS_ORIGIN` en backend no coincide con la URL del frontend.

**Solución**:

En `backend/.env`:
```env
CORS_ORIGIN=http://localhost:3000  # Desarrollo
# O
CORS_ORIGIN=https://yourdomain.com  # Producción
```

Reinicia el servidor PHP.

---

### Error: "401 Unauthorized" en todas las rutas

**Causa**: `JWT_SECRET` no coincide entre frontend y backend.

**Solución**:

Asegúrate que **ambos** `.env` tienen el **mismo** `JWT_SECRET`:

```bash
# Frontend: .env.local
JWT_SECRET=el-mismo-secret-exactamente-igual

# Backend: .env
JWT_SECRET=el-mismo-secret-exactamente-igual
```

Limpia cookies del navegador y vuelve a hacer login.

---

### Error: "Port already in use"

**Causa**: Puerto 8000 o 3000 ya está ocupado.

**Solución**:
```bash
# Encontrar proceso en puerto 8000
lsof -i :8000

# Matar proceso
kill -9 <PID>

# O usar otro puerto
php -S localhost:8001 -t public
```

---

### Frontend no conecta con Backend

**Checklist**:
1. ✅ Backend corriendo: `http://localhost:8000/api/health` debe responder
2. ✅ `NEXT_PUBLIC_API_URL` en `.env.local` es correcta
3. ✅ CORS configurado correctamente
4. ✅ No hay proxy/VPN bloqueando
5. ✅ Revisa consola del navegador (F12) para errores

---

### Migraciones fallan en Hostinger

**Causa**: Permisos o credenciales incorrectas.

**Solución**:
```bash
# Conectar directamente a MySQL
mysql -h localhost -u u123456_admin -p

# Verificar que la BD existe
SHOW DATABASES;

# Si no existe, crearla
CREATE DATABASE u123456_acavall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE u123456_acavall;

# Importar manualmente
SOURCE migrations/001_create_tables.sql;
SOURCE migrations/002_seed_data.sql;
```

---

## 📚 Documentación Adicional

- **[SETUP.md](SETUP.md)** - Guía completa de instalación con troubleshooting detallado
- **Backend API Docs** - Ver `/backend/README.md` (si existe)
- **Shadcn/UI** - [https://ui.shadcn.com/](https://ui.shadcn.com/)
- **Next.js** - [https://nextjs.org/docs](https://nextjs.org/docs)
- **Slim Framework** - [https://www.slimframework.com/](https://www.slimframework.com/)

---

## 🤝 Contribuir

Este es un proyecto privado de la Fundación Acavall.

---

## 📄 Licencia

Privado - © 2025 Fundación Acavall

---

## 🎯 Roadmap

### ✅ Fase 1 (Actual - Completado)
- [x] Autenticación JWT
- [x] CRUD de Centros, Terapeutas, Sesiones
- [x] Dashboard con calendario interactivo
- [x] Reportes de administración
- [x] Panel de impacto con métricas
- [x] Permisos hardcoded (Admin/Coordinator/Therapist)
- [x] Deploy en Hostinger

### 🔄 Fase 2 (Futuro)
- [ ] Sistema de roles customizable desde UI
- [ ] Gestión de permisos dinámicos
- [ ] Gestión de usuarios (crear/editar/eliminar)
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Notificaciones por email
- [ ] Logs de auditoría

### 💡 Fase 3 (Ideas)
- [ ] App móvil (React Native)
- [ ] Recordatorios automáticos de sesiones
- [ ] Chat interno entre terapeutas
- [ ] Integración con calendario Google/Outlook
- [ ] Dashboard público para stakeholders

---

## 📞 Soporte

Para problemas, preguntas o sugerencias:

1. Revisa esta documentación
2. Consulta `SETUP.md` para troubleshooting
3. Revisa logs:
   - Backend: `backend/logs/` (si existen)
   - Frontend: Consola del navegador (F12)
4. Contacta al equipo de desarrollo

---

## ⚡ Scripts Útiles

```bash
# Frontend
bun run dev          # Desarrollo
bun run build        # Build producción
bun run start        # Servidor producción
bun run lint         # Linter
bun run type-check   # Verificar tipos

# Backend
php -S localhost:8000 -t public        # Servidor desarrollo
composer install                        # Instalar dependencias
composer update                         # Actualizar dependencias
php migrations/run_migrations.php       # Ejecutar migraciones

# Database
mysql -u root -p acavall_harmony                    # Conectar a BD
mysqldump -u root -p acavall_harmony > backup.sql   # Backup
mysql -u root -p acavall_harmony < backup.sql       # Restore
```

---

## 🙏 Agradecimientos

Desarrollado con ❤️ para la Fundación Acavall

**Stack powered by**:
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Slim Framework](https://www.slimframework.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query)

---

**¿Todo listo?** 🚀

```bash
# 1. Instala dependencias
bun install && cd backend && composer install && cd ..

# 2. Configura .env
cp .env.local.example .env.local
cp backend/.env.example backend/.env

# 3. Ejecuta migraciones
php backend/migrations/run_migrations.php

# 4. Inicia servidores
# Terminal 1
cd backend && php -S localhost:8000 -t public

# Terminal 2
bun run dev

# 5. Abre http://localhost:3000
# Login: admin@acavall.org / password
```

¡A disfrutar de tu nueva aplicación! 🎉
