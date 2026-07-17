from fastapi import HTTPException, status

from app.auth.dependencies import UserContext
from app.db.pool import get_connection
from app.repositories import dashboard_repo, filial_repo
from app.services import escopo

_NAO_SE_APLICA = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN, detail="Mapa de exposição não se aplica a este perfil"
)


def resumo(user: UserContext, filial_id: int | None) -> dict:
    if user.tipo_acesso == "colaborador":
        filial_id = None  # scope já é o departamento, aplicado abaixo
        departamento_id = user.departamento_id
    elif user.tipo_acesso == "admin_filial":
        filial_id = user.filial_id
        departamento_id = None
    else:  # dono_empresa — pode opcionalmente restringir a uma filial própria
        departamento_id = None
        if filial_id is not None:
            with get_connection() as conn:
                filial = filial_repo.get_by_id(conn, filial_id)
            escopo.validar_filial(user, filial)

    with get_connection() as conn:
        return dashboard_repo.resumo(conn, user.empresa_id, filial_id=filial_id, departamento_id=departamento_id)


def mapa_exposicao(user: UserContext) -> list[dict]:
    """Decisão da seção 3.2: não se aplica a colaborador — opção mais simples adotada."""
    if user.tipo_acesso == "colaborador":
        raise _NAO_SE_APLICA

    with get_connection() as conn:
        if user.tipo_acesso == "dono_empresa":
            return dashboard_repo.mapa_exposicao_por_filial(conn, user.empresa_id)
        return dashboard_repo.mapa_exposicao_por_departamento(conn, user.filial_id)
