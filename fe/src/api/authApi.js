// src/api/authApi.js (Cập nhật cho Spring/GraphQL)
import axios from 'axios';

// Thay đổi URL này thành GraphQL Endpoint của Spring Boot của bạn
const GRAPHQL_ENDPOINT = 'http://localhost:8080/graphql';

const authApi = {
    // Hàm chung để gửi yêu cầu GraphQL
    sendGraphQLRequest: async (query, variables = {}) => {
        try {
            const response = await axios.post(GRAPHQL_ENDPOINT, {
                query,
                variables,
            });

            // Xử lý lỗi từ server (nếu có)
            if (response.data.errors) {
                console.error("GraphQL Errors:", response.data.errors);
                // Trả về lỗi đầu tiên hoặc thông báo chung
                throw new Error(response.data.errors[0].message || "Lỗi GraphQL từ Server.");
            }

            return response.data.data;
        } catch (error) {
            console.error("API Call Error:", error);
            // Xử lý lỗi mạng hoặc lỗi không xác định
            throw new Error(error.message || "Không thể kết nối đến server.");
        }
    },

    // 1. Đăng nhập (Login)
    login: async (credentials) => {
        const LOGIN_MUTATION = `
            mutation Login($email: String!, $password: String!) {
                login(email: $email, password: $password) {
                    token
                    user {
                        role
                    }
                }
            }
        `;
        
        const data = await authApi.sendGraphQLRequest(LOGIN_MUTATION, credentials);

        const token = data?.login?.token;
        const role = data?.login?.user?.role;
        
        if (token && role) {
            return { success: true, token, role };
        } else {
            // Trường hợp logic đăng nhập thất bại (có thể do lỗi từ server, hoặc trả về null/undefined)
            return { success: false, message: "Email hoặc mật khẩu không đúng." };
        }
    },

    // 2. Đăng ký Hộ gia đình (Role: ChuHo)
    registerFamily: async (data) => {
        const REGISTER_FAMILY_MUTATION = `
            mutation RegisterFamily($input: FamilyRegisterInput!) {
                registerFamily(input: $input) {
                    userID
                    email
                }
            }
        `;
        
        // Cần đảm bảo trường input FamilyRegisterInput khớp với backend Spring của bạn
        // Bỏ 'confirmPassword' vì nó chỉ dùng ở frontend
        const { confirmPassword, ...inputData } = data; 
        
        const variables = { 
            input: { 
                ...inputData, 
                role: 'ChuHo' // Đảm bảo role được gửi đúng
            } 
        };

        const result = await authApi.sendGraphQLRequest(REGISTER_FAMILY_MUTATION, variables);
        
        if (result?.registerFamily?.userID) {
            return { success: true, message: "Đăng ký hộ gia đình thành công! Bạn có thể đăng nhập ngay." };
        } else {
            return { success: false, message: "Đăng ký thất bại. Email có thể đã tồn tại." };
        }
    },

    // 3. Đăng ký Bác sĩ (Role: BacSi)
    registerDoctor: async (data) => {
        const REGISTER_DOCTOR_MUTATION = `
            mutation RegisterDoctor($input: DoctorRegisterInput!) {
                registerDoctor(input: $input) {
                    userID
                    email
                }
            }
        `;
        
        const { confirmPassword, ...inputData } = data;
        
        const variables = { 
            input: { 
                ...inputData, 
                role: 'BacSi' // Đảm bảo role được gửi đúng
            } 
        };

        const result = await authApi.sendGraphQLRequest(REGISTER_DOCTOR_MUTATION, variables);
        
        if (result?.registerDoctor?.userID) {
            return { success: true, message: "Đăng ký bác sĩ thành công! Vui lòng chờ admin duyệt." };
        } else {
             return { success: false, message: "Đăng ký thất bại. Mã Bác sĩ hoặc Email có thể đã tồn tại." };
        }
    }
};

export default authApi;