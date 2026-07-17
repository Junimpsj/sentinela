from fastapi import HTTPException

from app.auth.dependencies import UserContext
from app.db.pool import get_connection, get_transaction
from app.repositories import equipamento_repo, equipamento_software_repo, software_repo
from app.services import escopo, vulnerabilidade_service


def listar(user: UserContext, equipamento_id: int) -> list[dict]:
    with get_connection() as conn:
        equipamento = equipamento_repo.get_by_id(conn, equipamento_id)
        escopo.validar_equipamento(user, equipamento)
        return equipamento_software_repo.list_by_equipamento(conn, equipamento_id)


def registrar(
    user: UserContext,
    equipamento_id: int,
    software_id: int,
    data_instalacao,
    chave_licenca: str | None,
    validade_licenca,
) -> dict:
    """RF12/RF13 — a partir do catálogo global software; duplicata permitida (decisão 9)."""
    with get_connection() as conn:
        equipamento = equipamento_repo.get_by_id(conn, equipamento_id)
        escopo.validar_equipamento(user, equipamento)
        software = software_repo.get_by_id(conn, software_id)
    if software is None:
        raise HTTPException(status_code=422, detail="Software inexistente no catálogo")

    with get_transaction() as conn:
        instalacao_id = equipamento_software_repo.insert(
            conn, equipamento_id, software_id, data_instalacao, chave_licenca, validade_licenca
        )
        vulnerabilidade_service.detectar_ao_instalar_software(conn, equipamento_id, software_id)

    return {
        "id": instalacao_id,
        "equipamento_id": equipamento_id,
        "software_id": software_id,
        "data_instalacao": data_instalacao,
        "chave_licenca": chave_licenca,
        "validade_licenca": validade_licenca,
    }
