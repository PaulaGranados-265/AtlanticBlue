document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  const submitBtn = document.getElementById("submitBtn")
  const btnText = submitBtn.querySelector(".btn-text")
  const btnLoading = submitBtn.querySelector(".btn-loading")
  const alertContainer = document.getElementById("alertContainer")
  const togglePassword = document.getElementById("togglePassword")
  const passwordInput = document.getElementById("password")
  const toggleIcon = document.getElementById("toggleIcon")

  togglePassword.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
    passwordInput.setAttribute("type", type)

    if (type === "text") {
      toggleIcon.className = "bi bi-eye-slash"
    } else {
      toggleIcon.className = "bi bi-eye"
    }
  })

  const inputs = loginForm.querySelectorAll("input[required]")
  inputs.forEach((input) => {
    input.addEventListener("blur", validateField)
    input.addEventListener("input", clearValidation)
  })

  function validateField(e) {
    const field = e.target
    if (field.value.trim() === "") {
      field.classList.add("is-invalid")
      field.classList.remove("is-valid")
    } else {
      field.classList.add("is-valid")
      field.classList.remove("is-invalid")
    }
  }

  function clearValidation(e) {
    const field = e.target
    field.classList.remove("is-invalid", "is-valid")
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    // Validate form
    if (!loginForm.checkValidity()) {
      loginForm.classList.add("was-validated")
      return
    }

    // Show loading state
    setLoadingState(true)
    clearAlert()

    const data = {
      id_usuario: document.getElementById("id_usuario").value,
      password: document.getElementById("password").value,
    }

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        showAlert("¡Inicio de sesión exitoso! Redirigiendo...", "success")

        // Guardar los datos del usuario en localStorage
        localStorage.setItem("user", JSON.stringify(result))

        setTimeout(() => {
          // Redirigir según el rol
          if (result.rol === "administrador") {
            window.location.href = "inicioadmin.html"
          } else if (result.rol === "mesero") {
            window.location.href = "panel.html"
          } else {
            // Si el rol no es reconocido, mándalo al panel básico
            window.location.href = "panel.html"
          }
        }, 1500)
      } else {
        showAlert(result.message || "Error al iniciar sesión", "danger")
        setLoadingState(false)
      }
    } catch (error) {
      console.error("Error:", error)
      showAlert("Error de conexión. Por favor, intenta nuevamente.", "danger")
      setLoadingState(false)
    }
  })

  function setLoadingState(loading) {
    if (loading) {
      submitBtn.disabled = true
      btnText.classList.add("d-none")
      btnLoading.classList.remove("d-none")
    } else {
      submitBtn.disabled = false
      btnText.classList.remove("d-none")
      btnLoading.classList.add("d-none")
    }
  }

  function showAlert(message, type) {
    const alertHtml = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        <i class="bi bi-${type === "success" ? "check-circle" : "exclamation-triangle"} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `
    alertContainer.innerHTML = alertHtml
  }

  function clearAlert() {
    alertContainer.innerHTML = ""
  }
})
