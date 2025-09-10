document.addEventListener("DOMContentLoaded", () => {
  // Initialize dashboard
  cargarClientes()
  cargarUsuarios()
  cargarPedidos()
})

// Utility function to show Bootstrap alerts
function showAlert(message, type = "success") {
  const alertContainer = document.getElementById("alertContainer")
  const alertId = "alert-" + Date.now()

  const alertHTML = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show alert-custom" role="alert">
            <i class="bi bi-${type === "success" ? "check-circle" : type === "danger" ? "exclamation-triangle" : "info-circle"} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `

  alertContainer.insertAdjacentHTML("beforeend", alertHTML)

  // Auto remove after 5 seconds
  setTimeout(() => {
    const alert = document.getElementById(alertId)
    if (alert) {
      alert.remove()
    }
  }, 5000)
}

// Show loading state for buttons
function setButtonLoading(button, loading = true) {
  if (loading) {
    button.disabled = true
    const originalText = button.innerHTML
    button.dataset.originalText = originalText
    button.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            Procesando...
        `
  } else {
    button.disabled = false
    button.innerHTML = button.dataset.originalText
  }
}

// Global variables for filtering and data management
let todosLosPedidos = []
let todosLosUsuarios = []

async function cargarClientes() {
  try {
    const res = await fetch("/clientes")
    const clientes = await res.json()
    const select = document.getElementById("clienteSelect")

    select.innerHTML = '<option value="">Seleccionar cliente...</option>'
    clientes.forEach((c) => {
      select.innerHTML += `<option value="${c.id_cliente}">${c.nombre}</option>`
    })
  } catch (error) {
    console.error("Error cargando clientes:", error)
    showAlert("Error al cargar clientes", "danger")
  }
}

async function cargarUsuarios() {
  try {
    const res = await fetch("/usuarios")
    const usuarios = await res.json()
    todosLosUsuarios = usuarios
  } catch (error) {
    console.error("Error cargando usuarios:", error)
    showAlert("Error al cargar usuarios", "danger")
  }
}

async function cargarPedidos() {
  try {
    const res = await fetch("/pedidos")
    const pedidos = await res.json()
    todosLosPedidos = pedidos
    mostrarPedidos(pedidos)
  } catch (error) {
    console.error("Error cargando pedidos:", error)
    showAlert("Error al cargar pedidos", "danger")
  }
}

function mostrarPedidos(pedidos) {
  const tbody = document.querySelector("#tablaPedidos tbody")
  const contador = document.getElementById("contadorPedidos")
  const noMessage = document.getElementById("noPedidosMessage")

  tbody.innerHTML = ""
  contador.textContent = `${pedidos.length} pedidos`

  if (pedidos.length === 0) {
    noMessage.classList.remove("d-none")
    return
  }

  noMessage.classList.add("d-none")

  pedidos.forEach((p) => {
    const fecha = p.fecha ? new Date(p.fecha).toLocaleString() : "N/A"

    tbody.innerHTML += `
      <tr>
        <td><span class="badge bg-primary">${p.id_pedido}</span></td>
        <td>${p.cliente || "N/A"}</td>
        <td><span class="badge bg-info">Mesa ${p.mesa}</span></td>
        <td>${p.mesero || "N/A"}</td>
        <td><small>${fecha}</small></td>
        <td><span class="badge bg-warning">Activo</span></td>
        <td>${p.observaciones || "-"}</td>
        <td class="text-center">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" onclick="verDetallesPedido(${p.id_pedido})" title="Ver detalles">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-outline-danger" onclick="eliminarPedido(${p.id_pedido})" title="Eliminar">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `
  })
}

function verDetallesPedido(idPedido) {
  // This would open a modal or navigate to details page
  showAlert(`Mostrando detalles del pedido #${idPedido}`, "info")
}

async function generarFacturaPDF(idFactura) {
  try {
    const response = await fetch(`/factura/pdf/${idFactura}`)

    if (!response.ok) {
      let errorMessage = "Error al generar PDF"
      try {
        const errorText = await response.text()
        if (errorText) {
          errorMessage = errorText
        }
      } catch (e) {
        // If we can't read the error, use default message
      }
      throw new Error(errorMessage)
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `factura_${idFactura}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    showAlert(`Factura PDF #${idFactura} descargada exitosamente`, "success")
  } catch (error) {
    console.error("Error generando PDF:", error)
    showAlert(`Error al generar PDF: ${error.message}`, "danger")
  }
}

async function generarFacturaDesdePedido(idPedido) {
  if (!confirm(`¿Desea generar una factura para el pedido #${idPedido}?`)) {
    return
  }

  try {
    showAlert("Generando factura...", "info")

    // Crear la factura
    const response = await fetch("/factura", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_pedido: Number.parseInt(idPedido) }),
    })

    if (response.ok) {
      const result = await response.json()
      showAlert(
        `Factura #${result.id_factura} creada exitosamente. Total: $${Number(result.total).toFixed(2)}`,
        "success",
      )

      // Generar el PDF
      setTimeout(async () => {
        try {
          await generarFacturaPDF(result.id_factura)
        } catch (pdfError) {
          console.error("Error generando PDF:", pdfError)
          showAlert("Factura creada pero error al generar PDF", "warning")
        }
      }, 1000)

      cargarPedidos() // Refresh to show new invoice
    } else {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error en el servidor")
    }
  } catch (error) {
    console.error("Error generando factura:", error)
    showAlert(`Error al generar factura: ${error.message}`, "danger")
  }
}

document.getElementById("formPedido").addEventListener("submit", async (e) => {
  e.preventDefault()
  const submitBtn = e.target.querySelector('button[type="submit"]')

  try {
    setButtonLoading(submitBtn, true)

    const pedido = {
      id_cliente: document.getElementById("clienteSelect").value,
      mesa: document.getElementById("mesa").value,
      observaciones: document.getElementById("observaciones").value,
      platos: [],
      bebidas: [],
      id_usuario: 1, // admin
    }

    const response = await fetch("/pedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido),
    })

    if (response.ok) {
      showAlert("Pedido registrado exitosamente", "success")
      e.target.reset()
      cargarPedidos()
    } else {
      throw new Error("Error en el servidor")
    }
  } catch (error) {
    console.error("Error creando pedido:", error)
    showAlert("Error al registrar pedido", "danger")
  } finally {
    setButtonLoading(submitBtn, false)
  }
})

async function eliminarPedido(id) {
  if (!confirm("¿Está seguro de que desea eliminar este pedido?")) return

  try {
    const response = await fetch(`/pedido/${id}`, { method: "DELETE" })

    if (response.ok) {
      showAlert("Pedido eliminado exitosamente", "success")
      cargarPedidos()
    } else {
      throw new Error("Error en el servidor")
    }
  } catch (error) {
    console.error("Error eliminando pedido:", error)
    showAlert("Error al eliminar pedido", "danger")
  }
}

function cerrarSesion() {
  if (confirm("¿Está seguro de que desea cerrar sesión?")) {
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = "login.html"
  }
}
