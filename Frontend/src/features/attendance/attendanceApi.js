import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    prepareHeaders: (headers) => {
      const auth = JSON.parse(sessionStorage.getItem("auth") || "null");
      if (auth?.token) {
        headers.set("Authorization", `Bearer ${auth.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Attendance"],
  endpoints: (builder) => ({
    punchIn: builder.mutation({
      query: (body) => ({ url: "/attendance/punch-in", method: "POST", body }),
      invalidatesTags: ["Attendance"],
    }),
    punchOut: builder.mutation({
      query: (body) => ({ url: "/attendance/punch-out", method: "POST", body }),
      invalidatesTags: ["Attendance"],
    }),
    requestOvertime: builder.mutation({
      query: (body) => ({ url: "/attendance/overtime", method: "POST", body }),
      invalidatesTags: ["Attendance"],
    }),
    getMyAttendance: builder.query({
      query: ({ page = 1, limit = 5, startDate, endDate } = {}) =>
        `/attendance/my-attendance?page=${page}&limit=${limit}${
          startDate ? `&startDate=${startDate}` : ""
        }${endDate ? `&endDate=${endDate}` : ""}`,
      providesTags: ["Attendance"],
    }),
    getTeamAttendance: builder.query({
      query: ({ page = 1, limit = 5, startDate, endDate, userId } = {}) =>
        `/attendance/team-attendance?page=${page}&limit=${limit}${
          startDate ? `&startDate=${startDate}` : ""
        }${endDate ? `&endDate=${endDate}` : ""}${
          userId ? `&userId=${userId}` : ""
        }`,
      providesTags: ["Attendance"],
    }),
    getAllAttendance: builder.query({
      query: ({
        page = 1,
        limit = 5,
        startDate,
        endDate,
        status,
        userId,
      } = {}) =>
        `/attendance/all-attendance?page=${page}&limit=${limit}${
          startDate ? `&startDate=${startDate}` : ""
        }${endDate ? `&endDate=${endDate}` : ""}${
          status ? `&status=${status}` : ""
        }${userId ? `&userId=${userId}` : ""}`,
      providesTags: ["Attendance"],
    }),
    getUnverifiedRecords: builder.query({
      query: ({ page = 1, limit = 5 } = {}) =>
        `/attendance/unverified?page=${page}&limit=${limit}`,
      providesTags: ["Attendance"],
    }),
    getPendingOvertimeRequests: builder.query({
      query: ({ page = 1, limit = 5 } = {}) =>
        `/attendance/pending-overtime?page=${page}&limit=${limit}`,
      providesTags: ["Attendance"],
    }),
    verifyAttendance: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/attendance/${id}/verify`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),
    approveOvertime: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/attendance/${id}/overtime`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),
  }),
});

export const {
  usePunchInMutation,
  usePunchOutMutation,
  useRequestOvertimeMutation,
  useGetMyAttendanceQuery,
  useGetTeamAttendanceQuery,
  useGetAllAttendanceQuery,
  useGetUnverifiedRecordsQuery,
  useGetPendingOvertimeRequestsQuery,
  useVerifyAttendanceMutation,
  useApproveOvertimeMutation,
} = attendanceApi;
