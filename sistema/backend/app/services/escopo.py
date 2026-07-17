from fastapi import HTTPException, status

from app.auth.dependencies import UserContext

# 404 genérico tanto pra "não existe" quanto pra "existe mas não é seu" — evita
# enumeração de recursos de outras empresas/filiais/departamentos (seção 3.1).
_NAO_ENCONTRADO = HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recurso não encontrado")


def negar() -> None:
    raise _NAO_ENCONTRADO


def validar_filial(user: UserContext, filial: dict | None) -> dict:
    if filial is None or filial["empresa_id"] != user.empresa_id:
        negar()
    if user.tipo_acesso in ("admin_filial", "colaborador") and filial["id"] != user.filial_id:
        negar()
    return filial


def validar_departamento(user: UserContext, departamento: dict | None, filial: dict) -> dict:
    if departamento is None or departamento["filial_id"] != filial["id"]:
        negar()
    if user.tipo_acesso == "colaborador" and departamento["id"] != user.departamento_id:
        negar()
    return departamento


def validar_equipamento(user: UserContext, equipamento: dict | None) -> dict:
    if equipamento is None or equipamento["empresa_id"] != user.empresa_id:
        negar()
    if user.tipo_acesso == "admin_filial" and equipamento["filial_id"] != user.filial_id:
        negar()
    if user.tipo_acesso == "colaborador" and equipamento["departamento_id"] != user.departamento_id:
        negar()
    return equipamento
