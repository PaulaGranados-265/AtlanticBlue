document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const pedidoId = params.get('id');
  const form = document.getElementById('formEditarPedido');

  if (!pedidoId) {
    alert('ID de pedido no proporcionado');
    return;
  }

  try {
    // Cargar clientes para el select
    const clientesRes = await fetch('/clientes');
    const clientes = await clientesRes.json();
    const clienteSelect = document.getElementById('cliente');
    clientes.forEach(c => {
      const option = document.createElement('option');
      option.value = c.id_cliente;
      option.textContent = c.nombre;
      clienteSelect.appendChild(option);
    });

    // Cargar datos del pedido
    const res = await fetch(`/pedido/${pedidoId}`);
    const pedido = await res.json();

    document.getElementById('mesa').value = pedido.mesa || '';
    document.getElementById('observaciones').value = pedido.observaciones || '';
    document.getElementById('cliente').value = pedido.id_cliente || '';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const datosActualizados = {
        id_cliente: document.getElementById('cliente').value,
        mesa: document.getElementById('mesa').value,
        observaciones: document.getElementById('observaciones').value
      };

      const updateRes = await fetch(`/pedido/${pedidoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosActualizados)
      });

      if (updateRes.ok) {
        alert('Pedido actualizado correctamente');
        window.location.href = 'ver_pedidos.html';
      } else {
        alert('Error al actualizar el pedido');
      }
    });
  } catch (err) {
    console.error('Error al cargar el pedido:', err);
    alert('Hubo un error al cargar los datos');
  }
});
