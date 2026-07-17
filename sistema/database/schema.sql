-- Sentinela — schema definitivo (seção 2 do prompt). Compatível com MySQL 8+.
-- FKs de vulnerabilidade usam ON UPDATE RESTRICT (não CASCADE) porque a coluna
-- participa de CHECK e MariaDB rejeita CASCADE nesse caso (erro 1901). MySQL 8
-- aceita ambos — mantido RESTRICT para compatibilidade cruzada.

CREATE DATABASE IF NOT EXISTS sentinela;
USE sentinela;

CREATE TABLE empresa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    razao_social VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE filial (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresa(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE departamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filial_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    FOREIGN KEY (filial_id) REFERENCES filial(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    filial_id INT NULL,
    departamento_id INT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo_acesso ENUM('dono_empresa', 'admin_filial', 'colaborador') NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresa(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (filial_id) REFERENCES filial(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (departamento_id) REFERENCES departamento(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE equipamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filial_id INT NOT NULL,
    departamento_id INT NULL,
    tipo ENUM('desktop', 'notebook', 'servidor', 'impressora', 'switch', 'roteador', 'outro') NOT NULL,
    patrimonio VARCHAR(100) NOT NULL UNIQUE,
    hostname VARCHAR(100) NULL,
    endereco_ip VARCHAR(45) NULL,
    status ENUM('ativo', 'manutencao', 'inativo') NOT NULL DEFAULT 'ativo',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (filial_id) REFERENCES filial(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (departamento_id) REFERENCES departamento(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE modelo_componente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('cpu', 'ram', 'hd', 'ssd', 'placa_mae', 'fonte', 'outro') NOT NULL,
    fabricante VARCHAR(255) NOT NULL,
    modelo VARCHAR(255) NOT NULL
);

CREATE TABLE manutencao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipamento_id INT NOT NULL,
    data DATETIME NOT NULL,
    descricao TEXT NOT NULL,
    status ENUM('aberta', 'concluida') NOT NULL DEFAULT 'aberta',
    FOREIGN KEY (equipamento_id) REFERENCES equipamento(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE componente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipamento_id INT NOT NULL,
    modelo_componente_id INT NOT NULL,
    manutencao_id INT NULL,
    status ENUM('ativo', 'substituido') NOT NULL DEFAULT 'ativo',
    data_instalacao DATETIME NOT NULL,
    data_remocao DATETIME NULL,
    FOREIGN KEY (equipamento_id) REFERENCES equipamento(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (modelo_componente_id) REFERENCES modelo_componente(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (manutencao_id) REFERENCES manutencao(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE software (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    fabricante VARCHAR(255) NOT NULL,
    versao VARCHAR(50) NOT NULL
);

CREATE TABLE equipamento_software (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipamento_id INT NOT NULL,
    software_id INT NOT NULL,
    data_instalacao DATETIME NOT NULL,
    chave_licenca VARCHAR(255) NULL,
    validade_licenca DATE NULL,
    FOREIGN KEY (equipamento_id) REFERENCES equipamento(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (software_id) REFERENCES software(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE vulnerabilidade (
    id INT AUTO_INCREMENT PRIMARY KEY,
    software_id INT NULL,
    componente_modelo_id INT NULL,
    codigo_cve VARCHAR(20) NOT NULL UNIQUE,
    severidade ENUM('baixa', 'media', 'alta', 'critica') NOT NULL,
    descricao TEXT NOT NULL,
    FOREIGN KEY (software_id) REFERENCES software(id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    FOREIGN KEY (componente_modelo_id) REFERENCES modelo_componente(id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CHECK (
        (software_id IS NOT NULL AND componente_modelo_id IS NULL)
        OR
        (software_id IS NULL AND componente_modelo_id IS NOT NULL)
    )
);

CREATE TABLE ocorrencia_vulnerabilidade (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipamento_id INT NOT NULL,
    vulnerabilidade_id INT NOT NULL,
    data_deteccao DATETIME NOT NULL,
    status ENUM('pendente', 'corrigido', 'ignorado') NOT NULL DEFAULT 'pendente',
    data_resolucao DATETIME NULL,
    FOREIGN KEY (equipamento_id) REFERENCES equipamento(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (vulnerabilidade_id) REFERENCES vulnerabilidade(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE movimentacao_equipamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipamento_id INT NOT NULL,
    departamento_origem_id INT NOT NULL,
    departamento_destino_id INT NOT NULL,
    data DATETIME NOT NULL,
    motivo VARCHAR(255) NULL,
    FOREIGN KEY (equipamento_id) REFERENCES equipamento(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (departamento_origem_id) REFERENCES departamento(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (departamento_destino_id) REFERENCES departamento(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);
