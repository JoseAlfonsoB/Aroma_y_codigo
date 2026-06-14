import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Link, useNavigate } from 'react-router-dom'; // 1. Importamos useNavigate

export const LoginForm = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate(); // 2. Inicializamos el hook de navegación interna
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

            // 3. ¡La magia de la SPA! Redirigimos al catálogo sin recargar la página
            navigate('/catalogo');
        } catch (err) {
            setError(err.message);
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

            <p className="text-center text-sm text-gray-600 mt-4">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-amber-800 font-bold hover:underline">
                    Regístrate aquí
                </Link>
            </p>

        </form>
    );
};