function openModal(title, bodyHtml, onSubmit) {
  const wrap = document.getElementById('modalWrap');
  wrap.innerHTML = `
    <div class="modal-overlay" id="overlay">
      <div class="modal">
        <div class="modal__title">${escapeHtml(title)}</div>
        <div id="modalAlert" class="alert alert--danger hidden"></div>
        <form id="modalForm">
          ${bodyHtml}
          <div class="form-actions">
            <button type="button" class="btn btn--ghost" id="modalCancel">Cancelar</button>
            <button type="submit" class="btn btn--primary">Salvar</button>
          </div>
        </form>
      </div>
    </div>`;
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('overlay').addEventListener('click', (e) => {
    if (e.target.id === 'overlay') closeModal();
  });
  document.getElementById('modalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('modalAlert');
    alertBox.classList.add('hidden');
    try {
      await onSubmit();
      closeModal();
    } catch (err) {
      alertBox.textContent = err.message;
      alertBox.classList.remove('hidden');
    }
  });
}

function closeModal() {
  document.getElementById('modalWrap').innerHTML = '';
}
