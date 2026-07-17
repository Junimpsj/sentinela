(async function () {
  const user = await initShell('dashboard', 'Dashboard');
  if (!user) return;

  const content = document.getElementById('pageContent');
  content.innerHTML = `
    <div id="empresaPanel"></div>
    <div id="filialFilterWrap"></div>
    <div class="kpi-grid" id="kpiGrid"></div>
    <div class="panel" id="exposicaoPanel"></div>
  `;

  await loadEmpresa();

  if (user.tipo_acesso === 'dono_empresa') {
    await renderFilialFilter();
  }

  await loadResumo();
  await loadMapaExposicao(user);

  async function loadEmpresa() {
    const panel = document.getElementById('empresaPanel');
    let empresa;
    try {
      empresa = await apiFetch('/empresas/me');
    } catch (_) {
      panel.remove();
      return;
    }
    panel.innerHTML = `
      <div class="panel" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;">
        <div>
          <div class="panel__title">${escapeHtml(empresa.razao_social)}</div>
          <div class="form-hint">CNPJ ${escapeHtml(empresa.cnpj)} · ${escapeHtml(empresa.email)}</div>
        </div>
        <span class="badge badge--primary">Cliente desde ${formatDate(String(empresa.criado_em).slice(0, 10))}</span>
      </div>
    `;
  }

  async function renderFilialFilter() {
    let filiais = [];
    try {
      filiais = await apiFetch('/filiais');
    } catch (_) {
      return;
    }
    const wrap = document.getElementById('filialFilterWrap');
    wrap.innerHTML = `
      <div class="form-group" style="max-width:320px;">
        <label for="filialFilter">Filtrar por filial</label>
        <select id="filialFilter">
          <option value="">Todas as filiais</option>
          ${filiais.map((f) => `<option value="${f.id}">${escapeHtml(f.nome)}</option>`).join('')}
        </select>
      </div>
    `;
    document.getElementById('filialFilter').addEventListener('change', (e) => {
      loadResumo(e.target.value || null);
    });
  }

  async function loadResumo(filialId) {
    const grid = document.getElementById('kpiGrid');
    let query = '';
    if (filialId) query = `?filial_id=${encodeURIComponent(filialId)}`;
    let resumo;
    try {
      resumo = await apiFetch(`/dashboard/resumo${query}`);
    } catch (err) {
      grid.innerHTML = `<div class="alert alert--danger">${escapeHtml(err.message)}</div>`;
      return;
    }
    grid.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-card__label">Equipamentos</div>
        <div class="kpi-card__value">${resumo.equipamentos_total}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__label">Ativos</div>
        <div class="kpi-card__value">${resumo.equipamentos_ativos}</div>
      </div>
      <div class="kpi-card kpi-card--amber">
        <div class="kpi-card__label">Manutenções abertas</div>
        <div class="kpi-card__value">${resumo.manutencoes_abertas}</div>
      </div>
      <div class="kpi-card kpi-card--danger">
        <div class="kpi-card__label">Vulnerabilidades pendentes</div>
        <div class="kpi-card__value">${resumo.ocorrencias_pendentes}</div>
        ${resumo.ocorrencias_pendentes_criticas > 0
          ? `<span class="badge badge--danger" style="margin-top:.5rem;"><span class="dot dot--danger"></span>${resumo.ocorrencias_pendentes_criticas} crítica(s)</span>`
          : ''}
      </div>
    `;
  }

  async function loadMapaExposicao(currentUser) {
    const panel = document.getElementById('exposicaoPanel');
    if (currentUser.tipo_acesso === 'colaborador') {
      panel.remove();
      return;
    }
    let mapa;
    try {
      mapa = await apiFetch('/dashboard/mapa-exposicao');
    } catch (err) {
      panel.innerHTML = `<div class="alert alert--danger">${escapeHtml(err.message)}</div>`;
      return;
    }
    const titulo = currentUser.tipo_acesso === 'dono_empresa' ? 'Exposição por filial' : 'Exposição por departamento';
    panel.innerHTML = `
      <div class="panel__header"><div class="panel__title">${titulo}</div></div>
      ${mapa.length === 0 ? '<div class="table-empty">Nenhum dado disponível.</div>' : mapa.map((item) => `
        <div class="exposure-card">
          <div class="exposure-card__name">${escapeHtml(item.filial_nome || item.departamento_nome)}</div>
          <div class="exposure-card__stats">
            <span>${item.pendentes} pendente(s)</span>
            ${item.pendentes_criticas > 0
              ? `<span class="badge badge--danger"><span class="dot dot--danger"></span>${item.pendentes_criticas} crítica(s)</span>`
              : '<span class="badge badge--success">sem críticas</span>'}
          </div>
        </div>
      `).join('')}
    `;
  }
})();
