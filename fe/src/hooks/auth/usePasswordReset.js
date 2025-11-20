import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';

const usePasswordReset = () => {
    const [step, setStep] = useState('enterEmail'); // 'enterEmail', 'enterCode'
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    
    const navigate = useNavigate();
    const location = useLocation();
    const token = location.state?.token;

    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const result = await authApi.forgotPassword(email);
            if (result.success) {
                setMessage(result.message);
                setStep('enterCode');
            } else {
                setError(result.message || 'Đã có lỗi xảy ra.');
            }
        } catch (err) {
            setError(err.message || 'Lỗi kết nối đến server.');
        } finally {
            setLoading(false);
        }
    };

    const handleValidateCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!/^\d{4}$/.test(code)) {
            setError("Mã xác nhận phải là 4 chữ số.");
            setLoading(false);
            return;
        }

        try {
            const result = await authApi.validateResetCode(email, code);
            if (result.success && result.token) {
                navigate('/update-password', { state: { token: result.token } });
            } else {
                setError(result.message || 'Mã xác thực không hợp lệ.');
            }
        } catch (err) {
            setError(err.message || 'Mã xác thực không đúng hoặc đã hết hạn.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Mật khẩu không khớp.");
            return;
        }
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const result = await authApi.resetMyPassword(token, password);
            if (result.success) {
                setMessage(result.message + " Bạn sẽ được chuyển đến trang đăng nhập.");
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(result.message || 'Đã có lỗi xảy ra.');
            }
        } catch (err) {
            setError(err.message || 'Token không hợp lệ hoặc đã hết hạn.');
        } finally {
            setLoading(false);
        }
    };

    return {
        step,
        email,
        setEmail,
        code,
        setCode,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        loading,
        error,
        setError,
        message,
        token,
        handleSendCode,
        handleValidateCode,
        handleResetPassword,
    };
};

export default usePasswordReset;
