from fastapi import APIRouter, Depends, status

from app.auth.dependencies import UserContext, get_current_user
from app.schemas import UsuarioCreate
from app.services import usuario_service

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("")
def listar(user: UserContext = Depends(get_current_user)):
    return usuario_service.listar(user)


@router.post("", status_code=status.HTTP_201_CREATED)
def criar(payload: UsuarioCreate, user: UserContext = Depends(get_current_user)):
    return usuario_service.criar(
        user, payload.nome, payload.email, payload.senha, payload.tipo_acesso, payload.filial_id, payload.departamento_id
    )
