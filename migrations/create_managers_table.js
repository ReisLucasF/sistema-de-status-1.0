const mysql = require('mysql');


const query = `
CREATE TABLE IF NOT EXISTS managers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  unit_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(id)
);
`;

db.query(query, (err, results) => {
  if (err) throw err;
  console.log('Tabela de gerentes criada com sucesso!');
  db.end();
});
