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
  database: process.env.DB_NAME
});

// Promesa para manejar la conexión de MySQL de forma más sencilla
const promisePool = pool.promise();

// Ruta para obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM usuarios');
    res.json(rows);
  } catch (err) {
    res.status(500).send('Error al obtener usuarios');
  }
});

// Ruta para obtener todas las letras de las músicas
app.get('/api/letras', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM letras');
    res.json(rows);
  } catch (err) {
    res.status(500).send('Error al obtener letras');
  }
});

// Ruta para obtener los links de escucha de las músicas
app.get('/api/links', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM links');
    res.json(rows);
  } catch (err) {
    res.status(500).send('Error al obtener links');
  }
});

// Ruta para obtener el registro de cambios realizados por los usuarios
app.get('/api/registros', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM registro_actividad');
    res.json(rows);
  } catch (err) {
    res.status(500).send('Error al obtener registros');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`API corriendo en http://localhost:${port}`);
});