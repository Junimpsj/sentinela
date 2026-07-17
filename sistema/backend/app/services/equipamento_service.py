import mysql.connector
from fastapi import HTTPException, status

from app.auth.dependencies import UserContext
from app.db.pool import get_connection, get_transaction
from app.repositories import departamento_repo, equipamento_repo, filial_repo
from app.services import escopo

_SEM_PERMISSAO = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão para esta ação"
)
_PATRIMONIO_EM_USO = HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Patrimônio já cadastrado")


def listar(
    user: UserContext,
    filial_id: int | None,
    departamento_id: int | None,
    tipo: str | None,
    status_filtro: str | None,
) -> list[dict]:
    # Cliente só pode restringir dentro do escopo do token, nunca ampliar (seção 3.1).
    if user.tipo_acesso == "colaborador":
        departamento_id = user.departamento_id
        filial_id = user.filial_id
    elif user.tipo_acesso == "admin_filial":
        filial_id = user.filial_id
        if departamento_id is not None:
            with get_connection() as conn:
                dep = departamento_repo.get_by_id(conn, departamento_id)
            if dep is None or dep["filial_id"] != user.filial_id:
                escopo.negar()
    else:  # dono_empresa
        if departamento_id is not None:
            with get_connection() as conn:
                dep = departamento_repo.get_by_id(conn, departamento_id)
                filial = filial_repo.get_by_id(conn, dep["filial_id"] if dep else -1)
            escopo.validar_filial(user, filial)
            filial_id = dep["filial_id"]
        elif filial_id is not None:
            with get_connection() as conn:
                filial = filial_repo.get_by_id(conn, filial_id)
            escopo.validar_filial(user, filial)

    with get_connection() as conn:
        return equipamento_repo.list_by_scope(
            conn, user.empresa_id, filial_id=filial_id, departamento_id=departamento_id, tipo=tipo, status=status_filtro
        )


def obter(user: UserContext, equipamento_id: int) -> dict:
    with get_connection() as conn:
        equipamento = equipamento_repo.get_by_id(conn, equipamento_id)
    return escopo.validar_equipamento(user, equipamento)


def criar(
    user: UserContext,
    filial_id: int,
    departamento_id: int,
    tipo: str,
    patrimonio: str,
    hostname: str | None,
    endereco_ip: str | None,
) -> dict:
    """RF08 — dono ou admin_filial (só a própria filial); departamento_id obrigatório (decisão 6)."""
    if user.tipo_acesso not in ("dono_empresa", "admin_filial"):
        raise _SEM_PERMISSAO

    with get_connection() as conn:
        filial = filial_repo.get_by_id(conn, filial_id)
    escopo.validar_filial(user, filial)

    with get_connection() as conn:
        dep = departamento_repo.get_by_id(conn, departamento_id)
    if dep is None or dep["filial_id"] != filial_id:
        raise HTTPException(status_code=422, detail="Departamento não pertence à filial informada")

    try:
        with get_transaction() as conn:
            equipamento_id = equipamento_repo.insert(
                conn, filial_id, departamento_id, tipo, patrimonio, hostname, endereco_ip
            )
    except mysql.connector.IntegrityError:
        raise _PATRIMONIO_EM_USO

    return {
        "id": equipamento_id,
        "filial_id": filial_id,
        "departamento_id": departamento_id,
        "tipo": tipo,
        "patrimonio": patrimonio,
        "hostname": hostname,
        "endereco_ip": endereco_ip,
        "status": "ativo",
    }
