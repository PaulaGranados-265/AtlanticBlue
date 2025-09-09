document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      id_usuario: document.getElementById('id_usuario').value,
      password: document.getElementById('password').value
    };

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        // Guardar los datos del usuario en localStorage
        localStorage.setItem('user', JSON.stringify(result));

        // Redirigir según el rol
        if (result.rol === 'administrador') {
          window.location.href = 'inicioadmin.html';
        } else if (result.rol === 'mesero') {
          window.location.href = 'panel.html';
        } else {
          // Si el rol no es reconocido, mándalo al panel básico
          window.location.href = 'panel.html';
        }
      } else {
        alert(result.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al iniciar sesión');
    }
  });
});
