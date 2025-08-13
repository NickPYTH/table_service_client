import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {UserModel} from "entities/UserModel";

export const userAPI = createApi({
    reducerPath: 'userAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/users`,
    }),
    tagTypes: ['user'],
    endpoints: (build) => ({
        getCurrent: build.mutation<any, void>({
            query: () => ({
                url: `/get_current_user`,
                method: 'GET',
            }),
            invalidatesTags: ['user']
        }),
        getAll: build.mutation<UserModel[], void>({
            query: () => ({
                url: `/`,
                method: 'GET',
            }),
            invalidatesTags: ['user']
        }),
    })
});
