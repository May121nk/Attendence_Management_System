import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import { authApi } from "../features/auth/authApi.js";
import { attendanceApi } from "../features/attendance/attendanceApi.js";
import { reportApi } from "../features/report/reportApi.js";
import { userApi } from "../features/users/userApi.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [reportApi.reducerPath]: reportApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      attendanceApi.middleware,
      reportApi.middleware,
      userApi.middleware,
    ),
});

export default store;
