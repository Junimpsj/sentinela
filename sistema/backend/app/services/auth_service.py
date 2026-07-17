from fastapi import HTTPException, status

from app.auth.security import create_token, hash_password, verify_password
from app.db.pool import get_connection
from app.repositories import usuario_repo

_CREDENCIAIS_INVALIDAS = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou senha inválidos"
)

# hash dummy só pra gastar o mesmo tempo de bcrypt quando o email não existe,
# evitando que o tempo de resposta revele se um email está cadastrado.
_HASH_DUMMY = hash_password("hash-dummy-tempo-constante")


def login(email: str, senha: str) -> tuple[dict, str]:
    with get_connection() as conn:
        usuario = usuario_repo.get_by_email(conn, email)

    hash_para_checar = usuario["senha"] if usuario else _HASH_DUMMY
    senha_confere = verify_password(senha, hash_para_checar)

    if usuario is None or not senha_confere:
        # sem rate limit aqui — fora do escopo desta fase (seção 4.11).
        # Produção: inserir throttling por IP/email neste ponto.
        raise _CREDENCIAIS_INVALIDAS

    token = create_token(
        {
            "usuario_id": usuario["id"],
            "empresa_id": usuario["empresa_id"],
            "filial_id": usuario["filial_id"],
            "departamento_id": usuario["departamento_id"],
            "tipo_acesso": usuario["tipo_acesso"],
        }
    )
    usuario.pop("senha")
    return usuario, token
