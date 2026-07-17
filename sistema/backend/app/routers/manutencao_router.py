from fastapi import APIRouter, Depends

from app.auth.dependencies import UserContext, get_current_user
from app.services import manutencao_service

router = APIRouter(prefix="/manutencoes", tags=["manutencoes"])


@router.patch("/{manutencao_id}")
def encerrar(manutencao_id: int, user: UserContext = Depends(get_current_user)):
    return manutencao_service.encerrar(user, manutencao_id)
