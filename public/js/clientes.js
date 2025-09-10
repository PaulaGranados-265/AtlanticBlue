// JavaScript para manejar el formulario de clientes con Bootstrap
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCliente")
  const submitBtn = form.querySelector('button[type="submit"]')

  // Validación en tiempo real
  const inputs = form.querySelectorAll("input[required]")
  inputs.forEach((input) => {
    input.addEventListener("blur", validateField)
    input.addEventListener("input", clearValidation)
  })

  function validateField(e) {
    const field = e.target
    const value = field.value.trim()

    // Remover clases previas
    field.classList.remove("is-valid", "is-invalid")

    // Validar según el tipo de campo
    let isValid = false

    switch (field.type) {
      case "email":
        isValid = validateEmail(value)
        break
      case "tel":
        isValid = validatePhone(value)
        break
      default:
        isValid = value.length >= 2
    }

    // Aplicar clase de validación
    field.classList.add(isValid ? "is-valid" : "is-invalid")
  }

  function clearValidation(e) {
    const field = e.target
    field.classList.remove("is-valid", "is-invalid")
  }

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  function validatePhone(phone) {
    const phoneRegex = /^[\d\s\-+$$$$]{8,}$/
    return phoneRegex.test(phone)
  }

  // Manejar envío del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    // Validar todos los campos
    let isFormValid = true
    inputs.forEach((input) => {
      validateField({ target: input })
      if (input.classList.contains("is-invalid")) {
        isFormValid = false
      }
    })

    if (!isFormValid) {
      showAlert("Por favor, corrija los errores en el formulario.", "danger")
      return
    }

    // Mostrar estado de carga
    submitBtn.classList.add("btn-loading")
    submitBtn.disabled = true

    const data = {
      nombre: document.getElementById("nombre").value,
      celular: document.getElementById("celular").value,
      correo: document.getElementById("correo").value,
    }

    try {
      const response = await fetch("/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.text()

      showAlert(result || "Cliente registrado exitosamente!", "success")
      form.reset()
      inputs.forEach((input) => input.classList.remove("is-valid", "is-invalid"))
    } catch (error) {
      console.error(error)

      try {
        const clienteData = {
          ...data,
          fechaRegistro: new Date().toISOString(),
        }

        const clientes = JSON.parse(localStorage.getItem("clientes") || "[]")
        clientes.push(clienteData)
        localStorage.setItem("clientes", JSON.stringify(clientes))

        showAlert("Cliente registrado localmente (sin conexión al servidor)", "warning")
        form.reset()
        inputs.forEach((input) => input.classList.remove("is-valid", "is-invalid"))
      } catch (localError) {
        showAlert("Error al registrar cliente", "danger")
      }
    } finally {
      submitBtn.classList.remove("btn-loading")
      submitBtn.disabled = false
    }
  })

  function showAlert(message, type) {
    // Crear alerta de Bootstrap
    const alertDiv = document.createElement("div")
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`
    alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `

    // Insertar antes del formulario
    const cardBody = document.querySelector(".card-body")
    cardBody.insertBefore(alertDiv, form)

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove()
      }
    }, 5000)
  }
})
