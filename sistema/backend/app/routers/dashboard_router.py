from typing import Optional

from fastapi import APIRouter, Depends

from app.auth.dependencies import UserContext, get_current_user
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/resumo")
def resumo(filial_id: Optional[int] = None, user: UserContext = Depends(get_current_user)):
    return dashboard_service.resumo(user, filial_id)


@router.get("/mapa-exposicao")
def mapa_exposicao(user: UserContext = Depends(get_current_user)):
    return dashboard_service.mapa_exposicao(user)
