// src/pages/Auth/RegisterDoctorPage.jsx
import React from 'react';
// Import component Form đã có Tailwind CSS
import RegisterDoctorForm from '../../components/AuthComponent/RegisterDoctorForm'; 
// Giả sử bạn đang dùng React Router
import { Link } from 'react-router-dom';

const RegisterDoctorPage = () => {
    /* Lưu ý: Component RegisterDoctorForm.jsx đã được thiết kế
       để bao bọc trong một container căn giữa màn hình (min-h-screen flex...)
       nên trang này không cần thêm layout phức tạp.
    */
       
    return (
        // Chỉ cần render Form component. 
        // Component Form đã chứa nút "Đã có tài khoản? Đăng nhập" ở cuối.
        <RegisterDoctorForm />
    );
};

export default RegisterDoctorPage;