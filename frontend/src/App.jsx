// src/App.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { LoginForm } from './components/organisms/LoginForm.jsx';
import { RegisterForm } from './components/organisms/RegisterForm.jsx';
import { ProductGrid } from './components/organisms/ProductGrid.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AuthContext } from './context/AuthContext';
import { CartList } from './components/organisms/CartList.jsx';

function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">

        {/* Navbar Dinámica */}
        <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center shadow-sm">
          <Link to={user ? "/catalogo" : "/login"} className="text-xl font-black text-amber-900 tracking-wider">
            AROMA & CÓDIGO
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              {/* ENLACE SPA HACIA EL CARRITO DE COMPRAS */}
              <Link
                to="/carrito"
                className="text-sm font-bold bg-amber-800 text-white px-4 py-1.5 rounded-lg hover:bg-amber-900 transition-colors"
              >
                🛒 Ver Carrito
              </Link>

              <span className="text-sm bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-medium">
                {user.nombre || 'Sesión Activa'}
              </span>

              <button
                onClick={logout}
                className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </header>

        {/* Contenedor de Vistas */}
        <main className="flex-1 flex items-center justify-center p-4">
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={
              !user ? <LoginForm /> : <Navigate to="/catalogo" replace />
            } />

            <Route path="/register" element={
              !user ? (
                <div className="w-full flex flex-col items-center">
                  <RegisterForm onSwitchToLogin={() => window.location.href = '/login'} />
                </div>
              ) : (
                <Navigate to="/catalogo" replace />
              )
            } />

            <Route path="/catalogo" element={
              <ProtectedRoute>
                <div className="w-full">
                  <ProductGrid />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/carrito" element={
              <ProtectedRoute>
                <div className="w-full">
                  <CartList />
                </div>
              </ProtectedRoute>
            } />

            {/* Redirección por defecto si la ruta no existe o está vacía */}
            <Route path="*" element={<Navigate to={user ? "/catalogo" : "/login"} replace />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;