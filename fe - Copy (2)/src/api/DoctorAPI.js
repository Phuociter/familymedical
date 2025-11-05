import axiosClient from './axiosClient';

export const getDoctors = async () => (await axiosClient.get('/doctors')).data;
export const createDoctor = async (name) => (await axiosClient.post('/doctors', { name })).data;
export const updateDoctor = async (id, name) => (await axiosClient.put(`/doctors/${id}`, { name })).data;
export const deleteDoctor = async (id) => (await axiosClient.delete(`/doctors/${id}`)).data;
