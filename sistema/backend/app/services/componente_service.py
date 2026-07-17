from fastapi import HTTPException

from app.auth.dependencies import UserContext
from app.db.pool import get_connection, get_transaction
from app.repositories import componente_repo, equipamento_repo, modelo_componente_repo
from app.services import escopo, vulnerabilidade_service


def listar(user: UserContext, equipamento_id: int) -> list[dict]:
    with get_connection() as conn:
        equipamento = equipamento_repo.get_by_id(conn, equipamento_id)
        escopo.validar_equipamento(user, equipamento)
        return componente_repo.list_by_equipamento(conn, equipamento_id)


def registrar(user: UserContext, equipamento_id: int, modelo_componente_id: int, data_instalacao) -> dict:
    """RF09 — a partir do catálogo global modelo_componente."""
    with get_connection() as conn:
        equipamento = equipamento_repo.get_by_id(conn, equipamento_id)
        escopo.validar_equipamento(user, equipamento)
        modelo = modelo_componente_repo.get_by_id(conn, modelo_componente_id)
    if modelo is None:
        raise HTTPException(status_code=422, detail="Modelo de componente inexistente")

    with get_transaction() as conn:
        componente_id = componente_repo.insert(
            conn, equipamento_id, modelo_componente_id, None, "ativo", data_instalacao
        )
        vulnerabilidade_service.detectar_ao_instalar_componente(conn, equipamento_id, modelo_componente_id)

    return {
        "id": componente_id,
        "equipamento_id": equipamento_id,
        "modelo_componente_id": modelo_componente_id,
        "status": "ativo",
        "data_instalacao": data_instalacao,
    }
