// src/hooks/useAuthForm.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook để quản lý logic cho các form xác thực (đăng ký, đăng nhập).
 * @param {object} initialState - Trạng thái ban đầu của form.
 * @param {function} apiCall - Hàm API để gọi khi submit form.
 * @param {function} onSuccess - Callback thực thi khi API gọi thành công.
 */
const useAuthForm = (initialState, apiCall, onSuccess) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Xóa message khi người dùng bắt đầu nhập lại
        if (message) {
            setMessage('');
            setIsError(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra mật khẩu xác nhận (nếu có)
        if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
            setMessage("Mật khẩu xác nhận không khớp.");
            setIsError(true);
            return;
        }

        setLoading(true);
        setMessage('');
        setIsError(false);

        try {
            // Loại bỏ confirmPassword trước khi gửi đi
            const { confirmPassword, ...dataToSend } = formData;
            const result = await apiCall(dataToSend);

            if (result.success) {
                setMessage(result.message || 'Hành động thành công!');
                setIsError(false);
                // Thực thi callback khi thành công
                if (onSuccess) {
                    onSuccess(result);
                }
            } else {
                setMessage(result.message || 'Có lỗi xảy ra.');
                setIsError(true);
            }
        } catch (err) {
            setMessage(err.message || "Đã xảy ra lỗi hệ thống. Vui lòng thử lại.");
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        loading,
        message,
        isError,
        handleChange,
        handleSubmit,
    };
};

export default useAuthForm;
