document.addEventListener('DOMContentLoaded', () => {
  const subscribeButton = document.getElementById('subscribe-button');

  subscribeButton.addEventListener('click', async () => {
    // pega o token que o backend envia no login
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('https://medrecall-backend.onrender.com/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_name: "Assinatura Anual MedRecall",
          amount: 0.01 // valor para teste
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Erro: ${data.message || 'Falha ao criar pagamento'}`);
        console.error(data);
        return;
      }

      console.log("✅ Pagamento criado:", data);

      // redireciona se for checkout
      if (data.init_point) {
        window.location.href = data.init_point;
      } 
      // exibe QR Code se for PIX
      else if (data.point_of_interaction?.transaction_data?.qr_code_base64) {
        const img = document.createElement("img");
        img.src = `data:image/png;base64,${data.point_of_interaction.transaction_data.qr_code_base64}`;
        img.className = "mt-4 mx-auto rounded-lg border border-slate-600";
        document.body.appendChild(img);
      } 
      else {
        alert("Pagamento criado, mas sem URL de checkout!");
      }

    } catch (err) {
      console.error('❌ Erro ao criar pagamento:', err);
      alert('Erro ao criar pagamento. Tente novamente.');
    }
  });
});
