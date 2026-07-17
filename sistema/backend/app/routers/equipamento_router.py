from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, status

from app.auth.dependencies import UserContext, get_current_user
from app.schemas import (
    ComponenteCreate,
    EquipamentoCreate,
    EquipamentoSoftwareCreate,
    ManutencaoCreate,
    MovimentacaoCreate,
    StatusEquipamento,
    TipoEquipamento,
)
from app.services import (
    componente_service,
    equipamento_service,
    manutencao_service,
    movimentacao_service,
    ocorrencia_service,
    software_instalacao_service,
)

router = APIRouter(prefix="/equipamentos", tags=["equipamentos"])


@router.get("")
def listar(
    filial_id: Optional[int] = None,
    departamento_id: Optional[int] = None,
    tipo: Optional[TipoEquipamento] = None,
    status_filtro: Optional[StatusEquipamento] = None,
    user: UserContext = Depends(get_current_user),
):
    return equipamento_service.listar(user, filial_id, departamento_id, tipo, status_filtro)


@router.get("/{equipamento_id}")
def obter(equipamento_id: int, user: UserContext = Depends(get_current_user)):
    return equipamento_service.obter(user, equipamento_id)


@router.post("", status_code=status.HTTP_201_CREATED)
def criar(payload: EquipamentoCreate, user: UserContext = Depends(get_current_user)):
    return equipamento_service.criar(
        user, payload.filial_id, payload.departamento_id, payload.tipo, payload.patrimonio, payload.hostname, payload.endereco_ip
    )


@router.get("/{equipamento_id}/componentes")
def listar_componentes(equipamento_id: int, user: UserContext = Depends(get_current_user)):
    return componente_service.listar(user, equipamento_id)


@router.post("/{equipamento_id}/componentes", status_code=status.HTTP_201_CREATED)
def registrar_componente(equipamento_id: int, payload: ComponenteCreate, user: UserContext = Depends(get_current_user)):
    return componente_service.registrar(
        user, equipamento_id, payload.modelo_componente_id, payload.data_instalacao or datetime.now()
    )


@router.get("/{equipamento_id}/manutencoes")
def listar_manutencoes(equipamento_id: int, user: UserContext = Depends(get_current_user)):
    return manutencao_service.listar(user, equipamento_id)


@router.post("/{equipamento_id}/manutencoes", status_code=status.HTTP_201_CREATED)
def registrar_manutencao(equipamento_id: int, payload: ManutencaoCreate, user: UserContext = Depends(get_current_user)):
    troca = payload.troca_componente.model_dump() if payload.troca_componente else None
    return manutencao_service.registrar(user, equipamento_id, payload.data or datetime.now(), payload.descricao, troca)


@router.get("/{equipamento_id}/softwares")
def listar_softwares(equipamento_id: int, user: UserContext = Depends(get_current_user)):
    return software_instalacao_service.listar(user, equipamento_id)


@router.post("/{equipamento_id}/softwares", status_code=status.HTTP_201_CREATED)
def registrar_software(equipamento_id: int, payload: EquipamentoSoftwareCreate, user: UserContext = Depends(get_current_user)):
    return software_instalacao_service.registrar(
        user,
        equipamento_id,
        payload.software_id,
        payload.data_instalacao or datetime.now(),
        payload.chave_licenca,
        payload.validade_licenca,
    )


@router.get("/{equipamento_id}/ocorrencias")
def listar_ocorrencias(equipamento_id: int, user: UserContext = Depends(get_current_user)):
    return ocorrencia_service.listar_por_equipamento(user, equipamento_id)


@router.get("/{equipamento_id}/movimentacoes")
def listar_movimentacoes(equipamento_id: int, user: UserContext = Depends(get_current_user)):
    return movimentacao_service.listar(user, equipamento_id)


@router.post("/{equipamento_id}/movimentacoes", status_code=status.HTTP_201_CREATED)
def registrar_movimentacao(equipamento_id: int, payload: MovimentacaoCreate, user: UserContext = Depends(get_current_user)):
    return movimentacao_service.registrar(user, equipamento_id, payload.departamento_destino_id, payload.motivo)
