// src/App.jsx
import React from 'react';
import { ProductGrid } from './api/components/organisms/ProductGrid.jsx';
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Falso para simular el entorno */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-black text-amber-900 tracking-wider">AROMA & CÓDIGO</h1>
        <span className="text-sm bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-medium">Sesión Activa</span>
      </header>

      <main className="p-4">
        <ProductGrid />
      </main>
    </div>
  );
}

export default App;