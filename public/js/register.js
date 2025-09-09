// public/js/register.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            id_usuario: document.getElementById('id_usuario').value,
            nombre_apellidos: document.getElementById('nombre_apellidos').value,
            telefono: document.getElementById('telefono').value,
            correo: document.getElementById('correo').value,
            fecha_inicio: document.getElementById('fecha_inicio').value,
            rol: document.getElementById('rol').value,
            contraseña: document.getElementById('contraseña').value
        };

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.text();
            alert(result);
            if (response.ok) window.location.href = 'login.html';
        } catch (error) {
            alert('Error al registrar usuario');
            console.error(error);
        }
    });
});
