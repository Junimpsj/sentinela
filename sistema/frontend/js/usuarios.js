const TIPO_ACESSO_LABEL = {
  dono_empresa: 'Dono da empresa',
  admin_filial: 'Admin de filial',
  colaborador: 'Colaborador',
};

(async function () {
  const user = await initShell('usuarios', 'Usuários');
  if (!user) return;

  const content = document.getElementById('pageContent');
  content.innerHTML = `
    <div class="panel">
      <div class="panel__header">
        <div class="panel__title">Usuários</div>
        <button class="btn btn--primary btn--sm" id="novoUsuarioBtn">+ Novo usuário</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Nome</th><th>Email</th><th>Papel</th></tr></thead>
          <tbody id="tabelaBody"></tbody>
        </table>
      </div>
    </div>
    <div id="modalWrap"></div>
  `;

  document.getElementById('novoUsuarioBtn').addEventListener('click', abrirModalNovoUsuario);
  await carregarLista();

  async function carregarLista() {
    const tbody = document.getElementById('tabelaBody');
    let lista;
    try {
      lista = await apiFetch('/usuarios');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="3"><div class="alert alert--danger">${escapeHtml(err.message)}</div></td></tr>`;
      return;
    }
    tbody.innerHTML =
      lista.length === 0
        ? '<tr><td colspan="3"><div class="table-empty">Nenhum usuário.</div></td></tr>'
        : lista
            .map(
              (u) => `<tr>
                <td>${escapeHtml(u.nome)}</td>
                <td>${escapeHtml(u.email)}</td>
                <td><span class="badge badge--primary">${TIPO_ACESSO_LABEL[u.tipo_acesso] || u.tipo_acesso}</span></td>
              </tr>`
            )
            .join('');
  }

  async function abrirModalNovoUsuario() {
    const souDono = user.tipo_acesso === 'dono_empresa';
    let filiais = [];
    if (souDono) filiais = await apiFetch('/filiais').catch(() => []);

    const tipoField = souDono
      ? `<div class="form-group">
           <label for="fTipo">Papel</label>
           <select id="fTipo">
             <option value="admin_filial">Admin de filial</option>
             <option value="colaborador">Colaborador</option>
           </select>
           <p class="form-hint">Dono da empresa só é criado no cadastro inicial da empresa.</p>
         </div>`
      : '';

    const filialField = souDono
      ? `<div class="form-group" id="filialFieldWrap">
           <label for="fFilial">Filial</label>
           <select id="fFilial"><option value="">—</option>${filiais.map((f) => `<option value="${f.id}">${escapeHtml(f.nome)}</option>`).join('')}</select>
         </div>`
      : '';

    const deptoField = `
      <div class="form-group" id="deptoFieldWrap">
        <label for="fDepto">Departamento</label>
        <select id="fDepto"><option value="">—</option></select>
      </div>`;

    openModal(
      'Novo usuário',
      `
      <div class="form-group"><label for="fNome">Nome</label><input type="text" id="fNome" required></div>
      <div class="form-group"><label for="fEmail">Email</label><input type="email" id="fEmail" required></div>
      <div class="form-group"><label for="fSenha">Senha</label><input type="password" id="fSenha" minlength="6" required></div>
      ${tipoField}
      ${filialField}
      ${deptoField}
      `,
      async () => {
        const tipoAcesso = souDono ? document.getElementById('fTipo').value : 'colaborador';
        const filialId = souDono ? document.getElementById('fFilial').value || null : null;
        const deptoSelect = document.getElementById('fDepto');
        const departamentoId = deptoSelect.value || null;

        await apiFetch('/usuarios', {
          method: 'POST',
          body: {
            nome: document.getElementById('fNome').value.trim(),
            email: document.getElementById('fEmail').value.trim(),
            senha: document.getElementById('fSenha').value,
            tipo_acesso: tipoAcesso,
            filial_id: filialId ? Number(filialId) : null,
            departamento_id: departamentoId ? Number(departamentoId) : null,
          },
        });
        await carregarLista();
      }
    );

    if (souDono) {
      document.getElementById('fFilial').addEventListener('change', carregarDeptosParaModal);
      document.getElementById('fTipo').addEventListener('change', atualizarCamposCondicionais);
      atualizarCamposCondicionais();
    } else {
      // admin_filial só cadastra colaborador dentro da própria filial (RF07)
      const deptos = await apiFetch(`/departamentos?filial_id=${user.filial_id}`).catch(() => []);
      document.getElementById('fDepto').innerHTML = deptos.map((d) => `<option value="${d.id}">${escapeHtml(d.nome)}</option>`).join('');
    }

    async function carregarDeptosParaModal() {
      const filialId = document.getElementById('fFilial').value;
      const deptoSelect = document.getElementById('fDepto');
      if (!filialId) {
        deptoSelect.innerHTML = '<option value="">—</option>';
        return;
      }
      const deptos = await apiFetch(`/departamentos?filial_id=${filialId}`).catch(() => []);
      deptoSelect.innerHTML =
        '<option value="">—</option>' + deptos.map((d) => `<option value="${d.id}">${escapeHtml(d.nome)}</option>`).join('');
    }

    function atualizarCamposCondicionais() {
      const tipo = document.getElementById('fTipo').value;
      document.getElementById('filialFieldWrap').classList.toggle('hidden', tipo === 'dono_empresa');
      document.getElementById('deptoFieldWrap').classList.toggle('hidden', tipo !== 'colaborador');
    }
  }
})();
