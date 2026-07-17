const TIPOS_COMPONENTE = ['cpu', 'ram', 'hd', 'ssd', 'placa_mae', 'fonte', 'outro'];
const SEVERIDADES = ['baixa', 'media', 'alta', 'critica'];
const SEVERIDADE_BADGE_CAT = { baixa: 'badge--muted', media: 'badge--amber', alta: 'badge--amber', critica: 'badge--danger' };

(async function () {
  const user = await initShell('catalogos', 'Catálogos');
  if (!user) return;

  const podeCriar = user.tipo_acesso === 'dono_empresa' || user.tipo_acesso === 'admin_filial';
  const content = document.getElementById('pageContent');

  content.innerHTML = `
    <div class="tabs">
      <div class="tab is-active" data-tab="softwares">Softwares</div>
      <div class="tab" data-tab="componentes">Componentes</div>
      <div class="tab" data-tab="vulnerabilidades">Vulnerabilidades</div>
    </div>
    <div id="tabSoftwares"></div>
    <div id="tabComponentes" class="hidden"></div>
    <div id="tabVulnerabilidades" class="hidden"></div>
    <div id="modalWrap"></div>
  `;

  content.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      content.querySelectorAll('.tab').forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      ['softwares', 'componentes', 'vulnerabilidades'].forEach((key) => {
        document.getElementById(`tab${capitalize(key)}`).classList.toggle('hidden', key !== tab.dataset.tab);
      });
    });
  });

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  await renderSoftwares();
  await renderComponentes();
  await renderVulnerabilidades();

  // === Softwares ===
  async function renderSoftwares() {
    const el = document.getElementById('tabSoftwares');
    el.innerHTML = `
      <div class="panel">
        <div class="panel__header">
          <div class="panel__title">Softwares</div>
          ${podeCriar ? '<button class="btn btn--sm btn--primary" id="novoSoftwareBtn">+ Novo</button>' : ''}
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Nome</th><th>Fabricante</th><th>Versão</th></tr></thead>
            <tbody id="softwaresBody"></tbody>
          </table>
        </div>
      </div>
    `;
    if (podeCriar) {
      document.getElementById('novoSoftwareBtn').addEventListener('click', () => {
        openModal(
          'Novo software',
          `
          <div class="form-group"><label for="fNome">Nome</label><input type="text" id="fNome" required></div>
          <div class="form-group"><label for="fFabricante">Fabricante</label><input type="text" id="fFabricante" required></div>
          <div class="form-group"><label for="fVersao">Versão</label><input type="text" id="fVersao" required></div>
          `,
          async () => {
            await apiFetch('/catalogos/softwares', {
              method: 'POST',
              body: {
                nome: document.getElementById('fNome').value.trim(),
                fabricante: document.getElementById('fFabricante').value.trim(),
                versao: document.getElementById('fVersao').value.trim(),
              },
            });
            await carregarSoftwares();
          }
        );
      });
    }
    await carregarSoftwares();
  }

  async function carregarSoftwares() {
    const tbody = document.getElementById('softwaresBody');
    const lista = await apiFetch('/catalogos/softwares').catch((err) => {
      tbody.innerHTML = `<tr><td colspan="3"><div class="alert alert--danger">${escapeHtml(err.message)}</div></td></tr>`;
      return [];
    });
    tbody.innerHTML =
      lista.length === 0
        ? '<tr><td colspan="3"><div class="table-empty">Nenhum software.</div></td></tr>'
        : lista.map((s) => `<tr><td>${escapeHtml(s.nome)}</td><td>${escapeHtml(s.fabricante)}</td><td>${escapeHtml(s.versao)}</td></tr>`).join('');
  }

  // === Modelos de componente ===
  async function renderComponentes() {
    const el = document.getElementById('tabComponentes');
    el.innerHTML = `
      <div class="panel">
        <div class="panel__header">
          <div class="panel__title">Modelos de componente</div>
          ${podeCriar ? '<button class="btn btn--sm btn--primary" id="novoComponenteBtn">+ Novo</button>' : ''}
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Tipo</th><th>Fabricante</th><th>Modelo</th></tr></thead>
            <tbody id="componentesBody"></tbody>
          </table>
        </div>
      </div>
    `;
    if (podeCriar) {
      document.getElementById('novoComponenteBtn').addEventListener('click', () => {
        openModal(
          'Novo modelo de componente',
          `
          <div class="form-group">
            <label for="fTipo">Tipo</label>
            <select id="fTipo">${TIPOS_COMPONENTE.map((t) => `<option value="${t}">${t}</option>`).join('')}</select>
          </div>
          <div class="form-group"><label for="fFabricante">Fabricante</label><input type="text" id="fFabricante" required></div>
          <div class="form-group"><label for="fModelo">Modelo</label><input type="text" id="fModelo" required></div>
          `,
          async () => {
            await apiFetch('/catalogos/modelos-componente', {
              method: 'POST',
              body: {
                tipo: document.getElementById('fTipo').value,
                fabricante: document.getElementById('fFabricante').value.trim(),
                modelo: document.getElementById('fModelo').value.trim(),
              },
            });
            await carregarComponentes();
          }
        );
      });
    }
    await carregarComponentes();
  }

  async function carregarComponentes() {
    const tbody = document.getElementById('componentesBody');
    const lista = await apiFetch('/catalogos/modelos-componente').catch((err) => {
      tbody.innerHTML = `<tr><td colspan="3"><div class="alert alert--danger">${escapeHtml(err.message)}</div></td></tr>`;
      return [];
    });
    tbody.innerHTML =
      lista.length === 0
        ? '<tr><td colspan="3"><div class="table-empty">Nenhum modelo cadastrado.</div></td></tr>'
        : lista.map((m) => `<tr><td>${escapeHtml(m.tipo)}</td><td>${escapeHtml(m.fabricante)}</td><td>${escapeHtml(m.modelo)}</td></tr>`).join('');
  }

  // === Vulnerabilidades (RF14) ===
  async function renderVulnerabilidades() {
    const el = document.getElementById('tabVulnerabilidades');
    const softwares = await apiFetch('/catalogos/softwares').catch(() => []);
    const modelos = await apiFetch('/catalogos/modelos-componente').catch(() => []);

    el.innerHTML = `
      <div class="panel">
        <div class="panel__header">
          <div class="panel__title">Vulnerabilidades</div>
          ${podeCriar ? '<button class="btn btn--sm btn--primary" id="novaVulnBtn">+ Nova</button>' : ''}
        </div>
        <div class="form-grid" style="margin-bottom:1rem;">
          <div class="form-group">
            <label for="filtroSoftware">Filtrar por software</label>
            <select id="filtroSoftware"><option value="">Todos</option>${softwares.map((s) => `<option value="${s.id}">${escapeHtml(s.nome)}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label for="filtroComponente">Filtrar por modelo de componente</label>
            <select id="filtroComponente"><option value="">Todos</option>${modelos.map((m) => `<option value="${m.id}">${escapeHtml(m.fabricante)} ${escapeHtml(m.modelo)}</option>`).join('')}</select>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>CVE</th><th>Severidade</th><th>Alvo</th><th>Descrição</th></tr></thead>
            <tbody id="vulnBody"></tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('filtroSoftware').addEventListener('change', (e) => {
      if (e.target.value) document.getElementById('filtroComponente').value = '';
      carregarVulnerabilidades();
    });
    document.getElementById('filtroComponente').addEventListener('change', (e) => {
      if (e.target.value) document.getElementById('filtroSoftware').value = '';
      carregarVulnerabilidades();
    });

    if (podeCriar) {
      document.getElementById('novaVulnBtn').addEventListener('click', () => {
        openModal(
          'Nova vulnerabilidade',
          `
          <div class="form-group">
            <label for="fAlvo">Tipo de alvo</label>
            <select id="fAlvo"><option value="software">Software</option><option value="componente">Modelo de componente</option></select>
          </div>
          <div class="form-group" id="fSoftwareWrap">
            <label for="fSoftwareSel">Software</label>
            <select id="fSoftwareSel">${softwares.map((s) => `<option value="${s.id}">${escapeHtml(s.nome)}</option>`).join('')}</select>
          </div>
          <div class="form-group hidden" id="fComponenteWrap">
            <label for="fComponenteSel">Modelo de componente</label>
            <select id="fComponenteSel">${modelos.map((m) => `<option value="${m.id}">${escapeHtml(m.fabricante)} ${escapeHtml(m.modelo)}</option>`).join('')}</select>
          </div>
          <div class="form-group"><label for="fCve">Código CVE</label><input type="text" id="fCve" required></div>
          <div class="form-group">
            <label for="fSeveridade">Severidade</label>
            <select id="fSeveridade">${SEVERIDADES.map((s) => `<option value="${s}">${s}</option>`).join('')}</select>
          </div>
          <div class="form-group"><label for="fDescricao">Descrição</label><textarea id="fDescricao" required></textarea></div>
          `,
          async () => {
            const alvo = document.getElementById('fAlvo').value;
            await apiFetch('/catalogos/vulnerabilidades', {
              method: 'POST',
              body: {
                software_id: alvo === 'software' ? Number(document.getElementById('fSoftwareSel').value) : null,
                componente_modelo_id: alvo === 'componente' ? Number(document.getElementById('fComponenteSel').value) : null,
                codigo_cve: document.getElementById('fCve').value.trim(),
                severidade: document.getElementById('fSeveridade').value,
                descricao: document.getElementById('fDescricao').value.trim(),
              },
            });
            await carregarVulnerabilidades();
          }
        );

        document.getElementById('fAlvo').addEventListener('change', (e) => {
          const isSoftware = e.target.value === 'software';
          document.getElementById('fSoftwareWrap').classList.toggle('hidden', !isSoftware);
          document.getElementById('fComponenteWrap').classList.toggle('hidden', isSoftware);
        });
      });
    }

    await carregarVulnerabilidades();
  }

  async function carregarVulnerabilidades() {
    const tbody = document.getElementById('vulnBody');
    const params = new URLSearchParams();
    const softwareId = document.getElementById('filtroSoftware').value;
    const componenteId = document.getElementById('filtroComponente').value;
    if (softwareId) params.set('software_id', softwareId);
    if (componenteId) params.set('componente_modelo_id', componenteId);

    const lista = await apiFetch(`/catalogos/vulnerabilidades?${params.toString()}`).catch((err) => {
      tbody.innerHTML = `<tr><td colspan="4"><div class="alert alert--danger">${escapeHtml(err.message)}</div></td></tr>`;
      return [];
    });

    tbody.innerHTML =
      lista.length === 0
        ? '<tr><td colspan="4"><div class="table-empty">Nenhuma vulnerabilidade encontrada.</div></td></tr>'
        : lista
            .map(
              (v) => `<tr>
                <td>${escapeHtml(v.codigo_cve)}</td>
                <td><span class="badge ${SEVERIDADE_BADGE_CAT[v.severidade]}">${v.severidade}</span></td>
                <td>${v.software_id ? 'software' : 'componente'}</td>
                <td style="white-space:normal;max-width:340px;">${escapeHtml(v.descricao)}</td>
              </tr>`
            )
            .join('');
  }
})();
