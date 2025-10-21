import axiosClient from './axiosClient';

export const getFamilies = async () => (await axiosClient.get('/families')).data;
export const createFamily = async (name) => (await axiosClient.post('/families', { name })).data;
export const updateFamily = async (id, name) => (await axiosClient.put(`/families/${id}`, { name })).data;
export const deleteFamily = async (id) => (await axiosClient.delete(`/families/${id}`)).data;
