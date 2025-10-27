// src/components/common/FormField.jsx
import React from 'react';

const FormField = ({ label, name, value, onChange, type = 'text', required = false, isTextArea = false, hint = '', placeholder = '' }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-ascent-2">
            {label}{required && <span className="text-red-500"> *</span>}
        </label>
        {isTextArea ? (
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                rows="3"
                placeholder={placeholder || `Nhập ${label.toLowerCase()}...`}
                className="mt-1 block w-full px-3 py-2 border-2 border-ascent-2 rounded-lg shadow-sm bg-secondary text-ascent-1 placeholder-ascent-2 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm transition-all duration-200"
            />
        ) : (
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder || `Nhập ${label.toLowerCase()}...`}
                className="mt-1 block w-full px-3 py-2 border-2 border-ascent-2 rounded-lg shadow-sm bg-secondary text-ascent-1 placeholder-ascent-2 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm transition-all duration-200"
            />
        )}
        {hint && <p className="mt-1 text-xs text-ascent-2">{hint}</p>}
    </div>
);

export default FormField;
