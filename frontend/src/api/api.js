// src/api/api.js

const BASE_URL = 'http://localhost:8000';

export const apiService = {
    // Peticiones GET (ej. Obtener productos o el carrito)
    async get(endpoint, params = {}) {
        const url = new URL(`${BASE_URL}/${endpoint}`);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        return handleResponse(response);
    },

    // Peticiones POST (ej. Login, Registro, Agregar al carrito, Pago)
    async post(endpoint, body) {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return handleResponse(response);
    },

    // Peticiones DELETE (ej. Eliminar del carrito)
    async delete(endpoint, body) {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return handleResponse(response);
    }
};

// Manejador central de respuestas HTTP
async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Ocurrió un error en la petición.');
    }
    return data;
}