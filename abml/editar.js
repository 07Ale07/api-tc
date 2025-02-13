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

// Función para editar una entrada
async function editarEntrada(idUsuario, idLetra, nuevoTitulo, nuevoContenido) {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Convertir el contenido a un archivo de texto si es una variable de texto
    let letraBuffer;
    if (typeof nuevoContenido === 'string') {
      const filePath = `letra_${idLetra}.txt`;
      await fs.writeFile(filePath, nuevoContenido, 'utf-8');
      letraBuffer = await fs.readFile(filePath);
      await fs.unlink(filePath); // Eliminar el archivo temporal después de leerlo
    } else {
      letraBuffer = await fs.readFile(nuevoContenido.path);
    }

    // Inicia una transacción
    await connection.beginTransaction();

    // Actualizar la entrada en la tabla principal
    await connection.execute(
      'UPDATE letras SET titulo = ?, letra = ? WHERE id_letra = ?',
      [nuevoTitulo, letraBuffer, idLetra]
    );

    // Registrar la actividad en la tabla registro_actividades
    const actividad = `El usuario ${idUsuario} ha editado la letra '${nuevoTitulo}'`;
    const fecha = new Date().toISOString().split('T')[0]; // Solo la fecha en formato YYYY-MM-DD
    await connection.execute(
      'INSERT INTO registro_actividades (id_usuario, id_letra, actividad, fecha) VALUES (?, ?, ?, ?)',
      [idUsuario, idLetra, actividad, fecha]
    );

    // Confirmar la transacción
    await connection.commit();
    console.log('Entrada editada y actividad registrada con éxito');
  } catch (error) {
    // Revertir la transacción en caso de error
    await connection.rollback();
    console.error('Error al editar la entrada:', error);
  } finally {
    // Cerrar la conexión
    await connection.end();
  }
}

module.exports = editarEntrada;