// src/redux/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('userToken') || null,
    role: localStorage.getItem('userRole') || null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            const { token, role, userDetails } = action.payload;
            state.token = token;
            state.role = role;
            state.user = userDetails;

            // Lưu vào localStorage
            localStorage.setItem('userToken', token);
            localStorage.setItem('userRole', role);
            localStorage.setItem('user', JSON.stringify(userDetails));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.role = null;

            // Xóa khỏi localStorage
            localStorage.removeItem('userToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('user');
        },
        updateProfile: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            localStorage.setItem('user', JSON.stringify(state.user));
        },
    },
});

export const { loginSuccess, logout, updateProfile } = userSlice.actions;

export default userSlice.reducer;
