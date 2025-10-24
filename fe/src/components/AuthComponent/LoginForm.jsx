// src/components/Auth/LoginForm.jsx (Cập nhật với Tailwind CSS)
import React, { useState } from 'react';
import authApi from '../../api/authApi';
import { Link } from 'react-router-dom';

const LoginForm = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.email || !formData.password) {
            setError("Vui lòng nhập đầy đủ Email và Mật khẩu.");
            setLoading(false);
            return;
        }

        try {
            const result = await authApi.login(formData);
            if (result.success) {
                alert(`Đăng nhập thành công! Vai trò: ${result.role}`);
                onLoginSuccess(result.token, result.role);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("Đã xảy ra lỗi trong quá trình đăng nhập.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Đăng nhập
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="rounded-md shadow-sm -space-y-px">
                        {/* Trường Email */}
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Địa chỉ Email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        {/* Trường Mật khẩu */}
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mt-3"
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                                loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                            }`}
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </div>
                </form>
                
                <div className="text-center text-sm">
                    <p className="font-medium text-gray-600">Chưa có tài khoản?</p>
                    <Link to="/register/family" className="font-medium text-indigo-600 hover:text-indigo-500 mr-4">
                        Đăng ký Hộ gia đình
                    </Link>
                    <span className="text-gray-400">|</span>
                    <Link to="/register/doctor" className="font-medium text-indigo-600 hover:text-indigo-500 ml-4">
                        Đăng ký Bác sĩ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;