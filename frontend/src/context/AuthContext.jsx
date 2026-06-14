// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { apiService } from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verificar al cargar la app si ya había una sesión guardada
    useEffect(() => {
        const storedUser = localStorage.getItem('aroma_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Función para Iniciar Sesión (conecta con auth.php)
    const login = async (email, password) => {
        try {
            const response = await apiService.post('auth', {
                accion: 'login',
                email,
                password
            });

            if (response.status === 'success') {
                setUser(response.user);
                localStorage.setItem('aroma_user', JSON.stringify(response.user));
                return response;
            }
        } catch (error) {
            throw error;
        }
    };

    // Función para Registrarse (conecta con auth.php)
    const registro = async (nombre, email, password) => {
        try {
            return await apiService.post('auth', {
                accion: 'registro',
                nombre,
                email,
                password
            });
        } catch (error) {
            throw error;
        }
    };

    // Cerrar Sesión
    const logout = () => {
        setUser(null);
        localStorage.removeItem('aroma_user');
    };

    const agregarAlCarrito = async (productoId, cantidad = 1) => {
        // Si no hay un usuario en el estado, le advertimos que debe loguearse
        if (!user || !user.id) {
            throw new Error('Debes iniciar sesión para añadir productos al carrito.');
        }

        try {
            // Mandamos el POST estructurado hacia el endpoint carrito.php
            const response = await apiService.post('carrito', {
                usuario_id: user.id,
                producto_id: productoId,
                cantidad: cantidad
            });

            return response;
        } catch (error) {
            throw error;
        }
    };

    // Recuerda agregar la función al return del Provider para que sea pública:
    return (
        <AuthContext.Provider value={{ user, login, registro, logout, agregarAlCarrito, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};