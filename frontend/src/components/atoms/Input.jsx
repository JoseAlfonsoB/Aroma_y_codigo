// src/components/atoms/Input.jsx
export const Input = ({ type, placeholder, name, value, onChange, required = true }) => (
    <input
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700 transition-all"
    />
);