import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/AuthComponent/LoginForm';
import { loginSuccess } from '../../redux/userSlice';

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLoginSuccess = (result) => {
        // Dispatch action để lưu state vào Redux và localStorage
        dispatch(loginSuccess(result));
        console.log("LoginPage - Login successful:", result);

        // Chờ 1.5s để người dùng thấy thông báo rồi mới chuyển trang
        setTimeout(() => {
            const role = normalized.role;
            if (role === 'BacSi') {
                navigate('/doctor/dashboard');
            } else if (result.role === 'ChuHo') {
                navigate('/families');
            } else if (result.role === 'Admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        }, 1500);
    };

    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
};

export default LoginPage;