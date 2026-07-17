from fastapi import APIRouter, Depends

from app.auth.dependencies import UserContext, get_current_user
from app.schemas import OcorrenciaUpdate
from app.services import ocorrencia_service

router = APIRouter(prefix="/ocorrencias-vulnerabilidade", tags=["ocorrencias"])


@router.get("")
def listar(user: UserContext = Depends(get_current_user)):
    return ocorrencia_service.listar(user)


@router.patch("/{ocorrencia_id}")
def atualizar_status(ocorrencia_id: int, payload: OcorrenciaUpdate, user: UserContext = Depends(get_current_user)):
    return ocorrencia_service.atualizar_status(user, ocorrencia_id, payload.status)
