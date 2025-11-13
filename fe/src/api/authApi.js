import axios from 'axios';

const GRAPHQL_ENDPOINT = 'http://localhost:8080/graphql';
import userSlice from '../redux/userSlice';
import { useSelector } from "react-redux";

// Custom Error để chứa các lỗi validation chi tiết
export class ValidationError extends Error {
    constructor(errors) {
        super("Validation failed");
        this.name = "ValidationError";
        this.errors = errors; // Đây là object dạng { field: 'message' }
    }
}


const authApi = {
    
    /**
     * Hàm chung để gửi yêu cầu GraphQL (có xử lý lỗi Server)
     */
    sendGraphQLRequest: async (query, variables = {}, token = null) => {
        try {
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await axios.post(GRAPHQL_ENDPOINT, 
                {
                    query,
                    variables,
                }, 
                { headers }
            );

            if (response.data.errors) {
                const gqlError = response.data.errors[0];

                // Ưu tiên tìm lỗi validation chi tiết
                if (gqlError.extensions && gqlError.extensions.validationErrors) {
                    throw new ValidationError(gqlError.extensions.validationErrors);
                }

                // Nếu không có, dùng message chung
                const errorMessage = gqlError.message || "Lỗi GraphQL từ Server.";
                throw new Error(errorMessage);
            }

            return response.data.data;
        } catch (error) {
            // Ném lại lỗi ValidationError nếu nó đã được tạo
            if (error instanceof ValidationError) {
                throw error;
            }
            if (error instanceof ValidationError) {
                console.log("Validation errors:", error.errors);
            }

            // Xử lý lỗi network hoặc lỗi GraphQL được trả về trong một response thất bại (status 4xx, 5xx)
            if (error.response?.data?.errors) {
                const gqlError = error.response.data.errors[0];
                 // Ưu tiên tìm lỗi validation chi tiết
                if (gqlError.extensions && gqlError.extensions.validationErrors) {
                    throw new ValidationError(gqlError.extensions.validationErrors);
                }
                const errorMessage = gqlError.message || "Lỗi GraphQL từ Server.";
                throw new Error(errorMessage);
            }

            
            // Ném lại các lỗi khác
            throw error;
        }
    },

    /**
     * 1. Đăng nhập (Login) - Đã sửa để dùng $input
     */
    login: async (credentials) => {
        const LOGIN_MUTATION = `
            mutation Login($email: String!, $password: String!) {
                login(input: {email: $email, password: $password}) {
                    token
                    user {
                        userID
                        email
                        avatarUrl
                        fullName
                        role
                        phoneNumber
                        address
                        cccd
                        doctorCode
                    }
                }
            }
        `; 

        const data = await authApi.sendGraphQLRequest(LOGIN_MUTATION, credentials);

        const token = data?.login?.token;
        const user = data?.login?.user;

        if (token && user) {
            return { success: true, token, role: user.role, userDetails: user };
        } else {
            return { success: false, message: "Email hoặc mật khẩu không đúng." };
        }
    },

    /**
     * 2. Đăng ký Hộ gia đình
     */
    registerFamily: async (data) => {
        const REGISTER_FAMILY_MUTATION = `
            mutation RegisterFamily($input: FamilyRegisterInput!) {
                registerFamily(input: $input) {
                    userID
                    email
                    fullName
                    role
                    phoneNumber
                    address
                    cccd
                }
            }
        `; 

        const { confirmPassword, ...inputData } = data; 
        
        // Gói dữ liệu vào biến $input
        const variables = { 
            input: { 
                ...inputData, 
            } 
        };

        const result = await authApi.sendGraphQLRequest(REGISTER_FAMILY_MUTATION, variables);

        if (result?.registerFamily?.userID) {
            return { success: true, message: "Đăng ký hộ gia đình thành công! Bạn có thể đăng nhập ngay.", user: result.registerFamily };
        } else {
            return { success: false, message: "Đăng ký thất bại. Email có thể đã tồn tại." };
        }
    },

    /**
     * 3. Đăng ký Bác sĩ
     */
    registerDoctor: async (data) => {
        const REGISTER_DOCTOR_MUTATION = `
            mutation RegisterDoctor($input: DoctorRegisterInput!) {
                registerDoctor(input: $input) {
                    userID
                    email
                    fullName
                    role
                    phoneNumber
                    address
                    cccd
                    doctorCode
                }
            }
        `;

        const { confirmPassword, ...inputData } = data;

        const variables = {
            input: {
                ...inputData,
            }
        };

        const result = await authApi.sendGraphQLRequest(REGISTER_DOCTOR_MUTATION, variables);

        if (result?.registerDoctor?.userID) {
            return { success: true, message: "Đăng ký bác sĩ thành công! Vui lòng chờ admin duyệt.", user: result.registerDoctor };
        } else {
             return { success: false, message: "Đăng ký thất bại. Mã Bác sĩ hoặc Email có thể đã tồn tại." };
        }
    },

    /**
     * 4. Hoàn tất hồ sơ sau khi đăng nhập bằng OAuth2
     */
    completeOAuth2Profile: async (data, token) => {
        const COMPLETE_PROFILE_MUTATION = `
            mutation CompleteOAuth2Profile($input: CompleteProfileInput!) {
                completeOAuth2Profile(input: $input) {
                    userID
                    fullName
                    email
                    role
                }
            }
        `;

        const variables = { input: data };

        const result = await authApi.sendGraphQLRequest(COMPLETE_PROFILE_MUTATION, variables, token);

        if (result?.completeOAuth2Profile?.userID) {
            return { success: true, message: "Hoàn tất hồ sơ thành công!", user: result.completeOAuth2Profile };
        } else {
            return { success: false, message: "Hoàn tất hồ sơ thất bại." };
        }
    },

    updateUserProfile: async (userID, data, token) => {
        // Lọc ra chỉ những field hợp lệ
        const { fullName, phoneNumber, cccd, address, avatarUrl } = data;
        const input = { fullName, phoneNumber, cccd, address, avatarUrl };
        console.log("updateUserProfile - input:", input);

        const UPDATE_USER_MUTATION = `
            mutation UpdateUserProfile($userID: ID!, $input: UpdateUserInput!) {
                updateUserProfile(userID: $userID, input: $input) {
                    userID
                    fullName
                    phoneNumber
                    avatarUrl
                    address
                }
            }
        `;

        const variables = { userID, input };

        const result = await authApi.sendGraphQLRequest(UPDATE_USER_MUTATION, variables, token);

        if (result?.updateUserProfile?.userID) {
            return { success: true, message: "Cập nhật thông tin thành công!", user: result.updateUserProfile };
        } else {
            return { success: false, message: "Cập nhật thất bại." };
        }
    },
    uploadAvatarToCloudinary: async (file) => {
        try {
            const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", uploadPreset);

            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error(`Upload failed with status ${response.status}`);

            const data = await response.json();
            return data.secure_url;
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            throw err;
        }
    },
     handleUpdateProfile: async function(userID, data, file){
        const token = localStorage.getItem('userToken');
        // Nếu có avatar, upload trước
        if (file) {
            const avatarUrl = await this.uploadAvatarToCloudinary(file);
            data.avatarUrl = avatarUrl;
        }

        // Gọi mutation update thông tin
        return await this.updateUserProfile(userID, data, token);
    }

};

export default authApi;