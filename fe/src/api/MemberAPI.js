import axios from 'axios';

const GRAPHQL_ENDPOINT = 'http://localhost:8080/graphql';
import userSlice from '../redux/userSlice';
import { useSelector } from "react-redux";
import authApi from './authApi';

const MemberAPI = {
  // const user = useSelector((state) => state.user.user);
  getMemberByUserID: async (userID, token) => {
    try{
      const GET_MEMBERS_QUERY = `
      query MembersByFamilyID($familyID: ID!) {
        membersByFamilyID(familyID: $familyID) {
          id
          fullName
          dateOfBirth
          gender
          relationship
          phoneNumber
          cccd
        }`
        const data = await authApi.sendGraphQLRequest(GET_MEMBERS_QUERY, { familyID: userID }, token);
        return data.membersByFamilyID;

    }
    catch (error) {}
  },
  updateMember: async (memberID, memberData, token) => {
    try {
      const UPDATE_MEMBER_MUTATION = `
      mutation UpdateMember($memberID: ID!, $input: MemberUpdateInput!) {
        updateMember(memberID: $memberID, input: $input) {
          id
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
      mutation CreateMember($input: MemberCreateInput!) {
        createMember(input: $input) {
          id
          fullName
          dateOfBirth 
          gender
          relationship
          phoneNumber
          cccd
        }
      };`
      const variables = {
        input: memberData,
      };
      const data = await authApi.sendGraphQLRequest(CREATE_MEMBER_MUTATIOIN, variables, token);
      return data.createMember;
    }
    catch(error){}
  }
}
export default MemberAPI;
