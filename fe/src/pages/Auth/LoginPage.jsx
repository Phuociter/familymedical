// src/pages/Auth/LoginPage.jsx
import React from 'react';
import LoginForm from '../../components/AuthComponent/LoginForm';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();

    const handleLoginSuccess = (token, role) => {
        localStorage.setItem('userToken', token);
        localStorage.setItem('userRole', role);
        
        // Chuyển hướng sau khi đăng nhập thành công
        if (role === 'BacSi') {
            navigate('/doctor/dashboard');
        } else if (role === 'ChuHo') {
            navigate('/family/dashboard');
        } else {
            navigate('/admin/dashboard');
        }
    };

    // LoginForm đã có đầy đủ layout Tailwind
    return (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
    );
};

export default LoginPage;