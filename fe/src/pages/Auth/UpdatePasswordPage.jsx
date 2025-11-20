import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePasswordReset from '../../hooks/auth/usePasswordReset';
import FormField from '../../components/common/FormField';

const UpdatePasswordPage = () => {
    const {
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        loading,
        error,
        setError,
        message,
        token,
        handleResetPassword,
    } = usePasswordReset();
    
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setError("Không có quyền truy cập. Vui lòng thử lại từ đầu.");
            setTimeout(() => navigate('/forgot-password'), 3000);
        }
    }, [token, navigate, setError]);

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bgColor">
                <div className="max-w-md w-full text-center p-10">
                    <h2 className="text-2xl font-bold text-red-600">Lỗi Truy Cập</h2>
                    <p className="text-ascent-2 mt-2">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-bgColor py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-primary p-10 rounded-xl shadow-xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-ascent-1">
                        Tạo Mật Khẩu Mới
                    </h2>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handleResetPassword}>
                    {message && <div className="p-3 mb-4 text-sm rounded-lg text-green-700 bg-green-100">{message}</div>}
                    
                    <FormField
                        label="Mật khẩu mới"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Nhập mật khẩu mới"
                        error={error}
                    />
                    <FormField
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Nhập lại mật khẩu mới"
                        error={error}
                    />
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading || !!message}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white ${loading || !!message ? 'bg-secondary cursor-not-allowed' : 'bg-blue hover:opacity-90'}`}
                        >
                            {loading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdatePasswordPage;
