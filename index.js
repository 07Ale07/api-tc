require('dotenv').config(); // Cargar variables de entorno del archivo .env
const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = process.env.PORT || 5000;

// Middleware para parsear JSON
app.use(express.json());

// Configuración de la conexión a la base de datos MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Promesa para manejar la conexión de MySQL de forma más sencilla
const promisePool = pool.promise();

// Importar las funciones de ABML
const crearLetra = require('./abml/crear');
const editarLetra = require('./abml/editar');
const eliminarLetra = require('./abml/eliminar');

// Ruta para obtener todos los usuarios
app.get('/api-tc/admins', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM administradores');
    res.json(rows);
  } catch (err) {
    res.status(500).send('Error al obtener usuarios');
  }
});

// Ruta para obtener todas las letras de las músicas
app.get('/api-tc/letras', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM letras');
    res.json(rows);
  } catch (err) {
    res.status(500).send('Error al obtener letras');
  }
});

// Ruta para obtener los links de escucha de las músicas
app.get('/api-tc/links', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM links');
    res.json(rows);
  } catch (err) {
    res.status(500).send('Error al obtener links');
  }
});

// Ruta para obtener el registro de cambios realizados por los usuarios
app.get('/api-tc/registros', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM registro_actividad');
    res.json(rows);
  } catch (err) {
    res.status(500).send('Error al obtener registros');
  }
});






// Ruta para crear una nueva letra
app.post('/api-tc-production.up.railway.app/letras', async (req, res) => {
  try {
    const { idUsuario, titulo, contenido } = req.body;
    // Validar que los campos requeridos estén presentes
    if (!idUsuario || !titulo || !contenido) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    const connection = await mysql.createConnection(dbConfig);

  try {
    // Convertir el contenido a un archivo de texto si es una variable de texto
    let letraBuffer;
    if (typeof contenido === 'string') {
      letraBuffer = Buffer.from(contenido, 'utf-8'); // Convertir directamente a buffer
    } else {
      letraBuffer = await fs.readFile(contenido.path); // Leer archivo si es un objeto
    }

    // Iniciar una transacción
    await connection.beginTransaction();

    // Insertar la nueva entrada en la tabla principal
    const [result] = await connection.execute(
      'INSERT INTO letras (titulo, letra) VALUES (?, ?)',
      [titulo, letraBuffer]
    );

    // Obtener el ID de la letra recién insertada
    const idLetra = result.insertId;

    // Registrar la actividad en la tabla registro_actividades
    const actividad = `El usuario ${idUsuario} ha añadido la alabanza '${titulo}'`;
    const fecha = new Date().toISOString().split('T')[0]; // Solo la fecha en formato YYYY-MM-DD
    await connection.execute(
      'INSERT INTO registro_actividades (id_usuario, id_letra, actividad, fecha) VALUES (?, ?, ?, ?)',
      [idUsuario, idLetra, actividad, fecha]
    );

    // Confirmar la transacción
    await connection.commit();
    console.log('Entrada creada y actividad registrada con éxito');
    return idLetra; // Devolver el ID de la letra creada
  } catch (error) {
    // Revertir la transacción en caso de error
    await connection.rollback();
    console.error('Error al crear la entrada:', error);
    throw error; // Relanzar el error para que el llamador lo maneje
  } finally {
    // Cerrar la conexión
    await connection.end();
  }
    res.status(201).json({ idLetra, message: 'Letra creada con éxito' });
  } catch (err) {
    console.error('Error al crear letra:', err);
    res.status(500).json({ error: 'Error al crear letra', details: err.message });
  }
});






// Ruta para editar una letra existente
app.put('/api-tc/letras/:id', async (req, res) => {
  try {
    const { idUsuario, titulo, contenido } = req.body;
    const idLetra = req.params.id;

    // Validar que los campos requeridos estén presentes
    if (!idUsuario || !titulo || !contenido) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Llamar a la función de edición
    const result = await editarLetra(promisePool, idLetra, idUsuario, titulo, contenido);
    res.json(result);
  } catch (err) {
    console.error('Error al editar letra:', err);
    res.status(500).json({ error: 'Error al editar letra', details: err.message });
  }
});

// Ruta para eliminar una letra
app.delete('/api-tc/letras/:id', async (req, res) => {
  try {
    const idLetra = req.params.id;
    const { idUsuario } = req.body;

    // Validar que el idUsuario esté presente
    if (!idUsuario) {
      return res.status(400).json({ error: 'Falta el ID del usuario' });
    }

    // Llamar a la función de eliminación
    const result = await eliminarLetra(promisePool, idLetra, idUsuario);
    res.json(result);
  } catch (err) {
    console.error('Error al eliminar letra:', err);
    res.status(500).json({ error: 'Error al eliminar letra', details: err.message });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`API corriendo en http://localhost:${port}`);
});
