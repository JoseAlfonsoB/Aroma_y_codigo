// src/components/atoms/Button.jsx
export const Button = ({ children, onClick, type = "button", variant = "primary" }) => {
    const styles = variant === "primary"
        ? "bg-amber-800 text-white hover:bg-amber-900"
        : "bg-gray-200 text-gray-800 hover:bg-gray-300";

    return (
        <button
            type={type}
            onClick={onClick}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${styles}`}
        >
            {children}
        </button>
    );
};