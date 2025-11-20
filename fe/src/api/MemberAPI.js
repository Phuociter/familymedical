import axios from 'axios';
const GRAPHQL_ENDPOINT = 'http://localhost:8080/graphql';
import authApi from './authApi';
// const token = localStorage.getItem('userToken');
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

  getRecordsOfMember: async (memberID,token) =>{
    try{

    }catch(error){
      throw error;
    }
  },
  
  createMedicalRecord: async(files, medicalRecords) =>{
    try{
      // 1. Upload tất cả file và lấy mảng các đường link trả về
      let uploadedFileLinks = [];
      if(files && files.length > 0){
        uploadedFileLinks = await Promise.all(
          files.map(file => authApi.uploadFileToCloudinary(file.file))
        );
      }

      // 2. Kiểm tra số lượng file và record phải khớp nhau
      if (medicalRecords.length !== uploadedFileLinks.length) {
        throw new Error("Số lượng file tải lên và số lượng record không khớp.");
      }
      
      // 3. Kết hợp dữ liệu record gốc với link file đã tải lên
      const medicalRecordsPayload = medicalRecords.map((record, index) => ({
        ...record,
        fileLink: uploadedFileLinks[index],
        description: record.fileLink, // Sử dụng tên file gốc làm mô tả
      }));

      // 4. GraphQL Mutation
      const POST_MEDICAL_RECORD_DATA = `
      mutation CreateMedicalRecord($input: CreateMedicalRecordInput!){
        createMedicalRecord(input:$input){
          recordID
          memberID
          fileType
          fileLink
          description
          recordDate
        }
      }
      `;
      const createdRecords = [];
      const token = localStorage.getItem('userToken');

      // 5. Gửi từng record đã xử lý lên server
      for (const record of medicalRecordsPayload) {
        
        // Chuyển đổi memberID sang kiểu Int
        const inputForGQL = {
          ...record,
          memberID: parseInt(record.memberID, 10)
        };

        // Kiểm tra nếu memberID không hợp lệ
        if (isNaN(inputForGQL.memberID)) {
          throw new Error(`Invalid memberID after parsing: ${record.memberID}`);
        }

        console.log("Sending this object to GraphQL:", inputForGQL); 
        const variables = { input: inputForGQL };
        const result = await authApi.sendGraphQLRequest(POST_MEDICAL_RECORD_DATA, variables, token);
        
        if (result?.createMedicalRecord) {
          createdRecords.push(result.createMedicalRecord);
        }
      }

      if (createdRecords.length > 0) {
        // 6. Trả về mảng các record vừa được tạo thành công
        return createdRecords;
      } else {
        throw new Error("Tạo record thất bại.");
      }
      
    }catch(error){
      console.error("Lỗi khi thêm file y tế:", error);
      throw(error);
    }
  }
}
export default MemberAPI;
