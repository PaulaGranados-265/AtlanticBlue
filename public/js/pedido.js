let platosData = []
let bebidasData = []
let acompanamientosData = []

async function cargarDatosMenu() {
  try {
    const [platosRes, bebidasRes, clientesRes, acompaRes] = await Promise.all([
      fetch("/platos"),
      fetch("/bebidas"),
      fetch("/clientes"),
      fetch("/acompanamientos"),
    ])

    if (platosRes.ok) platosData = await platosRes.json()
    if (bebidasRes.ok) bebidasData = await bebidasRes.json()
    if (clientesRes.ok) {
      const clientes = await clientesRes.json()
      const selectCliente = document.getElementById("cliente")
      selectCliente.innerHTML = `<option value="">-- Seleccione un cliente --</option>`
      clientes.forEach((cliente) => {
        const option = document.createElement("option")
        option.value = cliente.id_cliente
        option.textContent = cliente.nombre
        selectCliente.appendChild(option)
      })
    }
    if (acompaRes.ok) acompanamientosData = await acompaRes.json()

    console.log("Datos cargados:", { platosData, bebidasData, acompanamientosData })
  } catch (error) {
    console.error("Error al cargar datos:", error)
    loadClientesFromStorage()
  }
}

function loadClientesFromStorage() {
  const clienteSelect = document.getElementById("cliente")
  const clientes = JSON.parse(localStorage.getItem("clientes") || "[]")

  clienteSelect.innerHTML = `<option value="">-- Seleccione un cliente --</option>`
  clientes.forEach((cliente) => {
    const option = document.createElement("option")
    option.value = cliente.id
    option.textContent = `${cliente.nombre} ${cliente.apellido}`
    clienteSelect.appendChild(option)
  })
}

function crearItem(tipo) {
  const container = document.getElementById(`${tipo}sContainer`)

  const itemDiv = document.createElement("div")
  itemDiv.className = `${tipo}-item mb-3`

  itemDiv.innerHTML = `
    <div class="row g-2">
      <div class="col-12 col-md-4">
        <label class="form-label">${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</label>
        <select class="form-select item-select">
          <option value="">-- Seleccione ${tipo} --</option>
        </select>
      </div>
      <div class="col-6 col-md-2">
        <label class="form-label">Cantidad</label>
        <input type="number" class="form-control cantidad-input" min="1" value="1" required>
      </div>
      <div class="col-6 col-md-3">
        <label class="form-label">Observaciones</label>
        <input type="text" class="form-control observaciones-input" placeholder="Observaciones">
      </div>
      <div class="col-12 col-md-2 acomp-container" style="display: none;">
        <label class="form-label">Acompañamiento</label>
        <select class="form-select acomp-select">
          <option value="">-- Acompañamiento --</option>
        </select>
      </div>
      <div class="col-12 col-md-1 d-flex align-items-end">
        <button type="button" class="btn btn-danger btn-sm w-100 eliminar">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  `

  const select = itemDiv.querySelector(".item-select")
  const cantidadInput = itemDiv.querySelector(".cantidad-input")
  const selectAcomp = itemDiv.querySelector(".acomp-select")
  const btnEliminar = itemDiv.querySelector(".eliminar")
  const acompContainer = itemDiv.querySelector(".acomp-container")

  const datos = tipo === "plato" ? platosData : bebidasData
  datos.forEach((opcion) => {
    const option = document.createElement("option")
    option.value = opcion.id_plato || opcion.id_bebida
    option.textContent = `${opcion.nombre} - $${opcion.precio}` + (opcion.tipo ? ` (${opcion.tipo})` : "")
    option.dataset.precio = opcion.precio
    if (opcion.tipo) option.dataset.tipo = opcion.tipo
    select.appendChild(option)
  })

  acompanamientosData.forEach((acom) => {
    const option = document.createElement("option")
    option.value = acom.id_acomp
    option.textContent = `${acom.nombre} - $${acom.precio}`
    option.dataset.precio = acom.precio
    selectAcomp.appendChild(option)
  })

  // Event listeners
  select.onchange = () => {
    if (tipo === "plato") {
      const selected = select.options[select.selectedIndex]
      const tipoPlato = selected.dataset.tipo
      if (tipoPlato === "especial") {
        acompContainer.style.display = "block"
      } else {
        acompContainer.style.display = "none"
        selectAcomp.value = ""
      }
    }
    calcularTotal()
  }

  cantidadInput.oninput = calcularTotal
  selectAcomp.onchange = calcularTotal

  btnEliminar.onclick = () => {
    itemDiv.remove()
    calcularTotal()
  }

  container.appendChild(itemDiv)
  calcularTotal()
}

function calcularTotal() {
  const items = document.querySelectorAll(".plato-item, .bebida-item")
  let total = 0

  items.forEach((item) => {
    const select = item.querySelector(".item-select")
    const cantidadInput = item.querySelector(".cantidad-input")
    const selectAcomp = item.querySelector(".acomp-select")

    if (select && cantidadInput && select.value) {
      const selectedOption = select.options[select.selectedIndex]
      const precio = Number.parseFloat(selectedOption.dataset.precio) || 0
      const cantidad = Number.parseInt(cantidadInput.value) || 1

      let precioAcomp = 0
      if (selectAcomp && selectAcomp.value) {
        const selectedAcomp = selectAcomp.options[selectAcomp.selectedIndex]
        precioAcomp = Number.parseFloat(selectedAcomp.dataset.precio) || 0
      }

      total += (precio + precioAcomp) * cantidad
    }
  })

  const totalElement = document.getElementById("totalAmount")
  if (totalElement) {
    totalElement.textContent = total.toFixed(2)
  }
}

async function procesarPedido(event) {
  event.preventDefault()

  const clienteId = document.getElementById("cliente").value || null
  const mesa = document.getElementById("mesa").value || null
  const observacionesGenerales = document.getElementById("observaciones").value || ""

  // Recopilar platos
  const platosItems = document.querySelectorAll(".plato-item")
  const platos = []

  platosItems.forEach((item) => {
    const select = item.querySelector(".item-select")
    const cantidadInput = item.querySelector(".cantidad-input")
    const observacionesInput = item.querySelector(".observaciones-input")
    const selectAcomp = item.querySelector(".acomp-select")

    if (select && select.value) {
      const platoData = {
        id_plato: Number.parseInt(select.value),
        cantidad: Number.parseInt(cantidadInput.value) || 1,
        observaciones: observacionesInput.value || "",
      }

      if (selectAcomp && selectAcomp.value) {
        platoData.id_acomp = Number.parseInt(selectAcomp.value)
      }

      platos.push(platoData)
    }
  })

  // Recopilar bebidas
  const bebidasItems = document.querySelectorAll(".bebida-item")
  const bebidas = []

  bebidasItems.forEach((item) => {
    const select = item.querySelector(".item-select")
    const cantidadInput = item.querySelector(".cantidad-input")

    if (select && select.value) {
      bebidas.push({
        id_bebida: Number.parseInt(select.value),
        cantidad: Number.parseInt(cantidadInput.value) || 1,
      })
    }
  })

  // Validar que hay al menos un plato o bebida
  if (platos.length === 0 && bebidas.length === 0) {
    alert("Debe agregar al menos un plato o bebida al pedido")
    return
  }

  const user = JSON.parse(localStorage.getItem("user"))
  const pedidoData = {
    id_cliente: clienteId,
    mesa: mesa,
    observaciones: observacionesGenerales,
    platos: platos,
    bebidas: bebidas,
    id_usuario: user ? user.id_usuario : null,
  }

  console.log("Enviando pedido:", pedidoData)

  try {
    const response = await fetch("/pedido", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pedidoData),
    })

    const result = await response.json()

    if (response.ok) {
      alert("Pedido registrado correctamente")
      limpiarFormulario()
    } else {
      throw new Error(result.error || "Error del servidor")
    }
  } catch (error) {
    console.error("Error API:", error)
    guardarEnLocalStorage(pedidoData)
  }
}

function guardarEnLocalStorage(pedidoData) {
  const pedido = {
    id: Date.now(),
    ...pedidoData,
    total: Number.parseFloat(document.getElementById("totalAmount").textContent),
    fecha: new Date().toISOString(),
  }

  const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]")
  pedidos.push(pedido)
  localStorage.setItem("pedidos", JSON.stringify(pedidos))

  alert("Pedido guardado localmente")
  limpiarFormulario()
}

function limpiarFormulario() {
  document.getElementById("formPedido").reset()
  document.getElementById("platosContainer").innerHTML = ""
  document.getElementById("bebidasContainer").innerHTML = ""
  calcularTotal()
}

function cerrarSesion() {
  if (confirm("¿Está seguro que desea cerrar sesión?")) {
    localStorage.removeItem("usuarioActual")
    localStorage.removeItem("user")
    window.location.href = "login.html"
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarDatosMenu()

  document.getElementById("addPlato").addEventListener("click", () => crearItem("plato"))
  document.getElementById("addBebida").addEventListener("click", () => crearItem("bebida"))
  document.getElementById("formPedido").addEventListener("submit", procesarPedido)
})
