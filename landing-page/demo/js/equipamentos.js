const TIPOS_EQUIPAMENTO = ['desktop', 'notebook', 'servidor', 'impressora', 'switch', 'roteador', 'outro'];
const STATUS_EQUIPAMENTO = ['ativo', 'manutencao', 'inativo'];

const STATUS_BADGE = {
  ativo: 'badge--success',
  manutencao: 'badge--amber',
  inativo: 'badge--muted',
};

(async function () {
  const user = await initShell('equipamentos', 'Equipamentos');
  if (!user) return;

  const podecriar = user.tipo_acesso === 'dono_empresa' || user.tipo_acesso === 'admin_filial';
  const content = document.getElementById('pageContent');

  content.innerHTML = `
    <div class="panel">
      <div class="panel__header">
        <div class="panel__title">Filtros</div>
        ${podecriar ? '<button class="btn btn--primary btn--sm" id="novoBtn">+ Novo equipamento</button>' : ''}
      </div>
      <div class="form-grid" id="filtrosGrid"></div>
    </div>
    <div class="panel">
      <div class="table-wrap">
        <table id="tabela">
          <thead>
            <tr><th>Patrimônio</th><th>Tipo</th><th>Hostname</th><th>IP</th><th>Status</th><th>Departamento</th></tr>
          </thead>
          <tbody id="tabelaBody"></tbody>
        </table>
      </div>
    </div>
    <div id="modalWrap"></div>
  `;

  let filiais = [];
  if (user.tipo_acesso === 'dono_empresa') {
    filiais = await apiFetch('/filiais').catch(() => []);
  }

  await renderFiltros();
  await carregarLista();

  if (podecriar) {
    document.getElementById('novoBtn').addEventListener('click', () => abrirModalCriacao());
  }

  async function renderFiltros() {
    const grid = document.getElementById('filtrosGrid');
    const filialOptions =
      user.tipo_acesso === 'dono_empresa'
        ? `<div class="form-group">
             <label for="filFilial">Filial</label>
             <select id="filFilial"><option value="">Todas</option>${filiais
               .map((f) => `<option value="${f.id}">${escapeHtml(f.nome)}</option>`)
               .join('')}</select>
           </div>`
        : '';

    grid.innerHTML = `
      ${filialOptions}
      <div class="form-group">
        <label for="filTipo">Tipo</label>
        <select id="filTipo"><option value="">Todos</option>${TIPOS_EQUIPAMENTO.map((t) => `<option value="${t}">${t}</option>`).join('')}</select>
      </div>
      <div class="form-group">
        <label for="filStatus">Status</label>
        <select id="filStatus"><option value="">Todos</option>${STATUS_EQUIPAMENTO.map((s) => `<option value="${s}">${s}</option>`).join('')}</select>
      </div>
    `;

    grid.querySelectorAll('select').forEach((el) => el.addEventListener('change', carregarLista));
  }

  async function carregarLista() {
    const params = new URLSearchParams();
    const filFilial = document.getElementById('filFilial');
    if (filFilial && filFilial.value) params.set('filial_id', filFilial.value);
    const tipo = document.getElementById('filTipo').value;
    if (tipo) params.set('tipo', tipo);
    const statusFiltro = document.getElementById('filStatus').value;
    if (statusFiltro) params.set('status_filtro', statusFiltro);

    const tbody = document.getElementById('tabelaBody');
    let lista;
    try {
      lista = await apiFetch(`/equipamentos?${params.toString()}`);
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="alert alert--danger">${escapeHtml(err.message)}</div></td></tr>`;
      return;
    }

    if (lista.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="table-empty">Nenhum equipamento encontrado.</div></td></tr>`;
      return;
    }

    tbody.innerHTML = lista
      .map(
        (eq) => `
      <tr style="cursor:pointer;" onclick="window.location.href='equipamento-detalhe.html?id=${eq.id}'">
        <td>${escapeHtml(eq.patrimonio)}</td>
        <td>${escapeHtml(eq.tipo)}</td>
        <td>${escapeHtml(eq.hostname || '—')}</td>
        <td>${escapeHtml(eq.endereco_ip || '—')}</td>
        <td><span class="badge ${STATUS_BADGE[eq.status] || 'badge--muted'}">${eq.status}</span></td>
        <td>${eq.departamento_id ?? '—'}</td>
      </tr>`
      )
      .join('');
  }

  async function abrirModalCriacao() {
    let filiaisDisponiveis = filiais;
    if (user.tipo_acesso === 'admin_filial') {
      filiaisDisponiveis = await apiFetch('/filiais').catch(() => []);
    }

    const modalWrap = document.getElementById('modalWrap');
    modalWrap.innerHTML = `
      <div class="modal-overlay" id="overlay">
        <div class="modal">
          <div class="modal__title">Novo equipamento</div>
          <div id="modalAlert" class="alert alert--danger hidden"></div>
          <form id="criarForm">
            <div class="form-grid">
              <div class="form-group">
                <label for="mFilial">Filial</label>
                <select id="mFilial" required>${filiaisDisponiveis.map((f) => `<option value="${f.id}">${escapeHtml(f.nome)}</option>`).join('')}</select>
              </div>
              <div class="form-group">
                <label for="mDepto">Departamento</label>
                <select id="mDepto" required><option value="">Selecione a filial primeiro</option></select>
              </div>
              <div class="form-group">
                <label for="mTipo">Tipo</label>
                <select id="mTipo" required>${TIPOS_EQUIPAMENTO.map((t) => `<option value="${t}">${t}</option>`).join('')}</select>
              </div>
              <div class="form-group">
                <label for="mPatrimonio">Patrimônio</label>
                <input type="text" id="mPatrimonio" required>
              </div>
              <div class="form-group">
                <label for="mHostname">Hostname</label>
                <input type="text" id="mHostname">
              </div>
              <div class="form-group">
                <label for="mIp">Endereço IP</label>
                <input type="text" id="mIp">
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn--ghost" id="cancelarBtn">Cancelar</button>
              <button type="submit" class="btn btn--primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const filialSelect = document.getElementById('mFilial');
    const deptoSelect = document.getElementById('mDepto');

    async function carregarDeptos() {
      if (!filialSelect.value) return;
      const deptos = await apiFetch(`/departamentos?filial_id=${filialSelect.value}`).catch(() => []);
      deptoSelect.innerHTML = deptos.map((d) => `<option value="${d.id}">${escapeHtml(d.nome)}</option>`).join('');
    }
    filialSelect.addEventListener('change', carregarDeptos);
    if (filialSelect.value) await carregarDeptos();

    document.getElementById('cancelarBtn').addEventListener('click', () => modalWrap.innerHTML = '');
    document.getElementById('overlay').addEventListener('click', (e) => {
      if (e.target.id === 'overlay') modalWrap.innerHTML = '';
    });

    document.getElementById('criarForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const alertBox = document.getElementById('modalAlert');
      alertBox.classList.add('hidden');
      try {
        await apiFetch('/equipamentos', {
          method: 'POST',
          body: {
            filial_id: Number(filialSelect.value),
            departamento_id: Number(deptoSelect.value),
            tipo: document.getElementById('mTipo').value,
            patrimonio: document.getElementById('mPatrimonio').value.trim(),
            hostname: document.getElementById('mHostname').value.trim() || null,
            endereco_ip: document.getElementById('mIp').value.trim() || null,
          },
        });
        modalWrap.innerHTML = '';
        await carregarLista();
      } catch (err) {
        alertBox.textContent = err.message;
        alertBox.classList.remove('hidden');
      }
    });
  }
})();
