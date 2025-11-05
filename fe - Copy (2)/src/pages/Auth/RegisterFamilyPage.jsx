// src/pages/Auth/RegisterFamilyPage.jsx
import React from 'react';
// Import component Form đã có Tailwind CSS
import RegisterFamilyForm from '../../components/AuthComponent/RegisterFamilyForm'; 
// Giả sử bạn đang dùng React Router
import { Link } from 'react-router-dom';

const RegisterFamilyPage = () => {
    /* Lưu ý: Component RegisterFamilyForm.jsx đã được thiết kế
       để bao bọc trong một container căn giữa màn hình (min-h-screen flex...)
       nên trang này không cần thêm layout phức tạp.
    */
    
    return (
        // Chỉ cần render Form component. 
        // Component Form đã chứa nút "Đã có tài khoản? Đăng nhập" ở cuối.
        <RegisterFamilyForm />
    );
};

export default RegisterFamilyPage;