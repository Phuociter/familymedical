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
            // console.log("doctorDATA:////////////",data);
            return data.getDoctorList;;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách bác sĩ:', error);
            throw error;
        }
    },
    getDoctorByFamilyID : async (familyID, token) => {
        try {
            const GET_DOCTOR_BY_FAMILY_ID = `   
            query GetDoctorByFamilyID($familyID: ID!) {
                getDoctorByFamilyID(familyID: $familyID) {
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
            const variables = { familyID };
            const data = await authApi.sendGraphQLRequest(GET_DOCTOR_BY_FAMILY_ID, variables, token);
            return data.getDoctorByFamilyID;
        }
        catch (error) {
            console.error('Lỗi khi lấy bác sĩ theo Family ID:', error);
            throw error;
        }
    },
    getDoctorRequestByFamilyID : async (familyId, token) => {
        try {
            const GET_DOCTOR_REQUEST_BY_FAMILY_ID = `
            query GetDoctorRequestByFamilyID($familyID: Int!) {
                getDoctorRequestByFamilyID(familyID: $familyID) {
                requestID
                doctor{
                    userID
                    fullName
                    phoneNumber
                    email
                }
                requestDate
                status
                family{
                    familyID
                    familyName
                }
            }
        }`;
            console.log('Fetching doctor request for familyID:', familyId);
            const variables = { familyID: Number(familyId) };

            const data = await authApi.sendGraphQLRequest(GET_DOCTOR_REQUEST_BY_FAMILY_ID, variables, token);
            return data.getDoctorRequestByFamilyID;
        } catch (error) {
            console.error('Lỗi khi lấy bác sĩ theo Family ID:', error);
            throw error;
        }
    },
    getDoctorInfoById : async (doctorID, token) => {
    if (!doctorID) return null;
    const GET_DOCTOR_INFO = `
      query UserById($userID: Int!) {
        userById(userID: $userID) {
          userID
          fullName
          email
          phoneNumber
          doctorCode
        }
      }`;
    const variables = { userID: Number(doctorID) };
    const data = await authApi.sendGraphQLRequest(GET_DOCTOR_INFO, variables, token);
    return data.userById;
  },
  deleteDoctorRequest : async (requestID, token) =>{
        try{
            const DELETE_DOCTOR_REQUEST = `        
            mutation DeleteDoctorRequest($requestID: ID!){
                deleteDoctorRequest(requestID:$requestID) 
            }`;
            const variables = { requestID };
            return await authApi.sendGraphQLRequest(DELETE_DOCTOR_REQUEST, variables, token);
        }catch(error){
            throw( error);
        }   
    },
    createDoctorRequest : async (doctorID,userID,token) =>{
        try{
            const CREATE_DOCTOR_REQUEST = `
            mutation CreateDRequest($doctorID:ID!, $userID:ID!){
                createDRequest(doctorID:$doctorID, userID:$userID){
                    requestID
                    status
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