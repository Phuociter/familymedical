import React from 'react';
import usePasswordReset from '../../hooks/auth/usePasswordReset';
import FormField from '../../components/common/FormField';

const ForgotPasswordPage = () => {
    const {
        step,
        email,
        setEmail,
        code,
        setCode,
        loading,
        error,
        message,
        handleSendCode,
        handleValidateCode,
    } = usePasswordReset();

    return (
        <div className="min-h-screen flex items-center justify-center bg-bgColor py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-primary p-10 rounded-xl shadow-xl">
                {step === 'enterEmail' ? (
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-ascent-1">
                            Quên Mật Khẩu
                        </h2>
                        <form className="mt-8 space-y-4" onSubmit={handleSendCode}>
                            <FormField
                                label="Địa chỉ Email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Nhập email của bạn"
                                error={error}
                            />
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white ${loading ? 'bg-secondary cursor-not-allowed' : 'bg-blue hover:opacity-90'}`}
                                >
                                    {loading ? 'Đang gửi...' : 'Gửi Mã Xác Thực'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-ascent-1">
                            Nhập Mã Xác Thực
                        </h2>
                        <p className="mt-2 text-center text-sm text-ascent-2">
                            Một mã 4 số đã được gửi đến email <span className="font-medium">{email}</span>.
                        </p>
                        {message && <div className="p-3 mt-4 text-sm rounded-lg text-green-700 bg-green-100">{message}</div>}
                        <form className="mt-8 space-y-4" onSubmit={handleValidateCode}>
                            <FormField
                                label="Mã Xác Thực"
                                name="code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                placeholder="Nhập mã 4 số"
                                error={error}
                            />
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white ${loading ? 'bg-secondary cursor-not-allowed' : 'bg-blue hover:opacity-90'}`}
                                >
                                    {loading ? 'Đang xác thực...' : 'Xác Nhận'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
