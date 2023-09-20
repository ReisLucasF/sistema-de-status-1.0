document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (!response.ok) {
                // Se a resposta não está ok, ainda queremos ler o corpo da resposta
                // para obter a mensagem de erro que nosso servidor está enviando
                return response.json().then((err) => Promise.reject(err));

              }
              return response.json();
              })
              .then((data) => {
                console.log(data);
                // Agora, 'data' contém os IDs que enviamos do servidor, então podemos usá-los aqui
              localStorage.setItem('unit_id', data.unit_id);
              localStorage.setItem('manager_id', data.manager_id);
              
                window.location.href = '/pedidos';  // Redirecionar para a página de pedidos após login bem-sucedido
              })
              .catch((error) => {
                console.error('Erro:', error);
              if (error.error) {
                // Se nosso erro tem uma propriedade 'error', é uma resposta do servidor
                alert(error.error);
              } else {
                // Senão, é um erro de rede ou outro erro de sistema
                alert('Ocorreu um erro ao tentar fazer login.');
              }
            });
    });
});