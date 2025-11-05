import axiosClient from './axiosClient';

export const createMember = async (familyId) =>
  (await axiosClient.post(`/members?familyId=${familyId}`)).data;

export const updateMember = async (member) =>
  (await axiosClient.put(`/members/${member.id}`, member)).data;

export const deleteMember = async (id) =>
  (await axiosClient.delete(`/members/${id}`)).data;

export const uploadFiles = async (memberId, files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('files', file));
  return (
    await axiosClient.post(`/members/${memberId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  ).data;
};

export const deleteFile = async (fileId) =>
  (await axiosClient.delete(`/files/${fileId}`)).data;

export const assignDoctor = async (memberId, doctorId) =>
  (await axiosClient.put(`/members/${memberId}/assignDoctor`, { doctorId })).data;
