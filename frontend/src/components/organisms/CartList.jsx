// src/components/organisms/CartList.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { apiService } from '../../api/api'; // 1. Importamos tu servicio centralizado
import { Button } from '../atoms/Button';
// Importamos los botones inteligentes del SDK oficial de PayPal
import { PayPalButtons } from "@paypal/react-paypal-js";

export const CartList = () => {
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Función para obtener los productos del carrito usando tu apiService
    const fetchCart = async () => {
        try {
            // 2. Consumimos el endpoint 'carrito' pasando el usuario_id como parámetro
            const response = await apiService.get(`carrito?usuario_id=${user.id}`);

            // Evaluamos según la estructura nativa de tus respuestas de éxito
            if (response && response.status === 'success') {
                setCartItems(response.data || response.carrito || []);
            } else {
                setCartItems(response || []);
            }
        } catch (err) {
            setError('No se pudo conectar con el servidor para recuperar el carrito de compras.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchCart();
        }
    }, [user]);

    // Cálculo matemático del total de la orden
    const calcularTotal = () => {
        return cartItems.reduce((acc, item) => {
            const precio = parseFloat(item.precio) || 0;
            const cantidad = parseInt(item.cantidad) || 0;
            return acc + (precio * cantidad);
        }, 0).toFixed(2);
    };

    // Configuración y envío del total dinámico de la orden a la ventana de PayPal
    const createOrder = (data, actions) => {
        const total = calcularTotal();
        return actions.order.create({
            purchase_units: [
                {
                    description: "Compra de especialidades - Tienda Aroma & Código",
                    amount: {
                        currency_code: "MXN", // Forzamos que coincida con el proveedor de App.jsx
                        value: total, // Pasamos el string devuelto por toFixed(2)
                    },
                },
            ],
        });
    };

    // Callback activado automáticamente cuando el cliente autoriza el cargo de manera exitosa
    const onApprove = async (data, actions) => {
        try {
            // 1. Capturamos la orden en los servidores de PayPal
            const details = await actions.order.capture();
            const totalOrden = calcularTotal();

            // 2. Mapeamos tus cartItems al formato exacto que espera recibir tu backend en PHP
            // Tu archivo pagos.php necesita: producto_id, cantidad y precio
            const itemsFormateados = cartItems.map(item => ({
                producto_id: item.producto_id,
                cantidad: item.cantidad,
                precio: parseFloat(item.precio)
            }));

            // 3. Enviamos la petición POST a pagos.php con la estructura exacta que ya tienes escrita
            const response = await apiService.post('endpoints/pagos.php', {
                usuario_id: user.id,
                total: parseFloat(totalOrden),
                id_transaccion: details.id,
                items: itemsFormateados
            });

            // 4. Validamos la respuesta del backend basada en tu código existente
            if (response && response.status === 'success') {
                // Limpiamos el estado en React para vaciar la interfaz de inmediato
                setCartItems([]);

                alert(`¡Pedido #${response.pedido_id} procesado con éxito en Aroma & Código! Tu pago con ID de pasarela ${details.id} ha sido registrado.`);
            } else {
                alert(response?.message || 'El pago pasó en PayPal pero ocurrió un inconveniente en el servidor.');
            }

        } catch (err) {
            console.error("Error al procesar la captura en PayPal o sincronizar con MariaDB:", err);
            alert("No se pudo completar el procesamiento del pago.");
        }
    };

    if (loading) return <div className="text-center text-amber-900 font-bold p-8">Cargando tu carrito dev...</div>;
    if (error) return <div className="text-center text-red-500 p-8 bg-red-50 rounded-xl">{error}</div>;

    return (
        <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-xl border border-gray-100 my-6">
            <h2 className="text-3xl font-black text-amber-950 border-b pb-4 mb-6 tracking-wide">
                Tu Carrito de Compras
            </h2>

            {cartItems.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No hay productos en tu carrito. ¡Explora el menú y añade tu café favorito!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Lista de productos */}
                    <div className="md:col-span-2 space-y-4">
                        {cartItems.map((item, index) => (
                            <div key={item.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-800 text-lg">{item.nombre || `Producto #${item.producto_id}`}</span>
                                    <span className="text-sm text-gray-500 italic">ID Producto: {item.producto_id}</span>
                                    <span className="text-sm text-amber-900 font-medium mt-1">
                                        Precio unitario: ${parseFloat(item.precio || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <span className="block text-xs uppercase text-gray-400 font-bold">Cant.</span>
                                        <span className="font-mono text-lg font-bold text-gray-700 bg-white border px-3 py-1 rounded-md block mt-1">
                                            {item.cantidad}
                                        </span>
                                    </div>
                                    <div className="text-right min-w-[80px]">
                                        <span className="block text-xs uppercase text-gray-400 font-bold">Subtotal</span>
                                        <span className="font-mono text-lg font-black text-amber-950 block mt-1">
                                            ${(parseFloat(item.precio || 0) * parseInt(item.cantidad || 0)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Resumen de Compra */}
                    <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-5 flex flex-col justify-between h-fit space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-amber-950 mb-3 uppercase tracking-wider border-b border-amber-200 pb-2">
                                Resumen del Pedido
                            </h3>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600">Productos únicos:</span>
                                <span className="font-mono font-bold text-gray-800">{cartItems.length}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-dashed border-amber-300 pt-3 mt-3">
                                <span className="text-xl font-bold text-amber-950">Total:</span>
                                <span className="text-2xl font-black font-mono text-amber-900">${calcularTotal()}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-3 bg-white rounded-lg border border-amber-200 text-center text-xs text-amber-800 italic">
                                🔒 Conexión segura lista para procesar pago.
                            </div>

                            {/* Inyección de los Botones Dinámicos de PayPal en sustitución del botón estático */}
                            <div className="z-0 relative">
                                <PayPalButtons
                                    style={{
                                        layout: "vertical",
                                        color: "gold",
                                        shape: "rect",
                                        label: "pay"
                                    }}
                                    createOrder={createOrder}
                                    onApprove={onApprove}
                                    onError={(err) => {
                                        console.error("Error directo del SDK de PayPal:", err);
                                        alert("La pasarela detectó un error al inicializar el pago.");
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};