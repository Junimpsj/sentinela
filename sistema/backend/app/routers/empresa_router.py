from fastapi import APIRouter, Depends, status

from app.auth.dependencies import UserContext, get_current_user
from app.schemas import EmpresaCreate
from app.services import empresa_service

router = APIRouter(prefix="/empresas", tags=["empresas"])


@router.post("", status_code=status.HTTP_201_CREATED)
def criar_empresa(payload: EmpresaCreate):
    return empresa_service.criar_empresa(
        payload.razao_social, payload.cnpj, payload.email, payload.dono_nome, payload.dono_email, payload.dono_senha
    )


@router.get("/me")
def obter_atual(user: UserContext = Depends(get_current_user)):
    return empresa_service.obter_atual(user)
