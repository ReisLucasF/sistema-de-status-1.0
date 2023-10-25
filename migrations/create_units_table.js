const mysql = require('mysql');



const query = `
CREATE TABLE IF NOT EXISTS units (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

db.query(query, (err, results) => {
  if (err) throw err;
  console.log('Tabela de unidades criada com sucesso!');
  db.end();
});
