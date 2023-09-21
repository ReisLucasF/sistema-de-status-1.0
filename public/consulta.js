document.addEventListener('DOMContentLoaded', () => {
    const buscarBtn = document.getElementById('buscarBtn');

    buscarBtn.addEventListener('click', () => {
        const cpf = document.getElementById('cpfInput').value;
        buscarDetalhesCliente(cpf);
        buscarPedidos(cpf);
        buscarSaldo(cpf);
    });
});

function buscarDetalhesCliente(cpf) {
    fetch(`/clients/detalhes/${cpf}`)
        .then(response => {
            // Verifique se a resposta é válida, se não, lance um erro
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Verifique se recebemos dados válidos
            if (data && data.length > 0) {
                const clientDetails = data[0];
                const boasVindasElem = document.getElementById('boasVindas');
                
                // Defina a mensagem de boas-vindas com o nome do cliente
                boasVindasElem.textContent = `Olá ${clientDetails.name}, veja abaixo os seus pedidos:`;

                // Mostre a mensagem de boas-vindas
                boasVindasElem.style.display = 'block';
            } else {
                // Caso o cliente não seja encontrado, exiba uma mensagem
                alert('Nenhum cliente encontrado com este CPF');
            }
        })
        .catch(error => {
            // Caso ocorra um erro na requisição, exiba uma mensagem de erro
            console.error('Erro ao buscar os detalhes do cliente:', error);
        });
}


function buscarPedidos(cpf) {
    fetch(`/orders/cpf/${cpf}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                // Filtre os pedidos pendentes e em processamento e monte a tabela
                const pedidosAbertos = data.filter(pedido => pedido.status === 'PENDENTE' || pedido.status === 'EM PROCESSAMENTO');
                const tabelaPedidos = document.getElementById('tabelaPedidos').getElementsByTagName('tbody')[0];
                tabelaPedidos.innerHTML = pedidosAbertos.map(pedido => `
                    <tr>
                        <td>${pedido.id}</td>
                        <td>${pedido.description}</td>
                        <td>${pedido.status}</td>
                        <td>${pedido.order_value}</td>
                    </tr>
                `).join('');
                document.getElementById('tabelaPedidos').style.display = 'table';
                
                // Calcule o saldo total baseado nos pedidos completos
                const saldoTotal = data.filter(pedido => pedido.status === 'COMPLETO').reduce((total, pedido) => total + parseFloat(pedido.order_value || 0), 0);
                document.getElementById('saldoTotal').textContent = `Saldo disponível: R$ ${saldoTotal.toFixed(2)}`;

                // Mostre o saldo
                document.getElementById('saldoTotal').parentElement.style.display = 'block';            } else {
                console.error('Nenhum pedido encontrado para este CPF');
            }
        })
        .catch(error => {
            console.error('Erro ao buscar os pedidos:', error);
        });
}


function buscarSaldo(cpf) {
    fetch(`/orders/saldo/${cpf}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.saldoTotal != null) {
                const saldoTotal = parseFloat(data.saldoTotal);
                document.getElementById('saldoTotal').textContent = `Saldo disponível: ${saldoTotal.toFixed(2)}`;
            } else {
                console.error('Não foi possível calcular o saldo para este CPF');
            }
        })
        .catch(error => {
            console.error('Erro ao buscar o saldo:', error);
        });
}