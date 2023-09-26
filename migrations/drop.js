const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'devos.mysql.uhserver.com',
  user: 'devos',
  password: 'Daredevil9127@',
  database: 'devos',
};

const dropTables = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const tablesWithoutDependencies = [
      'SALAOCLIENTE',
      'HORARIO'
    ];

    for (const table of tablesWithoutDependencies) {
      const dropQuery = `DROP TABLE IF EXISTS ${table};`;
      await connection.query(dropQuery);
      console.log(`Tabela ${table} excluída com sucesso.`);
    }

    const tablesWithDependencies = [
      'AGENDAMENTO',
      'COLABORADOR_SERVICO',
      'SERVICO',
      'COLABORADOR',
      'CLIENTE'
    ];

    for (const table of tablesWithDependencies) {
      const dropQuery = `DROP TABLE IF EXISTS ${table};`;
      await connection.query(dropQuery);
      console.log(`Tabela ${table} excluída com sucesso.`);
    }

    console.log('Todas as tabelas foram excluídas com sucesso!');

    await connection.end();
  } catch (error) {
    console.error('Erro ao excluir tabelas:', error);
  }
};

dropTables();
