import mysql.connector
from fastapi import HTTPException, status

from app.auth.dependencies import UserContext
from app.auth.security import hash_password
from app.db.pool import get_connection, get_transaction
from app.repositories import departamento_repo, filial_repo, usuario_repo
from app.services import escopo

_SEM_PERMISSAO = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão para esta ação"
)
_EMAIL_EM_USO = HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email já cadastrado")


def listar(user: UserContext) -> list[dict]:
    with get_connection() as conn:
        return usuario_repo.list_by_scope(
            conn, user.empresa_id, filial_id=user.filial_id, departamento_id=user.departamento_id
        )


def criar(
    user: UserContext,
    nome: str,
    email: str,
    senha: str,
    tipo_acesso: str,
    filial_id: int | None,
    departamento_id: int | None,
) -> dict:
    if user.tipo_acesso == "dono_empresa":
        # RF06 — dono cria admin_filial ou colaborador, dentro da própria empresa.
        # dono_empresa nunca é criado aqui: só nasce no cadastro da empresa (RF01,
        # ver empresa_service.criar_empresa) — senão qualquer dono poderia mintar
        # "co-donos" à vontade, sem controle nenhum (risco de escalonamento de
        # privilégio caso essa conta seja comprometida).
        if tipo_acesso not in ("admin_filial", "colaborador"):
            raise _SEM_PERMISSAO
        if tipo_acesso == "admin_filial":
            if filial_id is None:
                raise HTTPException(status_code=422, detail="filial_id é obrigatório para admin_filial")
            with get_connection() as conn:
                filial = filial_repo.get_by_id(conn, filial_id)
            escopo.validar_filial(user, filial)
            departamento_id = None
        else:  # colaborador
            if departamento_id is None:
                raise HTTPException(status_code=422, detail="departamento_id é obrigatório para colaborador")
            with get_connection() as conn:
                dep = departamento_repo.get_by_id(conn, departamento_id)
                filial = filial_repo.get_by_id(conn, dep["filial_id"] if dep else -1)
            escopo.validar_filial(user, filial)
            filial_id = filial["id"]
    elif user.tipo_acesso == "admin_filial":
        # RF07 — admin_filial só cadastra colaborador, e o departamento tem
        # que pertencer à própria filial (validado explicitamente).
        if tipo_acesso != "colaborador":
            raise _SEM_PERMISSAO
        if departamento_id is None:
            raise HTTPException(status_code=422, detail="departamento_id é obrigatório")
        with get_connection() as conn:
            dep = departamento_repo.get_by_id(conn, departamento_id)
        if dep is None or dep["filial_id"] != user.filial_id:
            raise HTTPException(status_code=422, detail="Departamento não pertence à sua filial")
        filial_id = user.filial_id
    else:
        raise _SEM_PERMISSAO

    senha_hash = hash_password(senha)
    try:
        with get_transaction() as conn:
            usuario_id = usuario_repo.insert(
                conn, user.empresa_id, filial_id, departamento_id, nome, email, senha_hash, tipo_acesso
            )
    except mysql.connector.IntegrityError:
        raise _EMAIL_EM_USO

    return {
        "id": usuario_id,
        "empresa_id": user.empresa_id,
        "filial_id": filial_id,
        "departamento_id": departamento_id,
        "nome": nome,
        "email": email,
        "tipo_acesso": tipo_acesso,
    }
