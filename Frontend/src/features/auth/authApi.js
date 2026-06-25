import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
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
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (body) => ({ url: "/auth/signup", method: "POST", body }),
    }),
    login: builder.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    me: builder.query({
      query: () => "/auth/me",
    }),
  }),
});

export const { useSignupMutation, useLoginMutation, useMeQuery } = authApi;
