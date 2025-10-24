// src/components/Auth/RegisterFamilyForm.jsx (Cập nhật với Tailwind CSS)
import React, { useState } from 'react';
import authApi from '../../api/authApi';
import { Link } from 'react-router-dom';

const initialFamilyState = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    familyName: '',
    phoneNumber: '',
    address: '',
    cccd: '',
};

// Component Field tái sử dụng
const Field = ({ label, name, value, onChange, type = 'text', required = false, isTextArea = false, hint = '' }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        ) : (
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        )}
        {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
);

const RegisterFamilyForm = () => {
    const [formData, setFormData] = useState(initialFamilyState);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMessage('');
        setIsError(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            setMessage("Mật khẩu xác nhận không khớp.");
            setIsError(true);
            return;
        }

        setLoading(true);
        setMessage('');
        setIsError(false);
        
        const { confirmPassword, ...dataToSend } = formData;
        
        try {
            const result = await authApi.registerFamily(dataToSend);
            if (result.success) {
                setMessage(result.message + " Bạn có thể đăng nhập ngay.");
                setFormData(initialFamilyState);
            } else {
                setMessage(result.message);
                setIsError(true);
            }
        } catch (err) {
            setMessage("Đã xảy ra lỗi hệ thống khi đăng ký.");
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full bg-white p-10 rounded-xl shadow-lg">
                <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
                    Đăng ký Hộ gia đình (Chủ hộ)
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {message && (
                        <div className={`p-3 text-sm rounded-lg ${isError ? 'text-red-800 bg-red-50' : 'text-green-800 bg-green-50'}`} role="alert">
                            {message}
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Cột 1: Thông tin Chủ hộ */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Thông tin Chủ hộ</h3>
                            <Field label="Họ và Tên" name="fullName" value={formData.fullName} onChange={handleChange} required />
                            <Field label="Email" name="email" value={formData.email} onChange={handleChange} type="email" required />
                            <Field label="Mật khẩu" name="password" value={formData.password} onChange={handleChange} type="password" required />
                            <Field label="Nhập lại Mật khẩu" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" required />
                            <Field label="CCCD/CMND" name="cccd" value={formData.cccd} onChange={handleChange} />
                        </div>
                        
                        {/* Cột 2: Thông tin gia đình */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Thông tin Hộ gia đình</h3>
                            <Field label="Tên Gia đình" name="familyName" value={formData.familyName} onChange={handleChange} required hint="Ví dụ: Gia đình Nguyễn Văn A" />
                            <Field label="Số điện thoại" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                            <Field label="Địa chỉ" name="address" value={formData.address} onChange={handleChange} required isTextArea />
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                            loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                        }`}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng ký Hộ gia đình'}
                    </button>
                </form>

                <div className="text-center text-sm mt-6">
                    <p className="text-gray-600">Đã có tài khoản? 
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">Đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterFamilyForm;