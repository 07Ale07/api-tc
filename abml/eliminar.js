const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: 'mysql.railway.internal',
  port: 3306,
  user: 'root',
  password: 'OcbnbDTNyGsTQIJqnZMsVyumeQLZpZpK',
  database: 'railway'
};

// Función para eliminar una entrada
async function eliminarEntrada(idUsuario, idLetra) {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Inicia una transacción
    await connection.beginTransaction();

    // Eliminar la entrada de la tabla principal
    await connection.execute(
      'DELETE FROM letras WHERE id_letra = ?',
      [idLetra]
    );

    // Registrar la actividad en la tabla registro_actividades
    const actividad = `El usuario ${idUsuario} ha eliminado la letra con ID ${idLetra}`;
    const fecha = new Date().toISOString().split('T')[0]; // Solo la fecha en formato YYYY-MM-DD
    await connection.execute(
      'INSERT INTO registro_actividades (id_usuario, id_letra, actividad, fecha) VALUES (?, ?, ?, ?)',
      [idUsuario, idLetra, actividad, fecha]
    );

    // Confirmar la transacción
    await connection.commit();
    console.log('Entrada eliminada y actividad registrada con éxito');
  } catch (error) {
    // Revertir la transacción en caso de error
    await connection.rollback();
    console.error('Error al eliminar la entrada:', error);
  } finally {
    // Cerrar la conexión
    await connection.end();
  }
}

module.exports = eliminarEntrada;