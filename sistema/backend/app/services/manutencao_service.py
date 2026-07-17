from datetime import datetime

from fastapi import HTTPException, status

from app.auth.dependencies import UserContext
from app.db.pool import get_connection, get_transaction
from app.repositories import componente_repo, equipamento_repo, manutencao_repo
from app.services import escopo

_TRANSICAO_INVALIDA = HTTPException(status_code=422, detail="Só é possível encerrar manutenção aberta")


def listar(user: UserContext, equipamento_id: int) -> list[dict]:
    with get_connection() as conn:
        equipamento = equipamento_repo.get_by_id(conn, equipamento_id)
        escopo.validar_equipamento(user, equipamento)
        return manutencao_repo.list_by_equipamento(conn, equipamento_id)


def registrar(
    user: UserContext,
    equipamento_id: int,
    data,
    descricao: str,
    troca_componente: dict | None = None,
) -> dict:
    """RF10/RF11 — decisão 1: colaborador pode registrar no próprio departamento,
    sem camada extra de permissão. Troca de componente (decisão 3) é atômica."""
    with get_connection() as conn:
        equipamento = equipamento_repo.get_by_id(conn, equipamento_id)
        escopo.validar_equipamento(user, equipamento)
        if troca_componente is not None:
            componente_antigo = componente_repo.get_by_id(conn, troca_componente["componente_antigo_id"])
            if componente_antigo is None or componente_antigo["equipamento_id"] != equipamento_id:
                raise HTTPException(status_code=422, detail="Componente antigo não pertence a este equipamento")

    with get_transaction() as conn:
        manutencao_id = manutencao_repo.insert(conn, equipamento_id, data, descricao, "aberta")

        if troca_componente is not None:
            agora = datetime.now()
            componente_repo.marcar_substituido(conn, troca_componente["componente_antigo_id"], agora)
            componente_repo.insert(
                conn,
                equipamento_id,
                troca_componente["modelo_componente_id_novo"],
                manutencao_id,
                "ativo",
                agora,
            )

    return {"id": manutencao_id, "equipamento_id": equipamento_id, "data": data, "descricao": descricao, "status": "aberta"}


def encerrar(user: UserContext, manutencao_id: int) -> dict:
    with get_connection() as conn:
        manutencao = manutencao_repo.get_by_id(conn, manutencao_id)
    escopo.validar_equipamento(user, manutencao)  # manutencao já traz filial_id/departamento_id/empresa_id

    if manutencao["status"] != "aberta":
        raise _TRANSICAO_INVALIDA

    with get_transaction() as conn:
        manutencao_repo.update_status(conn, manutencao_id, "concluida")

    manutencao["status"] = "concluida"
    return manutencao
