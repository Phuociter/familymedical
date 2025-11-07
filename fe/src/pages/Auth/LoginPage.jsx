import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/AuthComponent/LoginForm';
import { loginSuccess } from '../../redux/userSlice';

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLoginSuccess = (result) => {
        // Chuẩn hóa dữ liệu theo userSlice: { token, role, userDetails }
        const normalized = {
            token: result.token,
            role: result.role || result.user?.role || null,
            userDetails: result.user || result.userDetails || null,
        };

        // Lưu state vào Redux và localStorage
        dispatch(loginSuccess(normalized));

        // Chờ 1.5s để người dùng thấy thông báo rồi mới chuyển trang
        setTimeout(() => {
            const role = normalized.role;
            if (role === 'BacSi') {
                navigate('/doctor/dashboard');
            } else if (role === 'ChuHo') {
                navigate('/family/dashboard');
            } else if (role === 'Admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        }, 1500);
    };

    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
};

export default LoginPage;