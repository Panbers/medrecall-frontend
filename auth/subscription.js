document.addEventListener('DOMContentLoaded', () => {
  const subscribeButton = document.getElementById('subscribe-button');

  subscribeButton.addEventListener('click', async () => {
    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch('http://localhost:3000/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_name: "Assinatura Anual MedRecall",
          amount: 0.01
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Erro: ${data.message}`);
        console.error(data);
        return;
      }

      console.log("✅ Pagamento criado:", data);
      if (data.init_point) {
        window.location.href = data.init_point; // redireciona ao checkout do MP
      } else {
        alert("Pagamento criado, mas sem URL de checkout!");
      }
    } catch (err) {
      console.error('❌ Erro ao criar pagamento:', err);
      alert('Erro ao criar pagamento. Tente novamente.');
    }
  });
});
