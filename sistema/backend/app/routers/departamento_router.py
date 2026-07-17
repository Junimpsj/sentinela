from fastapi import APIRouter, Depends, status

from app.auth.dependencies import UserContext, get_current_user
from app.schemas import DepartamentoCreate
from app.services import departamento_service

router = APIRouter(prefix="/departamentos", tags=["departamentos"])


@router.get("")
def listar(filial_id: int, user: UserContext = Depends(get_current_user)):
    return departamento_service.listar(user, filial_id)


@router.post("", status_code=status.HTTP_201_CREATED)
def criar(payload: DepartamentoCreate, user: UserContext = Depends(get_current_user)):
    return departamento_service.criar(user, payload.filial_id, payload.nome)
