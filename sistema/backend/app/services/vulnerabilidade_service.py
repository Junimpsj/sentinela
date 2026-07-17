from datetime import datetime

import mysql.connector
from fastapi import HTTPException, status

from app.auth.dependencies import UserContext
from app.db.pool import get_connection, get_transaction
from app.repositories import componente_repo, equipamento_software_repo, ocorrencia_repo, vulnerabilidade_repo

_SEM_PERMISSAO = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Só dono ou admin de filial podem cadastrar vulnerabilidades",
)
_CVE_EM_USO = HTTPException(status_code=status.HTTP_409_CONFLICT, detail="CVE já cadastrado")


def _checar_e_registrar_ocorrencia(conn, equipamento_id: int, vulnerabilidade_id: int) -> None:
    """Decisão 4/5 — não duplica ocorrência pendente; reabertura é sempre nova linha."""
    if not ocorrencia_repo.existe_pendente(conn, equipamento_id, vulnerabilidade_id):
        ocorrencia_repo.insert(conn, equipamento_id, vulnerabilidade_id, datetime.now())


def detectar_ao_instalar_software(conn, equipamento_id: int, software_id: int) -> None:
    """Gatilho 1 (decisão 4) — roda dentro da mesma transação do INSERT em equipamento_software."""
    for vuln in vulnerabilidade_repo.list_all(conn, software_id=software_id):
        _checar_e_registrar_ocorrencia(conn, equipamento_id, vuln["id"])


def detectar_ao_instalar_componente(conn, equipamento_id: int, modelo_componente_id: int) -> None:
    """Gatilho 2 (decisão 4) — roda dentro da mesma transação do INSERT em componente."""
    for vuln in vulnerabilidade_repo.list_all(conn, componente_modelo_id=modelo_componente_id):
        _checar_e_registrar_ocorrencia(conn, equipamento_id, vuln["id"])


def _detectar_ao_cadastrar_vulnerabilidade(conn, vulnerabilidade: dict) -> None:
    """Gatilho 3 (decisão 4) — contra TODOS os equipamentos afetados, não só um."""
    if vulnerabilidade["software_id"] is not None:
        equipamentos = equipamento_software_repo.list_equipamentos_com_software(
            conn, vulnerabilidade["software_id"]
        )
    else:
        equipamentos = componente_repo.list_equipamentos_com_modelo_ativo(
            conn, vulnerabilidade["componente_modelo_id"]
        )
    for equipamento_id in equipamentos:
        _checar_e_registrar_ocorrencia(conn, equipamento_id, vulnerabilidade["id"])


def listar(software_id: int | None, componente_modelo_id: int | None) -> list[dict]:
    with get_connection() as conn:
        return vulnerabilidade_repo.list_all(conn, software_id=software_id, componente_modelo_id=componente_modelo_id)


def criar(
    user: UserContext,
    software_id: int | None,
    componente_modelo_id: int | None,
    codigo_cve: str,
    severidade: str,
    descricao: str,
) -> dict:
    if user.tipo_acesso not in ("dono_empresa", "admin_filial"):
        raise _SEM_PERMISSAO
    if (software_id is None) == (componente_modelo_id is None):
        raise HTTPException(
            status_code=422, detail="Informe exatamente um de software_id ou componente_modelo_id"
        )

    try:
        with get_transaction() as conn:
            vulnerabilidade_id = vulnerabilidade_repo.insert(
                conn, software_id, componente_modelo_id, codigo_cve, severidade, descricao
            )
            vulnerabilidade = vulnerabilidade_repo.get_by_id(conn, vulnerabilidade_id)
            _detectar_ao_cadastrar_vulnerabilidade(conn, vulnerabilidade)
    except mysql.connector.IntegrityError:
        raise _CVE_EM_USO

    return vulnerabilidade
