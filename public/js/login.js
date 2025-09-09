// public/js/login.js
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

            const result = await response.json(); // ahora esperamos un objeto

            if (response.ok) {
                // Guardar los datos del usuario en localStorage
                localStorage.setItem('user', JSON.stringify(result));
                // Redirigir al panel
                window.location.href = 'panel.html';
            } else {
                alert(result.message || 'Error al iniciar sesión');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al iniciar sesión');
        }
    });
});
