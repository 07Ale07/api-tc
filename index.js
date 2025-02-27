require('dotenv').config(); // Cargar variables de entorno del archivo .env
const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = process.env.PORT || 3306;

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

// Ruta para verificar la conexión a la base de datos
app.get('/check-db-connection', async (req, res) => {
  try {
    // Obtener una conexión del pool
    const connection = await pool.promise().getConnection();

    // Intentar ejecutar una consulta simple para verificar la conexión
    await connection.query('SELECT 1');

    // Liberar la conexión
    connection.release();

    // Enviar respuesta de éxito
    res.status(200).json({ success: true, message: 'Conexión a la base de datos exitosa' });
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    res.status(500).json({ success: false, message: 'Error al conectar a la base de datos', error: error.message });
  }
});

// Ruta para obtener todas las alabanzas
app.get('/alabanzas', async (req, res) => {
  try {
    // Obtener una conexión del pool
    const connection = await pool.promise().getConnection();

    // Consulta SQL para obtener todas las alabanzas
    const [rows] = await connection.query('SELECT * FROM alabanzas');

    // Liberar la conexión
    connection.release();

    // Enviar la respuesta con los datos obtenidos
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las alabanzas' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
