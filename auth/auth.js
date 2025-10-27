// auth.js - O novo guarda, agora verificando também a assinatura

const token = localStorage.getItem('authToken');
const userDataString = localStorage.getItem('userData');

if (!token || !userDataString) {
    // Se não há token OU dados do usuário, o acesso é negado.
    alert('Acesso negado. Por favor, faça o login para continuar.');
    window.location.href = 'index.html';
} else {
    // Se há token, vamos verificar o status da assinatura
    const userData = JSON.parse(userDataString);

    if (userData.subscription_status !== 'active') {
        // Se a assinatura não está ativa, ele não pode acessar o dashboard.
        // Redireciona para a página de assinatura.
        console.log("Guarda: Assinatura não ativa. Acesso ao dashboard bloqueado.");
        window.location.href = 'subscription.html';
    }
    // Se a assinatura for 'active', o script termina e a página do dashboard continua carregando.
    console.log("Guarda: Acesso permitido.");
}