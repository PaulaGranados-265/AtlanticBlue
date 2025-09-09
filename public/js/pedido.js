let platosData = [];
let bebidasData = [];
let acompanamientosData = [];

async function cargarDatosMenu() {
  try {
    const [platosRes, bebidasRes, clientesRes, acompaRes] = await Promise.all([
      fetch("/platos"),
      fetch("/bebidas"),
      fetch("/clientes"),
      fetch("/acompanamientos")
    ]);

    if (platosRes.ok) platosData = await platosRes.json();
    if (bebidasRes.ok) bebidasData = await bebidasRes.json();
    if (clientesRes.ok) {
      const clientes = await clientesRes.json();
      const selectCliente = document.getElementById("cliente");
      selectCliente.innerHTML = `<option value="">-- Seleccione un cliente --</option>`;
      clientes.forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.id_cliente;
        option.textContent = cliente.nombre;
        selectCliente.appendChild(option);
      });
    }
    if (acompaRes.ok) acompanamientosData = await acompaRes.json();

    console.log('Datos cargados:', { platosData, bebidasData, acompanamientosData });
  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
}

function crearItem(tipo) {
  const container = document.getElementById(`${tipo}sContainer`);

  const itemDiv = document.createElement("div");
  itemDiv.className = "item";

  // Crear select principal
  const select = document.createElement("select");
  select.className = "item-select";
  
  // Agregar opción por defecto
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = `-- Seleccione ${tipo} --`;
  select.appendChild(defaultOption);

  const datos = tipo === "plato" ? platosData : bebidasData;

  datos.forEach(opcion => {
    const option = document.createElement("option");
    option.value = opcion.id_plato || opcion.id_bebida;
    option.textContent = `${opcion.nombre} - $${opcion.precio}` + (opcion.tipo ? ` (${opcion.tipo})` : "");
    option.dataset.precio = opcion.precio;
    if (opcion.tipo) option.dataset.tipo = opcion.tipo;
    select.appendChild(option);
  });

  // Input de cantidad
  const cantidadInput = document.createElement("input");
  cantidadInput.type = "number";
  cantidadInput.min = "1";
  cantidadInput.value = "1";
  cantidadInput.className = "cantidad-input";

  // Input de observaciones
  const observacionesInput = document.createElement("input");
  observacionesInput.type = "text";
  observacionesInput.placeholder = "Observaciones";
  observacionesInput.className = "observaciones-input";

  // Select de acompañamientos (solo para platos especiales)
  const selectAcomp = document.createElement("select");
  selectAcomp.style.display = "none";
  selectAcomp.className = "acomp-select";
  
  const opcionDefaultAcomp = document.createElement("option");
  opcionDefaultAcomp.value = "";
  opcionDefaultAcomp.textContent = "-- Acompañamiento --";
  selectAcomp.appendChild(opcionDefaultAcomp);

  acompanamientosData.forEach(acom => {
    const option = document.createElement("option");
    option.value = acom.id_acomp;
    option.textContent = `${acom.nombre} - $${acom.precio}`;
    option.dataset.precio = acom.precio;
    selectAcomp.appendChild(option);
  });

  // Botón eliminar
  const btnEliminar = document.createElement("button");
  btnEliminar.type = "button";
  btnEliminar.textContent = "Eliminar";
  btnEliminar.className = "eliminar";
  btnEliminar.onclick = () => {
    itemDiv.remove();
    calcularTotal();
  };

  // Event listeners
  select.onchange = () => {
    if (tipo === "plato") {
      const selected = select.options[select.selectedIndex];
      const tipoPlato = selected.dataset.tipo;
      if (tipoPlato === "especial") {
        selectAcomp.style.display = "inline-block";
      } else {
        selectAcomp.style.display = "none";
        selectAcomp.value = "";
      }
    }
    calcularTotal();
  };

  cantidadInput.oninput = calcularTotal;
  selectAcomp.onchange = calcularTotal;

  // Agregar elementos al div
  itemDiv.appendChild(select);
  itemDiv.appendChild(cantidadInput);
  itemDiv.appendChild(observacionesInput);
  if (tipo === "plato") {
    itemDiv.appendChild(selectAcomp);
  }
  itemDiv.appendChild(btnEliminar);

  container.appendChild(itemDiv);
  calcularTotal();
}

function calcularTotal() {
  const items = document.querySelectorAll(".item");
  let total = 0;

  items.forEach(item => {
    const select = item.querySelector(".item-select");
    const cantidadInput = item.querySelector(".cantidad-input");
    const selectAcomp = item.querySelector(".acomp-select");

    if (select && cantidadInput && select.value) {
      const selectedOption = select.options[select.selectedIndex];
      const precio = parseFloat(selectedOption.dataset.precio) || 0;
      const cantidad = parseInt(cantidadInput.value) || 1;

      let precioAcomp = 0;
      if (selectAcomp && selectAcomp.value) {
        const selectedAcomp = selectAcomp.options[selectAcomp.selectedIndex];
        precioAcomp = parseFloat(selectedAcomp.dataset.precio) || 0;
      }

      total += (precio + precioAcomp) * cantidad;
    }
  });

  // CORREGIDO: usar "totalAmount" en lugar de "total"
  const totalElement = document.getElementById("totalAmount");
  if (totalElement) {
    totalElement.textContent = total.toFixed(2);
  }
}

// Función para procesar el pedido
async function procesarPedido(event) {
  event.preventDefault();
  
  const clienteId = document.getElementById("cliente").value || null;
  const mesa = document.getElementById("mesa").value || null;
  const observacionesGenerales = document.getElementById("observaciones").value || "";

  // Recopilar platos
  const platosItems = document.querySelectorAll("#platosContainer .item");
  const platos = [];
  
  platosItems.forEach(item => {
    const select = item.querySelector(".item-select");
    const cantidadInput = item.querySelector(".cantidad-input");
    const observacionesInput = item.querySelector(".observaciones-input");
    
    if (select && select.value) {
      platos.push({
        id_plato: parseInt(select.value),
        cantidad: parseInt(cantidadInput.value) || 1,
        observaciones: observacionesInput.value || ""
      });
    }
  });

  // Recopilar bebidas
  const bebidasItems = document.querySelectorAll("#bebidasContainer .item");
  const bebidas = [];
  
  bebidasItems.forEach(item => {
    const select = item.querySelector(".item-select");
    const cantidadInput = item.querySelector(".cantidad-input");
    
    if (select && select.value) {
      bebidas.push({
        id_bebida: parseInt(select.value),
        cantidad: parseInt(cantidadInput.value) || 1
      });
    }
  });

  // Validar que hay al menos un plato o bebida
  if (platos.length === 0 && bebidas.length === 0) {
    alert("Debe agregar al menos un plato o bebida al pedido");
    return;
  }

  const user = JSON.parse(localStorage.getItem('user'));

const pedidoData = {
  id_cliente: clienteId,
  mesa: mesa,
  observaciones: observacionesGenerales,
  platos: platos,
  bebidas: bebidas,
  id_usuario: user.id_usuario 
};

  console.log('Enviando pedido:', pedidoData);

  try {
    const response = await fetch('/pedido', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pedidoData)
    });

    const result = await response.json();
    
    if (response.ok) {
      alert('Pedido registrado correctamente');
      // Limpiar formulario
      document.getElementById('formPedido').reset();
      document.getElementById('platosContainer').innerHTML = '';
      document.getElementById('bebidasContainer').innerHTML = '';
      calcularTotal();
    } else {
      alert('Error al registrar pedido: ' + result.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al procesar el pedido');
  }
}

// Event listeners
document.getElementById("addPlato").addEventListener("click", () => crearItem("plato"));
document.getElementById("addBebida").addEventListener("click", () => crearItem("bebida"));
document.getElementById("formPedido").addEventListener("submit", procesarPedido);

// Cargar datos al iniciar
window.onload = cargarDatosMenu;