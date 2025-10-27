// frontend/api/apiService.js
// Este ficheiro define e expõe um objeto de comunicação com o servidor (UMD via window.apiService)

const API_BASE_URL = 'http://localhost:3000/api';

const request = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    alert('Sessão inválida. Por favor, faça o login novamente.');
    window.location.href = 'index.html';
    throw new Error('Token não encontrado');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      alert('A sua sessão expirou. Por favor, faça o login novamente.');
      window.location.href = 'index.html';
      throw new Error('Token inválido ou expirado');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(errorData.error || `Erro na API: ${response.statusText}`);
    }

    if (response.status === 204) return null;
    return response.json();
  } catch (error) {
    console.error(`Falha na requisição para ${endpoint}:`, error);
    throw error;
  }
};

const apiService = {
  // ✅ endpoint corrigido
  getInitialData: () => request('/initial-data'),

  createDeck: (deckData) => request('/decks', 'POST', deckData),
  updateDeck: (deckId, deckData) => request(`/decks/${deckId}`, 'PUT', deckData),
  deleteDeck: (deckId) => request(`/decks/${deckId}`, 'DELETE'),

  createCard: (deckId, cardData) => request(`/decks/${deckId}/cards`, 'POST', cardData),
  updateCard: (cardId, cardData) => request(`/cards/${cardId}`, 'PUT', cardData),
  deleteCard: (cardId) => request(`/cards/${cardId}`, 'DELETE'),
  reviewCard: (cardId, reviewData) => request(`/cards/${cardId}/review`, 'POST', reviewData),

  createFolder: (folderData) => request('/folders', 'POST', folderData),
  updateFolder: (folderId, folderData) => request(`/folders/${folderId}`, 'PUT', folderData),
  deleteFolder: (folderId) => request(`/folders/${folderId}`, 'DELETE'),
};

// 👉 expõe no escopo global para uso sem ES Modules
window.apiService = apiService;
