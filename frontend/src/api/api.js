// src/api/api.js

const BASE_URL = '/index.php';

export const apiService = {
    // 1. Peticiones GET (Corregida la concatenación limpia)
    async get(endpoint, params = {}) {
        // Concatenamos el endpoint directamente de forma limpia
        let url = `${BASE_URL}/${endpoint}`;

        // Si mandas parámetros (como filtros o IDs), los pegamos manualmente con Query Strings
        const paramKeys = Object.keys(params);
        if (paramKeys.length > 0) {
            const queryString = paramKeys
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');
            url += `?${queryString}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        return handleResponse(response);
    },

    // 2. Peticiones POST (Corregida usando Template Strings)
    async post(endpoint, body) {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return handleResponse(response);
    },

    // 3. Peticiones DELETE
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
    // Si la respuesta es un texto plano antes de ser JSON (por errores del hosting)
    const text = await response.text();

    try {
        const data = JSON.parse(text);
        if (!response.ok) {
            throw new Error(data.message || 'Ocurrió un error en la petición.');
        }
        return data;
    } catch (err) {
        // Si el hosting responde con un HTML de error o algo raro, lo atrapamos de forma segura
        throw new Error('Error en el servidor o formato de respuesta inválido.', err);
    }
}