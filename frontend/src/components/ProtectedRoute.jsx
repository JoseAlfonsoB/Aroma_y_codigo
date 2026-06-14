// src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    // Si el contexto aún está cargando la sesión del localStorage, mostramos un mensaje
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-600">Verificando sesión...</div>;
    }

    // Si no hay usuario, lo mandamos directo al login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Si hay usuario, permitimos el acceso al componente hijo (el catálogo)
    return children;
};