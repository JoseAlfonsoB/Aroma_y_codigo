import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';

export const LoginForm = () => {
    const { login } = useContext(AuthContext); // Extraemos la función mágica
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(formData.email, formData.password);
            alert("¡Bienvenido al sistema!");
            // Aquí podrías usar un hook de navegación como useNavigate de react-router-dom
        } catch (err) {
            setError(err.message); // El error que viene desde api.js
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Iniciar Sesión</h2>

            {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded text-center">{error}</p>}

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

            <Button type="submit">Entrar</Button>

            
        </form>
    );
};