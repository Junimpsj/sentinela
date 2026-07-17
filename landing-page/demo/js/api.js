// mock de backend inteiro só pra hospedagem estática (portfólio) —
// mesma assinatura de apiFetch do sistema real, então todo o resto do frontend
// (dashboard.js, equipamentos.js, etc) roda sem alteração nenhuma.

const STORAGE_KEY = 'sentinela_demo_db';
const SESSION_KEY = 'sentinela_demo_logado';

function nextId(list) {
  return list.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function seedDb() {
  const empresa = {
    id: 1,
    razao_social: 'TechCorp Soluções em TI',
    cnpj: '12.345.678/0001-90',
    email: 'contato@techcorp.com.br',
    criado_em: '2024-03-10T09:00:00',
  };

  const filiais = [
    { id: 1, empresa_id: 1, nome: 'Matriz São Paulo', cidade: 'São Paulo', uf: 'SP', endereco: 'Av. Paulista, 1000' },
    { id: 2, empresa_id: 1, nome: 'Filial Curitiba', cidade: 'Curitiba', uf: 'PR', endereco: 'Rua XV de Novembro, 500' },
    { id: 3, empresa_id: 1, nome: 'Filial Recife', cidade: 'Recife', uf: 'PE', endereco: 'Av. Boa Viagem, 200' },
  ];

  const departamentos = [
    { id: 1, filial_id: 1, nome: 'TI' },
    { id: 2, filial_id: 1, nome: 'Financeiro' },
    { id: 3, filial_id: 1, nome: 'RH' },
    { id: 4, filial_id: 2, nome: 'TI' },
    { id: 5, filial_id: 2, nome: 'Vendas' },
    { id: 6, filial_id: 3, nome: 'TI' },
    { id: 7, filial_id: 3, nome: 'Suporte' },
  ];

  const usuarios = [
    { id: 1, empresa_id: 1, filial_id: null, departamento_id: null, nome: 'Larissa Prado', email: 'larissa.prado@techcorp.com.br', tipo_acesso: 'dono_empresa', criado_em: '2024-03-10T09:00:00' },
    { id: 2, empresa_id: 1, filial_id: 1, departamento_id: null, nome: 'Marcos Andrade', email: 'marcos.andrade@techcorp.com.br', tipo_acesso: 'admin_filial', criado_em: '2024-03-11T10:00:00' },
    { id: 3, empresa_id: 1, filial_id: 1, departamento_id: 1, nome: 'Bruno Lima', email: 'bruno.lima@techcorp.com.br', tipo_acesso: 'colaborador', criado_em: '2024-03-12T11:00:00' },
  ];

  const equipamentos = [
    { id: 1, filial_id: 1, departamento_id: 1, tipo: 'desktop', patrimonio: 'PAT-0001', hostname: 'SP-TI-01', endereco_ip: '10.0.1.10', status: 'ativo' },
    { id: 2, filial_id: 1, departamento_id: 1, tipo: 'notebook', patrimonio: 'PAT-0002', hostname: 'SP-TI-NB01', endereco_ip: '10.0.1.11', status: 'ativo' },
    { id: 3, filial_id: 1, departamento_id: 1, tipo: 'servidor', patrimonio: 'PAT-0003', hostname: 'SP-SRV01', endereco_ip: '10.0.1.5', status: 'manutencao' },
    { id: 4, filial_id: 1, departamento_id: 2, tipo: 'desktop', patrimonio: 'PAT-0004', hostname: 'SP-FIN-01', endereco_ip: '10.0.2.10', status: 'ativo' },
    { id: 5, filial_id: 1, departamento_id: 3, tipo: 'impressora', patrimonio: 'PAT-0005', hostname: 'SP-RH-PR01', endereco_ip: '10.0.3.10', status: 'ativo' },
    { id: 6, filial_id: 2, departamento_id: 4, tipo: 'switch', patrimonio: 'PAT-0006', hostname: 'CTB-SW01', endereco_ip: '10.1.1.1', status: 'ativo' },
    { id: 7, filial_id: 2, departamento_id: 4, tipo: 'roteador', patrimonio: 'PAT-0007', hostname: 'CTB-RT01', endereco_ip: '10.1.1.2', status: 'ativo' },
    { id: 8, filial_id: 2, departamento_id: 5, tipo: 'notebook', patrimonio: 'PAT-0008', hostname: 'CTB-VD-NB01', endereco_ip: '10.1.2.10', status: 'ativo' },
    { id: 9, filial_id: 2, departamento_id: 5, tipo: 'desktop', patrimonio: 'PAT-0009', hostname: 'CTB-VD-01', endereco_ip: '10.1.2.11', status: 'inativo' },
    { id: 10, filial_id: 3, departamento_id: 6, tipo: 'servidor', patrimonio: 'PAT-0010', hostname: 'REC-SRV01', endereco_ip: '10.2.1.5', status: 'ativo' },
    { id: 11, filial_id: 3, departamento_id: 7, tipo: 'desktop', patrimonio: 'PAT-0011', hostname: 'REC-SUP-01', endereco_ip: '10.2.2.10', status: 'ativo' },
    { id: 12, filial_id: 3, departamento_id: 7, tipo: 'outro', patrimonio: 'PAT-0012', hostname: null, endereco_ip: null, status: 'ativo' },
  ];

  const modelosComponente = [
    { id: 1, tipo: 'cpu', fabricante: 'Intel', modelo: 'Core i5-12400' },
    { id: 2, tipo: 'ram', fabricante: 'Kingston', modelo: 'Fury 16GB DDR4' },
    { id: 3, tipo: 'hd', fabricante: 'Seagate', modelo: 'Barracuda 1TB' },
    { id: 4, tipo: 'ssd', fabricante: 'Samsung', modelo: '970 EVO 500GB' },
    { id: 5, tipo: 'placa_mae', fabricante: 'ASUS', modelo: 'Prime B560M' },
    { id: 6, tipo: 'fonte', fabricante: 'Corsair', modelo: 'CV550' },
  ];

  const softwares = [
    { id: 1, nome: 'Windows', fabricante: 'Microsoft', versao: '11 Pro' },
    { id: 2, nome: 'Office', fabricante: 'Microsoft', versao: '365' },
    { id: 3, nome: 'Ubuntu Server', fabricante: 'Canonical', versao: '22.04 LTS' },
    { id: 4, nome: 'Antivírus', fabricante: 'ESET', versao: 'NOD32 v16' },
    { id: 5, nome: '7-Zip', fabricante: 'Igor Pavlov', versao: '23.01' },
  ];

  const componentes = [
    { id: 1, equipamento_id: 1, modelo_componente_id: 1, manutencao_id: null, status: 'ativo', data_instalacao: '2024-03-15T09:00:00', data_remocao: null, modelo_tipo: 'cpu', modelo_fabricante: 'Intel', modelo_nome: 'Core i5-12400' },
    { id: 2, equipamento_id: 1, modelo_componente_id: 2, manutencao_id: null, status: 'ativo', data_instalacao: '2024-03-15T09:00:00', data_remocao: null, modelo_tipo: 'ram', modelo_fabricante: 'Kingston', modelo_nome: 'Fury 16GB DDR4' },
    { id: 3, equipamento_id: 3, modelo_componente_id: 3, manutencao_id: null, status: 'substituido', data_instalacao: '2023-05-01T09:00:00', data_remocao: '2024-06-01T14:00:00', modelo_tipo: 'hd', modelo_fabricante: 'Seagate', modelo_nome: 'Barracuda 1TB' },
    { id: 4, equipamento_id: 3, modelo_componente_id: 4, manutencao_id: 1, status: 'ativo', data_instalacao: '2024-06-01T14:00:00', data_remocao: null, modelo_tipo: 'ssd', modelo_fabricante: 'Samsung', modelo_nome: '970 EVO 500GB' },
  ];

  const equipamentoSoftwares = [
    { id: 1, equipamento_id: 1, software_id: 1, data_instalacao: '2024-03-16T09:00:00', chave_licenca: null, validade_licenca: null, software_nome: 'Windows', software_fabricante: 'Microsoft', software_versao: '11 Pro' },
    { id: 2, equipamento_id: 1, software_id: 2, data_instalacao: '2024-03-16T09:00:00', chave_licenca: null, validade_licenca: '2026-12-31', software_nome: 'Office', software_fabricante: 'Microsoft', software_versao: '365' },
    { id: 3, equipamento_id: 3, software_id: 3, data_instalacao: '2023-11-01T09:00:00', chave_licenca: null, validade_licenca: null, software_nome: 'Ubuntu Server', software_fabricante: 'Canonical', software_versao: '22.04 LTS' },
    { id: 4, equipamento_id: 8, software_id: 1, data_instalacao: '2024-02-01T09:00:00', chave_licenca: null, validade_licenca: null, software_nome: 'Windows', software_fabricante: 'Microsoft', software_versao: '11 Pro' },
  ];

  const manutencoes = [
    { id: 1, equipamento_id: 3, data: '2024-06-01T14:00:00', descricao: 'Troca de HD por SSD por lentidão reportada pelos usuários.', status: 'concluida' },
    { id: 2, equipamento_id: 9, data: '2025-01-10T10:00:00', descricao: 'Verificação de superaquecimento e ruído excessivo na ventoinha.', status: 'aberta' },
  ];

  const vulnerabilidades = [
    { id: 1, software_id: 1, componente_modelo_id: null, codigo_cve: 'CVE-2024-21351', severidade: 'alta', descricao: 'Bypass de segurança no SmartScreen do Windows.' },
    { id: 2, software_id: 3, componente_modelo_id: null, codigo_cve: 'CVE-2024-1086', severidade: 'critica', descricao: 'Escalonamento de privilégio no kernel Linux (netfilter).' },
    { id: 3, software_id: null, componente_modelo_id: 5, codigo_cve: 'CVE-2023-40283', severidade: 'media', descricao: 'Falha de firmware permite acesso não autorizado via rede de gerência.' },
    { id: 4, software_id: 4, componente_modelo_id: null, codigo_cve: 'CVE-2024-0158', severidade: 'baixa', descricao: 'Falha de validação de certificado em atualizações.' },
  ];

  const ocorrencias = [
    { id: 1, equipamento_id: 1, vulnerabilidade_id: 1, data_deteccao: '2024-04-01T08:00:00', status: 'pendente', data_resolucao: null, codigo_cve: 'CVE-2024-21351', severidade: 'alta', vulnerabilidade_descricao: 'Bypass de segurança no SmartScreen do Windows.', patrimonio: 'PAT-0001' },
    { id: 2, equipamento_id: 3, vulnerabilidade_id: 2, data_deteccao: '2024-04-02T08:00:00', status: 'pendente', data_resolucao: null, codigo_cve: 'CVE-2024-1086', severidade: 'critica', vulnerabilidade_descricao: 'Escalonamento de privilégio no kernel Linux (netfilter).', patrimonio: 'PAT-0003' },
    { id: 3, equipamento_id: 8, vulnerabilidade_id: 1, data_deteccao: '2024-02-05T08:00:00', status: 'corrigido', data_resolucao: '2024-02-20T08:00:00', codigo_cve: 'CVE-2024-21351', severidade: 'alta', vulnerabilidade_descricao: 'Bypass de segurança no SmartScreen do Windows.', patrimonio: 'PAT-0008' },
  ];

  const movimentacoes = [
    { id: 1, equipamento_id: 9, departamento_origem_id: 5, departamento_destino_id: 4, data: '2024-08-15T09:00:00', motivo: 'Realocação para o setor de TI', origem_nome: 'Vendas', destino_nome: 'TI' },
  ];

  return {
    empresa, filiais, departamentos, usuarios, equipamentos, modelosComponente, softwares,
    componentes, equipamentoSoftwares, manutencoes, vulnerabilidades, ocorrencias, movimentacoes,
  };
}

function loadDb() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (_) {
      // ignora e recria
    }
  }
  const db = seedDb();
  saveDb(db);
  return db;
}

function saveDb(db) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

let DB = loadDb();

function currentUser() {
  return DB.usuarios[0]; // dono_empresa — única identidade logada nesta demo
}

function departamentoNome(id) {
  const dep = DB.departamentos.find((d) => d.id === id);
  return dep ? dep.nome : '—';
}

function notFound(msg) {
  throw new Error(msg || 'Recurso não encontrado');
}

function handle(method, segs, q, body) {
  const [r0, r1, r2] = segs;

  // === auth ===
  if (r0 === 'auth' && r1 === 'login' && method === 'POST') {
    sessionStorage.setItem(SESSION_KEY, '1');
    return currentUser();
  }
  if (r0 === 'auth' && r1 === 'logout' && method === 'POST') {
    sessionStorage.removeItem(SESSION_KEY);
    return { detail: 'Sessão encerrada' };
  }
  if (r0 === 'auth' && r1 === 'me' && method === 'GET') {
    if (!sessionStorage.getItem(SESSION_KEY)) notFound('Não autenticado');
    return currentUser();
  }

  // === empresas ===
  if (r0 === 'empresas' && r1 === undefined && method === 'POST') {
    // demo: cadastro de empresa sempre "funciona", sem persistir de fato
    return { empresa_id: DB.empresa.id, usuario_id: DB.usuarios[0].id };
  }
  if (r0 === 'empresas' && r1 === 'me' && method === 'GET') {
    return DB.empresa;
  }

  // === filiais ===
  if (r0 === 'filiais' && r1 === undefined && method === 'GET') {
    return DB.filiais;
  }
  if (r0 === 'filiais' && r1 === undefined && method === 'POST') {
    const filial = { id: nextId(DB.filiais), empresa_id: DB.empresa.id, ...body };
    DB.filiais.push(filial);
    saveDb(DB);
    return filial;
  }
  if (r0 === 'filiais' && r2 === 'duplicar' && method === 'POST') {
    const origemId = Number(r1);
    const nova = { id: nextId(DB.filiais), empresa_id: DB.empresa.id, ...body };
    DB.filiais.push(nova);
    DB.departamentos
      .filter((d) => d.filial_id === origemId)
      .forEach((d) => DB.departamentos.push({ id: nextId(DB.departamentos), filial_id: nova.id, nome: d.nome }));
    saveDb(DB);
    return nova;
  }

  // === departamentos ===
  if (r0 === 'departamentos' && r1 === undefined && method === 'GET') {
    const filialId = Number(q.get('filial_id'));
    return DB.departamentos.filter((d) => d.filial_id === filialId);
  }
  if (r0 === 'departamentos' && r1 === undefined && method === 'POST') {
    const dep = { id: nextId(DB.departamentos), filial_id: body.filial_id, nome: body.nome };
    DB.departamentos.push(dep);
    saveDb(DB);
    return dep;
  }

  // === usuarios ===
  if (r0 === 'usuarios' && r1 === undefined && method === 'GET') {
    return DB.usuarios;
  }
  if (r0 === 'usuarios' && r1 === undefined && method === 'POST') {
    const usuario = {
      id: nextId(DB.usuarios),
      empresa_id: DB.empresa.id,
      filial_id: body.filial_id,
      departamento_id: body.departamento_id,
      nome: body.nome,
      email: body.email,
      tipo_acesso: body.tipo_acesso,
      criado_em: new Date().toISOString(),
    };
    DB.usuarios.push(usuario);
    saveDb(DB);
    return usuario;
  }

  // === equipamentos ===
  if (r0 === 'equipamentos' && r1 === undefined && method === 'GET') {
    let lista = DB.equipamentos;
    const filialId = q.get('filial_id');
    const departamentoId = q.get('departamento_id');
    const tipo = q.get('tipo');
    const statusFiltro = q.get('status_filtro');
    if (departamentoId) lista = lista.filter((e) => e.departamento_id === Number(departamentoId));
    else if (filialId) lista = lista.filter((e) => e.filial_id === Number(filialId));
    if (tipo) lista = lista.filter((e) => e.tipo === tipo);
    if (statusFiltro) lista = lista.filter((e) => e.status === statusFiltro);
    return [...lista].sort((a, b) => a.patrimonio.localeCompare(b.patrimonio));
  }
  if (r0 === 'equipamentos' && r1 === undefined && method === 'POST') {
    const eq = {
      id: nextId(DB.equipamentos),
      filial_id: body.filial_id,
      departamento_id: body.departamento_id,
      tipo: body.tipo,
      patrimonio: body.patrimonio,
      hostname: body.hostname || null,
      endereco_ip: body.endereco_ip || null,
      status: 'ativo',
    };
    DB.equipamentos.push(eq);
    saveDb(DB);
    return eq;
  }
  if (r0 === 'equipamentos' && r1 !== undefined && r2 === undefined && method === 'GET') {
    const eq = DB.equipamentos.find((e) => e.id === Number(r1));
    if (!eq) notFound('Equipamento não encontrado');
    return eq;
  }

  if (r0 === 'equipamentos' && r2 === 'componentes') {
    const equipamentoId = Number(r1);
    if (method === 'GET') {
      return DB.componentes
        .filter((c) => c.equipamento_id === equipamentoId)
        .sort((a, b) => new Date(b.data_instalacao) - new Date(a.data_instalacao));
    }
    if (method === 'POST') {
      const modelo = DB.modelosComponente.find((m) => m.id === body.modelo_componente_id);
      const comp = {
        id: nextId(DB.componentes),
        equipamento_id: equipamentoId,
        modelo_componente_id: body.modelo_componente_id,
        manutencao_id: null,
        status: 'ativo',
        data_instalacao: new Date().toISOString(),
        data_remocao: null,
        modelo_tipo: modelo ? modelo.tipo : '',
        modelo_fabricante: modelo ? modelo.fabricante : '',
        modelo_nome: modelo ? modelo.modelo : '',
      };
      DB.componentes.push(comp);
      saveDb(DB);
      return comp;
    }
  }

  if (r0 === 'equipamentos' && r2 === 'softwares') {
    const equipamentoId = Number(r1);
    if (method === 'GET') {
      return DB.equipamentoSoftwares
        .filter((s) => s.equipamento_id === equipamentoId)
        .sort((a, b) => new Date(b.data_instalacao) - new Date(a.data_instalacao));
    }
    if (method === 'POST') {
      const software = DB.softwares.find((s) => s.id === body.software_id);
      const inst = {
        id: nextId(DB.equipamentoSoftwares),
        equipamento_id: equipamentoId,
        software_id: body.software_id,
        data_instalacao: new Date().toISOString(),
        chave_licenca: body.chave_licenca || null,
        validade_licenca: body.validade_licenca || null,
        software_nome: software ? software.nome : '',
        software_fabricante: software ? software.fabricante : '',
        software_versao: software ? software.versao : '',
      };
      DB.equipamentoSoftwares.push(inst);
      saveDb(DB);
      return inst;
    }
  }

  if (r0 === 'equipamentos' && r2 === 'manutencoes') {
    const equipamentoId = Number(r1);
    if (method === 'GET') {
      return DB.manutencoes
        .filter((m) => m.equipamento_id === equipamentoId)
        .sort((a, b) => new Date(b.data) - new Date(a.data));
    }
    if (method === 'POST') {
      const manutencao = {
        id: nextId(DB.manutencoes),
        equipamento_id: equipamentoId,
        data: new Date().toISOString(),
        descricao: body.descricao,
        status: 'aberta',
      };
      DB.manutencoes.push(manutencao);
      if (body.troca_componente) {
        const antigo = DB.componentes.find((c) => c.id === body.troca_componente.componente_antigo_id);
        if (antigo) {
          antigo.status = 'substituido';
          antigo.data_remocao = new Date().toISOString();
        }
        const modeloNovo = DB.modelosComponente.find((m) => m.id === body.troca_componente.modelo_componente_id_novo);
        DB.componentes.push({
          id: nextId(DB.componentes),
          equipamento_id: equipamentoId,
          modelo_componente_id: body.troca_componente.modelo_componente_id_novo,
          manutencao_id: manutencao.id,
          status: 'ativo',
          data_instalacao: new Date().toISOString(),
          data_remocao: null,
          modelo_tipo: modeloNovo ? modeloNovo.tipo : '',
          modelo_fabricante: modeloNovo ? modeloNovo.fabricante : '',
          modelo_nome: modeloNovo ? modeloNovo.modelo : '',
        });
      }
      saveDb(DB);
      return manutencao;
    }
  }

  if (r0 === 'equipamentos' && r2 === 'ocorrencias' && method === 'GET') {
    const equipamentoId = Number(r1);
    return DB.ocorrencias
      .filter((o) => o.equipamento_id === equipamentoId)
      .sort((a, b) => new Date(b.data_deteccao) - new Date(a.data_deteccao));
  }

  if (r0 === 'equipamentos' && r2 === 'movimentacoes') {
    const equipamentoId = Number(r1);
    if (method === 'GET') {
      return DB.movimentacoes
        .filter((m) => m.equipamento_id === equipamentoId)
        .sort((a, b) => new Date(b.data) - new Date(a.data));
    }
    if (method === 'POST') {
      const eq = DB.equipamentos.find((e) => e.id === equipamentoId);
      const origemId = eq.departamento_id;
      const mov = {
        id: nextId(DB.movimentacoes),
        equipamento_id: equipamentoId,
        departamento_origem_id: origemId,
        departamento_destino_id: body.departamento_destino_id,
        data: new Date().toISOString(),
        motivo: body.motivo || null,
        origem_nome: departamentoNome(origemId),
        destino_nome: departamentoNome(body.departamento_destino_id),
      };
      DB.movimentacoes.push(mov);
      eq.departamento_id = body.departamento_destino_id;
      saveDb(DB);
      return mov;
    }
  }

  // === manutencoes (encerrar) ===
  if (r0 === 'manutencoes' && r1 !== undefined && method === 'PATCH') {
    const manutencao = DB.manutencoes.find((m) => m.id === Number(r1));
    if (!manutencao) notFound('Manutenção não encontrada');
    manutencao.status = 'concluida';
    saveDb(DB);
    return manutencao;
  }

  // === ocorrencias-vulnerabilidade ===
  if (r0 === 'ocorrencias-vulnerabilidade' && r1 === undefined && method === 'GET') {
    return DB.ocorrencias;
  }
  if (r0 === 'ocorrencias-vulnerabilidade' && r1 !== undefined && method === 'PATCH') {
    const ocorrencia = DB.ocorrencias.find((o) => o.id === Number(r1));
    if (!ocorrencia) notFound('Ocorrência não encontrada');
    ocorrencia.status = body.status;
    ocorrencia.data_resolucao = new Date().toISOString();
    saveDb(DB);
    return ocorrencia;
  }

  // === catalogos ===
  if (r0 === 'catalogos' && r1 === 'modelos-componente' && method === 'GET') {
    return DB.modelosComponente;
  }
  if (r0 === 'catalogos' && r1 === 'modelos-componente' && method === 'POST') {
    const existente = DB.modelosComponente.find(
      (m) => m.tipo === body.tipo && m.fabricante === body.fabricante && m.modelo === body.modelo
    );
    if (existente) return existente;
    const modelo = { id: nextId(DB.modelosComponente), ...body };
    DB.modelosComponente.push(modelo);
    saveDb(DB);
    return modelo;
  }
  if (r0 === 'catalogos' && r1 === 'softwares' && method === 'GET') {
    return DB.softwares;
  }
  if (r0 === 'catalogos' && r1 === 'softwares' && method === 'POST') {
    const existente = DB.softwares.find(
      (s) => s.nome === body.nome && s.fabricante === body.fabricante && s.versao === body.versao
    );
    if (existente) return existente;
    const software = { id: nextId(DB.softwares), ...body };
    DB.softwares.push(software);
    saveDb(DB);
    return software;
  }
  if (r0 === 'catalogos' && r1 === 'vulnerabilidades' && method === 'GET') {
    let lista = DB.vulnerabilidades;
    const softwareId = q.get('software_id');
    const componenteModeloId = q.get('componente_modelo_id');
    if (softwareId) lista = lista.filter((v) => v.software_id === Number(softwareId));
    if (componenteModeloId) lista = lista.filter((v) => v.componente_modelo_id === Number(componenteModeloId));
    return lista;
  }
  if (r0 === 'catalogos' && r1 === 'vulnerabilidades' && method === 'POST') {
    const vuln = { id: nextId(DB.vulnerabilidades), ...body };
    DB.vulnerabilidades.push(vuln);
    saveDb(DB);
    return vuln;
  }

  // === dashboard ===
  if (r0 === 'dashboard' && r1 === 'resumo' && method === 'GET') {
    const filialId = q.get('filial_id');
    const escopo = filialId ? DB.equipamentos.filter((e) => e.filial_id === Number(filialId)) : DB.equipamentos;
    const idsEscopo = new Set(escopo.map((e) => e.id));
    const ocorrenciasEscopo = DB.ocorrencias.filter((o) => o.status === 'pendente' && idsEscopo.has(o.equipamento_id));
    const manutencoesEscopo = DB.manutencoes.filter((m) => m.status === 'aberta' && idsEscopo.has(m.equipamento_id));
    return {
      equipamentos_total: escopo.length,
      equipamentos_ativos: escopo.filter((e) => e.status === 'ativo').length,
      equipamentos_em_manutencao: escopo.filter((e) => e.status === 'manutencao').length,
      equipamentos_inativos: escopo.filter((e) => e.status === 'inativo').length,
      ocorrencias_pendentes: ocorrenciasEscopo.length,
      ocorrencias_pendentes_criticas: ocorrenciasEscopo.filter((o) => o.severidade === 'critica').length,
      manutencoes_abertas: manutencoesEscopo.length,
    };
  }
  if (r0 === 'dashboard' && r1 === 'mapa-exposicao' && method === 'GET') {
    return DB.filiais.map((f) => {
      const idsFilial = new Set(DB.equipamentos.filter((e) => e.filial_id === f.id).map((e) => e.id));
      const pendentes = DB.ocorrencias.filter((o) => o.status === 'pendente' && idsFilial.has(o.equipamento_id));
      return {
        filial_id: f.id,
        filial_nome: f.nome,
        pendentes: pendentes.length,
        pendentes_criticas: pendentes.filter((o) => o.severidade === 'critica').length,
      };
    });
  }

  notFound(`Rota de demonstração não implementada: ${method} /${segs.join('/')}`);
}

async function apiFetch(path, { method = 'GET', body } = {}) {
  await new Promise((resolve) => setTimeout(resolve, 20)); // só estética, simula latência de rede

  const [pathname, qs] = path.replace(/^\/+/, '').split('?');
  const segs = pathname.split('/').filter(Boolean);
  const q = new URLSearchParams(qs || '');

  return handle(method, segs, q, body);
}

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value + (value.length === 10 ? 'T00:00:00' : ''));
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('pt-BR');
}
