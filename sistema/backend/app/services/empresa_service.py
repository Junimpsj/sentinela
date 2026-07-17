import mysql.connector
from fastapi import HTTPException, status

from app.auth.dependencies import UserContext
from app.auth.security import hash_password
from app.db.pool import get_connection, get_transaction
from app.repositories import empresa_repo, usuario_repo

_EMAIL_CNPJ_EM_USO = HTTPException(
    status_code=status.HTTP_409_CONFLICT, detail="CNPJ ou email já cadastrado"
)


def criar_empresa(
    razao_social: str, cnpj: str, email: str, dono_nome: str, dono_email: str, dono_senha: str
) -> dict:
    """RF01 — cria empresa + usuário dono_empresa inicial na mesma transação."""
    try:
        with get_transaction() as conn:
            empresa_id = empresa_repo.insert(conn, razao_social, cnpj, email)
            senha_hash = hash_password(dono_senha)
            usuario_id = usuario_repo.insert(
                conn, empresa_id, None, None, dono_nome, dono_email, senha_hash, "dono_empresa"
            )
    except mysql.connector.IntegrityError:
        raise _EMAIL_CNPJ_EM_USO

    return {"empresa_id": empresa_id, "usuario_id": usuario_id}


def obter_atual(user: UserContext) -> dict:
    """Dados básicos da empresa do usuário logado — escopo é o próprio JWT, sem parâmetro de entrada."""
    with get_connection() as conn:
        empresa = empresa_repo.get_by_id(conn, user.empresa_id)
    return empresa
