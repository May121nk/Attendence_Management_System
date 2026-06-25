import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const reportApi = createApi({
  reducerPath: "reportApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      import.meta.env.VITE_API_URL ||
      "https://attendanceapp-backend1-ptv8.onrender.com",
    prepareHeaders: (headers) => {
      const auth = JSON.parse(localStorage.getItem("auth") || "null");
      if (auth?.token) {
        headers.set("Authorization", `Bearer ${auth.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Reports"],
  endpoints: (builder) => ({
    dailyReport: builder.query({
      query: ({ startDate, endDate, userId } = {}) =>
        `/attendance/report/daily?${[
          startDate ? `startDate=${startDate}` : "",
          endDate ? `endDate=${endDate}` : "",
          userId ? `userId=${userId}` : "",
        ]
          .filter(Boolean)
          .join("&")}`,
      providesTags: ["Reports"],
    }),
    employeeReport: builder.query({
      query: ({ startDate, endDate } = {}) =>
        `/attendance/report/employee?${[
          startDate ? `startDate=${startDate}` : "",
          endDate ? `endDate=${endDate}` : "",
        ]
          .filter(Boolean)
          .join("&")}`,
      providesTags: ["Reports"],
    }),
  }),
});

export const { useDailyReportQuery, useEmployeeReportQuery } = reportApi;
