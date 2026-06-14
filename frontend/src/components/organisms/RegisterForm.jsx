// src/components/organisms/RegisterForm.jsx
import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Link } from 'react-router-dom';

export const RegisterForm = ({ onSwitchToLogin }) => {
    const { registro } = useContext(AuthContext);
    const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await registro(formData.nombre, formData.email, formData.password);
            if (response.status === 'success') {
                setSuccess('¡Usuario registrado con éxito! Redirigiendo...');
                setFormData({ nombre: '', email: '', password: '' });
                // Esperamos 2 segundos para que el usuario vea el éxito y cambiamos a la pantalla de login
                setTimeout(() => {
                    onSwitchToLogin();
                }, 2000);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Crear Cuenta</h2>

            {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded text-center">{error}</p>}
            {success && <p className="text-green-600 text-sm bg-green-100 p-2 rounded text-center">{success}</p>}

            <Input
                type="text"
                name="nombre"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={handleChange}
            />
            <Input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
            />
            <Input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
            />

            <Button type="submit">Registrarse</Button>

            <p className="text-center text-sm text-gray-600 mt-4">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-amber-800 font-bold hover:underline">
                    Inicia sesión aquí
                </Link>
            </p>
        </form>
    );
};