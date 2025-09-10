console.log("✅ reserva.js se cargó")

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formReserva")
  const tablaBody = document.querySelector("#tablaReservas tbody")

  // Cargar clientes en datalist
  const cargarClientes = async () => {
    try {
      const response = await fetch("/clientes/nombres")
      const clientes = await response.json()
      const datalist = document.getElementById("listaClientes")
      datalist.innerHTML = ""
      clientes.forEach((c) => {
        const option = document.createElement("option")
        option.value = c.nombre
        datalist.appendChild(option)
      })
    } catch (error) {
      console.error("Error al cargar clientes:", error)
    }
  }

  // Mostrar reservas
  const cargarReservas = async () => {
    try {
      const response = await fetch("/reservas")
      const reservas = await response.json()

      tablaBody.innerHTML = ""
      reservas.forEach((reserva) => {
        const row = `
          <tr>
            <td><span class="badge bg-secondary">${reserva.id_reserva}</span></td>
            <td><strong>${reserva.responsable}</strong></td>
            <td>${new Date(reserva.fecha_reserva).toLocaleDateString("es-ES")}</td>
            <td><span class="badge bg-info">${reserva.cantidad_personas} personas</span></td>
            <td class="text-center">
              <button class="btn btn-warning btn-action" 
                      onclick="editarReserva(${reserva.id_reserva}, '${reserva.responsable}', '${reserva.fecha_reserva}', ${reserva.cantidad_personas})"
                      title="Editar reserva">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-danger btn-action" 
                      onclick="eliminarReserva(${reserva.id_reserva})"
                      title="Eliminar reserva">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>`
        tablaBody.innerHTML += row
      })
    } catch (error) {
      console.error("Error al cargar reservas:", error)
      mostrarAlerta("Error al cargar las reservas", "danger")
    }
  }

  // Registrar o editar reserva
  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const submitBtn = form.querySelector('button[type="submit"]')
    const originalText = submitBtn.innerHTML
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Guardando...'
    submitBtn.disabled = true

    const data = {
      responsable: document.getElementById("responsable").value,
      fecha_reserva: document.getElementById("fecha_reserva").value,
      cantidad_personas: document.getElementById("cantidad_personas").value,
    }

    const editandoId = form.dataset.editando
    const url = editandoId ? `/reserva/${editandoId}` : "/reserva"
    const method = editandoId ? "PUT" : "POST"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        mostrarAlerta(editandoId ? "Reserva actualizada correctamente" : "Reserva registrada correctamente", "success")
        form.reset()
        delete form.dataset.editando
        cargarReservas()
      } else {
        mostrarAlerta("Error al guardar la reserva", "danger")
      }
    } catch (error) {
      mostrarAlerta("Error de conexión al guardar reserva", "danger")
      console.error(error)
    } finally {
      submitBtn.innerHTML = originalText
      submitBtn.disabled = false
    }
  })

  // Eliminar reserva
  window.eliminarReserva = async (id) => {
    if (confirm("¿Está seguro de que desea eliminar esta reserva?")) {
      try {
        const response = await fetch(`/reserva/${id}`, { method: "DELETE" })
        if (response.ok) {
          mostrarAlerta("Reserva eliminada correctamente", "success")
          cargarReservas()
        } else {
          mostrarAlerta("No se pudo eliminar la reserva", "danger")
        }
      } catch (error) {
        console.error("Error al eliminar:", error)
        mostrarAlerta("Error de conexión al eliminar", "danger")
      }
    }
  }

  // Editar reserva
  window.editarReserva = (id, responsable, fecha, cantidad) => {
    document.getElementById("responsable").value = responsable
    document.getElementById("fecha_reserva").value = fecha.split("T")[0]
    document.getElementById("cantidad_personas").value = cantidad
    form.dataset.editando = id

    const submitBtn = form.querySelector('button[type="submit"]')
    submitBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Actualizar Reserva'

    if (window.innerWidth < 768) {
      form.scrollIntoView({ behavior: "smooth" })
    }
  }

  const mostrarAlerta = (mensaje, tipo) => {
    const alertContainer = document.querySelector(".container")
    const alert = document.createElement("div")
    alert.className = `alert alert-${tipo} alert-dismissible fade show mt-3`
    alert.innerHTML = `
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `
    alertContainer.insertBefore(alert, alertContainer.firstChild)

    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove()
      }
    }, 5000)
  }

  cargarClientes()
  cargarReservas()
})
