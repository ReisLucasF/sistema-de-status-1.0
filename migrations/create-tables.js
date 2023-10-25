const mysql = require('mysql2/promise');


const createTables = async () => {
    try {
      const connection = await mysql.createConnection(dbConfig);
  
      const queries = [
        
    `
    CREATE TABLE IF NOT EXISTS units (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    `
    CREATE TABLE IF NOT EXISTS managers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        unit_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (unit_id) REFERENCES units(id)
      );
    `,
    `
    CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(15) NOT NULL,
        cpf VARCHAR(14) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,

    `
    CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        unit_id INT NOT NULL,
        manager_id INT NOT NULL,
        client_id INT NOT NULL,
        description TEXT NOT NULL,
        status ENUM('PENDENTE', 'EM PROCESSAMENTO', 'COMPLETO', 'CANCELADO') NOT NULL DEFAULT 'PENDENTE',
        order_value DECIMAL(10,2) DEFAULT 0.00, -- Novo campo para armazenar o valor do pedido
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (unit_id) REFERENCES units(id),
        FOREIGN KEY (manager_id) REFERENCES managers(id),
        FOREIGN KEY (client_id) REFERENCES clients(id)
        );
        `,
      ];

      for (const query of queries) {
        await connection.query(query);
      }

      console.log('Tabelas criadas com sucesso!');

      await connection.end();

    } catch (error) {
        console.error('Erro ao criar tabelas:', error);
      }
    };
    
createTables();
