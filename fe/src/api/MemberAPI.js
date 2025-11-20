import axios from 'axios';
const GRAPHQL_ENDPOINT = 'http://localhost:8080/graphql';
import authApi from './authApi';
const token = localStorage.getItem('userToken');
// const user = JSON.parse(localStorage.getItem('user'));
// const userID = user.userID;
const MemberAPI = {
  // const user = useSelector((state) => state.user.user);
  getMemberByFamilyID: async (familyID, token) => {
    try{
      const GET_MEMBERS_QUERY = `
      query MembersByFamilyID($familyID: ID!) {
        membersByFamilyID(familyID: $familyID) {
          memberID
          familyID
          fullName
          relationship
          cccd
          dateOfBirth
          gender
          phoneNumber
        }
      }`
        const variables = {familyID};
        const data = await authApi.sendGraphQLRequest(GET_MEMBERS_QUERY, variables, token);
        return data.membersByFamilyID;

    }
    catch (error) {
      console.error("lỗi khi lấy danh sách thành viên",error);
      if(error.response){
        console.log("lỗi server:",JSON.stringify(error.response.data, null, 2))
      }
      return[];
    }
  },
  updateMember: async (memberID, memberData, token) => {
    try {
      const UPDATE_MEMBER_MUTATION = `
      mutation UpdateMember($memberID: ID!, $input: MemberUpdateInput!) {
        updateMember(memberID: $memberID, input: $input) {
          memberID
          fullName
          dateOfBirth 
          gender
          relationship
          phoneNumber
          cccd
        }
      }`; 
      const variables = {                                                                                                     
      memberID,                                                                                                            
      input: updateData,                                                                                                   
      };
      return await authApi.sendGraphQLRequest(UPDATE_MEMBER_MUTATION, variables, token);
    } catch (error) {
      throw error;
    }
  },
  createMember: async (memberData, token) => {
    try{
      const CREATE_MEMBER_MUTATIOIN  = `
      mutation CreateMember($input: CreateMemberInput!) {
        createMember(input: $input) {
          relationship
          fullName
          dateOfBirth 
          gender
          phoneNumber
          cccd
        }
      }`;
      const variables = {
        input: memberData,
      };
      const data = await authApi.sendGraphQLRequest(CREATE_MEMBER_MUTATIOIN, variables, token);
      return data.createMember;
    }
    catch(error){
      throw error;
    }
  },
  getFamilyByHeadOfFamilyID: async (userID, token) => {
    try{
      // console.log("userID:",userID);
      const Get_Family_By_MemberID_QUERY  = `
      query GetFamilyByHeadOfFamilyID($userID:ID!) {
        getFamilyByHeadOfFamilyID(userID: $userID) {
          familyID
          familyName
          familyAddress
          address
          members {
            memberID
            fullName
            relationship
            cccd
            dateOfBirth
            gender
            phoneNumber
          }
          doctorAssignments {
          assignmentId
            doctor{
              userID
              fullName
              phoneNumber
            }
          } 
        }
      }`;
    const variables = { userID };
      // console.log("userID:",token);

    const data = await authApi.sendGraphQLRequest(Get_Family_By_MemberID_QUERY, variables, token);
    return data.getFamilyByHeadOfFamilyID;
    }
    catch(error){
      console.error("getFamilyByHeadOfFamilyID error:", error);
      throw error;
    }
  },
  postMedicalRecord: async(memberID, medicalRecord,token) =>{
    try{
      const medicalRecordFile = await authApi.uploadAvatarToCloudinary(file)
      const POST_MEDICAL_RECORD_DATA = `
      `;
    }catch(error){
      throw(error);
    }
  }
}
export default MemberAPI;
