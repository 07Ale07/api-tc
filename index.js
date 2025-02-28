require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Configuración de la conexión a la base de datos MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,  // Número máximo de conexiones en el pool
  queueLimit: 0
});

// Mensaje en la consola al iniciar el servidor
console.log('Iniciando servidor...');
console.log('Verificando conexión a la base de datos...');

// Ruta para verificar la conexión a la base de datos
app.get('/check-db-connection', async (req, res) => {
  let connection;
  try {
    console.log('Intentando conectar a la base de datos...');
    connection = await pool.promise().getConnection();
    await connection.query('SELECT 1'); // Consulta simple para verificar conexión
    console.log('Conexión a la base de datos exitosa.');
    res.status(200).json({ success: true, message: 'Conexión a la base de datos exitosa' });
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    res.status(500).json({ success: false, message: 'Error al conectar a la base de datos', error: error.code });
  } finally {
    if (connection) {
      console.log('Liberando conexión...');
      connection.release(); // Liberar la conexión en cualquier caso
    }
  }
});

// Ruta para obtener todas las alabanzas
app.get('/alabanzas', async (req, res) => {
  let connection;
  try {
    console.log('Obteniendo todas las alabanzas...');
    connection = await pool.promise().getConnection();
    
    // Consulta SQL para obtener todas las alabanzas
    const [rows] = await connection.query('SELECT * FROM alabanzas');
    
    // Convertir la columna "letra" de string JSON a un objeto real si es necesario
    const formattedRows = rows.map(row => {
      try {
        const letra = typeof row.letra === 'string' ? JSON.parse(row.letra) : row.letra;
        if (typeof letra !== 'object' || letra === null || Array.isArray(letra)) {
          throw new Error('La letra no es un objeto válido');
        }
        return {
          id: row.id,
          titulo: row.titulo,
          letra: letra
        };
      } catch (error) {
        console.error(`Error al procesar la letra de la alabanza con ID ${row.id}:`, error);
        return {
          id: row.id,
          titulo: row.titulo,
          letra: {} // O un valor por defecto
        };
      }
    });

    console.log('Alabanzas obtenidas correctamente.');
    res.status(200).json({ success: true, data: formattedRows });
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las alabanzas', error: error.code });
  } finally {
    if (connection) {
      console.log('Liberando conexión...');
      connection.release();
    }
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log('Prueba los siguientes endpoints:');
  console.log(`- Verificar conexión a la base de datos: GET http://localhost:${port}/check-db-connection`);
  console.log(`- Obtener todas las alabanzas: GET http://localhost:${port}/alabanzas`);
});
