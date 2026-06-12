// src/App.jsx
import React, { useState } from 'react';
import { LoginForm } from './api/components/organisms/LoginForm.jsx';
import { RegisterForm } from './api/components/organisms/RegisterForm.jsx';

function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {isLogin ? (
        // Renderiza el Login y si le da clic a registrarse, cambia el estado
        <div className="w-full flex flex-col items-center">
          <LoginForm />
          <p className="text-sm text-gray-500 mt-4">
            ¿No tienes cuenta?{' '}
            <button onClick={() => setIsLogin(false)} className="text-amber-800 font-bold hover:underline">
              Regístrate aquí
            </button>
          </p>
        </div>
      ) : (
        // Renderiza el Registro y permite regresar al Login
        <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  );
}

export default App;