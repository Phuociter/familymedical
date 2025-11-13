// src/components/common/FormField.jsx
import React from 'react';

const FormField = ({ label, name, value, onChange, type = 'text', required = false, isTextArea = false, hint = '', placeholder = '', error = '' }) => {
    const hasError = !!error;

    const baseClasses = "block w-full px-3 py-2 border-2 rounded-lg shadow-sm bg-secondary text-ascent-1 placeholder-ascent-2 focus:outline-none sm:text-sm transition-all duration-200";
    const errorClasses = "border-red-500 focus:ring-red-500 focus:border-red-500"; // Assuming red exists from user feedback
    const normalClasses = "border-ascent-2 focus:ring-blue focus:border-blue";

    return (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-medium text-ascent-2">
                {label}{required && <span className="text-red-500"> *</span>}
            </label>
            <div className="mt-1 relative"> {/* Container cho input và tooltip */}
                {isTextArea ? (
                    <textarea
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                        required={required}
                        rows="3"
                        placeholder={placeholder || `Nhập ${label.toLowerCase()}...`}
                        className={`${baseClasses} ${hasError ? errorClasses : normalClasses}`}
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
                        className={`${baseClasses} ${hasError ? errorClasses : normalClasses}`}
                    />
                )}

                {/* Tooltip hiển thị lỗi */}
                {hasError && (
                    <div 
                        className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-10 w-max max-w-sm"
                        role="alert"
                    >
                        {/* Mũi tên (dùng kỹ thuật xoay div và inline style) */}
                        <div 
                            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white transform rotate-45"
                            style={{ borderTop: '1px solid #A0A0A0', borderLeft: '1px solid #A0A0A0' }}
                        ></div>
                        
                        {/* Thân tooltip */}
                        <div 
                            className="p-2 bg-white rounded-md shadow-lg flex items-center"
                            style={{ border: '1px solid #A0A0A0' }}
                        >
                            {/* Biểu tượng chấm than (dùng inline style) */}
                            <div 
                                className="flex-shrink-0 w-5 h-5 rounded-sm flex items-center justify-center"
                                style={{ backgroundColor: '#F97316' }} // Orange-500
                            >
                                <span className="text-white font-bold text-sm">!</span>
                            </div>
                            {/* Tin nhắn lỗi */}
                            <p 
                                className="text-sm ml-2"
                                style={{ color: '#333333' }}
                            >
                                {error}
                            </p>
                        </div>
                    </div>
                )}
            </div>
            {hint && !hasError && <p className="mt-1 text-xs text-ascent-2">{hint}</p>}
        </div>
    );
};

export default FormField;
