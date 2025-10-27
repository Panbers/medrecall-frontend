// register.js
import { API_BASE } from "./config.js";

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();
  const messageEl = document.getElementById("message");

  if (password !== confirmPassword) {
    messageEl.textContent = "As senhas não coincidem.";
    messageEl.style.color = "red";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      messageEl.textContent = "✅ Conta criada com sucesso! Faça login.";
      messageEl.style.color = "green";
      setTimeout(() => (window.location.href = "login.html"), 1500);
    } else {
      messageEl.textContent = data.message || "❌ Não foi possível criar a conta.";
      messageEl.style.color = "red";
    }
  } catch (err) {
    console.error("Erro:", err);
    messageEl.textContent = "Erro de conexão com o servidor.";
    messageEl.style.color = "red";
  }
});
