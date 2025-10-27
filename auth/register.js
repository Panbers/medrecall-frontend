// register.js
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const errorMessage = document.getElementById('error-message');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessage.textContent = '';

        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // 1. Validação no lado do cliente
        if (password !== confirmPassword) {
            errorMessage.textContent = 'As senhas não coincidem.';
            return;
        }

        try {
            // 2. Envia os dados para a sua API de registro
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                // 3. Sucesso!
                alert('Conta criada com sucesso! Você será redirecionado para a página de login.');
                window.location.href = 'index.html'; // Redireciona para o login
            } else {
                // 4. Erro vindo do servidor
                const errorData = await response.json();
                errorMessage.textContent = errorData.error || 'Não foi possível criar a conta.';
            }
        } catch (error) {
            console.error('Erro ao registar:', error);
            errorMessage.textContent = 'Falha na comunicação com o servidor.';
        }
    });
});