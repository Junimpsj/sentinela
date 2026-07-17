const SEVERIDADE_BADGE = { baixa: 'badge--muted', media: 'badge--amber', alta: 'badge--amber', critica: 'badge--danger' };
const OCORRENCIA_BADGE = { pendente: 'badge--danger', corrigido: 'badge--success', ignorado: 'badge--muted' };
const MANUTENCAO_BADGE = { aberta: 'badge--amber', concluida: 'badge--success' };
const STATUS_BADGE_DETALHE = { ativo: 'badge--success', manutencao: 'badge--amber', inativo: 'badge--muted' };

(async function () {
  const user = await initShell('equipamentos', 'Detalhe do equipamento');
  if (!user) return;

  const params = new URLSearchParams(window.location.search);
  const equipamentoId = params.get('id');
  if (!equipamentoId) {
    window.location.href = 'equipamentos.html';
    return;
  }

  const content = document.getElementById('pageContent');
  content.innerHTML = `
    <div id="headerBox"></div>
    <div class="detail-grid">
      <div>
        <div class="panel" id="componentesPanel"></div>
        <div class="panel" id="softwaresPanel"></div>
        <div class="panel" id="manutencoesPanel"></div>
      </div>
      <div>
        <div class="panel" id="ocorrenciasPanel"></div>
        <div class="panel" id="movimentacoesPanel"></div>
      </div>
    </div>
    <div id="modalWrap"></div>
  `;

  let equipamento;
  try {
    equipamento = await apiFetch(`/equipamentos/${equipamentoId}`);
  } catch (err) {
    content.innerHTML = `<div class="alert alert--danger">${escapeHtml(err.message)}</div>`;
    return;
  }

  renderHeader(equipamento);
  await Promise.all([
    carregarComponentes(),
    carregarSoftwares(),
    carregarManutencoes(),
    carregarOcorrencias(),
    carregarMovimentacoes(),
  ]);

  function renderHeader(eq) {
    document.getElementById('headerBox').innerHTML = `
      <div class="detail-header">
        <div>
          <div class="detail-header__title">${escapeHtml(eq.patrimonio)}</div>
          <div class="detail-header__meta">
            <span>${escapeHtml(eq.tipo)}</span>
            <span>${escapeHtml(eq.hostname || 'sem hostname')}</span>
            <span>${escapeHtml(eq.endereco_ip || 'sem IP')}</span>
          </div>
        </div>
        <span class="badge ${STATUS_BADGE_DETALHE[eq.status] || 'badge--muted'}">${eq.status}</span>
      </div>
    `;
  }

  // === Componentes (RF09/RF21) ===
  async function carregarComponentes() {
    const panel = document.getElementById('componentesPanel');
    const lista = await apiFetch(`/equipamentos/${equipamentoId}/componentes`).catch((err) => {
      panel.innerHTML = `<div class="alert alert--danger">${escapeHtml(err.message)}</div>`;
      return null;
    });
    if (lista === null) return;

    panel.innerHTML = `
      <div class="panel__header">
        <div class="panel__title">Componentes</div>
        <button class="btn btn--sm btn--primary" id="addComponenteBtn">+ Instalar</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Tipo</th><th>Modelo</th><th>Status</th><th>Instalado em</th></tr></thead>
          <tbody>
            ${lista.length === 0
              ? '<tr><td colspan="4"><div class="table-empty">Nenhum componente.</div></td></tr>'
              : lista
                  .map(
                    (c) => `<tr>
                      <td>${escapeHtml(c.modelo_tipo)}</td>
                      <td>${escapeHtml(c.modelo_fabricante)} ${escapeHtml(c.modelo_nome)}</td>
                      <td><span class="badge ${c.status === 'ativo' ? 'badge--success' : 'badge--muted'}">${c.status}</span></td>
                      <td>${formatDateTime(c.data_instalacao)}</td>
                    </tr>`
                  )
                  .join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('addComponenteBtn').addEventListener('click', async () => {
      const modelos = await apiFetch('/catalogos/modelos-componente').catch(() => []);
      openModal(
        'Instalar componente',
        `
        <div class="form-group">
          <label for="fModelo">Modelo (catálogo)</label>
          <select id="fModelo" required>${modelos.map((m) => `<option value="${m.id}">${escapeHtml(m.tipo)} — ${escapeHtml(m.fabricante)} ${escapeHtml(m.modelo)}</option>`).join('')}</select>
        </div>
        `,
        async () => {
          await apiFetch(`/equipamentos/${equipamentoId}/componentes`, {
            method: 'POST',
            body: { modelo_componente_id: Number(document.getElementById('fModelo').value) },
          });
          await carregarComponentes();
        }
      );
    });
  }

  // === Softwares (RF12/RF13) ===
  async function carregarSoftwares() {
    const panel = document.getElementById('softwaresPanel');
    const lista = await apiFetch(`/equipamentos/${equipamentoId}/softwares`).catch((err) => {
      panel.innerHTML = `<div class="alert alert--danger">${escapeHtml(err.message)}</div>`;
      return null;
    });
    if (lista === null) return;

    panel.innerHTML = `
      <div class="panel__header">
        <div class="panel__title">Softwares</div>
        <button class="btn btn--sm btn--primary" id="addSoftwareBtn">+ Instalar</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Software</th><th>Versão</th><th>Instalado em</th><th>Licença válida até</th></tr></thead>
          <tbody>
            ${lista.length === 0
              ? '<tr><td colspan="4"><div class="table-empty">Nenhum software instalado.</div></td></tr>'
              : lista
                  .map(
                    (s) => `<tr>
                      <td>${escapeHtml(s.software_nome)}</td>
                      <td>${escapeHtml(s.software_versao)}</td>
                      <td>${formatDateTime(s.data_instalacao)}</td>
                      <td>${s.validade_licenca ? formatDate(s.validade_licenca) : '—'}</td>
                    </tr>`
                  )
                  .join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('addSoftwareBtn').addEventListener('click', async () => {
      const softwares = await apiFetch('/catalogos/softwares').catch(() => []);
      openModal(
        'Instalar software',
        `
        <div class="form-group">
          <label for="fSoftware">Software (catálogo)</label>
          <select id="fSoftware" required>${softwares.map((s) => `<option value="${s.id}">${escapeHtml(s.nome)} — ${escapeHtml(s.versao)}</option>`).join('')}</select>
        </div>
        <div class="form-group">
          <label for="fChave">Chave de licença</label>
          <input type="text" id="fChave">
        </div>
        <div class="form-group">
          <label for="fValidade">Validade da licença</label>
          <input type="date" id="fValidade">
        </div>
        `,
        async () => {
          await apiFetch(`/equipamentos/${equipamentoId}/softwares`, {
            method: 'POST',
            body: {
              software_id: Number(document.getElementById('fSoftware').value),
              chave_licenca: document.getElementById('fChave').value.trim() || null,
              validade_licenca: document.getElementById('fValidade').value || null,
            },
          });
          await carregarSoftwares();
        }
      );
    });
  }

  // === Manutenções (RF10/RF11) ===
  async function carregarManutencoes() {
    const panel = document.getElementById('manutencoesPanel');
    const lista = await apiFetch(`/equipamentos/${equipamentoId}/manutencoes`).catch((err) => {
      panel.innerHTML = `<div class="alert alert--danger">${escapeHtml(err.message)}</div>`;
      return null;
    });
    if (lista === null) return;

    panel.innerHTML = `
      <div class="panel__header">
        <div class="panel__title">Manutenções</div>
        <button class="btn btn--sm btn--primary" id="addManutencaoBtn">+ Registrar</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Data</th><th>Descrição</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${lista.length === 0
              ? '<tr><td colspan="4"><div class="table-empty">Nenhuma manutenção.</div></td></tr>'
              : lista
                  .map(
                    (m) => `<tr>
                      <td>${formatDateTime(m.data)}</td>
                      <td style="white-space:normal;max-width:260px;">${escapeHtml(m.descricao)}</td>
                      <td><span class="badge ${MANUTENCAO_BADGE[m.status]}">${m.status}</span></td>
                      <td>${m.status === 'aberta' ? `<button class="btn btn--sm btn--ghost" data-encerrar="${m.id}">Encerrar</button>` : ''}</td>
                    </tr>`
                  )
                  .join('')}
          </tbody>
        </table>
      </div>
    `;

    panel.querySelectorAll('[data-encerrar]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await apiFetch(`/manutencoes/${btn.dataset.encerrar}`, { method: 'PATCH' });
          await carregarManutencoes();
        } catch (err) {
          alert(err.message);
        }
      });
    });

    document.getElementById('addManutencaoBtn').addEventListener('click', async () => {
      const componentesAtivos = (await apiFetch(`/equipamentos/${equipamentoId}/componentes`).catch(() => [])).filter(
        (c) => c.status === 'ativo'
      );
      const modelos = await apiFetch('/catalogos/modelos-componente').catch(() => []);

      openModal(
        'Registrar manutenção',
        `
        <div class="form-group">
          <label for="fDescricao">Descrição</label>
          <textarea id="fDescricao" required></textarea>
        </div>
        <div class="form-group">
          <label><input type="checkbox" id="fTrocaCheck" style="width:auto;display:inline-block;margin-right:.4rem;">Incluir troca de componente</label>
        </div>
        <div id="trocaFields" class="hidden">
          <div class="form-group">
            <label for="fComponenteAntigo">Componente a substituir</label>
            <select id="fComponenteAntigo">${componentesAtivos.map((c) => `<option value="${c.id}">${escapeHtml(c.modelo_tipo)} — ${escapeHtml(c.modelo_fabricante)} ${escapeHtml(c.modelo_nome)}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label for="fModeloNovo">Novo modelo (catálogo)</label>
            <select id="fModeloNovo">${modelos.map((m) => `<option value="${m.id}">${escapeHtml(m.tipo)} — ${escapeHtml(m.fabricante)} ${escapeHtml(m.modelo)}</option>`).join('')}</select>
          </div>
        </div>
        `,
        async () => {
          const trocaAtiva = document.getElementById('fTrocaCheck').checked;
          const payload = { descricao: document.getElementById('fDescricao').value.trim() };
          if (trocaAtiva) {
            payload.troca_componente = {
              componente_antigo_id: Number(document.getElementById('fComponenteAntigo').value),
              modelo_componente_id_novo: Number(document.getElementById('fModeloNovo').value),
            };
          }
          await apiFetch(`/equipamentos/${equipamentoId}/manutencoes`, { method: 'POST', body: payload });
          await Promise.all([carregarManutencoes(), carregarComponentes()]);
        }
      );

      document.getElementById('fTrocaCheck').addEventListener('change', (e) => {
        document.getElementById('trocaFields').classList.toggle('hidden', !e.target.checked);
      });
    });
  }

  // === Ocorrências de vulnerabilidade (RF16/RF17) ===
  async function carregarOcorrencias() {
    const panel = document.getElementById('ocorrenciasPanel');
    const lista = await apiFetch(`/equipamentos/${equipamentoId}/ocorrencias`).catch((err) => {
      panel.innerHTML = `<div class="alert alert--danger">${escapeHtml(err.message)}</div>`;
      return null;
    });
    if (lista === null) return;

    panel.innerHTML = `
      <div class="panel__header"><div class="panel__title">Vulnerabilidades</div></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>CVE</th><th>Severidade</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${lista.length === 0
              ? '<tr><td colspan="4"><div class="table-empty">Nenhuma ocorrência.</div></td></tr>'
              : lista
                  .map(
                    (o) => `<tr>
                      <td>${escapeHtml(o.codigo_cve)}</td>
                      <td><span class="badge ${SEVERIDADE_BADGE[o.severidade]}">${o.severidade}</span></td>
                      <td><span class="badge ${OCORRENCIA_BADGE[o.status]}">${o.status}</span></td>
                      <td>${o.status === 'pendente'
                        ? `<button class="btn btn--sm btn--ghost" data-ocorrencia="${o.id}" data-status="corrigido">Corrigir</button>
                           <button class="btn btn--sm btn--ghost" data-ocorrencia="${o.id}" data-status="ignorado">Ignorar</button>`
                        : ''}</td>
                    </tr>`
                  )
                  .join('')}
          </tbody>
        </table>
      </div>
    `;

    panel.querySelectorAll('[data-ocorrencia]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await apiFetch(`/ocorrencias-vulnerabilidade/${btn.dataset.ocorrencia}`, {
            method: 'PATCH',
            body: { status: btn.dataset.status },
          });
          await carregarOcorrencias();
        } catch (err) {
          alert(err.message);
        }
      });
    });
  }

  // === Movimentações (RF19/RF20) ===
  async function carregarMovimentacoes() {
    const panel = document.getElementById('movimentacoesPanel');
    const lista = await apiFetch(`/equipamentos/${equipamentoId}/movimentacoes`).catch((err) => {
      panel.innerHTML = `<div class="alert alert--danger">${escapeHtml(err.message)}</div>`;
      return null;
    });
    if (lista === null) return;

    panel.innerHTML = `
      <div class="panel__header">
        <div class="panel__title">Movimentações</div>
        <button class="btn btn--sm btn--primary" id="addMovBtn">+ Movimentar</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Data</th><th>De</th><th>Para</th><th>Motivo</th></tr></thead>
          <tbody>
            ${lista.length === 0
              ? '<tr><td colspan="4"><div class="table-empty">Nenhuma movimentação.</div></td></tr>'
              : lista
                  .map(
                    (m) => `<tr>
                      <td>${formatDateTime(m.data)}</td>
                      <td>${escapeHtml(m.origem_nome)}</td>
                      <td>${escapeHtml(m.destino_nome)}</td>
                      <td>${escapeHtml(m.motivo || '—')}</td>
                    </tr>`
                  )
                  .join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('addMovBtn').addEventListener('click', async () => {
      const equipamentoAtual = await apiFetch(`/equipamentos/${equipamentoId}`).catch(() => null);
      const departamentos = equipamentoAtual
        ? await apiFetch(`/departamentos?filial_id=${equipamentoAtual.filial_id}`).catch(() => [])
        : [];

      openModal(
        'Movimentar equipamento',
        `
        <div class="form-group">
          <label for="fDestino">Departamento de destino</label>
          <select id="fDestino" required>${departamentos.map((d) => `<option value="${d.id}">${escapeHtml(d.nome)}</option>`).join('')}</select>
        </div>
        <div class="form-group">
          <label for="fMotivo">Motivo</label>
          <input type="text" id="fMotivo">
        </div>
        `,
        async () => {
          await apiFetch(`/equipamentos/${equipamentoId}/movimentacoes`, {
            method: 'POST',
            body: {
              departamento_destino_id: Number(document.getElementById('fDestino').value),
              motivo: document.getElementById('fMotivo').value.trim() || null,
            },
          });
          await carregarMovimentacoes();
        }
      );
    });
  }
})();
