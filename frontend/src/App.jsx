// src/App.jsx
import React, { useContext } from 'react';
// Importamos useLocation y useNavigate para la reactividad total del botón
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
// 1. Importamos el proveedor oficial de PayPal SDK
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { LoginForm } from './components/organisms/LoginForm.jsx';
import { RegisterForm } from './components/organisms/RegisterForm.jsx';
import { ProductGrid } from './components/organisms/ProductGrid.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AuthContext } from './context/AuthContext';
import { CartList } from './components/organisms/CartList.jsx';

// 🚀 SUB-COMPONENTE NAVBAR CON EL BOTÓN MULTIFUNCIONAL REACTIVO
function Navbar({ user, logout }) {
  const location = useLocation(); // Sabe exactamente en qué URL está parado el cliente
  const navigate = useNavigate(); // Permite redireccionar de forma imperativa

  // Evaluamos de forma booleana si el usuario se encuentra actualmente visualizando el carrito
  const esCarrito = location.pathname === '/carrito';

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center shadow-sm">
      <Link to={user ? "/catalogo" : "/login"} className="text-xl font-black text-amber-900 tracking-wider">
        AROMA & CÓDIGO
      </Link>

      {user && (
        <div className="flex items-center gap-4">

          {/* 👇 CAMBIO RADICAL: BOTÓN ÚNICO, REACTIVO Y MUTABLE */}
          {/* Cambia su acción y sus clases de diseño según el valor de 'esCarrito' */}
          <button
            onClick={() => navigate(esCarrito ? '/catalogo' : '/carrito')}
            className={`text-sm font-bold px-4 py-1.5 rounded-lg transition-all duration-200 ${esCarrito
                ? "border-2 border-amber-800 text-amber-800 hover:bg-amber-50" // Diseño sutil para "Regresar"
                : "bg-amber-800 text-white hover:bg-amber-900" // Diseño sólido para "Ver Carrito"
              }`}
          >
            {esCarrito ? '← Volver al Menú' : '🛒 Ver Carrito'}
          </button>

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
  );
}

function App() {
  const { user, logout } = useContext(AuthContext);

  // 2. Configuración inicial del SDK de PayPal con tu Client ID Sandbox
  const paypalOptions = {
    "client-id": "Aados7GNsODazp1MZqwSfu8gMuln9l8gjGwLgpXv32Ege5jjFKNJCNz0ky7GT1o_QsO_SJcf1UwQzqee",
    currency: "MXN", // Forzamos la moneda a Pesos Mexicanos para tu cafetería
    intent: "capture"
  };

  return (
    // 3. Envolvemos toda la aplicación con el proveedor de secuencias de comandos de PayPal
    <PayPalScriptProvider options={paypalOptions}>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">

          {/* Llamamos a nuestra Navbar Dinámica inyectándole los estados de autenticación */}
          <Navbar user={user} logout={logout} />

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

              {/* Rutas Privadas Protegidas */}
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
    </PayPalScriptProvider>
  );
}

export default App;