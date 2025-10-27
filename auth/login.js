// ✅ LOGIN ATUALIZADO - sem salvar dados compartilhados no navegador
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('error-message');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorMessage.textContent = '';

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      // 🔹 1️⃣ Faz login
      const response = await fetch('https://medrecall-backend.onrender.com/api/initial-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        errorMessage.textContent = 'Email ou senha incorretos.';
        return;
      }

      // 🔹 2️⃣ Extrai dados do backend
      const data = await response.json();
      const user = data.user;
      const token = data.token;

      console.log("👤 Usuário logado:", user);
      console.log("🔑 Token JWT salvo:", token);

      // 🔹 3️⃣ Salva autenticação (sessão)
      localStorage.setItem('token', token);
      
      localStorage.setItem('userData', JSON.stringify(user));

      // 🔹 4️⃣ Teste: apenas verifica se o banco está respondendo
      try {
        const initResponse = await fetch('http://localhost:3000/api/initial-data', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (initResponse.ok) {
          const initialData = await initResponse.json();
          console.log('✅ Dados carregados direto do banco:', initialData);
        } else {
          console.warn('⚠️ Falha ao buscar dados iniciais do banco.');
        }
      } catch (loadErr) {
        console.error('❌ Erro ao buscar dados do banco:', loadErr);
      }

      // 🔹 5️⃣ Redirecionamento conforme assinatura
      if (user.subscription_status === 'active') {
        console.log("Assinatura ativa. Indo para o dashboard...");
        window.location.href = 'dashboard.html';
      } else {
        console.log("Sem assinatura ativa. Indo para a página de assinatura...");
        window.location.href = 'subscription.html';
      }

    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      errorMessage.textContent = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    }
  });
});



