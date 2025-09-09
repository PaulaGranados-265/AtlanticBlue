const path = require('path');

const express = require('express');
const mysql = require('mysql2');

const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));


// Conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'restaurante_user',
    password: '12345',
    database: 'restaurante'
});

db.connect((err) => {
    if (err) {
        console.error('Error de conexión a la BD:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});



app.use(express.static('public'));

// Ruta para registrar usuario

app.post('/register', (req, res) => {
    console.log('Se recibió solicitud POST en /register');
    console.log(req.body); // Imprime los datos recibidos

    const { id_usuario, nombre_apellidos, telefono, correo, fecha_inicio, rol, contraseña } = req.body;

    const query = `
        INSERT INTO usuario 
        (id_usuario, nombre_apellidos, telefono, correo, fecha_inicio, rol, contraseña) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [id_usuario, nombre_apellidos, telefono, correo, fecha_inicio, rol, contraseña], (err, result) => {
        if (err) {
            console.error(' Error SQL:', err);
            return res.status(500).send('Error al registrar usuario');
        }
        console.log(' Usuario insertado correctamente');
        res.send('Usuario registrado correctamente');
    });
});


app.post('/login', (req, res) => {
  const { id_usuario, password } = req.body;

  const query = 'SELECT * FROM usuario WHERE id_usuario = ? AND contraseña = ?';
  db.query(query, [id_usuario, password], (err, results) => {
    if (err) {
      console.error('Error en consulta SQL:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    if (results.length > 0) {
      const user = results[0];
      console.log('Login exitoso:', user);
      res.json({
        id_usuario: user.id_usuario,
        nombre_apellidos: user.nombre_apellidos,
        rol: user.rol
      });
    } else {
      res.status(401).json({ message: 'ID de usuario o contraseña incorrectos' });
    }
  });
});

// clientesssssssssssssss
app.post('/clientes', (req, res) => {
  const { nombre, celular, correo } = req.body;

  const query = 'INSERT INTO clientes (nombre, celular, correo) VALUES (?, ?, ?)';

  db.query(query, [nombre, celular, correo], (err, result) => {
    if (err) {
      console.error(' Error al registrar cliente:', err);
      return res.status(500).send('Error al registrar cliente');
    }

    console.log(' Cliente registrado correctamente');
    res.send('Cliente registrado correctamente');
  });
});


// Registrar nueva reserva
app.post('/reserva', (req, res) => {
  const { responsable, fecha_reserva, cantidad_personas } = req.body;
  const query = 'INSERT INTO reserva (responsable, fecha_reserva, cantidad_personas) VALUES (?, ?, ?)';
  db.query(query, [responsable, fecha_reserva, cantidad_personas], (err, result) => {
    if (err) {
      console.error('Error al registrar reserva:', err);
      return res.status(500).send('Error al registrar reserva');
    }
    res.send('Reserva registrada correctamente');
  });
});

// Obtener todas las reservas (para mostrar en tabla)
app.get('/reservas', (req, res) => {
  db.query('SELECT * FROM reserva ORDER BY fecha_reserva ASC', (err, results) => {
    if (err) {
      console.error('Error al obtener reservas:', err);
      return res.status(500).send('Error al obtener reservas');
    }
    res.json(results);
  });
});

app.get('/clientes/nombres', (req, res) => {
  db.query('SELECT nombre FROM clientes', (err, results) => {
    if (err) {
      console.error('Error al obtener nombres de clientes:', err);
      return res.status(500).send('Error al obtener nombres');
    }
    res.json(results);
  });
});

// Eliminar reserva
app.delete('/reserva/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM reserva WHERE id_reserva = ?', [id], (err) => {
    if (err) {
      console.error('Error al eliminar reserva:', err);
      return res.status(500).send('Error al eliminar reserva');
    }
    res.send('Reserva eliminada correctamente');
  });
});

// Editar reserva
app.put('/reserva/:id', (req, res) => {
  const id = req.params.id;
  const { responsable, fecha_reserva, cantidad_personas } = req.body;
  db.query(
    'UPDATE reserva SET responsable = ?, fecha_reserva = ?, cantidad_personas = ? WHERE id_reserva = ?',
    [responsable, fecha_reserva, cantidad_personas, id],
    (err) => {
      if (err) {
        console.error('Error al editar reserva:', err);
        return res.status(500).send('Error al editar reserva');
      }
      res.send('Reserva actualizada');
    }
  );
});

// Ruta para obtener el menú completo
app.get('/menu', (req, res) => {
  const query = `
    SELECT 
      p.nombre AS plato,
      p.tipo,
      p.precio,
      p.plato_del_dia,
      pr.nombre AS proteina,
      b.nombre AS bebida,
      a.nombre AS acompanamiento
    FROM menu_detalle m
    JOIN platos p ON m.id_plato = p.id_plato
    JOIN proteinas pr ON m.id_proteina = pr.id_proteina
    JOIN bebidas b ON m.id_bebida = b.id_bebida
    JOIN acompanamientos a ON m.id_acomp = a.id_acomp
    ORDER BY p.tipo, p.nombre
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener el menú:', err);
      return res.status(500).send('Error al obtener el menú');
    }
    res.json(results);
  });
});

// Reemplaza tu ruta actual con esta versión mejorada
// Registrar pedido
// REGISTRAR PEDIDO - VERSIÓN CORREGIDA
app.post('/pedido', (req, res) => {
    const { id_cliente, mesa, observaciones, platos, bebidas, id_usuario } = req.body;
    console.log('Pedido recibido:', req.body); 

    // Insertar en tabla pedido
    const sqlPedido = 'INSERT INTO pedido (id_cliente, fecha, observaciones, mesa, id_usuario) VALUES (?, NOW(), ?, ?, ?)';
    
    db.query(sqlPedido, [id_cliente, observaciones, mesa, id_usuario], (err, result) => {
        if (err) {
            console.error('Error al insertar en pedido:', err);
            return res.status(500).json({ error: 'Error al crear el pedido' });
        }

        const id_pedido = result.insertId;
        console.log('Pedido creado con ID:', id_pedido);

        // Función para insertar platos
        const insertarPlatos = () => {
            return new Promise((resolve, reject) => {
                if (!platos || platos.length === 0) {
                    resolve();
                    return;
                }

                const detallesPlatos = [];
                platos.forEach(p => {
                    if (p.id_plato) { // Verificar que tenga ID válido
                        detallesPlatos.push([id_pedido, p.id_plato, p.cantidad || 1, p.observaciones || '']);
                    }
                });

                if (detallesPlatos.length === 0) {
                    resolve();
                    return;
                }

                const sqlPlatos = 'INSERT INTO detalle_pedido (id_pedido, id_plato, cantidad, observaciones) VALUES ?';
                db.query(sqlPlatos, [detallesPlatos], (err) => {
                    if (err) {
                        console.error('Error al insertar platos:', err);
                        reject(err);
                    } else {
                        console.log('Platos insertados correctamente');
                        resolve();
                    }
                });
            });
        };

        // Función para insertar bebidas
        const insertarBebidas = () => {
            return new Promise((resolve, reject) => {
                if (!bebidas || bebidas.length === 0) {
                    resolve();
                    return;
                }

                const detallesBebidas = [];
                bebidas.forEach(b => {
                    if (b.id_bebida) { // Verificar que tenga ID válido
                        detallesBebidas.push([id_pedido, b.id_bebida, b.cantidad || 1]);
                    }
                });

                if (detallesBebidas.length === 0) {
                    resolve();
                    return;
                }

                const sqlBebidas = 'INSERT INTO detalle_bebida_pedido (id_pedido, id_bebida, cantidad) VALUES ?';
                db.query(sqlBebidas, [detallesBebidas], (err) => {
                    if (err) {
                        console.error('Error al insertar bebidas:', err);
                        reject(err);
                    } else {
                        console.log('Bebidas insertadas correctamente');
                        resolve();
                    }
                });
            });
        };

        // Ejecutar ambas inserciones
        Promise.all([insertarPlatos(), insertarBebidas()])
            .then(() => {
                res.status(200).json({ 
                    mensaje: 'Pedido registrado correctamente',
                    id_pedido: id_pedido 
                });
            })
            .catch((error) => {
                console.error('Error al insertar detalles del pedido:', error);
                res.status(500).json({ error: 'Error al insertar los detalles del pedido' });
            });
    });
});

// Obtener platos
app.get('/platos', (req, res) => {
  db.query('SELECT * FROM platos', (err, results) => {
    if (err) {
      console.error('Error al obtener platos:', err);
      return res.status(500).send('Error al obtener platos');
    }
    res.json(results);
  });
});

// Obtener bebidas
app.get('/bebidas', (req, res) => {
  db.query('SELECT * FROM bebidas', (err, results) => {
    if (err) {
      console.error('Error al obtener bebidas:', err);
      return res.status(500).send('Error al obtener bebidas');
    }
    res.json(results);
  });
});

// Obtener clientes
app.get('/clientes', (req, res) => {
  db.query('SELECT * FROM clientes', (err, results) => {
    if (err) {
      console.error('Error al obtener clientes:', err);
      return res.status(500).send('Error al obtener clientes');
    }
    res.json(results);
  });
});

// Obtener acompañamientos
app.get('/acompanamientos', (req, res) => {
  db.query('SELECT * FROM acompanamientos', (err, results) => {
    if (err) {
      console.error('Error al obtener acompañamientos:', err);
      return res.status(500).send('Error al obtener acompañamientos');
    }
    res.json(results);
  });
});


app.get('/pedido/:id', (req, res) => {
  const id = req.params.id;

  const query = `
    SELECT p.*, c.nombre AS cliente_nombre
    FROM pedido p
    LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
    WHERE p.id_pedido = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener pedido:', err);
      return res.status(500).send('Error al obtener pedido');
    }

    if (results.length === 0) {
      return res.status(404).send('Pedido no encontrado');
    }

    res.json(results[0]);
  });
});

app.put('/pedido/:id', (req, res) => {
  const id = req.params.id;
  const { id_cliente, mesa, observaciones } = req.body;

  const query = `
    UPDATE pedido 
    SET id_cliente = ?, mesa = ?, observaciones = ?
    WHERE id_pedido = ?
  `;

  db.query(query, [id_cliente, mesa, observaciones, id], (err) => {
    if (err) {
      console.error('Error al actualizar pedido:', err);
      return res.status(500).send('Error al actualizar pedido');
    }

    res.send('Pedido actualizado correctamente');
  });
});


app.delete('/pedido/:id', (req, res) => {
  const id = req.params.id;

  // Borra primero los detalles
  db.query('DELETE FROM detalle_pedido WHERE id_pedido = ?', [id], (err) => {
    if (err) return res.status(500).send('Error al borrar detalles');

    db.query('DELETE FROM detalle_bebida_pedido WHERE id_pedido = ?', [id], (err) => {
      if (err) return res.status(500).send('Error al borrar bebidas');

      db.query('DELETE FROM pedido WHERE id_pedido = ?', [id], (err) => {
        if (err) return res.status(500).send('Error al borrar pedido');
        res.send('Pedido eliminado correctamente');
      });
    });
  });
});

app.get('/pedidos', (req, res) => {
  const { id_usuario, rol } = req.query;

  let query = `
    SELECT p.id_pedido, p.fecha, p.mesa, p.observaciones, 
           c.nombre AS cliente, u.nombre_apellidos AS mesero
    FROM pedido p
    LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
    LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
  `;

  const params = [];

  if (rol === 'mesero' && id_usuario) {
    query += ' WHERE p.id_usuario = ?';
    params.push(id_usuario);
  }

  query += ' ORDER BY p.fecha DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener pedidos:', err);
      return res.status(500).send('Error al obtener pedidos');
    }
    res.json(results);
  });
});


app.get('/reporte-dia', (req, res) => {
  const { fecha } = req.query;

  const query = `
    SELECT 
      DATE(p.fecha) as fecha, 
      COUNT(p.id_pedido) AS total_pedidos,
      COALESCE(SUM(dp.cantidad * pl.precio), 0) + COALESCE(SUM(dbp.cantidad * b.precio), 0) AS total_ventas
    FROM pedido p
    LEFT JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
    LEFT JOIN platos pl ON dp.id_plato = pl.id_plato
    LEFT JOIN detalle_bebida_pedido dbp ON p.id_pedido = dbp.id_pedido
    LEFT JOIN bebidas b ON dbp.id_bebida = b.id_bebida
    WHERE DATE(p.fecha) = ?
  `;

  db.query(query, [fecha], (err, results) => {
    if (err) return res.status(500).send('Error');
    res.json(results[0]);
  });
});



// Marcar como pagada
app.put('/factura/pagar/:id', (req, res) => {
  const id = req.params.id;
  db.query('UPDATE factura SET pagada = 1 WHERE id_factura = ?', [id], (err) => {
    if (err) return res.status(500).send('Error al marcar pago');
    res.send('Factura pagada');
  });
});
app.post('/factura', (req, res) => {
  const { id_pedido } = req.body;

  const id_factura = `F-${Date.now()}`;
  const hora = new Date().toTimeString().split(' ')[0];

  const queryTotal = `
    SELECT 
      COALESCE(SUM(dp.cantidad * pl.precio), 0) +
      COALESCE(SUM(dbp.cantidad * b.precio), 0) AS total
    FROM pedido p
    LEFT JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
    LEFT JOIN platos pl ON dp.id_plato = pl.id_plato
    LEFT JOIN detalle_bebida_pedido dbp ON p.id_pedido = dbp.id_pedido
    LEFT JOIN bebidas b ON dbp.id_bebida = b.id_bebida
    WHERE p.id_pedido = ?
  `;

  db.query(queryTotal, [id_pedido], (err, results) => {
    if (err) {
      console.error('Error al calcular total:', err);
      return res.status(500).send('Error al calcular total');
    }

    const total = results[0].total;

    const queryFactura = `
      INSERT INTO factura (id_factura, id_pedido, hora, pagada, total)
      VALUES (?, ?, ?, 0, ?)
    `;

    db.query(queryFactura, [id_factura, id_pedido, hora, total], (err) => {
      if (err) {
        console.error('Error al insertar factura:', err);
        return res.status(500).send('Error al generar factura');
      }

      res.send('Factura generada correctamente');
    });
  });
});



app.listen(port, () => {
    console.log(`Servidor activo en http://localhost:${port}`);
});