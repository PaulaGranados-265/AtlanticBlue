// Enhanced register.js with Bootstrap integration
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm")
  const submitBtn = document.getElementById("submitBtn")
  const togglePassword = document.getElementById("togglePassword")
  const passwordInput = document.getElementById("contraseña")
  const alertContainer = document.getElementById("alertContainer")
  const bootstrap = window.bootstrap // Declare the bootstrap variable

  // Password toggle functionality
  togglePassword.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
    passwordInput.setAttribute("type", type)

    const icon = togglePassword.querySelector("i")
    icon.classList.toggle("bi-eye")
    icon.classList.toggle("bi-eye-slash")
  })

  // Real-time validation
  const inputs = form.querySelectorAll("input, select")
  inputs.forEach((input) => {
    input.addEventListener("blur", validateField)
    input.addEventListener("input", clearValidation)
  })

  function validateField(e) {
    const field = e.target
    const value = field.value.trim()

    // Remove previous validation classes
    field.classList.remove("is-valid", "is-invalid")

    let isValid = true

    switch (field.id) {
      case "id_usuario":
        isValid = value.length >= 3
        break
      case "nombre_apellidos":
        isValid = value.length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)
        break
      case "telefono":
        isValid = /^[\d\s\-+$$$$]{8,15}$/.test(value)
        break
      case "correo":
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        break
      case "contraseña":
        isValid = value.length >= 6
        break
      case "fecha_inicio":
        isValid = value !== ""
        break
      case "rol":
        isValid = value !== ""
        break
    }

    field.classList.add(isValid ? "is-valid" : "is-invalid")
    return isValid
  }

  function clearValidation(e) {
    const field = e.target
    field.classList.remove("is-valid", "is-invalid")
  }

  function showAlert(message, type = "danger") {
    const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="bi bi-${type === "success" ? "check-circle" : "exclamation-triangle"} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `
    alertContainer.innerHTML = alertHtml

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      const alert = alertContainer.querySelector(".alert")
      if (alert) {
        const bsAlert = new bootstrap.Alert(alert)
        bsAlert.close()
      }
    }, 5000)
  }

  function setLoading(loading) {
    const btnText = submitBtn.querySelector(".btn-text")
    const spinner = submitBtn.querySelector(".spinner-border")

    if (loading) {
      submitBtn.disabled = true
      btnText.textContent = "Registrando..."
      spinner.classList.remove("d-none")
      submitBtn.classList.add("loading")
    } else {
      submitBtn.disabled = false
      btnText.textContent = "Registrar Usuario"
      spinner.classList.add("d-none")
      submitBtn.classList.remove("loading")
    }
  }

  // Form submission with original functionality preserved
  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    // Clear previous alerts
    alertContainer.innerHTML = ""

    // Validate all fields
    let isFormValid = true
    inputs.forEach((input) => {
      if (!validateField({ target: input })) {
        isFormValid = false
      }
    })

    if (!isFormValid) {
      showAlert("Por favor corrija los errores en el formulario.", "warning")
      return
    }

    const data = {
      id_usuario: document.getElementById("id_usuario").value,
      nombre_apellidos: document.getElementById("nombre_apellidos").value,
      telefono: document.getElementById("telefono").value,
      correo: document.getElementById("correo").value,
      fecha_inicio: document.getElementById("fecha_inicio").value,
      rol: document.getElementById("rol").value,
      contraseña: document.getElementById("contraseña").value,
    }

    setLoading(true)

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.text()

      if (response.ok) {
        showAlert("Usuario registrado exitosamente. Redirigiendo...", "success")
        form.reset()

        // Clear validation classes
        inputs.forEach((input) => {
          input.classList.remove("is-valid", "is-invalid")
        })

        setTimeout(() => {
          window.location.href = "login.html"
        }, 2000)
      } else {
        showAlert(result || "Error al registrar usuario", "danger")
      }
    } catch (error) {
      console.error("Error:", error)
      showAlert("Error de conexión. Por favor intente nuevamente.", "danger")
    } finally {
      setLoading(false)
    }
  })
})
