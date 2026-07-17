from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field

TipoAcesso = Literal["dono_empresa", "admin_filial", "colaborador"]
TipoEquipamento = Literal["desktop", "notebook", "servidor", "impressora", "switch", "roteador", "outro"]
StatusEquipamento = Literal["ativo", "manutencao", "inativo"]
TipoComponente = Literal["cpu", "ram", "hd", "ssd", "placa_mae", "fonte", "outro"]
Severidade = Literal["baixa", "media", "alta", "critica"]


class EmpresaCreate(BaseModel):
    razao_social: str = Field(min_length=1, max_length=255)
    cnpj: str = Field(min_length=1, max_length=18)
    email: EmailStr
    dono_nome: str = Field(min_length=1, max_length=255)
    dono_email: EmailStr
    dono_senha: str = Field(min_length=6, max_length=255)


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str = Field(min_length=1, max_length=255)


class FilialCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=255)
    cidade: str = Field(min_length=1, max_length=100)
    uf: str = Field(min_length=2, max_length=2)
    endereco: str = Field(min_length=1, max_length=255)


class DepartamentoCreate(BaseModel):
    filial_id: int
    nome: str = Field(min_length=1, max_length=255)


class UsuarioCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=255)
    email: EmailStr
    senha: str = Field(min_length=6, max_length=255)
    tipo_acesso: TipoAcesso
    filial_id: Optional[int] = None
    departamento_id: Optional[int] = None


class EquipamentoCreate(BaseModel):
    filial_id: int
    departamento_id: int
    tipo: TipoEquipamento
    patrimonio: str = Field(min_length=1, max_length=100)
    hostname: Optional[str] = Field(default=None, max_length=100)
    endereco_ip: Optional[str] = Field(default=None, max_length=45)


class ModeloComponenteCreate(BaseModel):
    tipo: TipoComponente
    fabricante: str = Field(min_length=1, max_length=255)
    modelo: str = Field(min_length=1, max_length=255)


class ComponenteCreate(BaseModel):
    modelo_componente_id: int
    data_instalacao: Optional[datetime] = None


class SoftwareCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=255)
    fabricante: str = Field(min_length=1, max_length=255)
    versao: str = Field(min_length=1, max_length=50)


class EquipamentoSoftwareCreate(BaseModel):
    software_id: int
    data_instalacao: Optional[datetime] = None
    chave_licenca: Optional[str] = Field(default=None, max_length=255)
    validade_licenca: Optional[date] = None


class TrocaComponente(BaseModel):
    componente_antigo_id: int
    modelo_componente_id_novo: int


class ManutencaoCreate(BaseModel):
    data: Optional[datetime] = None
    descricao: str = Field(min_length=1)
    troca_componente: Optional[TrocaComponente] = None


class VulnerabilidadeCreate(BaseModel):
    software_id: Optional[int] = None
    componente_modelo_id: Optional[int] = None
    codigo_cve: str = Field(min_length=1, max_length=20)
    severidade: Severidade
    descricao: str = Field(min_length=1)


class OcorrenciaUpdate(BaseModel):
    status: Literal["corrigido", "ignorado"]


class MovimentacaoCreate(BaseModel):
    departamento_destino_id: int
    motivo: Optional[str] = Field(default=None, max_length=255)
