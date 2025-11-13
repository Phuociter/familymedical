import axios from 'axios';

const GRAPHQL_ENDPOINT = 'http://localhost:8080/graphql';

const paymentApi = {

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
                const errorMessage = response.data.errors[0].message || "Lỗi GraphQL từ Server.";
                throw new Error(errorMessage);
            }

            return response.data.data;
        } catch (error) {
            console.error("API Call Error:", error);
            if (error.response && error.response.data && error.response.data.errors) {
                 const errorMessage = error.response.data.errors[0].message || "Lỗi GraphQL từ Server.";
                throw new Error(errorMessage);
            }
            throw new Error(error.message || "Không thể kết nối đến server.");
        }
    },

    createMomoPayment: async (userId, packageType, amount) => {
        const CREATE_MOMO_PAYMENT_MUTATION = `
            mutation CreateMomoPayment($userId: Int!, $packageType: PackageType!, $amount: Float!) {
                createMomoPayment(userId: $userId, packageType: $packageType, amount: $amount) {
                    payUrl
                    orderId
                    message
                }
            }
        `;
        const variables = { userId, packageType, amount };
        const data = await paymentApi.sendGraphQLRequest(CREATE_MOMO_PAYMENT_MUTATION, variables);
        return data?.createMomoPayment;
    },

    updateMomoPaymentStatus: async (orderId, resultCode) => {
        const UPDATE_MOMO_PAYMENT_STATUS_MUTATION = `
            mutation UpdateMomoPaymentStatus($orderId: String!, $resultCode: Int!) {
                updateMomoPaymentStatus(orderId: $orderId, resultCode: $resultCode) {
                    paymentId
                    paymentStatus
                    transactionCode
                    amount
                    packageType
                }
            }
        `;
        const variables = { orderId, resultCode };
        const data = await paymentApi.sendGraphQLRequest(UPDATE_MOMO_PAYMENT_STATUS_MUTATION, variables);
        return data?.updateMomoPaymentStatus;
    },

    getPaymentsByUserId: async (userId) => {
        const GET_PAYMENTS_QUERY = `
            query GetPaymentOnByUserId($userId: Int!) {
                getPaymentOnByUserId(userId: $userId) {
                    paymentId
                    user {
                        userID
                        fullName
                        email
                    }
                    packageType
                    amount
                    paymentStatus
                    expiryDate
                    transactionCode
                }
            }
        `;
        const variables = { userId };
        const data = await paymentApi.sendGraphQLRequest(GET_PAYMENTS_QUERY, variables);
        console.log("getPaymentsByUserId - data:", data);
        return data?.getPaymentOnByUserId || [];
    }
};

export default paymentApi;