from dataclasses import dataclass
from typing import Optional

import jwt
from fastapi import HTTPException, Request, status

from app.auth.security import decode_token
from app.config import COOKIE_NAME


@dataclass
class UserContext:
    """Escopo do usuário logado — vem do JWT, nunca do client (seção 3.1)."""

    usuario_id: int
    empresa_id: int
    filial_id: Optional[int]
    departamento_id: Optional[int]
    tipo_acesso: str


def get_current_user(request: Request) -> UserContext:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Não autenticado")
    try:
        payload = decode_token(token)
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão inválida ou expirada")
    return UserContext(
        usuario_id=payload["usuario_id"],
        empresa_id=payload["empresa_id"],
        filial_id=payload.get("filial_id"),
        departamento_id=payload.get("departamento_id"),
        tipo_acesso=payload["tipo_acesso"],
    )
