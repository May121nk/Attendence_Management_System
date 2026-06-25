import { createSlice } from "@reduxjs/toolkit";

const authData = JSON.parse(sessionStorage.getItem("auth") || "null");

const isValidSession =
  authData && authData.expiryTime && Date.now() < authData.expiryTime;

if (!isValidSession) {
  sessionStorage.removeItem("auth");
}

const initialState = {
  user: isValidSession ? authData.user : null,
  token: isValidSession ? authData.token : null,
  isAuthenticated: !!isValidSession,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setAuth: (state, action) => {
      const authData = {
        user: action.payload.user,
        token: action.payload.token,
        expiryTime: Date.now() + 60 * 60 * 1000, // 1 Hour
      };

      state.user = authData.user;
      state.token = authData.token;
      state.isAuthenticated = true;

      sessionStorage.setItem("auth", JSON.stringify(authData));
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      sessionStorage.removeItem("auth");
    },
  },
});

export const { setAuth, logout } = authSlice.actions;

export default authSlice.reducer;
