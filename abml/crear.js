const mysql = require('mysql2/promise');
const fs = require('fs').promises;

// Configuración de la base de datos
const dbConfig = {
  host: 'mysql.railway.internal',
  port: 3306,
  user: 'root',
  password: 'OcbnbDTNyGsTQIJqnZMsVyumeQLZpZpK',
  database: 'railway'
};

// Función para crear una nueva entrada
async function crearEntrada(idUsuario, idLetra, titulo, contenido) {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Convertir el contenido a un archivo de texto si es una variable de texto
    let letraBuffer;
    if (typeof contenido === 'string') {
      const filePath = `letra_${idLetra}.txt`;
      await fs.writeFile(filePath, contenido, 'utf-8');
      letraBuffer = await fs.readFile(filePath);
      await fs.unlink(filePath); // Eliminar el archivo temporal después de leerlo
    } else {
      letraBuffer = await fs.readFile(contenido.path);
    }

    // Inicia una transacción
    await connection.beginTransaction();

    // Insertar la nueva entrada en la tabla principal
    await connection.execute(
      'INSERT INTO letras (id_letra, titulo, letra) VALUES (?, ?, ?)',
      [idLetra, titulo, letraBuffer]
    );

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
  } catch (error) {
    // Revertir la transacción en caso de error
    await connection.rollback();
    console.error('Error al crear la entrada:', error);
  } finally {
    // Cerrar la conexión
    await connection.end();
  }
}

module.exports = crearEntrada;