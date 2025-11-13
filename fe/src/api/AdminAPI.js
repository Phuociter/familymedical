import axios from 'axios';

const GRAPHQL_ENDPOINT = 'http://localhost:8080/graphql';

/**
 * Helper function để gửi GraphQL request với token từ localStorage
 * 
 * @param {string} query - GraphQL query hoặc mutation string
 * @param {object} variables - Biến truyền vào GraphQL query/mutation (optional)
 * @returns {Promise<object>} - Dữ liệu trả về từ GraphQL (response.data.data)
 * 
 * Hàm này tự động:
 * - Lấy token từ localStorage để xác thực
 * - Gửi request đến GraphQL endpoint
 * - Xử lý lỗi và throw exception nếu có
 * - Trả về dữ liệu từ response.data.data
 */
const sendGraphQLRequest = async (query, variables = {}) => {
    try {
        // Lấy token từ localStorage để xác thực
        const token = localStorage.getItem('userToken');
        const headers = {
            'Content-Type': 'application/json',
        };
        
        // Nếu có token, thêm vào Authorization header
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Gửi POST request đến GraphQL endpoint
        const response = await axios.post(GRAPHQL_ENDPOINT, 
            {
                query,      // GraphQL query/mutation string
                variables,  // Biến truyền vào query/mutation
            }, 
            { headers }
        );

        // Kiểm tra và xử lý lỗi từ GraphQL
        if (response.data.errors) {
            console.error("GraphQL Errors:", response.data.errors);
            const errorMessage = response.data.errors[0].message || "Lỗi GraphQL từ Server.";
            throw new Error(errorMessage);
        }

        // Trả về dữ liệu từ response.data.data
        return response.data.data;
    } catch (error) {
        console.error("API Call Error:", error);
        // Xử lý lỗi từ GraphQL response
        if (error.response && error.response.data && error.response.data.errors) {
            const errorMessage = error.response.data.errors[0].message || "Lỗi GraphQL từ Server.";
            throw new Error(errorMessage);
        }
        // Xử lý lỗi mạng hoặc lỗi khác
        throw new Error(error.message || "Không thể kết nối đến server.");
    }
};

// ==================== Members (Bệnh nhân) ====================

/**
 * Lấy danh sách tất cả thành viên (bệnh nhân) trong hệ thống
 * 
 * @returns {Promise<Array>} - Mảng các đối tượng Member chứa thông tin:
 *   - memberID: ID của thành viên
 *   - familyID: ID của gia đình
 *   - fullName: Họ và tên
 *   - dateOfBirth: Ngày sinh (format: YYYY-MM-DD)
 *   - gender: Giới tính (Male, Female, Other)
 *   - relationship: Mối quan hệ trong gia đình
 *   - cccd: Số CCCD
 *   - phoneNumber: Số điện thoại
 *   - createdAt: Ngày tạo
 */
export const getMembers = async () => {
    const query = `
        query GetAllMembers {
            allMembers {
                memberID
                familyID
                fullName
                dateOfBirth
                gender
                relationship
                cccd
                phoneNumber
                createdAt
            }
        }
    `;
    const data = await sendGraphQLRequest(query);
    return data.allMembers;
};

/**
 * Tạo mới một thành viên (bệnh nhân) trong hệ thống
 * 
 * @param {object} memberData - Dữ liệu thành viên mới:
 *   - familyID: ID của gia đình (bắt buộc)
 *   - fullName: Họ và tên
 *   - dateOfBirth: Ngày sinh (format: YYYY-MM-DD)
 *   - gender: Giới tính (Male, Female, Other)
 *   - cccd: Số CCCD
 *   - relationship: Mối quan hệ trong gia đình
 *   - phoneNumber: Số điện thoại
 * @returns {Promise<object>} - Đối tượng Member đã được tạo với đầy đủ thông tin
 */
export const createMember = async (memberData) => {
    const mutation = `
        mutation CreateMember($input: CreateMemberInput!) {
            createMember(input: $input) {
                memberID
                familyID
                fullName
                dateOfBirth
                gender
                relationship
                cccd
                phoneNumber
                createdAt
            }
        }
    `;
    const data = await sendGraphQLRequest(mutation, { input: memberData });
    return data.createMember;
};

/**
 * Cập nhật thông tin của một thành viên (bệnh nhân) theo ID
 * 
 * @param {number} id - ID của thành viên cần cập nhật
 * @param {object} memberData - Dữ liệu cần cập nhật (chỉ cần truyền các field muốn thay đổi):
 *   - fullName: Họ và tên mới
 *   - dateOfBirth: Ngày sinh mới (format: YYYY-MM-DD)
 *   - gender: Giới tính mới (Nam, Nu, Khac)
 *   - cccd: Số CCCD mới
 *   - relationship: Mối quan hệ mới
 *   - phoneNumber: Số điện thoại mới
 * @returns {Promise<object>} - Đối tượng Member đã được cập nhật
 */
export const updateMember = async (id, memberData) => {
    const mutation = `
        mutation UpdateMember($input: UpdateMemberInput!) {
            updateMember(input: $input) {
                memberID
                familyID
                fullName
                dateOfBirth
                gender
                relationship
                cccd
                phoneNumber
                createdAt
            }
        }
    `;
    const input = { memberID: parseInt(id), ...memberData };
    const data = await sendGraphQLRequest(mutation, { input });
    return data.updateMember;
};

/**
 * Xóa một thành viên (bệnh nhân) khỏi hệ thống
 * 
 * @param {number} id - ID của thành viên cần xóa
 * @returns {Promise<boolean>} - true nếu xóa thành công
 */
export const deleteMember = async (id) => {
    const mutation = `
        mutation DeleteMember($memberID: Int!) {
            deleteMember(memberID: $memberID)
        }
    `;
    const data = await sendGraphQLRequest(mutation, { memberID: parseInt(id) });
    return data.deleteMember;
};

/**
 * Upload các file đính kèm cho một thành viên (bệnh nhân)
 * 
 * Lưu ý: Chức năng này vẫn sử dụng REST API vì GraphQL không hỗ trợ tốt multipart/form-data
 * 
 * @param {number} memberId - ID của thành viên cần upload file
 * @param {FileList|Array} files - Danh sách các file cần upload (từ input file hoặc FileList)
 * @returns {Promise<object>} - Response từ server với status: "ok" nếu thành công
 */
export const uploadFiles = async (memberId, files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));
    
    const token = localStorage.getItem('userToken');
    const headers = {
        'Authorization': `Bearer ${token}`,
    };
    
    const response = await axios.post(
        `http://localhost:8080/api/members/${memberId}/upload`,
        formData,
        { headers }
    );
    return response.data;
};

/**
 * Xóa một file đã upload khỏi hệ thống
 * 
 * Lưu ý: Chức năng này vẫn sử dụng REST API
 * 
 * @param {number} fileId - ID của file (MedicalRecord) cần xóa
 * @returns {Promise<object>} - Response từ server
 */
/**
 * Cập nhật thông tin bệnh án
 * 
 * @param {number} fileId - ID của bệnh án cần cập nhật
 * @param {object} data - Dữ liệu cập nhật (symptoms, diagnosis, treatmentPlan)
 * @returns {Promise<object>} - MedicalRecord đã được cập nhật
 */
export const updateMedicalRecord = async (fileId, data) => {
    const token = localStorage.getItem('userToken');
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
    
    const response = await axios.put(
        `http://localhost:8080/api/files/${fileId}`,
        data,
        { headers }
    );
    return response.data;
};

export const deleteFile = async (fileId) => {
    const token = localStorage.getItem('userToken');
    const headers = {
        'Authorization': `Bearer ${token}`,
    };
    
    const response = await axios.delete(
        `http://localhost:8080/api/files/${fileId}`,
        { headers }
    );
    return response.data;
};

/**
 * Gán một bác sĩ phụ trách cho một thành viên (qua gia đình của thành viên)
 * 
 * @param {number} memberId - ID của thành viên cần gán bác sĩ
 * @param {number} doctorId - ID của bác sĩ được gán
 * @returns {Promise<boolean>} - true nếu gán thành công
 */
export const assignDoctor = async (memberId, doctorId) => {
    const mutation = `
        mutation AssignDoctorToMember($memberID: Int!, $doctorID: Int!) {
            assignDoctorToMember(memberID: $memberID, doctorID: $doctorID)
        }
    `;
    const data = await sendGraphQLRequest(mutation, { 
        memberID: parseInt(memberId), 
        doctorID: parseInt(doctorId) 
    });
    return data.assignDoctorToMember;
};

// ==================== Doctors (Bác sĩ) ====================

/**
 * Lấy danh sách tất cả bác sĩ trong hệ thống
 * 
 * @returns {Promise<Array>} - Mảng các đối tượng User với role = "BacSi" chứa thông tin:
 *   - userID: ID của user
 *   - email: Email
 *   - fullName: Họ và tên
 *   - role: Vai trò (luôn là "BacSi")
 *   - phoneNumber: Số điện thoại
 *   - address: Địa chỉ
 *   - cccd: Số CCCD
 *   - doctorCode: Mã bác sĩ
 */
export const getDoctors = async () => {
    const query = `
        query GetAllDoctors {
            allDoctors {
                userID
                email
                fullName
                role
                phoneNumber
                address
                cccd
                doctorCode
                isVerified
                isLocked
            }
        }
    `;
    const data = await sendGraphQLRequest(query);
    return data.allDoctors;
};

/**
 * Tạo mới một bác sĩ trong hệ thống
 * 
 * @param {object} doctorData - Dữ liệu bác sĩ mới:
 *   - fullName: Họ và tên (bắt buộc)
 *   - email: Email (bắt buộc)
 *   - password: Mật khẩu (bắt buộc)
 *   - role: Vai trò (mặc định là "BacSi" nếu không truyền)
 *   - phoneNumber: Số điện thoại
 *   - address: Địa chỉ
 *   - cccd: Số CCCD
 *   - doctorCode: Mã bác sĩ
 * @returns {Promise<object>} - Đối tượng User đã được tạo với đầy đủ thông tin
 */
export const createDoctor = async (doctorData) => {
    const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
            createUser(input: $input) {
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
    const input = {
        ...doctorData,
        role: doctorData.role || 'BacSi',
    };
    const data = await sendGraphQLRequest(mutation, { input });
    return data.createUser;
};

/**
 * Cập nhật thông tin của một bác sĩ theo ID
 * 
 * @param {number} id - ID của bác sĩ cần cập nhật
 * @param {object} doctorData - Dữ liệu cần cập nhật (chỉ cần truyền các field muốn thay đổi):
 *   - fullName: Họ và tên mới
 *   - phoneNumber: Số điện thoại mới
 *   - address: Địa chỉ mới
 *   - cccd: Số CCCD mới
 *   - doctorCode: Mã bác sĩ mới
 *   - role: Vai trò mới (ít khi thay đổi)
 * @returns {Promise<object>} - Đối tượng User đã được cập nhật
 */
export const updateDoctor = async (id, doctorData) => {
    const mutation = `
        mutation UpdateUser($input: UpdateUserInput!) {
            updateUser(input: $input) {
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
    const input = { userID: parseInt(id), ...doctorData };
    const data = await sendGraphQLRequest(mutation, { input });
    return data.updateUser;
};

/**
 * Xóa một bác sĩ khỏi hệ thống
 * 
 * @param {number} id - ID của bác sĩ cần xóa
 * @returns {Promise<boolean>} - true nếu xóa thành công
 */
export const deleteDoctor = async (id) => {
    const mutation = `
        mutation DeleteUser($userID: Int!) {
            deleteUser(userID: $userID)
        }
    `;
    const data = await sendGraphQLRequest(mutation, { userID: parseInt(id) });
    return data.deleteUser;
};

// ==================== Families (Gia đình) ====================

/**
 * Lấy danh sách tất cả gia đình trong hệ thống
 * 
 * @returns {Promise<Array>} - Mảng các đối tượng Family chứa thông tin:
 *   - familyID: ID của gia đình
 *   - familyName: Tên gia đình
 *   - address: Địa chỉ
 *   - headOfFamilyID: ID của chủ hộ (User)
 *   - createdAt: Ngày tạo
 */
export const getFamilies = async () => {
    const query = `
        query GetAllFamilies {
            allFamilies {
                familyID
                familyName
                address
                headOfFamilyID
                createdAt
            }
        }
    `;
    const data = await sendGraphQLRequest(query);
    return data.allFamilies;
};

/**
 * Tạo mới một gia đình trong hệ thống
 * 
 * @param {object} familyData - Dữ liệu gia đình mới:
 *   - familyName: Tên gia đình (bắt buộc)
 *   - address: Địa chỉ
 *   - headOfFamilyID: ID của chủ hộ (User)
 * @returns {Promise<object>} - Đối tượng Family đã được tạo với đầy đủ thông tin
 */
export const createFamily = async (familyData) => {
    const mutation = `
        mutation CreateFamily($input: CreateFamilyInput!) {
            createFamily(input: $input) {
                familyID
                familyName
                address
                headOfFamilyID
                createdAt
            }
        }
    `;
    const data = await sendGraphQLRequest(mutation, { input: familyData });
    return data.createFamily;
};

/**
 * Cập nhật thông tin của một gia đình theo ID
 * 
 * @param {number} id - ID của gia đình cần cập nhật
 * @param {object} familyData - Dữ liệu cần cập nhật (chỉ cần truyền các field muốn thay đổi):
 *   - familyName: Tên gia đình mới
 *   - address: Địa chỉ mới
 * @returns {Promise<object>} - Đối tượng Family đã được cập nhật
 */
export const updateFamily = async (id, familyData) => {
    const mutation = `
        mutation UpdateFamily($input: UpdateFamilyInput!) {
            updateFamily(input: $input) {
                familyID
                familyName
                address
                headOfFamilyID
                createdAt
            }
        }
    `;
    const input = { familyID: parseInt(id), ...familyData };
    const data = await sendGraphQLRequest(mutation, { input });
    return data.updateFamily;
};

/**
 * Xóa một gia đình khỏi hệ thống
 * 
 * @param {number} id - ID của gia đình cần xóa
 * @returns {Promise<boolean>} - true nếu xóa thành công
 */
export const deleteFamily = async (id) => {
    const mutation = `
        mutation DeleteFamily($familyID: Int!) {
            deleteFamily(familyID: $familyID)
        }
    `;
    const data = await sendGraphQLRequest(mutation, { familyID: parseInt(id) });
    return data.deleteFamily;
};

// ==================== Additional Admin Functions ====================

/**
 * Lấy danh sách tất cả user trong hệ thống (bao gồm Admin, Bác sĩ, Chủ hộ)
 * 
 * @returns {Promise<Array>} - Mảng các đối tượng User với tất cả vai trò:
 *   - userID: ID của user
 *   - email: Email
 *   - fullName: Họ và tên
 *   - role: Vai trò (Admin, BacSi, ChuHo)
 *   - phoneNumber: Số điện thoại
 *   - address: Địa chỉ
 *   - cccd: Số CCCD
 *   - doctorCode: Mã bác sĩ (nếu là bác sĩ)
 */
export const getAllUsers = async () => {
    const query = `
        query GetAllUsers {
            allUsers {
                userID
                email
                fullName
                role
                phoneNumber
                address
                cccd
                doctorCode
                isVerified
                isLocked
            }
        }
    `;
    const data = await sendGraphQLRequest(query);
    return data.allUsers;
};

/**
 * Thay đổi vai trò (role) của một user trong hệ thống
 * 
 * @param {number} userId - ID của user cần thay đổi vai trò
 * @param {string} role - Vai trò mới: "Admin", "BacSi", hoặc "ChuHo"
 * @returns {Promise<object>} - Đối tượng User đã được cập nhật vai trò
 */
export const changeUserRole = async (userId, role) => {
    const mutation = `
        mutation ChangeUserRole($userID: Int!, $role: UserRole!) {
            changeUserRole(userID: $userID, role: $role) {
                userID
                email
                fullName
                role
            }
        }
    `;
    const data = await sendGraphQLRequest(mutation, { userID: userId, role });
    return data.changeUserRole;
};

/**
 * Reset mật khẩu của một user (admin thao tác)
 * 
 * @param {number} userId - ID của user cần reset mật khẩu
 * @param {string} newPassword - Mật khẩu mới (sẽ được mã hóa tự động)
 * @returns {Promise<boolean>} - true nếu reset thành công
 */
export const resetPassword = async (userId, newPassword) => {
    const mutation = `
        mutation ResetPassword($userID: Int!, $newPassword: String!) {
            resetPassword(userID: $userID, newPassword: $newPassword)
        }
    `;
    const data = await sendGraphQLRequest(mutation, { userID: userId, newPassword });
    return data.resetPassword;
};

/**
 * Khóa tài khoản của một user (ngăn không cho đăng nhập)
 * 
 * @param {number} userId - ID của user cần khóa
 * @returns {Promise<boolean>} - true nếu khóa thành công
 */
export const lockUser = async (userId) => {
    const mutation = `
        mutation LockUser($userID: Int!) {
            lockUser(userID: $userID)
        }
    `;
    const data = await sendGraphQLRequest(mutation, { userID: userId });
    return data.lockUser;
};

/**
 * Mở khóa tài khoản của một user (cho phép đăng nhập lại)
 * 
 * @param {number} userId - ID của user cần mở khóa
 * @returns {Promise<boolean>} - true nếu mở khóa thành công
 */
export const unlockUser = async (userId) => {
    const mutation = `
        mutation UnlockUser($userID: Int!) {
            unlockUser(userID: $userID)
        }
    `;
    const data = await sendGraphQLRequest(mutation, { userID: userId });
    return data.unlockUser;
};

/**
 * Phê duyệt yêu cầu đăng ký bác sĩ của một user
 * 
 * Khi approve, hệ thống sẽ:
 * - Đánh dấu DoctorRequest là ACCEPTED
 * - Set user.verified = true để bác sĩ có thể đăng nhập
 * 
 * @param {number} requestId - ID của DoctorRequest cần phê duyệt
 * @returns {Promise<object>} - Đối tượng User (bác sĩ) đã được verify
 */
export const approveDoctorRequest = async (requestId) => {
    const mutation = `
        mutation ApproveDoctorRequest($requestID: Int!) {
            approveDoctorRequest(requestID: $requestID) {
                userID
                email
                fullName
                role
                doctorCode
            }
        }
    `;
    const data = await sendGraphQLRequest(mutation, { requestID: requestId });
    return data.approveDoctorRequest;
};

/**
 * Từ chối yêu cầu đăng ký bác sĩ của một user
 * 
 * Khi reject, hệ thống sẽ:
 * - Đánh dấu DoctorRequest là REJECTED
 * - User sẽ không được verify và không thể đăng nhập với vai trò bác sĩ
 * 
 * @param {number} requestId - ID của DoctorRequest cần từ chối
 * @returns {Promise<boolean>} - true nếu từ chối thành công
 */
export const rejectDoctorRequest = async (requestId) => {
    const mutation = `
        mutation RejectDoctorRequest($requestID: Int!) {
            rejectDoctorRequest(requestID: $requestID)
        }
    `;
    const data = await sendGraphQLRequest(mutation, { requestID: requestId });
    return data.rejectDoctorRequest;
};

// ==================== Doctor Requests (REST API) ====================

/**
 * Lấy danh sách tất cả yêu cầu bác sĩ (qua REST API)
 * 
 * @param {string} status - Lọc theo trạng thái (pending, accepted, rejected) - optional
 * @returns {Promise<Array>} - Mảng các DoctorRequest
 */
export const getDoctorRequests = async (status = null) => {
    const token = localStorage.getItem('userToken');
    const headers = {
        'Authorization': `Bearer ${token}`,
    };
    
    const url = status 
        ? `http://localhost:8080/api/doctor-requests?status=${status}`
        : 'http://localhost:8080/api/doctor-requests';
    
    const response = await axios.get(url, { headers });
    return Array.isArray(response.data) ? response.data : [];
};

/**
 * Lấy chi tiết một yêu cầu bác sĩ theo ID (qua REST API)
 * 
 * @param {number} requestId - ID của yêu cầu
 * @returns {Promise<object>} - Đối tượng DoctorRequest
 */
export const getDoctorRequestById = async (requestId) => {
    const token = localStorage.getItem('userToken');
    const headers = {
        'Authorization': `Bearer ${token}`,
    };
    
    const response = await axios.get(
        `http://localhost:8080/api/doctor-requests/${requestId}`,
        { headers }
    );
    return response.data;
};

/**
 * Phê duyệt yêu cầu bác sĩ (qua REST API)
 * 
 * @param {number} requestId - ID của yêu cầu
 * @returns {Promise<object>} - Đối tượng User (bác sĩ) đã được verify
 */
export const approveDoctorRequestREST = async (requestId) => {
    const token = localStorage.getItem('userToken');
    const headers = {
        'Authorization': `Bearer ${token}`,
    };
    
    const response = await axios.put(
        `http://localhost:8080/api/doctor-requests/${requestId}/approve`,
        {},
        { headers }
    );
    return response.data;
};

/**
 * Từ chối yêu cầu bác sĩ (qua REST API)
 * 
 * @param {number} requestId - ID của yêu cầu
 * @returns {Promise<void>}
 */
export const rejectDoctorRequestREST = async (requestId) => {
    const token = localStorage.getItem('userToken');
    const headers = {
        'Authorization': `Bearer ${token}`,
    };
    
    await axios.put(
        `http://localhost:8080/api/doctor-requests/${requestId}/reject`,
        {},
        { headers }
    );
};

// ==================== Payments (Thanh toán) ====================

/**
 * Lấy danh sách tất cả thanh toán
 * 
 * @param {string} status - Lọc theo trạng thái (SUCCESS, FAILED, PENDING) - optional
 * @returns {Promise<Array>} - Mảng các Payment
 */
export const getPayments = async (status = null) => {
    const token = localStorage.getItem('userToken');
    const headers = {
        'Authorization': `Bearer ${token}`,
    };
    
    const url = status 
        ? `http://localhost:8080/api/payments?status=${status}`
        : 'http://localhost:8080/api/payments';
    
    const response = await axios.get(url, { headers });
    return Array.isArray(response.data) ? response.data : [];
};

/**
 * Lấy chi tiết một thanh toán theo ID
 * 
 * @param {number} paymentId - ID của thanh toán
 * @returns {Promise<object>} - Đối tượng Payment
 */
export const getPaymentById = async (paymentId) => {
    const token = localStorage.getItem('userToken');
    const headers = {
        'Authorization': `Bearer ${token}`,
    };
    
    const response = await axios.get(
        `http://localhost:8080/api/payments/${paymentId}`,
        { headers }
    );
    return response.data;
};

/**
 * Tạo mới một thanh toán
 * 
 * @param {object} paymentData - Dữ liệu thanh toán:
 *   - familyID: ID của gia đình
 *   - doctorID: ID của bác sĩ
 *   - amount: Số tiền
 *   - paymentMethod: Phương thức thanh toán
 *   - status: Trạng thái (SUCCESS, FAILED, PENDING)
 * @returns {Promise<object>} - Đối tượng Payment đã được tạo
 */
export const createPayment = async (paymentData) => {
    const token = localStorage.getItem('userToken');
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
    
    const response = await axios.post(
        'http://localhost:8080/api/payments',
        paymentData,
        { headers }
    );
    return response.data;
};

/**
 * Cập nhật thông tin thanh toán
 * 
 * @param {number} paymentId - ID của thanh toán
 * @param {object} paymentData - Dữ liệu cần cập nhật
 * @returns {Promise<object>} - Đối tượng Payment đã được cập nhật
 */
export const updatePayment = async (paymentId, paymentData) => {
    const token = localStorage.getItem('userToken');
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
    
    const response = await axios.put(
        `http://localhost:8080/api/payments/${paymentId}`,
        paymentData,
        { headers }
    );
    return response.data;
};

/**
 * Xóa một thanh toán
 * 
 * @param {number} paymentId - ID của thanh toán
 * @returns {Promise<void>}
 */
export const deletePayment = async (paymentId) => {
    const token = localStorage.getItem('userToken');
    const headers = {
        'Authorization': `Bearer ${token}`,
    };
    
    await axios.delete(
        `http://localhost:8080/api/payments/${paymentId}`,
        { headers }
    );
};

/**
 * Lấy danh sách files (MedicalRecords) đã upload của một thành viên
 * 
 * @param {number} memberId - ID của thành viên cần lấy danh sách files
 * @returns {Promise<Array>} - Mảng các MedicalRecord
 */
export const getMemberFiles = async (memberId) => {
    const token = localStorage.getItem('userToken');
    const headers = {
        'Authorization': `Bearer ${token}`,
    };
    
    const response = await axios.get(
        `http://localhost:8080/api/members/${memberId}/files`,
        { headers }
    );
    return Array.isArray(response.data) ? response.data : [];
};

/**
 * Phân công bác sĩ cho một gia đình
 * 
 * @param {number} familyId - ID của gia đình
 * @param {number} doctorId - ID của bác sĩ
 * @returns {Promise<object>} - Kết quả phân công
 */
export const assignDoctorToFamily = async (familyId, doctorId) => {
    const token = localStorage.getItem('userToken');
    const headers = {
        'Authorization': `Bearer ${token}`,
    };
    
    const response = await axios.put(
        `http://localhost:8080/api/families/${familyId}/assignDoctor`,
        { doctorId: parseInt(doctorId) },
        { headers }
    );
    return response.data;
};

/**
 * Lấy danh sách bác sĩ đã được phân công cho một gia đình
 * 
 * @param {number} familyId - ID của gia đình
 * @returns {Promise<Array>} - Mảng các bác sĩ đã phân công
 */
export const getAssignedDoctors = async (familyId) => {
    const token = localStorage.getItem('userToken');
    const headers = {
        'Authorization': `Bearer ${token}`,
    };
    
    const response = await axios.get(
        `http://localhost:8080/api/families/${familyId}/doctors`,
        { headers }
    );
    return Array.isArray(response.data) ? response.data : [];
};

/**
 * Hủy phân công bác sĩ cho một gia đình
 * 
 * @param {number} familyId - ID của gia đình
 * @param {number} assignmentId - ID của phân công cần hủy
 * @returns {Promise<void>}
 */
export const removeDoctorAssignment = async (familyId, assignmentId) => {
    const token = localStorage.getItem('userToken');
    const headers = {
        'Authorization': `Bearer ${token}`,
    };
    
    await axios.delete(
        `http://localhost:8080/api/families/${familyId}/doctors/${assignmentId}`,
        { headers }
    );
};