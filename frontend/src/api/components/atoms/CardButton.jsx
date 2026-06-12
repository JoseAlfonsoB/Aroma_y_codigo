// src/components/atoms/CardButton.jsx
import React from 'react';

export const CardButton = ({ onClick, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full py-2 px-4 rounded-md font-semibold text-sm transition-colors ${disabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-800 text-white hover:bg-amber-900'
                }`}
        >
            {disabled ? 'Agotado' : 'Agregar al Carrito'}
        </button>
    );
};