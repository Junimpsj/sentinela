from datetime import datetime

from fastapi import HTTPException

from app.auth.dependencies import UserContext
from app.db.pool import get_connection, get_transaction
from app.repositories import equipamento_repo, ocorrencia_repo
from app.services import escopo

_TRANSICOES_VALIDAS = {"corrigido", "ignorado"}


def listar_por_equipamento(user: UserContext, equipamento_id: int) -> list[dict]:
    with get_connection() as conn:
        equipamento = equipamento_repo.get_by_id(conn, equipamento_id)
        escopo.validar_equipamento(user, equipamento)
        return ocorrencia_repo.list_by_equipamento(conn, equipamento_id)


def listar(user: UserContext) -> list[dict]:
    with get_connection() as conn:
        return ocorrencia_repo.list_by_scope(
            conn, user.empresa_id, filial_id=user.filial_id, departamento_id=user.departamento_id
        )


def atualizar_status(user: UserContext, ocorrencia_id: int, novo_status: str) -> dict:
    """RF17 — decisão 8: só pendente → corrigido/ignorado. Reabertura é sempre nova linha (decisão 5)."""
    with get_connection() as conn:
        ocorrencia = ocorrencia_repo.get_by_id(conn, ocorrencia_id)
    escopo.validar_equipamento(user, ocorrencia)

    if ocorrencia["status"] != "pendente" or novo_status not in _TRANSICOES_VALIDAS:
        raise HTTPException(status_code=422, detail="Transição de status inválida")

    agora = datetime.now()
    with get_transaction() as conn:
        ocorrencia_repo.update_status(conn, ocorrencia_id, novo_status, agora)

    ocorrencia["status"] = novo_status
    ocorrencia["data_resolucao"] = agora
    return ocorrencia
