// src/components/Auth/RegisterDoctorForm.jsx (Cập nhật với Tailwind CSS)
import React, { useState } from 'react';
import authApi from '../../api/authApi';
import { Link } from 'react-router-dom';

const initialDoctorState = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    doctorCode: '',
    phoneNumber: '',
    address: '',
    cccd: '',
};

// Component Field tái sử dụng (có thể copy từ file trên hoặc tạo 1 file chung)
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

const RegisterDoctorForm = () => {
    const [formData, setFormData] = useState(initialDoctorState);
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
            const result = await authApi.registerDoctor(dataToSend);
            if (result.success) {
                setMessage(result.message);
                setFormData(initialDoctorState);
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
            <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-lg">
                <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
                    Đăng ký Bác sĩ
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {message && (
                        <div className={`p-3 text-sm rounded-lg ${isError ? 'text-red-800 bg-red-50' : 'text-green-800 bg-green-50'}`} role="alert">
                            {message}
                        </div>
                    )}

                    <Field label="Mã Bác sĩ" name="doctorCode" value={formData.doctorCode} onChange={handleChange} required hint="Mã đăng ký cấp bởi cơ quan y tế" />
                    <Field label="Họ và Tên" name="fullName" value={formData.fullName} onChange={handleChange} required />
                    <Field label="Email" name="email" value={formData.email} onChange={handleChange} type="email" required />
                    <Field label="Mật khẩu" name="password" value={formData.password} onChange={handleChange} type="password" required />
                    <Field label="Nhập lại Mật khẩu" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" required />
                    <Field label="Số điện thoại" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                    <Field label="Địa chỉ" name="address" value={formData.address} onChange={handleChange} isTextArea />
                    <Field label="CCCD/CMND" name="cccd" value={formData.cccd} onChange={handleChange} />
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                            loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng ký Bác sĩ'}
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

export default RegisterDoctorForm;