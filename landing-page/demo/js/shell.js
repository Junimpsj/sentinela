const ROLE_LABELS = {
  dono_empresa: 'Dono da empresa',
  admin_filial: 'Admin de filial',
  colaborador: 'Colaborador',
};

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', href: 'dashboard.html', roles: ['dono_empresa', 'admin_filial', 'colaborador'] },
  { key: 'equipamentos', label: 'Equipamentos', href: 'equipamentos.html', roles: ['dono_empresa', 'admin_filial', 'colaborador'] },
  { key: 'filiais', label: 'Filiais & Deptos', href: 'filiais.html', roles: ['dono_empresa', 'admin_filial'] },
  { key: 'usuarios', label: 'Usuários', href: 'usuarios.html', roles: ['dono_empresa', 'admin_filial'] },
  { key: 'catalogos', label: 'Catálogos', href: 'catalogos.html', roles: ['dono_empresa', 'admin_filial', 'colaborador'] },
];

async function initShell(activeKey, pageTitle) {
  let user;
  try {
    user = await apiFetch('/auth/me');
  } catch (_) {
    window.location.href = 'index.html';
    return null;
  }

  const links = NAV_ITEMS.filter((item) => item.roles.includes(user.tipo_acesso))
    .map(
      (item) =>
        `<a class="sidebar__link${item.key === activeKey ? ' is-active' : ''}" href="${item.href}">${item.label}</a>`
    )
    .join('');

  const shell = document.getElementById('appShell');
  shell.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar__logo">Sentinela<span class="sidebar__logo-dot">.</span></div>
      <button class="hamburger-btn" id="hamburgerBtn" aria-label="Abrir menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <nav class="sidebar__nav" id="sidebarNav">
        ${links}
        <div class="sidebar__demo">Modo de demonstração, utilizamos dados fictícios. Você pode interagir com o sistema mas ele reseta ao fechar a aba<br><br>Sistema completo e funcional implementado e funcionando de maneira local</div>
      </nav>
      <div class="sidebar__footer">Sentinela · Controle de Parque Tecnológico</div>
    </aside>
    <div class="main">
      <header class="topbar">
        <div class="topbar__title">${escapeHtml(pageTitle)}</div>
        <div class="topbar__user">
          <span><strong>${escapeHtml(ROLE_LABELS[user.tipo_acesso] || user.tipo_acesso)}</strong></span>
          <button class="btn btn--ghost btn--sm" id="logoutBtn">Sair</button>
        </div>
      </header>
      <main class="content" id="pageContent"></main>
    </div>
  `;

  document.getElementById('hamburgerBtn').addEventListener('click', () => {
    const nav = document.getElementById('sidebarNav');
    const isOpen = nav.classList.toggle('is-open');
    document.getElementById('hamburgerBtn').setAttribute('aria-expanded', String(isOpen));
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    window.location.href = 'index.html';
  });

  return user;
}
