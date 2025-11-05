import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import { useAuth } from '../../hooks/auth/useAuth';
import useAuthForm from '../../hooks/auth/useAuthForm';
import FormField from '../../components/common/FormField';

const OAuth2CompleteProfilePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const role = searchParams.get('role');

    // API call wrapper to include the token
    const completeProfileApiCall = (data) => {
        return authApi.completeOAuth2Profile(data, token);
    };

    const handleSuccess = (result) => {
        // On success, use the login function from useAuth
        login({ token, role, userDetails: result.user });
    };

    const {
        formData,
        loading,
        message,
        isError,
        handleChange,
        handleSubmit,
    } = useAuthForm(
        { familyName: '', phoneNumber: '', address: '' },
        completeProfileApiCall,
        handleSuccess
    );

    useEffect(() => {
        if (!token || !role || !email) {
            navigate('/login', { state: { error: 'Thông tin không đầy đủ để hoàn tất hồ sơ.' } });
        }
    }, [token, role, email, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-bgColor py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-primary p-10 rounded-xl shadow-xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-ascent-1">
                        Hoàn tất Hồ sơ Gia đình
                    </h2>
                    <p className="mt-2 text-center text-sm text-ascent-2">
                        Chào mừng {email}! Vui lòng cung cấp thêm thông tin.
                    </p>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    {message && (
                        <div className={`p-3 mb-4 text-sm rounded-lg ${isError ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'}`} role="alert">
                            {message}
                        </div>
                    )}

                    <FormField
                        label="Tên Gia đình"
                        name="familyName"
                        value={formData.familyName}
                        onChange={handleChange}
                        required
                    />
                    <FormField
                        label="Số điện thoại"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Số điện thoại (Tùy chọn)"
                    />
                    <FormField
                        label="Địa chỉ"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        isTextArea
                        placeholder="Địa chỉ (Tùy chọn)"
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
                            {loading ? 'Đang lưu...' : 'Hoàn tất Đăng ký'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OAuth2CompleteProfilePage;
