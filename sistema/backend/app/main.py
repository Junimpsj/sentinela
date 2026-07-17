from pathlib import Path

from fastapi import FastAPI
from starlette.staticfiles import StaticFiles

from app.routers import (
    auth_router,
    catalogo_router,
    dashboard_router,
    departamento_router,
    empresa_router,
    equipamento_router,
    filial_router,
    manutencao_router,
    ocorrencia_router,
    usuario_router,
)

app = FastAPI(title="Sentinela")

api = FastAPI()
for router in (
    auth_router.router,
    empresa_router.router,
    filial_router.router,
    departamento_router.router,
    usuario_router.router,
    equipamento_router.router,
    catalogo_router.router,
    manutencao_router.router,
    ocorrencia_router.router,
    dashboard_router.router,
):
    api.include_router(router)

app.mount("/api/v1", api)

# Frontend estático — mesma origem do backend, sem CORS (seção 1.1).
FRONTEND_DIR = Path(__file__).resolve().parents[2] / "frontend"
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
