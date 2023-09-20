const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'devos.mysql.uhserver.com',
  user: 'devos',
  password: 'Daredevil9127@',
  database: 'devos',
});

const query = `
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(15) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

db.query(query, (err, results) => {
  if (err) throw err;
  console.log('Tabela de clientes criada com sucesso!');
  db.end();
});
