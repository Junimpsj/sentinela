from fastapi import APIRouter, Depends, Response

from app.auth.dependencies import UserContext, get_current_user
from app.config import COOKIE_NAME, COOKIE_SECURE, JWT_EXPIRATION_MINUTES
from app.schemas import LoginRequest
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(payload: LoginRequest, response: Response):
    usuario, token = auth_service.login(payload.email, payload.senha)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="strict",
        max_age=JWT_EXPIRATION_MINUTES * 60,
    )
    return usuario


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, httponly=True, secure=COOKIE_SECURE, samesite="strict")
    return {"detail": "Sessão encerrada"}


@router.get("/me")
def me(user: UserContext = Depends(get_current_user)):
    return user
