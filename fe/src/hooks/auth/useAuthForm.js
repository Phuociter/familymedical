// src/hooks/useAuthForm.js
import { useState } from 'react';
import { ValidationError } from '../../api/authApi'; // Import a custom error

/**
 * Custom hook để quản lý logic cho các form xác thực (đăng ký, đăng nhập).
 * @param {object} initialState - Trạng thái ban đầu của form.
 * @param {function} apiCall - Hàm API để gọi khi submit form.
 * @param {function} onSuccess - Callback thực thi khi API gọi thành công.
 */
const useAuthForm = (initialState, apiCall, onSuccess) => {
    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({}); // Thay message/isError bằng errors object

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Xóa lỗi của trường đang nhập và lỗi chung
        if (errors[name] || errors.general) {
            const newErrors = { ...errors };
            delete newErrors[name];
            delete newErrors.general;
            setErrors(newErrors);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Kiểm tra mật khẩu xác nhận (nếu có)
        if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
            setErrors({ confirmPassword: "Mật khẩu xác nhận không khớp." });
            return;
        }

        setLoading(true);

        try {
            // Loại bỏ confirmPassword trước khi gửi đi
            const { confirmPassword, ...dataToSend } = formData;
            const result = await apiCall(dataToSend);

            if (result.success) {
                // Xử lý thành công, không có lỗi
                if (onSuccess) {
                    onSuccess(result);
                }
            } else {
                // Xử lý lỗi chung từ logic trả về của API (ít dùng sau khi đổi sang throw)
                setErrors({ general: result.message || 'Có lỗi xảy ra.' });
            }
        } catch (err) {
            if (err instanceof ValidationError) {
                // Bắt lỗi validation chi tiết từ backend
                setErrors(err.errors);
            } else {
                // Bắt các lỗi khác (lỗi mạng, lỗi server 500,...)
                setErrors({ general: err.message || "Đã xảy ra lỗi hệ thống. Vui lòng thử lại." });
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        loading,
        errors, // Trả về object errors
        handleChange,
        handleSubmit,
    };
};

export default useAuthForm;

