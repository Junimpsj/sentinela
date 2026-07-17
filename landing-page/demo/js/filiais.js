(async function () {
  const user = await initShell('filiais', 'Filiais & Departamentos');
  if (!user) return;

  const content = document.getElementById('pageContent');
  content.innerHTML = `
    <div class="panel">
      <div class="panel__header">
        <div class="panel__title">Filiais</div>
        ${user.tipo_acesso === 'dono_empresa' ? '<button class="btn btn--primary btn--sm" id="novaFilialBtn">+ Nova filial</button>' : ''}
      </div>
      <div id="filiaisList"></div>
    </div>
    <div id="modalWrap"></div>
  `;

  if (user.tipo_acesso === 'dono_empresa') {
    document.getElementById('novaFilialBtn').addEventListener('click', abrirModalNovaFilial);
  }

  await carregarFiliais();

  async function carregarFiliais() {
    const listEl = document.getElementById('filiaisList');
    let filiais;
    try {
      filiais = await apiFetch('/filiais');
    } catch (err) {
      listEl.innerHTML = `<div class="alert alert--danger">${escapeHtml(err.message)}</div>`;
      return;
    }

    if (filiais.length === 0) {
      listEl.innerHTML = '<div class="table-empty">Nenhuma filial cadastrada.</div>';
      return;
    }

    listEl.innerHTML = filiais
      .map(
        (f) => `
      <div class="panel" style="margin-bottom:1rem;background:var(--c-bg);">
        <div class="panel__header">
          <div>
            <div class="panel__title">${escapeHtml(f.nome)}</div>
            <div class="form-hint">${escapeHtml(f.cidade)}/${escapeHtml(f.uf)} — ${escapeHtml(f.endereco)}</div>
          </div>
          <div style="display:flex;gap:.5rem;">
            <button class="btn btn--sm btn--ghost" data-depto="${f.id}">+ Departamento</button>
            ${user.tipo_acesso === 'dono_empresa' ? `<button class="btn btn--sm btn--ghost" data-duplicar="${f.id}">Duplicar</button>` : ''}
          </div>
        </div>
        <div class="table-wrap" id="deptos-${f.id}"></div>
      </div>
    `
      )
      .join('');

    for (const f of filiais) {
      await carregarDepartamentos(f.id);
    }

    listEl.querySelectorAll('[data-depto]').forEach((btn) => {
      btn.addEventListener('click', () => abrirModalNovoDepartamento(Number(btn.dataset.depto)));
    });
    listEl.querySelectorAll('[data-duplicar]').forEach((btn) => {
      btn.addEventListener('click', () => abrirModalDuplicar(Number(btn.dataset.duplicar)));
    });
  }

  async function carregarDepartamentos(filialId) {
    const wrap = document.getElementById(`deptos-${filialId}`);
    const deptos = await apiFetch(`/departamentos?filial_id=${filialId}`).catch(() => []);
    wrap.innerHTML = `
      <table>
        <thead><tr><th>Departamento</th></tr></thead>
        <tbody>
          ${deptos.length === 0
            ? '<tr><td><div class="table-empty">Nenhum departamento.</div></td></tr>'
            : deptos.map((d) => `<tr><td>${escapeHtml(d.nome)}</td></tr>`).join('')}
        </tbody>
      </table>
    `;
  }

  function abrirModalNovaFilial() {
    openModal(
      'Nova filial',
      `
      <div class="form-group"><label for="fNome">Nome</label><input type="text" id="fNome" required></div>
      <div class="form-group"><label for="fCidade">Cidade</label><input type="text" id="fCidade" required></div>
      <div class="form-group"><label for="fUf">UF</label><input type="text" id="fUf" maxlength="2" required></div>
      <div class="form-group"><label for="fEndereco">Endereço</label><input type="text" id="fEndereco" required></div>
      `,
      async () => {
        await apiFetch('/filiais', {
          method: 'POST',
          body: {
            nome: document.getElementById('fNome').value.trim(),
            cidade: document.getElementById('fCidade').value.trim(),
            uf: document.getElementById('fUf').value.trim().toUpperCase(),
            endereco: document.getElementById('fEndereco').value.trim(),
          },
        });
        await carregarFiliais();
      }
    );
  }

  function abrirModalNovoDepartamento(filialId) {
    openModal(
      'Novo departamento',
      `<div class="form-group"><label for="dNome">Nome</label><input type="text" id="dNome" required></div>`,
      async () => {
        await apiFetch('/departamentos', {
          method: 'POST',
          body: { filial_id: filialId, nome: document.getElementById('dNome').value.trim() },
        });
        await carregarDepartamentos(filialId);
      }
    );
  }

  function abrirModalDuplicar(filialId) {
    openModal(
      'Duplicar filial (só a estrutura de departamentos é copiada)',
      `
      <div class="form-group"><label for="fNome">Nome da nova filial</label><input type="text" id="fNome" required></div>
      <div class="form-group"><label for="fCidade">Cidade</label><input type="text" id="fCidade" required></div>
      <div class="form-group"><label for="fUf">UF</label><input type="text" id="fUf" maxlength="2" required></div>
      <div class="form-group"><label for="fEndereco">Endereço</label><input type="text" id="fEndereco" required></div>
      `,
      async () => {
        await apiFetch(`/filiais/${filialId}/duplicar`, {
          method: 'POST',
          body: {
            nome: document.getElementById('fNome').value.trim(),
            cidade: document.getElementById('fCidade').value.trim(),
            uf: document.getElementById('fUf').value.trim().toUpperCase(),
            endereco: document.getElementById('fEndereco').value.trim(),
          },
        });
        await carregarFiliais();
      }
    );
  }
})();
