// src/components/organisms/ProductGrid.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { apiService } from '../../api/api';
import { ProductCard } from '../molecules/ProductCard';

export const ProductGrid = () => {
    const [productos, setProductos] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const { agregarAlCarrito } = useContext(AuthContext);

    useEffect(() => {
        const cargarProductos = async () => {
            try {
                const response = await apiService.get('productos');
                if (response.status === 'success') {
                    setProductos(response.data);
                }
            } catch (err) {
                setError('No se pudo conectar con el catálogo de productos.',err);
            } finally {
                setLoading(false);
            }
        };

        cargarProductos();
    }, []);

    const handleAgregarCarrito = async (producto) => {
        try {
            const response = await agregarAlCarrito(producto.id, 1);
            if (response.status === 'success') {
                alert(`¡"${producto.nombre}" se ha guardado en tu carrito en la Base de Datos!`);
            }
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <p className="text-center text-gray-600 py-10">Cargando exquisito café...</p>;
    if (error) return <p className="text-center text-red-500 py-10 bg-red-50 rounded-lg">{error}</p>;

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">Nuestro Menú Dev</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {productos.map((producto) => (
                    <ProductCard
                        key={producto.id}
                        producto={producto}
                        onAgregarAlCarrito={handleAgregarCarrito}
                    />
                ))}
            </div>
        </div>
    );
};