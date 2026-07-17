from typing import Optional

from fastapi import APIRouter, Depends, status

from app.auth.dependencies import UserContext, get_current_user
from app.schemas import ModeloComponenteCreate, SoftwareCreate, VulnerabilidadeCreate
from app.services import catalogo_service, vulnerabilidade_service

router = APIRouter(prefix="/catalogos", tags=["catalogos"])


@router.get("/modelos-componente")
def listar_modelos_componente(user: UserContext = Depends(get_current_user)):
    return catalogo_service.listar_modelos_componente()


@router.post("/modelos-componente", status_code=status.HTTP_201_CREATED)
def criar_modelo_componente(payload: ModeloComponenteCreate, user: UserContext = Depends(get_current_user)):
    return catalogo_service.buscar_ou_criar_modelo_componente(user, payload.tipo, payload.fabricante, payload.modelo)


@router.get("/softwares")
def listar_softwares(user: UserContext = Depends(get_current_user)):
    return catalogo_service.listar_softwares()


@router.post("/softwares", status_code=status.HTTP_201_CREATED)
def criar_software(payload: SoftwareCreate, user: UserContext = Depends(get_current_user)):
    return catalogo_service.buscar_ou_criar_software(user, payload.nome, payload.fabricante, payload.versao)


@router.get("/vulnerabilidades")
def listar_vulnerabilidades(
    software_id: Optional[int] = None,
    componente_modelo_id: Optional[int] = None,
    user: UserContext = Depends(get_current_user),
):
    return vulnerabilidade_service.listar(software_id, componente_modelo_id)


@router.post("/vulnerabilidades", status_code=status.HTTP_201_CREATED)
def criar_vulnerabilidade(payload: VulnerabilidadeCreate, user: UserContext = Depends(get_current_user)):
    return vulnerabilidade_service.criar(
        user, payload.software_id, payload.componente_modelo_id, payload.codigo_cve, payload.severidade, payload.descricao
    )
