document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-unit-form');
    const unitsTable = document.getElementById('units-table');
  
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const unitName = document.getElementById('unit-name').value;
      const managerName = document.getElementById('manager-name').value;
      const managerUsername = document.getElementById('manager-username').value;
      const managerPassword = document.getElementById('manager-password').value;
  
      fetch('/units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unitName,
          managerName,
          username: managerUsername,
          password: managerPassword,
        }),
      })
        .then((response) => response.text())
        .then((message) => {
          alert(message);
          loadUnits();
        });
    });
  
    function loadUnits() {
        fetch('/units')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Houve um erro de conexão: ' + response.statusText);
          }
          return response.json();
        })

      .then((units) => {
          unitsTable.tBodies[0].innerHTML = units
            .map(
              (unit) =>
                `<tr>
                  <td>${unit.unit_name}</td>
                  <td>${unit.manager_name}</td>
                  <td>${unit.username}</td>
                  <td>
                    <button onclick="editUnit(${unit.id},'${unit.unit_name}','${unit.manager_name}','${unit.username}')">Edit</button>
                    <button onclick="deleteUnit(${unit.id})">Delete</button>
                  </td>
                </tr>`
            )
            .join('');
        })
        .catch((error) => {
            console.error('Ops! Ocorreu um erro: (', error);
        });
        
    }
  
    loadUnits();
  });
  
  function editUnit(id, unitName, managerName, username) {
    const newUnitName = prompt('Digite o nome da nova unidade:', unitName);
    const newManagerName = prompt('Digite o nome do gerente:', managerName);
    const newUsername = prompt('Digite o nome de usuário:', username);
    const newPassword = prompt('Crie uma senha:');
  
    if (newUnitName && newManagerName && newUsername && newPassword) {
      fetch(`/units/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unitName: newUnitName,
          managerName: newManagerName,
          username: newUsername,
          password: newPassword,
        }),
      })
        .then((response) => response.text())
        .then((message) => {
          alert(message);
          document.dispatchEvent(new Event('DOMContentLoaded'));
        });
    } else {
      alert('Todos os campos são obrigatórios!');
    }
  }
  
  function deleteUnit(id) {
    if (confirm('Tem certeza que gostaria de excluir esta unidade?')) {
      fetch(`/units/${id}`, {
        method: 'DELETE',
      })
        .then((response) => response.text())
        .then((message) => {
          alert(message);
          document.dispatchEvent(new Event('DOMContentLoaded'));
        });
    }
  }
  
  //  pedidos

  document.addEventListener('DOMContentLoaded', () => {
    const clientModal = document.getElementById('clientModal');
    const orderModal = document.getElementById('orderModal');
    const productsContainer = document.getElementById('productsContainer'); // Container para os produtos

    document.getElementById('addClientBtn').addEventListener('click', () => {
        clientModal.style.display = 'block';
    });

    document.getElementById('addOrderBtn').addEventListener('click', () => {
        orderModal.style.display = 'block';
        fetchClients();
    });

    document.getElementById('closeClientModalBtn').addEventListener('click', () => {
        clientModal.style.display = 'none';
    });

    document.getElementById('closeOrderModalBtn').addEventListener('click', () => {
        orderModal.style.display = 'none';
    });

    // document.getElementById('clientSelect').addEventListener('change', (e) => {
    //     fetchClientDetails(e.target.value);
    // });

    document.getElementById('fetchClientByCpfBtn').addEventListener('click', () => {
      const cpf = document.getElementById('clientCpfSearch').value;
      fetchClientDetailsByCpf(cpf);
  });

    // document.getElementById('addProductBtn').addEventListener('click', () => {
    //     addProductFields();
    // });

    document.getElementById('saveClientBtn').addEventListener('click', () => {
        saveClient();
    });

    document.getElementById('saveOrderBtn').addEventListener('click', () => {
        saveOrder();
    });

    const clientSelect = document.getElementById('clientSelect');

    function fetchClientDetailsByCpf(cpf) {
      fetch(`/clients/cpf/${cpf}`)
          .then(response => response.json())
          .then(data => {
              if (data && data.length > 0) {
                  const clientDetails = data[0];
                  document.getElementById('orderClientName').value = clientDetails.name;
                  document.getElementById('orderClientEmail').value = clientDetails.email;
                  document.getElementById('orderClientPhone').value = clientDetails.phone;
                  document.getElementById('orderClientCpf').value = clientDetails.cpf;
              } else {
                  console.error('Nenhum cliente encontrado com este CPF');
              }
          })
          .catch(error => {
              console.error('Erro ao buscar os detalhes do cliente:', error);
          });
  }

  function fetchClients() {
    fetch('/clients')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(clients => {
        // Popula a tabela com os dados recebidos
        const clientsTable = document.getElementById('clientsTable').getElementsByTagName('tbody')[0];
        clientsTable.innerHTML = clients.map(client => `
          <tr>
            <td>${client.name}</td>
            <td>${client.cpf}</td>
            <td>${client.email}</td>
            <td>${client.phone}</td>
            <td><button class="edit-client-button" data-client-id="${client.id}">Editar</button></td>
          </tr>
        `).join('');
      })
      .catch(error => console.error('Erro ao buscar os detalhes dos clientes:', error));
  }
  
  document.addEventListener('click', function(e) {
    if (e.target.matches('button.edit-client-button')) {
      const clientId = e.target.getAttribute('data-client-id');
      editClient(clientId);
    }
  });
  
  document.getElementById('ClientBtn').addEventListener('click', () => {
    document.getElementById('clientsModal').style.display = 'block';
    fetchClients();
  });
  
  document.getElementById('fetchClientByCpfBtn').addEventListener('click', () => {
    const cpf = document.getElementById('clientCPFSearch').value;
    fetchClientDetails(cpf);
  });
  
  let currentClientId; 
  
  function editClient(clientId) {
    // Guardamos o ID do cliente que está sendo editado
    currentClientId = clientId;
  
    // Buscamos os detalhes do cliente
    fetch(`/clients/${clientId}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const clientDetails = data[0];


          document.getElementById('editClientName').value = clientDetails.name;
          document.getElementById('editClientEmail').value = clientDetails.email;
          document.getElementById('editClientPhone').value = clientDetails.phone;
          document.getElementById('editClientCpf').value = clientDetails.cpf;
  
          // Exibimos o modal de edição
          document.getElementById('editClientModal').style.display = 'block';
        } else {
          console.error('Nenhum detalhe do cliente encontrado');
        }
      })
      .catch(error => {
        console.error('Erro ao buscar os detalhes do cliente:', error);
      });
  }

  
    
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

  function fetchClientDetails(cpf) {
    fetch(`/clients/cpf/${cpf}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const clientDetails = data[0];
                document.getElementById('orderClientName').value = clientDetails.name; // Adicione esta linha para preencher o nome do cliente
                document.getElementById('orderClientEmail').value = clientDetails.email;
                document.getElementById('orderClientPhone').value = clientDetails.phone;
                document.getElementById('orderClientCpf').value = clientDetails.cpf;
                document.getElementById('clientId').value = clientDetails.id;  // Armazenando o ID do cliente

              } else {
                console.error('Nenhum cliente encontrado com este CPF');
            }
        })
        .catch(error => {
            console.error('Erro ao buscar os detalhes do cliente:', error);
        });
}

    // function addProductFields() {
    //     const productDiv = document.createElement('div');
    //     productDiv.classList.add('product');
    //     productDiv.innerHTML = `
    //         <label for="productName">Nome do Produto</label>
    //         <input type="text" name="productName">
    //         <label for="productPrice">Preço do Produto</label>
    //         <input type="text" name="productPrice">
    //         <button type="button" onclick="this.parentElement.remove()">Remover Produto</button>
    //     `;
    //     productsContainer.appendChild(productDiv);
    // }

    function saveClient() {
        const name = document.getElementById('clientName').value;
        const email = document.getElementById('clientEmail').value;
        const phone = document.getElementById('clientPhone').value;
        const cpf = document.getElementById('clientCpf').value;

        fetch('/clients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, cpf })
        })
        .then(response => response.json())
        .then(data => {
            alert('Cliente salvo com sucesso!');
            clientModal.style.display = 'none';
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao salvar o cliente');
        });
    }

    function saveOrder() {
      // const unit_id = localStorage.getItem('unit_id');
      // const manager_id = localStorage.getItem('manager_id');

      const clientIdElem = document.getElementById('clientId');

      console.log(document.getElementById('clientId'));  // Adicione esta linha

      if (!clientIdElem) {
        console.error('Elemento clientId não encontrado!');
        return;
      }
        const client_id = clientIdElem.value;
        // const client_id = document.getElementById('clientSelect').value;
        const description = document.getElementById('orderDescription').value;
        const status = document.getElementById('orderStatus').value;


        const products = Array.from(productsContainer.getElementsByClassName('product')).map(productDiv => {
            const name = productDiv.querySelector('input[name="productName"]').value;
            const price = productDiv.querySelector('input[name="productPrice"]').value;
            return { name, price };
        });

        fetch('/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ client_id, description, status, products })
        })
        .then(response => response.json())
        .then(data => {
            alert('Pedido salvo com sucesso!');
            orderModal.style.display = 'none';
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao salvar o pedido');
        });
    }
});


// modals para visualizar os pedidos
document.getElementById('viewOrdersBtn').addEventListener('click', () => {
  document.getElementById('ordersModal').style.display = 'block';
});

document.getElementById('closeOrdersModalBtn').addEventListener('click', () => {
  document.getElementById('ordersModal').style.display = 'none';
});

document.getElementById('openOrdersBtn').addEventListener('click', () => {
  closeAllModals();
  fetchOpenOrders();
  document.getElementById('openOrdersModal').style.display = 'block';
});

document.getElementById('closeOrdersModalBtn').addEventListener('click', () => {
  document.getElementById('ordersModal').style.display = 'none';
  closeAllModals();
});

document.getElementById('completedOrdersBtn').addEventListener('click', () => {
  closeAllModals();
  fetchCompletedOrders();
  document.getElementById('completedOrdersModal').style.display = 'block';
});

document.getElementById('closeOpenOrdersModalBtn').addEventListener('click', () => {
  document.getElementById('openOrdersModal').style.display = 'none';
});

document.getElementById('closeCompletedOrdersModalBtn').addEventListener('click', () => {
  document.getElementById('completedOrdersModal').style.display = 'none';
});


// ordens abertas
function fetchOpenOrders() {
  const unitId = localStorage.getItem('unit_id');
  console.log('unit_id from localStorage:', unitId);  // Log para verificar o unit_id
  fetch(`/abertas?unit_id=${unitId}`)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
      // console.log('Data received:', data);  // Movido para aqui
      // Popula a tabela com os dados recebidos
      const openOrdersTable = document.getElementById('openOrdersTable').getElementsByTagName('tbody')[0];
      openOrdersTable.innerHTML = data.map(order => `
        <tr>
          <td>${order.id}</td>
          <td>${order.client_name}</td>
          <td>${order.client_cpf}</td>
          <td>${order.status}</td>
          <td><button onclick="editOrder(${order.id})">Editar</button></td>
        </tr>
      `).join('');
    })
    .catch(error => console.error('Erro ao buscar os pedidos em aberto:', error));
}

// ordens completas
function fetchCompletedOrders() {
  const unitId = localStorage.getItem('unit_id');
  // console.log('unit_id from localStorage:', unitId);
  fetch(`/completas?unit_id=${unitId}`)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
      // console.log('Data received:', data);
      // Popula a tabela com os dados recebidos
      const completedOrdersTable = document.getElementById('completedOrdersTable').getElementsByTagName('tbody')[0];
      completedOrdersTable.innerHTML = data.map(order => `
      <tr>
        <td>${order.id}</td>
        <td>${order.client_name}</td>
        <td>${order.client_cpf}</td>
        <td>${order.status}</td>
        <td><button class="edit-button" data-order-id="${order.id}">Editar</button></td>
      </tr>
      `).join('');
    })
    .catch(error => console.error('Erro ao buscar os pedidos finalizados:', error));
}


let currentOrderId;  // Declare no escopo global


document.addEventListener('click', function(e) {
  if (e.target.matches('button.edit-button')) {
    const orderId = e.target.getAttribute('data-order-id');
    editOrder(orderId);
  }
});



function editOrder(orderId) {
  fetch(`/orders/${orderId}`)
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        const orderDetails = data[0];
        currentOrderId = orderDetails.id; 
        
        document.getElementById('editOrderDescription').value = orderDetails.description;
        // document.getElementById('orderDescription').value = orderDetails.description;
        document.getElementById('orderStatus').value = orderDetails.status;
        document.getElementById('editOrderTotalPrice').value = orderDetails.order_value; // Nova linha

        
        
        // ... (faça isso para todos os outros campos que você deseja que sejam editáveis)

        // Exibir o modal
        document.getElementById('editOrderModal').style.display = 'block';

      } else {
        console.error('Nenhum detalhe do pedido encontrado');
      }
    })
    .catch(error => {
      console.error('Erro ao buscar os detalhes do pedido:', error);
    });
}

document.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById('saveEditedOrderBtn').addEventListener('click', saveOrderChanges);
});


function saveOrderChanges() {
  // Obtenha o ID e os outros detalhes do pedido dos campos de input no modal
  // const orderId = document.getElementById('edit-order-id').value;
  const descriptionElem = document.getElementById('editOrderDescription');
  const statusElem = document.getElementById('editOrderStatus');
  const orderValueElem = document.getElementById('editOrderTotalPrice'); // Nova linha

  // const clientSelectElem = document.getElementById('editClientSelect');


  if (!descriptionElem || !statusElem || !orderValueElem ) {
    console.error('Um ou mais elementos não foram encontrados');
    return;
}

  const description = descriptionElem.value;
  const status = statusElem.value;
  const order_value = orderValueElem.value;
  // const client_id = clientSelectElem.value;
  
  // Crie um objeto com os detalhes do pedido
  const orderDetails = {
    description,
    status,
    order_value, 
    // ... (inclua todas as outras propriedades que você está permitindo editar)
  };


  // Enviar os detalhes do pedido atualizados para o servidor
  fetch(`/orders/${currentOrderId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderDetails),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Pedido atualizado com sucesso:', data);
      
      // Ocultar o modal
      document.getElementById('editOrderModal').style.display = 'none';

      // Atualize a tabela de pedidos para refletir a alteração na UI
      // (chame a função que recarrega os dados na tabela de pedidos)
      fetchOpenOrders();

      // Atualize a tabela de pedidos (ou faça o que for necessário para refletir a alteração na UI)
      // Por exemplo, você pode recarregar a tabela de pedidos chamando uma função que busca todos os pedidos novamente
      // loadOrders();
    })
    .catch(error => {
      console.error('Erro ao atualizar o pedido:', error);
    });
}


// console.log(document.getElementById('edit-order-id'));


// fechar modais
function closeAllModals() {
  document.getElementById('openOrdersModal').style.display = 'none';
  document.getElementById('completedOrdersModal').style.display = 'none';
  // Repita para outras modals
}






document.getElementById('closeEditOrderModalBtn').addEventListener('click', () => {
  document.getElementById('editOrderModal').style.display = 'none';
});
