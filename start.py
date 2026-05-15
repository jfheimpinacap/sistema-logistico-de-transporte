#!/usr/bin/env python
"""Local orchestrator for sistema-logistico-de-transporte.

Primary target: Windows + Visual Studio Code, executed as `py start.py`.
"""
from __future__ import annotations

import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "apps" / "backend"
FRONTEND_DIR = ROOT_DIR / "apps" / "frontend"
ENV_EXAMPLE = ROOT_DIR / ".env.example"
ENV_FILE = ROOT_DIR / ".env"

DEFAULT_ENV = {
    "APP_OPEN_URL": "http://localhost:5175",
    "FRONTEND_PORT": "5175",
    "BACKEND_PORT": "8002",
    "DJANGO_DEBUG": "True",
    "DJANGO_SECRET_KEY": "change-me",
    "DJANGO_ALLOWED_HOSTS": "localhost,127.0.0.1",
    "CORS_ALLOWED_ORIGINS": "http://localhost:5175,http://127.0.0.1:5175",
}


def load_env() -> dict[str, str]:
    """Load .env values when present and fall back to safe local defaults."""
    env = DEFAULT_ENV.copy()
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("#") or "=" not in stripped:
                continue
            key, value = stripped.split("=", 1)
            env[key.strip()] = value.strip().strip('"').strip("'")
    else:
        print("[INFO] No existe .env. Usando valores por defecto.")
        print(f"[INFO] Puedes crear uno con: copy {ENV_EXAMPLE.name} .env")

    os.environ.update(env)
    return env


def npm_command() -> str | None:
    """Return the npm executable available for the current platform."""
    candidates = ["npm.cmd", "npm"] if platform.system() == "Windows" else ["npm", "npm.cmd"]
    for candidate in candidates:
        found = shutil.which(candidate)
        if found:
            return found
    return None


def run_checked(command: list[str], cwd: Path) -> int:
    """Run a command and show a friendly message if the executable is missing."""
    try:
        return subprocess.call(command, cwd=cwd)
    except FileNotFoundError:
        print(f"[ERROR] No se encontró el comando: {command[0]}")
        return 1


def run_manage(command: list[str]) -> int:
    """Run a Django management command with the current Python executable."""
    manage_py = BACKEND_DIR / "manage.py"
    if not manage_py.exists():
        print("[ERROR] No existe apps/backend/manage.py")
        return 1
    return run_checked([sys.executable, str(manage_py), *command], ROOT_DIR)


def prepare() -> int:
    """Install dependencies, run migrations, and seed development data."""
    load_env()
    exit_code = 0
    backend_ready = False

    print("[PREPARE] Preparando dependencias del backend...")
    requirements = BACKEND_DIR / "requirements.txt"
    if requirements.exists():
        backend_code = run_checked(
            [sys.executable, "-m", "pip", "install", "-r", str(requirements)],
            ROOT_DIR,
        )
        exit_code = exit_code or backend_code
        backend_ready = backend_code == 0
    else:
        print("[WARN] No se encontró apps/backend/requirements.txt")
        exit_code = exit_code or 1

    if backend_ready:
        print("[PREPARE] Ejecutando migraciones del backend...")
        migrate_code = run_manage(["migrate"])
        exit_code = exit_code or migrate_code

        if migrate_code == 0:
            print("[PREPARE] Creando o actualizando usuario demo...")
            seed_code = run_manage(["seed_demo_user"])
            exit_code = exit_code or seed_code

            print("[PREPARE] Creando o actualizando datos maestros logísticos demo...")
            logistics_seed_code = run_manage(["seed_demo_logistics"])
            if logistics_seed_code != 0:
                print(
                    "[WARN] No se pudieron sembrar datos logísticos demo. "
                    "Verifica dependencias, migraciones o disponibilidad del comando."
                )
            exit_code = exit_code or logistics_seed_code

            print("[PREPARE] Creando o actualizando encomiendas demo...")
            operations_seed_code = run_manage(["seed_demo_operations"])
            if operations_seed_code != 0:
                print(
                    "[WARN] No se pudieron sembrar encomiendas demo. "
                    "Verifica dependencias, migraciones o disponibilidad del comando."
                )
            exit_code = exit_code or operations_seed_code

            print("[PREPARE] Creando o actualizando rutas demo...")
            routes_seed_code = run_manage(["seed_demo_routes"])
            if routes_seed_code != 0:
                print(
                    "[WARN] No se pudieron sembrar rutas demo. "
                    "Verifica dependencias, migraciones o disponibilidad del comando."
                )
            exit_code = exit_code or routes_seed_code

            print("[PREPARE] Creando o actualizando evidencias e incidencias demo...")
            fieldops_seed_code = run_manage(["seed_demo_fieldops"])
            if fieldops_seed_code != 0:
                print(
                    "[WARN] No se pudieron sembrar evidencias/incidencias demo. "
                    "Verifica dependencias, migraciones o disponibilidad del comando."
                )
            exit_code = exit_code or fieldops_seed_code
    else:
        print("[WARN] Se omiten migraciones y usuario demo porque el backend no quedó listo.")

    print("[PREPARE] Preparando dependencias del frontend...")
    npm = npm_command()
    package_json = FRONTEND_DIR / "package.json"
    if npm and package_json.exists():
        frontend_code = run_checked([npm, "install"], FRONTEND_DIR)
        exit_code = exit_code or frontend_code
    elif not npm:
        print("[WARN] npm no está disponible. Instala Node.js y vuelve a ejecutar prepare.")
        exit_code = exit_code or 1
    else:
        print("[WARN] No se encontró apps/frontend/package.json")
        exit_code = exit_code or 1

    return exit_code


def backend() -> int:
    """Start Django development server on the configured backend port."""
    env = load_env()
    manage_py = BACKEND_DIR / "manage.py"
    if not manage_py.exists():
        print("[ERROR] No existe apps/backend/manage.py")
        return 1

    port = env.get("BACKEND_PORT", DEFAULT_ENV["BACKEND_PORT"])
    print(f"[BACKEND] Iniciando Django en http://localhost:{port}")
    print("[BACKEND] Si faltan dependencias, ejecuta: py start.py prepare")
    return run_checked([sys.executable, str(manage_py), "runserver", f"0.0.0.0:{port}"], BACKEND_DIR)


def frontend() -> int:
    """Start Vite development server on the configured frontend port."""
    env = load_env()
    npm = npm_command()
    if not npm:
        print("[ERROR] npm no está disponible. Instala Node.js y ejecuta: py start.py prepare")
        return 1

    package_json = FRONTEND_DIR / "package.json"
    if not package_json.exists():
        print("[ERROR] No existe apps/frontend/package.json")
        return 1

    port = env.get("FRONTEND_PORT", DEFAULT_ENV["FRONTEND_PORT"])
    print(f"[FRONTEND] Iniciando Vite en http://localhost:{port}")
    print("[FRONTEND] Si faltan dependencias, ejecuta: py start.py prepare")
    return run_checked([npm, "run", "dev", "--", "--port", port], FRONTEND_DIR)


def open_windows_terminal(command: str, title: str) -> int:
    """Open a new Windows terminal window with a command."""
    try:
        subprocess.Popen(["cmd", "/c", "start", title, "cmd", "/k", command], cwd=ROOT_DIR)
        return 0
    except FileNotFoundError:
        print("[ERROR] No se pudo abrir cmd.exe")
        return 1


def dev() -> int:
    """Start backend and frontend; on Windows use separated terminals."""
    env = load_env()
    print("[DEV] Iniciando entorno local de desarrollo.")
    print(f"[DEV] URL principal: {env.get('APP_OPEN_URL', DEFAULT_ENV['APP_OPEN_URL'])}")

    if platform.system() == "Windows":
        python_cmd = f'"{sys.executable}" start.py'
        code_backend = open_windows_terminal(f"{python_cmd} backend", "SLT Backend")
        code_frontend = open_windows_terminal(f"{python_cmd} frontend", "SLT Frontend")
        print("[DEV] Backend y frontend solicitados en terminales separadas.")
        return code_backend or code_frontend

    print("[DEV] En sistemas no Windows ejecuta en terminales separadas:")
    print("      python start.py backend")
    print("      python start.py frontend")
    return 0


def help_message() -> None:
    print("Uso: py start.py [dev|backend|frontend|prepare]")
    print("Sin argumentos se ejecuta: dev")


def main() -> int:
    command = sys.argv[1].lower() if len(sys.argv) > 1 else "dev"
    commands = {
        "dev": dev,
        "backend": backend,
        "frontend": frontend,
        "prepare": prepare,
    }

    if command not in commands:
        help_message()
        return 1

    return commands[command]()


if __name__ == "__main__":
    raise SystemExit(main())
