const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
app.use(express.json());
const port = 3000;

const db = mysql.createConnection({
  host: 'devos.mysql.uhserver.com',
  user: 'devos',
  password: 'Daredevil9127@',
  database: 'devos',
  connectTimeout: 60 * 60 * 1000,
  // acquireTimeout: 60 * 60 * 1000,
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Conectado ao banco de dados');
});

// Mantenha a conexão ativa através de uma query "keep-alive"
setInterval(() => {
  db.query('SELECT 1', (err) => {
    if (err) {
      console.error('Erro ao executar query keep-alive:', err);
    } else {
      console.log('Query keep-alive executada com sucesso');
    }
  });
}, 1 * 60 * 1000);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/units', (req, res) => {
  console.log('Tratando requisição GET');
  const query = `
    SELECT 
      units.id, 
      units.name AS unit_name, 
      managers.name AS manager_name, 
      managers.username 
    FROM units 
    JOIN managers ON units.id = managers.unit_id
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro no servidor: ' + err.message);
    }
    res.json(results);
  });
});

app.post('/units', (req, res) => {
  console.log('Corpo da requisição:', req.body);
  const { unitName, managerName, username, password } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro no servidor: ' + err.message);
    }

    db.query('INSERT INTO units (name) VALUES (?)', [unitName], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro no servidor: ' + err.message);
      }

      const unitId = results.insertId;
      db.query(
        'INSERT INTO managers (unit_id, name, username, password) VALUES (?, ?, ?, ?)',
        [unitId, managerName, username, hashedPassword],
        (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Erro no servidor: ' + err.message);
          }
          res.send('Unidade e gerente criados com sucesso');
        }
      );
    });
  });
});

app.put('/units/:id', (req, res) => {
  const { id } = req.params;
  const { unitName, managerName, username, password } = req.body;

  const updateUnitQuery = 'UPDATE units SET name = ? WHERE id = ?';
  const updateManagerQuery = 'UPDATE managers SET name = ?, username = ?, password = ? WHERE unit_id = ?';

  db.query(updateUnitQuery, [unitName, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro no servidor: ' + err.message);
    }

    db.query(updateManagerQuery, [managerName, username, password, id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro no servidor: ' + err.message);
      }
      res.send('Unidade e gerente atualizados com sucesso');
    });
  });
});

app.delete('/units/:id', (req, res) => {
  const { id } = req.params;

  const deleteManagerQuery = 'DELETE FROM managers WHERE unit_id = ?';
  const deleteUnitQuery = 'DELETE FROM units WHERE id = ?';

  db.query(deleteManagerQuery, [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro no servidor: ' + err.message);
    }

    db.query(deleteUnitQuery, [id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro no servidor: ' + err.message);
      }
      res.send('Unidade e gerente excluídos com sucesso');
    });
  });
});

const session = require('express-session');

app.use(session({
  secret: 'seu segredo aqui',
  resave: false,
  saveUninitialized: true,
}));



// login

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Consulta para encontrar o gerente com o username fornecido
  const query = 'SELECT * FROM managers WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro no servidor');
    }

    // Verificando se um gerente foi encontrado e se a senha está correta
    if (results.length > 0) {
      const manager = results[0];
      bcrypt.compare(password, manager.password, (err, isMatch) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Erro no servidor');
        }

        if (isMatch) {
          // A senha está correta, então você pode criar uma sessão aqui
          req.session.managerId = manager.id;  // Salve o ID do gerente na sessão

           // Agora vamos buscar o unit_id do gerente
          db.query('SELECT unit_id FROM managers WHERE id = ?', [manager.id], (err, results) => {
            if (err) {
              console.error('Erro ao buscar unit_id:', err);
              return res.status(500).send('Erro no servidor');
            }

            if (results.length === 0) {
              return res.status(400).json({ error: 'Gerente não encontrado' });
            }

            // Enviando o unit_id e o manager_id na resposta
            res.json({ 
              message: 'Login bem-sucedido',
              unit_id: results[0].unit_id,  // Aqui está o unit_id
              manager_id: manager.id,  // Aqui está o manager_id
            });
          });

        
        
        } else {
          // A senha está incorreta
          res.status(401).json({ error: 'Erro ao realizar login. Tente novamente.' });
        }
      });

        // Middleware para verificar se o usuário está autenticado
    function checkAuthenticated(req, res, next) {
      if (req.session.managerId) {
        next();
      } else {
        res.status(401).send('Não autorizado');
      }
    }

    // Rota para servir a página de pedidos, que só pode ser acessada se o usuário estiver autenticado
    app.get('/pedidos', checkAuthenticated, (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'pedidos.html'));
    });




    } else {
      // Nenhum gerente encontrado com o username fornecido
      res.status(401).send('Erro ao realizar login. Tente novamente.');
    }
  });
});

// endpoints pedidos

app.post('/orders', (req, res) => {
  const { client_id, description, status, order_value } = req.body; // Adicionado total_price
  const manager_id = req.session.managerId; // Obtemos o manager_id da sessão

  // Primeiro, obtemos o unit_id baseado no manager_id
  db.query('SELECT unit_id FROM managers WHERE id = ?', [manager_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro no servidor: ' + err.message });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'Gerente não encontrado' });
    }

    const unit_id = results[0].unit_id;

    const insertOrderQuery = `
      INSERT INTO orders (unit_id, manager_id, client_id, description, status, order_value) 
      VALUES (?, ?, ?, ?, ?, ?);
    `;

    db.query(insertOrderQuery, [unit_id, manager_id, client_id, description, status, order_value], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro no servidor: ' + err.message });
      }

      res.json({ message: 'Pedido criado com sucesso', orderId: results.insertId }); // Retornamos também o ID do pedido criado
    });
  });
});


app.get('/orders/:order_id', (req, res) => {
  const { order_id } = req.params;
  const query = `
    SELECT * FROM orders 
    WHERE id = ?;
  `;
  db.query(query, [order_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro no servidor: ' + err.message);
    }
    res.json(results);
  });
});

app.post('/orders/:order_number/products', (req, res) => {
  const { order_number } = req.params;
  const { name, price, image } = req.body;

  const query = `
    INSERT INTO products (order_number, name, price, image)
    VALUES (?, ?, ?, ?);
  `;
  db.query(query, [order_number, name, price, image], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro no servidor: ' + err.message);
    }
    res.send('Produto adicionado com sucesso');
  });
});

app.post('/customers', (req, res) => {
  const { name, email, phone } = req.body;
  const query = `
    INSERT INTO customers (name, email, phone)
    VALUES (?, ?, ?);
  `;
  db.query(query, [name, email, phone], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro no servidor: ' + err.message);
    }
    res.json({ id: results.insertId, message: 'Cliente criado com sucesso' });
  });
});

app.get('/customers', (req, res) => {
  const query = `
    SELECT * FROM customers;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro no servidor: ' + err.message);
    }
    res.json(results);
  });
});

// cliente

// endpoint para buscar todos os clientes
app.get('/clients', (req, res) => {
  const query = `
    SELECT 
      id, 
      name, 
      cpf, 
      email, 
      phone
    FROM clients;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro no servidor: ' + err.message });
    }

    res.json(results);
  });
});

// buscar detalhes dos clientes:

app.get('/clients/:clientId', (req, res) => {
  const { clientId } = req.params;
  const query = 'SELECT * FROM clients WHERE id = ?';
  db.query(query, [clientId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro no servidor: ' + err.message);
    }
    res.json(results);
  });
});


// pedidos

app.post('/orders', (req, res) => {
  const clientID = Number(req.query.client_id);
  console.log("Received unitId:", clientID);
  const { client_id, description, status, total_price } = req.body;
  const manager_id = req.session.managerId; // Obtemos o manager_id da sessão

  // Primeiro, obtemos o unit_id baseado no manager_id
  db.query('SELECT unit_id FROM managers WHERE id = ?', [manager_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro no servidor: ' + err.message });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'Gerente não encontrado' });
    }

    const unit_id = results[0].unit_id;

    // Calculamos o preço total
    const total_price = products.reduce((sum, product) => sum + product.price, 0);

    const insertOrderQuery = `
      INSERT INTO orders (client_id, description, status, total_price) 
      VALUES (?, ?, ?, ?);
    `;

    db.query(insertOrderQuery, [unit_id, manager_id, client_id, description, status, total_price], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro no servidor: ' + err.message });
      }

      const orderId = results.insertId;

      if (products && products.length > 0) {
        const insertProductsQuery = `
          INSERT INTO products (order_id, name, price) 
          VALUES ?;
        `;
        const productsValues = products.map(product => [orderId, product.name, product.price]);
        db.query(insertProductsQuery, [productsValues], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro no servidor: ' + err.message });
          }
          res.json({ message: 'Pedido e produtos criados com sucesso' });
        });
      } else {
        res.json({ message: 'Pedido criado com sucesso' });
      }
    });
  });
});

// edição e visualização dos pedidos
app.get('/orders/open', (req, res) => {
  console.log(req.query);
  const unitId = Number(req.query.unit_id);
  const query = "SELECT orders.id, clients.name as client_name, clients.cpf as client_cpf, orders.status FROM orders JOIN clients ON orders.client_id = clients.id WHERE orders.unit_id = 4 AND (orders.status = 'PENDING' OR orders.status = 'IN PROCESS')";
  console.log(query);
  db.query(query, (err, results)=> {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro no servidor: ' + err.message });
    }
    console.log(results);  // Movido para aqui
    res.json(results);
  });
});

// pedidos em aberto
app.get('/abertas', (req, res) => {
  const unitId = Number(req.query.unit_id);
  // console.log("Received unitId:", unitId);
  const query = `SELECT orders.id, clients.name as client_name, clients.cpf as client_cpf, orders.status
  FROM orders
  JOIN clients ON orders.client_id = clients.id
  WHERE orders.unit_id = ${unitId} AND (orders.status = 'PENDENTE' OR orders.status = 'EM PROCESSAMENTO')`;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Erro no servidor: ' + err.message);
    }
    res.send(results);
  });
});

// pedidos completos
app.get('/completas', (req, res) => {
  const unitId = Number(req.query.unit_id);
  const query = `SELECT orders.id, clients.name as client_name, clients.cpf as client_cpf, orders.status
    FROM orders
    JOIN clients ON orders.client_id = clients.id
    WHERE orders.unit_id = ${unitId} AND orders.status = 'COMPLETO';
  `;
  db.query(query, [unitId], (err, results) => {
    if (err) {
      return res.status(500).send('Erro no servidor: ' + err.message);
    }
    res.json(results);
  });
});



app.put('/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { description, status, order_value  } = req.body;

  const updateOrderQuery = `
    UPDATE orders
    SET description = ?, status = ?, order_value = ?  -- Adicionado order_value
    WHERE id = ?;
  `;

  // Atualizamos os detalhes básicos do pedido
  db.query(updateOrderQuery, [description, status, order_value, orderId], (err) => { // Adicionado order_value
    if (err) {
      console.error(err);
      return res.status(500).send('Erro no servidor: ' + err.message);
    }
    
    res.json({ message: 'Pedido atualizado com sucesso' });
  });
});



app.get('/clients/cpf/:cpf', (req, res) => {
  const { cpf } = req.params;
  const query = 'SELECT * FROM clients WHERE cpf = ?';
  db.query(query, [cpf], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro no servidor: ' + err.message);
    }
    res.json(results);
  });
});


app.put('/clients/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, cpf } = req.body;

  const query = `
      UPDATE clients
      SET name = ?, email = ?, phone = ?, cpf = ?
      WHERE id = ?`;
  
  db.query(query, [name, email, phone, cpf, id], (error, results) => {
      if (error) {
          return res.status(500).json({ error: error.message });
      }

      if (results.affectedRows === 0) {
          return res.status(404).json({ message: "Client not found" });
      }

      res.status(200).json({ message: "Client updated successfully" });
  });
});

// excluir cliente

app.delete('/clients/:id', (req, res) => {
  const { id } = req.params;

  const query = `
      DELETE FROM clients
      WHERE id = ?`;

  db.query(query, [id], (error, results) => {
      if (error) {
          return res.status(500).json({ error: error.message });
      }

      if (results.affectedRows === 0) {
          return res.status(404).json({ message: "Client not found" });
      }

      res.status(200).json({ message: "Client deleted successfully" });
  });
});

// consulta

app.get('/clients/detalhes/:cpf', (req, res) => {
  const { cpf } = req.params;

  // Criando uma query SQL para buscar os detalhes do cliente usando o CPF
  const query = 'SELECT * FROM clients WHERE cpf = ?';

  db.query(query, [cpf], (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).send('Erro no servidor: ' + err.message);
      }
      
      // Retornando os detalhes do cliente como resposta JSON
      res.json(results);
  });
});

app.get('/orders/cpf/:cpf', (req, res) => {
  const { cpf } = req.params;

  // Criando uma query SQL para buscar os pedidos usando o CPF do cliente
  const query = `
      SELECT orders.id, orders.description, orders.status, orders.order_value 
      FROM orders 
      JOIN clients ON orders.client_id = clients.id 
      WHERE clients.cpf = ?;
  `;

  db.query(query, [cpf], (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).send('Erro no servidor: ' + err.message);
      }
      
      // Retornando os pedidos como resposta JSON
      res.json(results);
  });
});


app.get('/orders/saldo/:cpf', (req, res) => {
  const { cpf } = req.params;

  // Criando uma query SQL para calcular o saldo total dos pedidos completos usando o CPF do cliente
  const query = `
      SELECT SUM(orders.order_value) AS saldoTotal
      FROM orders 
      JOIN clients ON orders.client_id = clients.id 
      WHERE clients.cpf = ? AND orders.status = 'COMPLETO';
  `;

  db.query(query, [cpf], (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).send('Erro no servidor: ' + err.message);
      }
      
      // Se nenhum pedido completo foi encontrado, o saldoTotal deve ser 0
      const saldoTotal = results[0].saldoTotal || 0;
      
      // Retornando o saldo total como resposta JSON
      res.json({ saldoTotal });
  });
});






app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
