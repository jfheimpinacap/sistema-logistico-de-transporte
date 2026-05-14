# Sistema Logístico de Transporte

Sistema logístico tipo TMS liviano para iniciar el control operativo de transporte de mercancías, encomiendas, paquetes y documentación interna de traslado.

> Estado actual: **Prompt 001 — Inicialización base**. El repositorio solo contiene la estructura inicial del monorepo y una pantalla base; todavía no implementa módulos funcionales de negocio.

## Stack inicial

- **Backend:** Django + Django REST Framework.
- **Frontend:** React + Vite + TypeScript.
- **Estilos frontend:** Tailwind CSS.
- **Base de datos inicial:** SQLite.
- **Base de datos futura:** PostgreSQL/PostGIS, no implementada todavía.
- **Orquestación local:** `start.py` en la raíz del proyecto.

## Estructura de carpetas

```text
sistema-logistico-de-transporte/
├── apps/
│   ├── backend/
│   │   ├── apps/
│   │   ├── config/
│   │   ├── manage.py
│   │   └── requirements.txt
│   └── frontend/
│       ├── public/
│       ├── src/
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
├── docs/
├── scripts/
├── .env.example
├── .gitignore
├── README.md
└── start.py
```

## Puertos definidos

- Backend Django: `http://localhost:8002`
- Frontend Vite: `http://localhost:5175`

## Configuración de entorno

Copia el archivo de ejemplo antes de ejecutar el proyecto localmente:

```bash
cp .env.example .env
```

En Windows también puedes usar:

```powershell
copy .env.example .env
```

## Comandos básicos esperados

Preparar dependencias:

```bash
py start.py prepare
```

Iniciar backend:

```bash
py start.py backend
```

Iniciar frontend:

```bash
py start.py frontend
```

Iniciar entorno de desarrollo local:

```bash
py start.py
```

El comando sin argumentos asume `dev`. En Windows intenta abrir backend y frontend en terminales separadas.

## Alcance actual

Incluye únicamente:

- Estructura base del monorepo.
- Configuración mínima de Django con endpoint de salud `GET /api/health/`.
- App React inicial con el texto “Sistema Logístico de Transporte” y “Panel operativo inicial”.
- Orquestador local `start.py`.

No incluye todavía modelos logísticos, autenticación JWT, CRUDs, dashboard avanzado, GPS, documentos internos ni app conductor.
