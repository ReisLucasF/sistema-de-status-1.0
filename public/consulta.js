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
    fetch(`/clients/cpf/${cpf}`)
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
        .then(response => response.json())
        .then(data => {
            // Código para preencher a tabela de pedidos
        })
        .catch(error => console.error('Erro ao buscar pedidos:', error));
}

function buscarSaldo(cpf) {
    fetch(`/orders/saldo/${cpf}`)
        .then(response => response.json())
        .then(data => {
            // Código para calcular e exibir o saldo total
        })
        .catch(error => console.error('Erro ao buscar saldo:', error));
}
