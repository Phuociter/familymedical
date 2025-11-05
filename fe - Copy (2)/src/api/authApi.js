import axios from 'axios';


const GRAPHQL_ENDPOINT = 'http://localhost:8080/graphql';

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
                console.error("GraphQL Errors:", response.data.errors);
                // Trích xuất thông báo lỗi rõ ràng nhất để hiển thị ở Frontend
                const errorMessage = response.data.errors[0].message || "Lỗi GraphQL từ Server.";
                throw new Error(errorMessage);
            }

            return response.data.data;
        } catch (error) {
            console.error("API Call Error:", error);
            // Xử lý lỗi mạng (CORS, Connection Refused) hoặc lỗi từ GraphQL
            if (error.response && error.response.data && error.response.data.errors) {
                 const errorMessage = error.response.data.errors[0].message || "Lỗi GraphQL từ Server.";
                throw new Error(errorMessage);
            }
            throw new Error(error.message || "Không thể kết nối đến server.");
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
    }
};

export default authApi;