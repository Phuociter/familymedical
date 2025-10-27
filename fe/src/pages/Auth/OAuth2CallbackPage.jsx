import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuth';

const OAuth2CallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const role = searchParams.get('role');
        const userDetails = {
            // Giả sử backend trả về các thông tin này qua URL
            // Nếu không, bạn cần điều chỉnh để lấy từ API sau khi có token
            fullName: searchParams.get('fullName') || 'Người dùng',
            email: searchParams.get('email'),
            // Thêm các trường khác nếu có
        };

        if (token && role) {
            // Gọi hàm login từ useAuth để xử lý tất cả logic
            login({ token, role, userDetails });
        } else {
            // Xử lý lỗi hoặc thiếu thông tin
            console.error("OAuth2 callback error: Missing token or role.");
            // Có thể hiển thị thông báo lỗi cho người dùng
            navigate('/login', { state: { error: 'Lỗi xác thực qua mạng xã hội.' } });
        }
    }, [searchParams, navigate, login]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-bgColor">
            <div className="text-ascent-1 text-xl">
                Đang xử lý đăng nhập...
            </div>
        </div>
    );
};

export default OAuth2CallbackPage;
