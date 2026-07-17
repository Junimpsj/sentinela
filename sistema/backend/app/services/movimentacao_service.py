from datetime import datetime

from fastapi import HTTPException

from app.auth.dependencies import UserContext
from app.db.pool import get_connection, get_transaction
from app.repositories import departamento_repo, equipamento_repo, movimentacao_repo
from app.services import escopo


def listar(user: UserContext, equipamento_id: int) -> list[dict]:
    with get_connection() as conn:
        equipamento = equipamento_repo.get_by_id(conn, equipamento_id)
        escopo.validar_equipamento(user, equipamento)
        return movimentacao_repo.list_by_equipamento(conn, equipamento_id)


def registrar(user: UserContext, equipamento_id: int, departamento_destino_id: int, motivo: str | None) -> dict:
    """RF19 — origem sempre derivada do servidor (decisão 7), nunca do client.
    RNF09: origem e destino têm que ser da mesma filial do equipamento."""
    with get_connection() as conn:
        equipamento = equipamento_repo.get_by_id(conn, equipamento_id)
        escopo.validar_equipamento(user, equipamento)

        origem_id = equipamento["departamento_id"]
        if origem_id is None:
            raise HTTPException(
                status_code=422,
                detail="Equipamento sem departamento vinculado — recadastre o vínculo antes de movimentar",
            )

        # Colaborador só movimenta equipamento que está no seu próprio departamento.
        if user.tipo_acesso == "colaborador" and origem_id != user.departamento_id:
            escopo.negar()

        destino = departamento_repo.get_by_id(conn, departamento_destino_id)
        if destino is None or destino["filial_id"] != equipamento["filial_id"]:
            raise HTTPException(
                status_code=422, detail="Departamento de destino precisa pertencer à mesma filial do equipamento"
            )

    agora = datetime.now()
    with get_transaction() as conn:
        movimentacao_id = movimentacao_repo.insert(conn, equipamento_id, origem_id, departamento_destino_id, agora, motivo)
        equipamento_repo.update_departamento(conn, equipamento_id, departamento_destino_id)

    return {
        "id": movimentacao_id,
        "equipamento_id": equipamento_id,
        "departamento_origem_id": origem_id,
        "departamento_destino_id": departamento_destino_id,
        "data": agora,
        "motivo": motivo,
    }
