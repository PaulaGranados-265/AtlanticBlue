console.log("✅ reserva.js se cargó");

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formReserva');
  const tablaBody = document.querySelector('#tablaReservas tbody');

  // Cargar clientes en datalist
  const cargarClientes = async () => {
    try {
      const response = await fetch('/clientes/nombres');
      const clientes = await response.json();
      const datalist = document.getElementById('listaClientes');
      datalist.innerHTML = '';
      clientes.forEach(c => {
        const option = document.createElement('option');
        option.value = c.nombre;
        datalist.appendChild(option);
      });
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  // Mostrar reservas
  const cargarReservas = async () => {
    try {
      const response = await fetch('/reservas');
      const reservas = await response.json();

      tablaBody.innerHTML = '';
      reservas.forEach(reserva => {
        const row = `
          <tr>
            <td>${reserva.id_reserva}</td>
            <td>${reserva.responsable}</td>
            <td>${new Date(reserva.fecha_reserva).toLocaleDateString()}</td>
            <td>${reserva.cantidad_personas}</td>
            <td>
              <button onclick="editarReserva(${reserva.id_reserva}, '${reserva.responsable}', '${reserva.fecha_reserva}', ${reserva.cantidad_personas})">✏️</button>
              <button onclick="eliminarReserva(${reserva.id_reserva})">🗑️</button>
            </td>
          </tr>`;
        tablaBody.innerHTML += row;
      });
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    }
  };

  // Registrar o editar reserva
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      responsable: document.getElementById('responsable').value,
      fecha_reserva: document.getElementById('fecha_reserva').value,
      cantidad_personas: document.getElementById('cantidad_personas').value
    };

    const editandoId = form.dataset.editando;
    const url = editandoId ? `/reserva/${editandoId}` : '/reserva';
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert(editandoId ? 'Reserva actualizada' : 'Reserva registrada correctamente');
        form.reset();
        delete form.dataset.editando;
        cargarReservas();
      } else {
        alert('Error al guardar');
      }
    } catch (error) {
      alert('Error al guardar reserva');
      console.error(error);
    }
  });

  // Eliminar reserva
  window.eliminarReserva = async (id) => {
    if (confirm('¿Eliminar esta reserva?')) {
      try {
        const response = await fetch(`/reserva/${id}`, { method: 'DELETE' });
        if (response.ok) {
          alert('Reserva eliminada');
          cargarReservas();
        } else {
          alert('No se pudo eliminar');
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  // Editar reserva
  window.editarReserva = (id, responsable, fecha, cantidad) => {
    document.getElementById('responsable').value = responsable;
    document.getElementById('fecha_reserva').value = fecha.split('T')[0];
    document.getElementById('cantidad_personas').value = cantidad;
    form.dataset.editando = id;
  };

  cargarClientes();
  cargarReservas();
});
