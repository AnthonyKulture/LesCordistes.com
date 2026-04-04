import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="w-full" suppressHydrationWarning>
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-slate-700 mb-2"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};
