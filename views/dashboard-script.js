// dashboard-script.js

function performGlobalLogout() {
    console.log("Iniciando processo de logout...");
    
    // 1. Limpa os dados de autenticação do navegador
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // 2. Alerta o usuário (opcional)
    alert('Você foi desconectado com segurança.');
    
    // 3. Redireciona para a página de login
    window.location.href = 'index.html';
}