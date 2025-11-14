import axiosClient from './axiosClient';
import authApi from './authApi';
const DoctorAPI = {
    getAllDoctor : async (token) => {
        try {

            const GET_DOCTORS_QUERY = `
            query GetAllDoctors {   
                getDoctorList {
                    userID
                    fullName
                    email
                    phoneNumber
                    address
                    cccd
                    avatarUrl
                    hospitalName
                    yearsOfExperience
                    doctorCode 
                }
            }`;
            const data = await authApi.sendGraphQLRequest(GET_DOCTORS_QUERY, {}, token);
            console.log("doctorDATA:////////////",data);
            return data.getDoctorList;;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách bác sĩ:', error);
            throw error;
        }
    },
    createDoctorRequest : async (doctorID,userID,token) =>{
        try{
            const CREATE_DOCTOR_REQUEST = `
            mutation CreateDRequest($doctorID:ID!, $userID:ID!){
                createDRequest(doctorID:$doctorID, userID:$userID){
                    requestID
                    doctorID
                    familyID
                    status
                    requestDate
                }
            }
            `
            const variables = { doctorID, userID};
            return await authApi.sendGraphQLRequest(CREATE_DOCTOR_REQUEST, variables, token);
        }catch(error){
            throw( error);
        }
    }
}
export default DoctorAPI;