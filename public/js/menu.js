document.addEventListener('DOMContentLoaded', async () => {
  const menuContainer = document.getElementById('menuContainer');

  try {
    const response = await fetch('/menu');
    const platos = await response.json();

    if (platos.length === 0) {
      menuContainer.innerHTML = '<p>No hay platos disponibles.</p>';
      return;
    }

    platos.forEach(plato => {
      const card = document.createElement('div');
      card.className = 'menu-item';
      card.innerHTML = `
        <h3>${plato.plato}</h3>
        <p><strong>Tipo:</strong> ${plato.tipo}</p>
        <p><strong>Proteína:</strong> ${plato.proteina}</p>
        <p><strong>Bebida:</strong> ${plato.bebida}</p>
        <p><strong>Acompañamiento:</strong> ${plato.acompanamiento}</p>
        <p><strong>Precio:</strong> $${plato.precio.toLocaleString()}</p>
        ${plato.plato_del_dia ? '<span class="badge">Plato del Día</span>' : ''}
      `;
      menuContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error al cargar el menú:', error);
    menuContainer.innerHTML = '<p>Error al cargar el menú.</p>';
  }
});
