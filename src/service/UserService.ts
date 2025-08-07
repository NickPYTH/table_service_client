import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";

export const userAPI = createApi({
    reducerPath: 'userAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/`,
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
    })
});
