import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import useAuthForm from '../../hooks/auth/useAuthForm';
import FormField from '../common/FormField';

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

const RegisterFamilyForm = () => {
    const navigate = useNavigate();

    const handleSuccess = (result) => {
        setTimeout(() => {
            navigate('/login', { state: { registeredEmail: result.user.email } });
        }, 1500);
    };

    const {
        formData,
        loading,
        errors,
        handleChange,
        handleSubmit,
    } = useAuthForm(initialFamilyState, authApi.registerFamily, handleSuccess);

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-bgColor">
            <div className="max-w-4xl w-full p-10 rounded-xl shadow-lg bg-primary">
                <h2 className="text-center text-3xl font-extrabold text-ascent-1 mb-8">
                    Đăng ký Hộ gia đình (Chủ hộ)
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {errors.general && (
                        <div className="p-3 text-sm rounded-lg text-red-700 bg-red-100" role="alert">
                            {errors.general}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-xl font-semibold text-ascent-1 mb-4 border-b border-secondary pb-2">Thông tin Chủ hộ</h3>
                            <FormField label="Họ và Tên" name="fullName" value={formData.fullName} onChange={handleChange} required error={errors.fullName} />
                            <FormField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" required error={errors.email} />
                            <FormField label="Mật khẩu" name="password" value={formData.password} onChange={handleChange} type="password" required error={errors.password} />
                            <FormField label="Nhập lại Mật khẩu" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" required error={errors.confirmPassword} />
                            <FormField label="CCCD/CMND" name="cccd" value={formData.cccd} onChange={handleChange} error={errors.cccd} />
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-ascent-1 mb-4 border-b border-secondary pb-2">Thông tin Hộ gia đình</h3>
                            <FormField label="Tên Gia đình" name="familyName" value={formData.familyName} onChange={handleChange} required hint="Ví dụ: Gia đình Nguyễn Văn A" error={errors.familyName} />
                            <FormField label="Số điện thoại" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required error={errors.phoneNumber} />
                            <FormField label="Địa chỉ" name="address" value={formData.address} onChange={handleChange} required isTextArea error={errors.address} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                            loading
                                ? 'bg-secondary cursor-not-allowed text-ascent-2'
                                : 'bg-blue hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue'
                        }`}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng ký Hộ gia đình'}
                    </button>
                </form>

                <div className="text-center text-sm mt-6">
                    <p className="text-ascent-2">
                        Đã có tài khoản?
                        <Link to="/login" className="font-medium text-blue hover:opacity-80 ml-1">Đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterFamilyForm;