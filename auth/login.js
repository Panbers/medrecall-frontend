// ✅ LOGIN ATUALIZADO PARA PRODUÇÃO (Render + Vercel)
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
      // 🔹 Login com backend hospedado
      const response = await fetch('https://medrecall-backend.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        errorMessage.textContent = 'Email ou senha incorretos.';
        return;
      }

      const data = await response.json();
      const user = data.user;
      const token = data.token;

      console.log("👤 Usuário logado:", user);
      console.log("🔑 Token JWT salvo:", token);

      // 🔹 Salva autenticação
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(user));

      // 🔹 Busca dados iniciais direto do banco (Render)
      try {
        const initResponse = await fetch('https://medrecall-backend.onrender.com/api/initial-data', {
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

      // 🔹 Redireciona com base na assinatura
      if (user.subscription_status === 'active') {
        window.location.href = 'dashboard.html';
      } else {
        window.location.href = 'subscription.html';
      }

    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      errorMessage.textContent = 'Não foi possível conectar ao servidor.';
    }
  });
});
