import React from 'react';
import { Link } from 'react-router-dom';
import authApi from '../../api/authApi';
import useAuthForm from '../../hooks/auth/useAuthForm';
import FormField from '../common/FormField';

const GOOGLE_AUTH_URL = 'http://localhost:8080/oauth2/authorization/google';
const FACEBOOK_AUTH_URL = 'http://localhost:8080/oauth2/authorization/facebook';

const LoginForm = ({ onLoginSuccess }) => {
    const {
        formData,
        loading,
        message,
        isError,
        handleChange,
        handleSubmit,
    } = useAuthForm({ email: '', password: '' }, authApi.login, onLoginSuccess);

    return (
        <div className="min-h-screen flex items-center justify-center bg-bgColor py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-primary p-10 rounded-xl shadow-xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-ascent-1">
                        Đăng nhập
                    </h2>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    {message && (
                        <div className={`p-3 mb-4 text-sm rounded-lg ${isError ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'}`} role="alert">
                            {message}
                        </div>
                    )}

                    <FormField
                        label="Địa chỉ Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Email"
                    />
                    <FormField
                        label="Mật khẩu"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Mật khẩu"
                    />

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white ${
                                loading
                                    ? 'bg-secondary cursor-not-allowed text-ascent-2'
                                    : 'bg-blue hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue'
                            }`}
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-ascent-2/30"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-primary text-ascent-2">
                                Hoặc đăng nhập bằng
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <div>
                            <a
                                href={GOOGLE_AUTH_URL}
                                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                                Google
                            </a>
                        </div>
                        <div>
                            <a
                                href={FACEBOOK_AUTH_URL}
                                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                                Facebook
                            </a>
                        </div>
                    </div>
                </div>

                <div className="text-center text-sm pt-4 border-t border-secondary mt-4">
                    <p className="font-medium text-ascent-2 mb-2">Chưa có tài khoản?</p>
                    <Link to="/register/family" className="font-medium text-blue hover:opacity-80 mr-4">
                        Đăng ký Hộ gia đình
                    </Link>
                    <span className="text-ascent-2">|</span>
                    <Link to="/register/doctor" className="font-medium text-blue hover:opacity-80 ml-4">
                        Đăng ký Bác sĩ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;