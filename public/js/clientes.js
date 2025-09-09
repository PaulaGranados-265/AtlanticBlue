document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formCliente');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
     
      nombre: document.getElementById('nombre').value,
      celular: document.getElementById('celular').value,
      correo: document.getElementById('correo').value
    };

    try {
      const response = await fetch('/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.text();
      alert(result);
      form.reset();
    } catch (error) {
      alert(' Error al registrar cliente');
      console.error(error);
    }
  });
});
