// src/components/molecules/ProductCard.jsx
//import React from 'react';
import { CardButton } from '../atoms/CardButton';

export const ProductCard = ({ producto, onAgregarAlCarrito }) => {
    const { nombre, descripcion, precio, stock, categoria, imagen_url } = producto;

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col justify-between p-4 h-full hover:shadow-lg transition-shadow">
            <div>
                {/* Contenedor de Imagen Simulado/Real */}
                <div className="w-full h-40 bg-amber-50 rounded-lg flex items-center justify-center text-amber-900 mb-4 font-bold text-xs uppercase tracking-wider border border-amber-100">
                    {categoria}
                </div>

                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{nombre}</h3>
                    <span className="text-amber-800 font-extrabold text-lg">${precio}</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">{descripcion}</p>
            </div>

            <div>
                <div className="flex justify-between items-center mb-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {stock > 0 ? 'Disponible' : 'Sin Stock'}
                    </span>
                    <span className="text-gray-500">Stock: {stock} pzs</span>
                </div>

                <CardButton
                    onClick={() => onAgregarAlCarrito(producto)}
                    disabled={stock <= 0}
                />
            </div>
        </div>
    );
};