from fastapi import APIRouter, Depends, status

from app.auth.dependencies import UserContext, get_current_user
from app.schemas import FilialCreate
from app.services import filial_service

router = APIRouter(prefix="/filiais", tags=["filiais"])


@router.get("")
def listar(user: UserContext = Depends(get_current_user)):
    return filial_service.listar(user)


@router.post("", status_code=status.HTTP_201_CREATED)
def criar(payload: FilialCreate, user: UserContext = Depends(get_current_user)):
    return filial_service.criar(user, payload.nome, payload.cidade, payload.uf, payload.endereco)


@router.post("/{filial_id}/duplicar", status_code=status.HTTP_201_CREATED)
def duplicar(filial_id: int, payload: FilialCreate, user: UserContext = Depends(get_current_user)):
    return filial_service.duplicar(user, filial_id, payload.nome, payload.cidade, payload.uf, payload.endereco)
