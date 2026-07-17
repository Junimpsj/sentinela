import mysql.connector
from fastapi import HTTPException, status

from app.auth.dependencies import UserContext
from app.db.pool import get_connection, get_transaction
from app.repositories import departamento_repo, filial_repo
from app.services import escopo

_SEM_PERMISSAO = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão para esta ação"
)
_NOME_EM_USO = HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Departamento já cadastrado")


def listar(user: UserContext, filial_id: int) -> list[dict]:
    with get_connection() as conn:
        filial = filial_repo.get_by_id(conn, filial_id)
        escopo.validar_filial(user, filial)
        departamentos = departamento_repo.list_by_filial(conn, filial_id)

    if user.tipo_acesso == "colaborador":
        departamentos = [d for d in departamentos if d["id"] == user.departamento_id]
    return departamentos


def criar(user: UserContext, filial_id: int, nome: str) -> dict:
    """RF05 — dono ou admin_filial (da própria filial)."""
    if user.tipo_acesso not in ("dono_empresa", "admin_filial"):
        raise _SEM_PERMISSAO

    with get_connection() as conn:
        filial = filial_repo.get_by_id(conn, filial_id)
    escopo.validar_filial(user, filial)

    try:
        with get_transaction() as conn:
            departamento_id = departamento_repo.insert(conn, filial_id, nome)
    except mysql.connector.IntegrityError:
        raise _NOME_EM_USO

    return {"id": departamento_id, "filial_id": filial_id, "nome": nome}
