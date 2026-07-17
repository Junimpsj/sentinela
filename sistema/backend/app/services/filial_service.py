import mysql.connector
from fastapi import HTTPException, status

from app.auth.dependencies import UserContext
from app.db.pool import get_connection, get_transaction
from app.repositories import departamento_repo, filial_repo
from app.services import escopo

_SO_DONO = HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ação restrita ao dono da empresa")
_NOME_EM_USO = HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Filial já cadastrada")


def listar(user: UserContext) -> list[dict]:
    with get_connection() as conn:
        filiais = filial_repo.list_by_empresa(conn, user.empresa_id)
    if user.tipo_acesso in ("admin_filial", "colaborador"):
        filiais = [f for f in filiais if f["id"] == user.filial_id]
    return filiais


def criar(user: UserContext, nome: str, cidade: str, uf: str, endereco: str) -> dict:
    if user.tipo_acesso != "dono_empresa":
        raise _SO_DONO
    try:
        with get_transaction() as conn:
            filial_id = filial_repo.insert(conn, user.empresa_id, nome, cidade, uf, endereco)
    except mysql.connector.IntegrityError:
        raise _NOME_EM_USO
    return {"id": filial_id, "empresa_id": user.empresa_id, "nome": nome, "cidade": cidade, "uf": uf, "endereco": endereco}


def duplicar(user: UserContext, filial_id: int, nome: str, cidade: str, uf: str, endereco: str) -> dict:
    """RF04 — só dono; copia apenas a estrutura de departamentos, nunca usuários."""
    if user.tipo_acesso != "dono_empresa":
        raise _SO_DONO

    with get_connection() as conn:
        origem = filial_repo.get_by_id(conn, filial_id)
    escopo.validar_filial(user, origem)

    with get_transaction() as conn:
        nova_filial_id = filial_repo.insert(conn, user.empresa_id, nome, cidade, uf, endereco)
        departamentos_origem = departamento_repo.list_by_filial(conn, filial_id)
        for dep in departamentos_origem:
            departamento_repo.insert(conn, nova_filial_id, dep["nome"])

    return {"id": nova_filial_id, "empresa_id": user.empresa_id, "nome": nome, "cidade": cidade, "uf": uf, "endereco": endereco}
