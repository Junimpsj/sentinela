from fastapi import HTTPException, status

from app.auth.dependencies import UserContext
from app.db.pool import get_connection, get_transaction
from app.repositories import modelo_componente_repo, software_repo

_SEM_PERMISSAO = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Só dono ou admin de filial podem criar entradas no catálogo",
)


def _exige_dono_ou_admin(user: UserContext) -> None:
    """Decisão 2 — colaborador só consulta o catálogo global, nunca cria."""
    if user.tipo_acesso not in ("dono_empresa", "admin_filial"):
        raise _SEM_PERMISSAO


def listar_modelos_componente() -> list[dict]:
    with get_connection() as conn:
        return modelo_componente_repo.list_all(conn)


def buscar_ou_criar_modelo_componente(user: UserContext, tipo: str, fabricante: str, modelo: str) -> dict:
    _exige_dono_ou_admin(user)
    with get_transaction() as conn:
        existente = modelo_componente_repo.get_by_natural_key(conn, tipo, fabricante, modelo)
        if existente:
            return existente
        novo_id = modelo_componente_repo.insert(conn, tipo, fabricante, modelo)
    return {"id": novo_id, "tipo": tipo, "fabricante": fabricante, "modelo": modelo}


def listar_softwares() -> list[dict]:
    with get_connection() as conn:
        return software_repo.list_all(conn)


def buscar_ou_criar_software(user: UserContext, nome: str, fabricante: str, versao: str) -> dict:
    _exige_dono_ou_admin(user)
    with get_transaction() as conn:
        existente = software_repo.get_by_natural_key(conn, nome, fabricante, versao)
        if existente:
            return existente
        novo_id = software_repo.insert(conn, nome, fabricante, versao)
    return {"id": novo_id, "nome": nome, "fabricante": fabricante, "versao": versao}
