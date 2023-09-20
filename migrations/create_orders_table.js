const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'devos.mysql.uhserver.com',
  user: 'devos',
  password: 'Daredevil9127@',
  database: 'devos',
});

const query1 = `
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
`;

// const query2 = `
// CREATE TABLE IF NOT EXISTS products (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   order_id INT NOT NULL,
//   name VARCHAR(255) NOT NULL,
//   price DECIMAL(10,2) NOT NULL,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (order_id) REFERENCES orders(id) -- Chave estrangeira para relacionar o produto ao pedido
// );
// `;

db.query(query1, (err, results) => {
  if (err) throw err;
  console.log('Tabela de pedidos criada com sucesso!');

  // db.query(query2, (err, results) => {
  //   if (err) throw err;
  //   console.log('Tabela de produtos criada com sucesso!');
   db.end();
  });
// });
