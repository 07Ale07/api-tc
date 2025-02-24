const mysql = require('mysql2/promise');
const fs = require('fs').promises;

// Configuración de la base de datos
const dbConfig = {
  host: 'mysql.railway.internal',
  port: 3306,
  user: 'root',
  password: 'OcbnbDTNyGsTQIJqnZMsVyumeQLZpZpK',
  database: 'railway',
};

// Función para crear una nueva entrada
async function crearEntrada(idUsuario, titulo, contenido) {
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
}

module.exports = crearEntrada;
