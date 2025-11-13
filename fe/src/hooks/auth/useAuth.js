// src/hooks/useAuth.js
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess, logout as logoutAction } from '../../redux/userSlice';

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, token, role } = useSelector((state) => state.user);

    const login = useCallback((authResult) => {
        dispatch(loginSuccess(authResult));

        // Chuyển hướng dựa trên vai trò
        if (authResult.role === 'BacSi') {
            navigate('/doctor/dashboard');
        } else if (authResult.role === 'ChuHo') {
            navigate('/families');
        } else if (authResult.role === 'Admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/'); // Trang mặc định nếu không có vai trò
        }
    }, [dispatch, navigate]);

    const logout = useCallback(() => {
        dispatch(logoutAction());
        navigate('/login');
    }, [dispatch, navigate]);

    return {
        user,
        token,
        role,
        isAuthenticated: !!token, // Trả về true nếu có token
        login,
        logout,
    };
};
