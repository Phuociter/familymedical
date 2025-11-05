import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import useAuthForm from '../../hooks/auth/useAuthForm';
import FormField from '../common/FormField';

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

const RegisterDoctorForm = () => {
    const navigate = useNavigate();

    const handleSuccess = (result) => {
        setTimeout(() => {
            navigate('/login', { state: { registeredEmail: result.user.email } });
        }, 1500);
    };

    const {
        formData,
        loading,
        message,
        isError,
        handleChange,
        handleSubmit,
    } = useAuthForm(initialDoctorState, authApi.registerDoctor, handleSuccess);

    return (
        <div className="min-h-screen flex items-center justify-center bg-bgColor py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-primary p-10 rounded-xl shadow-xl">
                <h2 className="text-center text-3xl font-extrabold text-ascent-1 mb-8">
                    Đăng ký Bác sĩ
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {message && (
                        <div className={`p-3 text-sm rounded-lg ${isError ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'}`} role="alert">
                            {message}
                        </div>
                    )}

                    <FormField label="Mã Bác sĩ" name="doctorCode" value={formData.doctorCode} onChange={handleChange} required hint="Mã đăng ký cấp bởi cơ quan y tế" />
                    <FormField label="Họ và Tên" name="fullName" value={formData.fullName} onChange={handleChange} required />
                    <FormField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" required />
                    <FormField label="Mật khẩu" name="password" value={formData.password} onChange={handleChange} type="password" required />
                    <FormField label="Nhập lại Mật khẩu" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" required />
                    <FormField label="Số điện thoại" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                    <FormField label="Địa chỉ" name="address" value={formData.address} onChange={handleChange} isTextArea />
                    <FormField label="CCCD/CMND" name="cccd" value={formData.cccd} onChange={handleChange} />

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white ${
                            loading
                                ? 'bg-secondary cursor-not-allowed text-ascent-2'
                                : 'bg-blue hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue'
                        }`}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng ký Bác sĩ'}
                    </button>
                </form>
                <div className="text-center text-sm pt-4 border-t border-secondary mt-4">
                    <p className="font-medium text-ascent-2 mb-2">
                        Đã có tài khoản?
                        <Link to="/login" className="font-medium text-blue hover:opacity-80 ml-1">Đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterDoctorForm;
